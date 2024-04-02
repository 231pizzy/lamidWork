import { deleteSession, getSession, isLoggedIn, logOut, setSession } from "@/Components/session";
import User from "../models/User";
import Folder from "../models/Folders";
import sendEmail from "./sendEmail";
import ProjectGroups from "../models/ProjectGroup";
import Schedules from "../models/Schedules";
import Contacts from "../models/Contacts";
import SupervisorEvaluations from "../models/SupervisorEvaluations";
import moment from "moment";
import bcrypt from 'bcrypt'

import { generate as genOtp } from 'otp-generator'


import fs from 'node:fs/promises'

import { writeFileSync } from 'node:fs'
import Followups from "../models/Followup";
import FollowupComments from "../models/FollowupComments";
import Forms from "../models/Forms";
import Documents from "../models/Documents";
import path from "node:path";

import crypto from 'node:crypto'
import { mkdirp } from "mkdirp";
import Privileges from "../models/Privileges";
import Notifications from "../models/Notifications";
import ProjectChats from "../models/ProjectChats";
import Goals from "../models/Goals";
import mongoose from "mongoose";
import emailMessages from "./getEmails";
import { removeHtml } from "@/utils/removeHtml";
import Notes from "../models/Notes";

const initialPath = process.env.NODE_ENV === 'production' ? '/tmp' : process.cwd();

const hashPassword = (password, callback) => {
    bcrypt.hash(password, 10, callback);
}

const generateOtp = () => {
    return genOtp(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false, specialChars: false
    });
}

const saveFile = async ({ folder, fileArray }) => {
    //Array of object: {filename:name, filedata:data}

    return mkdirp(path.join(initialPath, 'files', folder,)).then((made) => {
        return fileArray.map(async (fileObj) => {
            const filename = fileObj.filename;
            const filedata = fileObj.filedata;

            const data = await filedata.arrayBuffer();
            const buffer = Buffer.from(data);

            const saveFileIn = path.join(initialPath, 'files', folder, filename);

            writeFileSync(saveFileIn, buffer)
        })
    })
}

const fetchFile = async ({ filePath }) => {
    console.log('filepath', filePath)
    const buffer = await fs.readFile(filePath);

    if (buffer)
        return buffer
}

const deleteFile = async ({ filePath }) => {
    return await fs.unlink(filePath);
}

const createNotification = async ({ title, recipients, details, }) => {
    const newNotification = new Notifications({
        date: moment().format('DD/MM/yyyy').toString(),
        time: moment().format('h:mm a').toString(),
        title: title,
        recipients: recipients,
        details: details,
        delivered: false,
        read: false
    })

    const result = await newNotification.save();

    if (result?._id)
        return true
    else
        return false
}

export async function handleCheckLoginStatus(searchParams) {
    const loggedIn = await isLoggedIn()
    console.log('logged in', loggedIn)
    return { result: loggedIn };
}

export async function handleLogOut(searchParams) {
    const loggedOut = await logOut()
    console.log('logged out', loggedOut)
    return { result: loggedOut };
}

export async function handleLogin(searchParams) {
    console.log('handle login called')
    const designation = await isLoggedIn()

    if (designation) {
        //user is already logged in. Just return true to say that login succeeded. 
        //No need telling the user that they are already logged in
        console.log('designation failed', designation)
        return { result: designation }
    }
    else {
        const email = searchParams.get('email')
        const password = searchParams.get('password')

        //Get the password hash for this email the password
        const userData = await User.findOne({ email: email });

        console.log('user data', userData);


        const match = await bcrypt.compare(password, userData?.password);
        console.log('data', match)


        if (match) {
            //The password matches what the user has. Go ahead and load the user in
            const done = await setSession({
                email: email, fullName: userData?.fullName, userId: userData?._id,
                profilePicture: userData?.profilePicture, designation: userData?.designation
            });

            console.log('done', done);
            return { result: done }

        }
        else {
            //The password does not match
            console.log('password missmatch')
            return { result: false }
        }
    }

}

export async function handleOtpRequest(searchParams, email) {
    const otp = generateOtp()
    email = email ?? searchParams.get('email')

    const emailPayload = {
        from: `Password Reset <${process.env.EMAIL}>`,
        to: email,
        subject: 'Reset password',
        text: `The OTP for resetting your password is ${otp}`,
        html: `<p>Hi</p><p>The OTP for resetting your password is ${otp}</p>`
    };

    const emailSent = await sendEmail({
        toEmail: emailPayload.to, fromHeading: emailPayload.from,
        subject: emailPayload.subject, text: emailPayload.text, html: emailPayload.html,
    })

    if (emailSent !== null) {
        //save the otp in session
        console.log('returned', emailSent)
        const done = await setSession({ otp: otp, email: email }, 'otp')
        return { result: done }
    }
}

export async function handleVerifyOtp(searchParams) {
    const otp = searchParams.get('otp');
    const realOtp = await getSession('otp');

    console.log(otp, realOtp);

    if (realOtp?.otp?.toString() === otp) {
        console.log('matched')
        const reset = await deleteSession(['otp']);

        //Set a flag that shows a user is ready for password change
        const markerSet = await setSession({ email: realOtp?.email }, 'passwordChangeMarker')

        return { result: markerSet };
    }
    else {
        console.log('mismatch')
        return { result: false };
    }
}

export async function resendOtp(searchParams) {
    const otpObject = await getSession('otp');

    console.log(otpObject);

    const sent = await handleOtpRequest(null, otpObject.email);

    return sent
}

export async function changePassword(searchParams) {
    const marker = await getSession('passwordChangeMarker');

    if (!marker?.email) {
        //User has not been auhenticated for password change
        return { result: false }
    }
    else {
        //User has been authenticated for password change. Go ahead with the change
        const password = searchParams.get('password');
        const salt = Number(process.env.SALT)

        console.log('salt', salt, marker.email)

        const passwordHash = await bcrypt.hash(password, salt);

        const modified = await User.updateOne({ email: marker.email }, { $set: { password: passwordHash } })

        console.log('done updating', modified);

        //Clean up:
        //delete the passwordChangeMarker cookie
        if (modified) {
            console.log('password changed');
            const done = await deleteSession(['passwordChangeMarker']);

            return { result: done || true }
        }
        else {
            console.log('password not changed');

            return { result: false }
        }
    }


}

export async function getAdminFrontPage(searchParams) {
    /* 
    The data to be returned are:
    1. The user's email
    2. All project groups
    3. 10 staff
    4. 10 schedules for today
    5. 5 contacts
    */

    //get email
    const session = await getSession();
    const email = session?.email
    const todayDate = moment().format('yyyy-MM-DD').toString();

    console.log('email', email);

    //get all project groups
    const projectGroups = await ProjectGroups.find();

    //get 10 staff
    const staffList = await User.find({}).limit(10);

    //10 schedules for today
    const schedule = await Schedules.find({ date: todayDate }).limit(10);

    //5 clients' contacts
    const contacts = await Contacts.find({}).limit(10);

    return { result: { email: email, staffArray: staffList, projectGroups: projectGroups, schedule: schedule, contacts: contacts } }
}

export async function createContactNote(searchParams) {
    const title = searchParams.get('title');
    const details = searchParams.get('details');
    const clientId = searchParams.get('clientId');
    const uploadedFileIds = JSON.parse(searchParams.get('uploadedFileIds'));

    const formatMapping = {
        image: ['png', 'jpg', 'jpeg', 'gif'],
        audio: ['mp3'],
        video: ['mp4'],
        document: ['pdf', 'docx', 'doc', 'txt', 'ppt', 'pptx'],
    }

    const files = uploadedFileIds?.map(item => {
        const file = searchParams.get(item)
        const extension = file.name.split('.').pop()
        return {
            filename: `${crypto.randomUUID()}.${extension}`,
            filedata: file,
            filesize: file?.size,
            contentType: file?.type,
            fileType: Object.keys(formatMapping).find(it => formatMapping[it]?.includes(extension)) || 'unknown',
        }
    })

    console.log('data for sending contact email', {
        title, details, uploadedFileIds,
        files
    })

    await saveFile({ folder: 'notes', fileArray: files })

    await Notes.create({
        title, details, clientId, attachments: files?.map(i => {
            return {
                ...i, filedata: null
            }
        })
    })

    return { result: 'saved' }
}

export async function getContactNotes(searchParams) {
    const clientId = searchParams.get('id');

    console.log('get notes called with id', { clientId, initialPath })

    let data = await Notes.find({ clientId });

    return {
        result: await Promise.all(data?.map(async item => {
            //  console.log('file name', item, item?.filename)
            return {
                ...item?.toObject(),
                date: moment(item?.createdAt).format('yyyy/MM/DD').toString(),
                attachments: await Promise.all(item?.toObject()?.attachments?.map(async i => {
                    return {
                        ...i,
                        file: (await fetchFile({ filePath: path.join(initialPath, 'files', 'notes', i?.filename) })).toJSON().data
                    }
                }))
            }
        }))
    }
}

export async function getEmails(searchParams) {
    const clientId = searchParams.get('id');

    const clientEmail = clientId && (await Contacts.findOne({ _id: clientId }))?.email
    const messages = await emailMessages({ emailAddress: 'isineyiikenna@gmail.com' /* clientEmail */ })

    return { result: messages }
}

export async function sendContactEmail(searchParams) {
    const title = searchParams.get('title');
    const message = searchParams.get('message');
    const email = searchParams.get('email');
    const uploadedFileIds = JSON.parse(searchParams.get('uploadedFileIds'));


    const files = await Promise.all(uploadedFileIds?.map(async item => {
        return {
            filename: item,
            content: Buffer.from(await searchParams.get(item).arrayBuffer()),
            contentType: searchParams.get(item).type
        }
    }))



    console.log('data for sending contact email', {
        title, message, uploadedFileIds,
        files
    })

    const emailPayload = {
        from: `Lamid Consulting <${process.env.EMAIL}>`,
        to: email,
        subject: title,
    };

    const emailSent = await sendEmail({
        toEmail: emailPayload.to, fromHeading: emailPayload.from, attachmentArray: files,
        subject: emailPayload.subject, text: removeHtml(), html: message,
    })

    // console.log('email sent', emailSent);

    return { result: 'sent' }
}

export async function facebookWebhook(searchParams) {
    const entry = searchParams['entry']
    const object = searchParams['object'];

    const messages = [];

    entry[0]?.messaging?.forEach(i => messages.push(i))

    console.log('data from facebook webhook', { data: JSON.stringify(entry), entry, object, messages });

    return { result: true }
}

export async function facebookWebhookVerification(searchParams) {
    const challenge = searchParams.get('hub.challenge')

    console.log('data from facebook webhook verify', { challenge });

    return challenge
}

export async function createContactGoal(searchParams) {
    const clientId = searchParams.get('clientId')
    const createdBy = (await getSession())?.fullName;
    const goalName = searchParams.get('goalName')
    const dueDate = searchParams.get('dueDate')
    const flagAt = searchParams.get('flagAt')
    const maxFollowup = searchParams.get('maxFollowup')
    const statusOnComplete = searchParams.get('statusOnComplete');
    const goalId = searchParams.get('goalId');

    console.log('create contact goal called', {
        clientId, createdBy, goalName, dueDate, flagAt, maxFollowup,
        statusOnComplete, goalId
    })

    goalId
        ? await Goals.updateOne({ _id: goalId }, {
            $set: {
                createdBy, goalName, dueDate, flagAt, maxFollowup,
                statusOnComplete, progessStatus: 'todo'
            }
        })
        : await Goals.create({
            clientId, createdBy, goalName, dueDate, flagAt, maxFollowup,
            statusOnComplete, progessStatus: 'todo'
        })

    return { result: 'created' }
}

export async function getContactGoals(searchParams) {
    const clientId = searchParams.get('id');
    const goalId = searchParams.get('goalId');

    if (goalId) {
        const goal = await Goals.findOne({ _id: goalId });
        return { result: goal }
    } else {
        const goals = await Goals.find({ clientId });

        const totalFollowups = await Followups.find({ clientId })

        return {
            result: goals?.map(i => {
                return {
                    ...i?.toObject(),
                    followupUsed: totalFollowups?.filter(it => it?.goalId === i?._id?.toString())?.length,
                    goalId: i?._id
                }
            })
        }
    }


}

export async function getFollowupData(searchParams) {
    const goalId = searchParams.get('id');
    const followups = await Followups.find({ goalId }).sort({ '_id': 'asc' });
    const evaluationReports = await SupervisorEvaluations.find({ goalId })

    const users = followups && await User.find({
        _id:
            [...followups.map(i => i?.toObject()?.userId),
            ...evaluationReports.map(i => i?.toObject()?.userId)]
    });

    return {
        result: followups.map(i => {
            const handler = users?.find(it => it?._id?.toString() === i?.toObject()?.userId)
            const supervisorReport = evaluationReports.find(it => it?.toObject()?.followupId === i?._id?.toString())
            const supervisor = users?.find(it => it?._id?.toString() === supervisorReport?.toObject()?.userId)
            return {
                handlerReport: { ...i?.toObject(), fullName: handler?.fullName, email: handler?.email },
                supervisorReport: supervisorReport && { ...supervisorReport?.toObject(), fullName: supervisor?.fullName, email: supervisor?.email }
            }
        })

    }
}

export async function getContactFollowupData(searchParams) {
    const clientId = searchParams.get('id');

    const followups = await Followups.find({ clientId }).sort({ '_id': 'asc' });
    const evaluationReports = await SupervisorEvaluations.find({ clientId })

    const users = followups && await User.find({
        _id:
            [...followups.map(i => i?.toObject()?.userId),
            ...evaluationReports.map(i => i?.toObject()?.userId)]
    });


    const followupData = [];
    const performanceData = [];

    const colorGen = () => {
        return '#' + Math.floor(Math.random() * 16777215).toString(16)
    }

    const userColorMapping = {}

    followups.forEach((item, index) => {
        const handler = users?.find(it => it?._id?.toString() === item?.toObject()?.userId)
        const supervisorReport = evaluationReports.find(it => it?.toObject()?.followupId === item?._id?.toString())
        const supervisor = users?.find(it => it?._id?.toString() === supervisorReport?.toObject()?.userId)

        //Push supervisor data
        supervisorReport && followupData.push({
            name: '',
            rating: supervisorReport?.appetiteRanking,
            color: '#BF0606',
            isHandler: false,
            fullName: supervisor?.fullName,
            email: supervisor?.email,
            date: item?.date
        })

        const handlerColor = userColorMapping[handler?.email] || colorGen()
        //push handler data
        followupData.push({
            name: `Follow up - ${index + 1}`,
            rating: item?.appetiteRanking,
            color: handlerColor,
            isHandler: true,
            fullName: handler?.fullName,
            email: handler?.email,
            date: item?.date
        })

        //push blank data
        followupData.push({
            name: null,
            rating: 4,
            fullName: '',
            color: 'transparent',
            blank: true,
            email: '',
            date: '',
        })


        userColorMapping[handler?.email] = handlerColor



        //Performance ranking
        supervisorReport && performanceData.push({
            name: `Follow up - ${index + 1}`,
            rating: supervisorReport?.handlerPerformance,
            color: handlerColor,
            isHandler: true,
            fullName: handler?.fullName,
            email: handler?.email,
            date: item?.date
        })
    })

    return {
        result: { followupData, performanceData }
    }
}

export async function createFollowupReport(searchParams) {
    const clientId = searchParams.get('clientId')
    const time = searchParams.get('time');
    const contactMode = JSON.parse(searchParams.get('contactMode'))
    const date = searchParams.get('date')
    const nextStep = searchParams.get('nextStep')
    const appetiteRanking = searchParams.get('appetiteRanking');
    const outcome = JSON.parse(searchParams.get('outcome'));
    const questionAndAnswers = JSON.parse(searchParams.get('questionAndAnswers'));
    const goalId = searchParams.get('goalId');
    const followupId = searchParams.get('followupId');

    const userId = (await getSession())?.userId

    console.log('create follow report called', {
        time, clientId, contactMode, date, nextStep, userId, appetiteRanking, outcome, questionAndAnswers, goalId
    })

    followupId
        ? await Followups.updateOne({ _id: followupId }, {
            $set: {
                time, clientId, contactMode, date, nextStep, userId,
                appetiteRanking, outcome, questionAndAnswers, goalId
            }
        })
        : await Followups.create({
            time, clientId, contactMode, date, nextStep, userId,
            appetiteRanking, outcome, questionAndAnswers, goalId
        })

    return { result: 'created' }
}

export async function deleteFollowupReport(searchParams) {
    const followupId = searchParams.get('id');

    await Followups.deleteMany({ _id: followupId });
    await SupervisorEvaluations.deleteMany({ followupId });
    return { result: 'deleted' }
}

export async function deleteEvaluationReport(searchParams) {
    const evaluationId = searchParams.get('id');

    await SupervisorEvaluations.deleteMany({ _id: evaluationId });
    return { result: 'deleted' }
}

export async function createSupervisorEvaluationReport(searchParams) {
    const clientId = searchParams.get('clientId')
    const nextStep = searchParams.get('nextStep')
    const appetiteRanking = searchParams.get('appetiteRanking');
    const handlerPerformance = searchParams.get('handlerPerformance');
    const outcome = JSON.parse(searchParams.get('outcome'));
    const questionAndAnswers = JSON.parse(searchParams.get('questionAndAnswers'));
    const goalId = searchParams.get('goalId');
    const followupId = searchParams.get('followupId');
    const evaluationId = searchParams.get('evaluationId');

    const userId = (await getSession())?.userId

    console.log('create supervisor evaluation report called', {
        clientId, nextStep, userId, followupId, appetiteRanking, outcome,
        handlerPerformance, questionAndAnswers, goalId, evaluationId
    })

    evaluationId
        ? await SupervisorEvaluations.updateOne({ _id: evaluationId }, {
            $set: {
                clientId, nextStep, userId, followupId, handlerPerformance,
                appetiteRanking, outcome, questionAndAnswers, goalId
            }
        })
        : await SupervisorEvaluations.create({
            clientId, nextStep, userId, followupId, handlerPerformance,
            appetiteRanking, outcome, questionAndAnswers, goalId
        })

    return { result: 'created' }
}

export async function deleteContactGoal(searchParams) {
    const goalId = searchParams.get('id');

    await Goals.deleteOne({ _id: goalId });
    await Followups.deleteMany({ goalId });
    return { result: 'deleted' }
}

export async function startContactGoal(searchParams) {
    const goalId = searchParams.get('goalId');
    await Goals.updateOne({ _id: goalId }, { $set: { progessStatus: 'inProgress' } });
    return { result: 'updated' }
}

export async function updateStage() {

    await Contacts.updateMany({}, { $set: { stage: 'prospect' } })

    return { result: 'done' }
}

const getProspects = ({ contacts, goals, followups, messages, notes }) => {
    return contacts?.map(i => {
        const relatedGoals = goals.filter(it => it?.clientId === i?._id?.toString())
        const relatedFollowups = followups.filter(it => it?.clientId === i?._id?.toString())

        return {
            ...i?.toObject(),
            handler: [...(i?.handler || []), ...(i?.rep || [])],
            followup: {
                used: relatedFollowups.length,
                max: relatedGoals?.reduce((acc, value) => acc + Number(value?.maxFollowup), 0)
            },
            appetiteRanking: Math.trunc(relatedFollowups?.reduce((acc, value) => acc + Number(value?.appetiteRanking), 0) / 4),
            attachment: {
                email: {
                    sent: messages?.sentMessages.filter(it => it?.email === i?.toObject()?.email)?.reduce((acc, value) => acc + (value?.attachments?.length || 0), 0),
                    received: messages?.receivedMessages.filter(it => it?.email === i?.toObject()?.email)?.reduce((acc, value) => acc + (value?.attachments?.length || 0), 0)
                },
                facebook: {
                    sent: 0,
                    received: 0
                },
                notes: notes.filter(it => it?.clientId === i?._id?.toString())?.reduce((acc, value) => acc + (value?.attachments?.length || 0), 0)
            },
            messages: {
                email: {
                    sent: messages?.sentMessages.filter(it => it?.email === i?.toObject()?.email)?.length,
                    received: messages?.receivedMessages.filter(it => it?.email === i?.toObject()?.email)?.length
                },
                facebook: {
                    sent: 0,
                    received: 0
                },
                notes: notes.filter(it => it?.clientId === i?.toObject()?._id?.toString())?.length
            }
        }
    })
}

const getClients = ({ contacts, goals, users, followups, evaluations, messages, notes }) => {
    return contacts?.map(i => {
        const relatedGoals = goals.filter(it => it?.clientId === i?._id?.toString())
        const relatedFollowups = followups.filter(it => it?.clientId === i?._id?.toString())
        const relatedEvaluations = evaluations.filter(it => it?.clientId === i?._id?.toString())

        const theGoals = {}
        relatedGoals.forEach(i => (theGoals[i.progessStatus] = (theGoals[i.progessStatus] || 0) + 1))

        return {
            ...i?.toObject(),
            handler: [...(i?.handler || []), ...(i?.rep || [])],
            followup: {
                used: relatedFollowups.length,
                max: relatedGoals?.reduce((acc, value) => acc + Number(value?.maxFollowup), 0)
            },
            handlerPerformance: relatedFollowups.map(it => {
                const user = users?.find(i => i?._id?.toString() === it?.userId)
                return {
                    name: user?.fullName, email: user?.email,
                    rating: relatedEvaluations?.find(i => i?.followupId === it?._id?.toString())?.handlerPerformance
                }
            }),
            attachment: {
                email: {
                    sent: messages?.sentMessages.filter(it => it?.email === i?.toObject()?.email)?.reduce((acc, value) => acc + (value?.attachments?.length || 0), 0),
                    received: messages?.receivedMessages.filter(it => it?.email === i?.toObject()?.email)?.reduce((acc, value) => acc + (value?.attachments?.length || 0), 0)
                },
                facebook: {
                    sent: 0,
                    received: 0
                },
                notes: notes.filter(it => it?.clientId === i?._id?.toString())?.reduce((acc, value) => acc + (value?.attachments?.length || 0), 0)
            },
            goals: theGoals,
            projects: [{ name: 'MTN PROJECT', color: 'red' }]
        }
    })
}

export async function getContacts(searchParams) {
    const offset = Number(searchParams.get('offset'));
    const size = Number(searchParams.get('size'));
    const id = searchParams.get('id');
    const countItems = searchParams.get('countItems');
    const contactName = searchParams.get('contactName');
    const stage = searchParams.get('stage');

    console.log('get contact called', offset, size, id, countItems, contactName);

    if (id) {
        return { result: await Contacts.findOne({ _id: id }) }
    }
    else if (countItems) {
        const data = await Contacts.find({})
        return { result: { count: data?.length, contacts: data.slice(0, 10) } }
    }
    else if (contactName) {
        return {
            result: await Contacts.find({ fullName: { $regex: `(^${contactName}|\\s${contactName})`, $options: 'i' }, })
                .skip(offset).limit(size)
        }
    }
    else {
        const data = await Contacts.find({ stage });
        const goals = await Goals.find({});
        const followups = await Followups.find({});
        const evaluations = stage === 'client' && await SupervisorEvaluations.find({});
        const notes = await Notes.find({});
        const users = await User.find({});
        const messages = { sentMessages: [], receivedMessages: [] } //await emailMessages({ emailAddress: null })

        return {
            result: stage === 'prospect'
                ? getProspects({ contacts: data, goals, followups, messages, notes })
                : getClients({ contacts: data, users, goals, evaluations, followups, messages, notes })
        }
    }
}

export async function getAppSecretProof(searchParams) {
    let hmac = crypto.createHmac("sha256", process.env.FB_APP_SECRET);
    let signed = hmac.update(Buffer.from(process.env.FB_ACCESS_TOKEN, 'utf-8')).digest("hex");

    return { result: 'signed' }
}

export async function updateHandler(searchParams) {
    const handler = JSON.parse(searchParams.get('handler'));
    const key = searchParams.get('key');
    const id = searchParams.get('id');

    console.log('updating handler', { key, id, handler })

    const exisiting = await Contacts.findOne({ _id: id });

    await Contacts.updateOne({ _id: id }, {
        $set: {
            [key]: handler,
            ...((exisiting?.status === 'not assigned' && key === 'handler') ? { status: 'introductory' } : {})
        }
    });

    return { result: 'saved' }
}

export async function updateContactStatus(searchParams) {
    const status = searchParams.get('status');
    const id = searchParams.get('id');

    console.log('updating contact status', { status, id })

    status && id && await Contacts.updateOne({ _id: id }, {
        $set: { status, ...(status === 'not assigned' ? { handler: [], supervisor: [], rep: [] } : {}) }
    });

    return { result: 'saved' }
}

export async function createContact(searchParams) {
    const contactArray = JSON.parse(searchParams.get('contactObject'));
    console.log('contactArray', contactArray)

    const result = await Contacts.insertMany(contactArray);

    const session = await getSession('session');

    const notificationObject = {
        title: 'New contact created',
        details: `${session?.fullName} added a new contact`,
        recipients: [session?.email]
    }

    await createNotification(notificationObject);

    return { result: Boolean(result) }
}

export async function editContact(searchParams) {
    const contactObject = JSON.parse(searchParams.get('contactObject'));
    const clientId = searchParams.get('clientRecordId');

    const result = await Contacts.updateOne({ _id: clientId }, { $set: contactObject });
    if (result) {
        const session = await getSession('session');

        const notificationObject = {
            title: 'Contact modified',
            details: `${session?.fullName} modified a contact`,
            recipients: [session?.email]
        }

        await createNotification(notificationObject);

        return { result: Boolean(result) }
    }

}

export async function deleteContact(searchParams) {
    const clientId = searchParams.get('id');

    const result = await Contacts.deleteOne({ _id: clientId });

    console.log('result', result)

    if (result) {
        const session = await getSession('session');
        const notificationObject = {
            title: 'Contact deleted',
            details: `${session?.fullName} deleted a contact`,
            recipients: [session?.email]
        }

        await createNotification(notificationObject);
        return { result: Boolean(result) }
    }

}

export async function emailClient(searchParams) {
    const to = searchParams.get('to');
    const subject = searchParams.get('subject');
    const emailBody = searchParams.get('emailBody');

    const emailPayload = {
        from: `Lamid Consulting <${process.env.EMAIL}>`,
        to: to,
        subject: subject,
        text: emailBody,
        //   html: `<p>Hi</p><p>The OTP for resetting your password is ${otp}</p>`
    };

    const emailSent = await sendEmail({
        toEmail: emailPayload.to, fromHeading: emailPayload.from,
        subject: emailPayload.subject, text: emailPayload.text, html: '',
    })

    if (emailSent) {
        const session = await getSession('session');
        const notificationObject = {
            title: 'Mail sent to a contact',
            details: `${session?.fullName} sent a mail to ${to}`,
            recipients: [session?.email]
        }

        await createNotification(notificationObject);
        return { result: true }
    }

}

export async function getLocation(searchParams) {
    const country = searchParams.get('country')?.toLowerCase();
    const state = searchParams.get('state')?.toLowerCase();
    const type = searchParams.get('type');

    const data = await fs.readFile('country-state-city.json', 'utf-8')
    const jsonContent = JSON.parse(data);

    if (type === 'state') {
        const states = jsonContent.find(item => item.name.toLowerCase() === country).states.map(theState => theState.name)
        states.push('State')
        return { result: states }
    }
    else if (type === 'city') {
        const cities = jsonContent.find(item => item.name.toLowerCase() === country).states.find(stateVal => stateVal.name.toLowerCase() === state).cities.map(city => city.name)
        cities.push('City')
        return { result: cities }
    }
}

export async function getFollowupHistory(searchParams) {
    const contactId = searchParams.get('id');
    const contactMode = searchParams.get('contactMode');

    const history = await Followups.find({ clientId: contactId, contactMode: contactMode });

    return { result: history }
}

export async function getFollowupComments(searchParams) {
    const followupId = searchParams.get('followupId');

    const comments = await FollowupComments.find({ followupId: followupId });

    return { result: comments }
}

export async function createFollowupComment(searchParams) {
    /*    date: date, time: time, followupId: followupId, comment: comment, */

    const followupId = searchParams.get('followupId');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const comment = searchParams.get('comment');
    const session = await getSession();
    const fullName = session?.fullName;
    const email = session?.email;

    console.log('searchParams', searchParams);

    const newComment = new FollowupComments({
        date: date, time: time, followupId: followupId,
        email: email, fullName: fullName, comment: comment
    });
    const result = await newComment.save();

    console.log('result', result)
    const id = result._id?.toString()

    if (id) {
        const notificationObject = {
            title: 'New follow-up comment',
            details: `${session?.fullName} made a follow-up comment`,
            recipients: [email]
        }

        await createNotification(notificationObject);
    }

    if (id)
        return { result: { fullName: fullName, email: email, id: id } }
}

export async function createFollowUp(searchParams) {
    const clientId = searchParams.get('clientId');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const contactMode = searchParams.get('contactMode');
    const topic = searchParams.get('topic');
    const details = searchParams.get('details');
    const rating = Number(searchParams.get('rating'));

    const followup = new Followups({
        date: date, time: time, clientId: clientId,
        contactMode: contactMode, topic: topic, details: details, rating: rating
    })

    const result = await followup.save()

    if (result) {
        const session = await getSession('session');
        const notificationObject = {
            title: 'New follow-up',
            details: `${session?.fullName} followed up on a contact via ${contactMode}`,
            recipients: [session?.email]
        }

        await createNotification(notificationObject);
        return { result: Boolean(result) }
    }

}

export async function NumberOfFollowupComments(searchParams) {
    const followupId = searchParams.get('followupId');

    const commentCount = await FollowupComments.find({ followupId: followupId }).count();

    return { result: commentCount }
}

export async function getForms(searchParams) {
    const formId = searchParams.get('formId');

    const form = formId !== 'undefined' ? await Forms.findOne({ _id: formId }) : await Forms.find({});



    return { result: form }
}

export async function createForms(searchParams) {
    const formTitle = searchParams.get('formTitle');
    const formData = searchParams.get('formData');

    const form = new Forms({ formTitle: formTitle, formJSON: formData })

    const saved = await form.save();

    if (saved) {
        const session = await getSession('session');
        const notificationObject = {
            title: 'New form created',
            details: `${session?.fullName} created a new form titled ${formTitle}`,
            recipients: [session?.email]
        }

        await createNotification(notificationObject);
        return { result: true }
    }

}

export async function editForms(searchParams) {
    const formData = searchParams.get('formData');
    const formId = searchParams.get('formId');

    const result = await Forms.updateOne({ _id: formId }, { $set: { formJSON: formData } })

    if (result) {
        const session = await getSession('session');
        const notificationObject = {
            title: 'Form modified',
            details: `${session?.fullName} modified a form`,
            recipients: [session?.email]
        }

        await createNotification(notificationObject);
        return { result: true }
    }

}

// export async function getDocument(searchParams) {
//     const docType = searchParams.get('docType');

//     const doc = await Documents.find({ extension: docType });

//     return { result: doc }
// }
export async function getDocument(searchParams) {
    const docType = searchParams.get('docType');
    const folderId = searchParams.get('folderId');

    console.log("backend folderId:", folderId)

    // Define the query based on docType and folderId
    let query = { extension: docType };
    if (folderId) {
        query.folderId = folderId;
    }

    // Use the query to find documents
    const doc = await Documents.find(query);

    return { result: doc };
}


export async function deleteDocument(searchParams) {
    const fileName = searchParams.get('fileName');

    const result = await Documents.deleteMany({ filename: fileName });

    const filepath = path.join(initialPath, 'files', 'documents', fileName);

    const deleted = await fs.unlink(filepath);
    //   console.log('deleted', deleted)

    if (result && deleted === undefined) {
        const session = await getSession('session');
        const notificationObject = {
            title: 'Document deleted',
            details: `${session?.fullName} deleted a document`,
            recipients: [session?.email]
        }

        await createNotification(notificationObject);
        return { result: true }
    }
}

export async function saveDocument(searchParams) {
    
    const dateTime = moment().format('yyyy-MM-DD h:mm a').toString()
    const filenames = JSON.parse(searchParams.get('filenames'));
    // console.log("file in backend;", fileArray)
  
    const arrayToSave = [] // this will be sent to the database

    const files = filenames.map(fileInfo => {
        const file = searchParams.get(fileInfo.filename);
        if (!file) {
            console.log(`File with name ${fileInfo.filename} not found in request parameters.`);
            return null;
        }
    
        const extension = file.name.split('.').reverse()[0];
        const realFileName = fileInfo.filename.split('.')[0];
        const fileName = `${crypto.randomUUID()}.${extension}`;
    
        arrayToSave.push({ name: realFileName, filename: fileName, extension: extension, dateTime: dateTime, downloads: 0, folderId: fileInfo.folderId });
    
        return { filename: fileName, filedata: file };
    });
    

    const dataSaved = await Documents.insertMany(arrayToSave);

    if (dataSaved) {
        const saved = await saveFile({ folder: 'documents', fileArray: files })

        console.log('files', saved, files);

        console.log('files to save', arrayToSave);

        if (saved) {
            const session = await getSession('session');
            const notificationObject = {
                title: 'Documents uploaded',
                details: `${session?.fullName} uploaded ${dataSaved?.length} new documents`,
                recipients: [session?.email]
            }

            await createNotification(notificationObject);
            return { result: true };
        }
    }
}




export async function downloadDocument(searchParams) {
    const fileName = searchParams.get('filename');

    console.log(' called download', fileName)

    const result = await Documents.updateOne({ filename: fileName }, { $inc: { downloads: 1 } });

    const filePath = path.join(initialPath, 'files', 'documents', fileName);


    const buffer = await fetchFile({ filePath: filePath })

    //console.log('filePath', filePath, result);

    if (buffer)
        return { result: buffer }
}

export async function getProjectGroupDashboard(searchParams) {

    const successCallback = (result) => {
        /* We need the following data on the project group dashboard:
      1. For each project, get number of:
          a. toDo b. inProgress c. review  d. completed  tasks
      2. For each project, get:
          a. total project budget
          b. total payment by client
          c. amount spent so far
          d. total time spent
          e. total time bank*/

        if (result) {
            const finalResult = {};
            /* Structure of final result: {[projectgroupname]:{
              id:386323896392assdas, color:'red', toDo:21,inProgress:34,review:72,completed:12,totalBudget:213202,totalClientPayment:12324,amountSpent:2212,
                timeSpentInMinutes:2112,timeBankInMinutes:31422
            },
            [projectgroupname]:{...bla bla bla again as in the previous iteration}} */
            console.log("result obtained... Let's process the data");

            result.forEach(projectGroup => {
                const projectGroupName = projectGroup.projectName;
                //Initialise the key-value pair for this project group
                finalResult[projectGroupName] = {
                    id: projectGroup._id, color: projectGroup.color, projectName: projectGroupName,
                    totalClientPayment: projectGroup?.totalClientPayment ?? 0, toDo: 0, inProgress: 0, review: 0,
                    completed: 0, totalBudget: 0, amountSpent: 0, timeSpentInMinutes: 0, timeBankInMinutes: 0
                };

                //Get the toDo,inProgress, review, completed, totalBudget, amountSpent, timeSpentInMinutes, timeBankInMinutes
                Object.values(projectGroup.workPhases).forEach(workPhase => {
                    Object.values(workPhase.goals).forEach(goal => {
                        goal.tasks.forEach(task => {
                            //Increase the respective status
                            finalResult[projectGroupName][task.status] += 1
                            //Increase the totalbudget
                            finalResult[projectGroupName].totalBudget += Number(task.taskBudget || 0)
                            //Increase the amountSpent
                            finalResult[projectGroupName].amountSpent += Number(task.amountSpent ?? 0)
                            //Increase the timeSpent
                            finalResult[projectGroupName].timeSpentInMinutes += Number(task.timeSpent ?? 0)
                            //Increase the timeBank
                            finalResult[projectGroupName].timeBankInMinutes += (Number(task.hours || 0) * 60) + Number(task.minutes || 0)
                        })

                        //  return true
                    })
                    //return true
                });
                // return true
            })

            return { result: finalResult };
        }
        else {
            console.log('no project group found');
            return { result: {} }
        }
    }

    const projectGroupDashboard = await ProjectGroups.find({});

    console.log('projectGroupDashboard', projectGroupDashboard);

    return successCallback(projectGroupDashboard);
}

export async function validateNameInProjectGroup(searchParams) {
    const category = searchParams.get('category')
    const value = searchParams.get('value');

    if (category === 'projectName') {
        const projectName = await ProjectGroups.findOne({ projectName: value });

        console.log('existing name', projectName);

        return { result: [projectName] }
    }
}

export async function getStaffFromFilter(searchParams) {
    const filter = searchParams.get('filter')

    const users = await User.find({});

    console.log('existing name', users);

    return { result: users }

}

export async function getProfilePictureFromArrayOfEmails(searchParams) {
    const emailArray = JSON.parse(searchParams.get('emailArray'))

    const records = await User.find({ email: { $in: emailArray } });

    console.log('existing profile picture records', emailArray, records);

    return { result: records }

}

export async function createProjectGroup(searchParams) {
    const projectObject = JSON.parse(searchParams.get('data'))

    const phases = {};
    Object.values(projectObject.workPhases).forEach(phaseObject => {
        phases[phaseObject.phaseName] = { phaseName: phaseObject.phaseName, goals: {} };
        Object.values(phaseObject.goals).forEach(goalObject => {
            phases[phaseObject.phaseName].goals[goalObject.goalName] = { ...goalObject, status: 'toDo' }
        })
    });

    console.log('newObject', phases)

    const projectGroup = new ProjectGroups({
        ...projectObject, workPhases: { ...phases }
    })

    const saved = await projectGroup.save();

    console.log('existing records', saved);

    if (saved?._id) {
        const session = await getSession('session');
        const notificationObject = {
            title: 'New project group',
            details: `${session?.fullName} created a new project group named ${projectObject?.projectName}`,
            recipients: [session?.email]
        }

        await createNotification(notificationObject);
        return { result: true }
    }


}

export async function getProjectGroupData(searchParams) {
    const projectId = searchParams.get('projectId')

    const projectGroup = await ProjectGroups.findOne({ _id: projectId });

    console.log('the projectGroup', projectId, projectGroup);

    return { result: projectGroup }
}

export async function getWorkPhases(searchParams) {
    const projectId = searchParams.get('projectId')
    const index = searchParams.get('index')

    const result = await ProjectGroups.findOne({ _id: projectId });

    if (result) {
        const arrayOfWorkPhases = Object.values(result.workPhases)

        console.log('the arrayOfWorkPhases', projectId, arrayOfWorkPhases);

        return {
            result: {
                numberOfWorkPhases: arrayOfWorkPhases.length,
                workPhase: arrayOfWorkPhases[Number(index)],
            }
        }
    }
}

export async function getSchedule(searchParams) {
    const session = await getSession('session');

    if (session) {
        const email = session.email;
        //Find documents where selectedStaff includes the email
        const schedules = await Schedules.find({ /* selectedStaff: email  */ });

        console.log('the schedules ', schedules);

        return { result: schedules }
    }

}

export async function getProjectGroup(searchParams) {
    const projectGroups = await ProjectGroups.find({});

    console.log('projectGroups', projectGroups);

    return { result: projectGroups }
}

export async function getStaff(searchParams) {
    const session = await getSession();

    if (searchParams.get('list')) {
        //get the full list of staff. Pagination should be used here to conserve memory
        const staffList = await User.find({});
        console.log('staffList', staffList)

        if (staffList) {
            return { result: { data: staffList, email: session?.email } };
        }
    }
    else {
        let email = searchParams.get('email');
        email = email ? email : session.email;

        const staff = await User.findOne({ email: email });

        console.log('staff', staff)

        return { result: { data: staff, email: session?.email } }
    }
}

export async function getStaffPrivileges(searchParams) {
    const email = searchParams.get('email');

    const privileges = await User.findOne({ email: email }).select({ privileges: 1 })

    console.log('staff privileges', privileges);

    return { result: privileges }
}

export async function addNewStaff(searchParams) {
    const data = JSON.parse(searchParams.get('data'));
    let filename = JSON.parse(searchParams.get('filenames'));// Array of names of files to be used to retrieve the files
    let profilePicture = null

    console.log('data', data, filename)

    if (filename?.length) {
        profilePicture = searchParams.get(filename[0]);
        const extension = profilePicture.name.split('.').reverse()[0]
        filename = `${crypto.randomUUID()}.${extension}`
    }
    else {
        filename = null
    }

    //hash the password
    const passwordHash = await bcrypt.hash(data.password, Number(process.env.SALT));

    console.log('filename', filename, passwordHash)

    //saved the data to database
    const user = new User({ ...data, profilePicture: filename ? filename : 'default.png', password: passwordHash });

    const saved = await user.save();

    if (saved?._id) {
        ///saved the files to storage, if any file was uploaded
        if (filename) {
            saveFile({ folder: 'profile-pictures', fileArray: [{ filename: filename, filedata: profilePicture }] })
        }

        console.log('new staff', saved);

        const session = await getSession('session');
        const notificationObject = {
            title: 'New user/staff profile created',
            details: `${session?.fullName} added a new user named ${data?.fullName}`,
            recipients: [session?.email]
        }

        await createNotification(notificationObject);

        return { result: true }
    }
}

export async function checkEmail(searchParams) {
    const email = searchParams.get('email');

    const existingUsers = await User.findOne({ email: email }).select({ _id: 1 })

    console.log('existing staff', existingUsers);

    return { result: Boolean(existingUsers) }
}

export async function getProfilePictureByName(searchParams) {
    const filename = searchParams.get('filename');
    const thisUser = searchParams.get('thisUser');
    const session = await getSession();
    const email = thisUser ? session?.email : searchParams.get('email');

    let filepath = null

    if (email) {
        const filename = await User.findOne({ email: email });
        filepath = path.join(initialPath, 'files', 'profile-pictures', filename?.profilePicture);
    }
    else {
        filepath = path.join(initialPath, 'files', 'profile-pictures', filename);
    }

    const file = await fetchFile({ filePath: filepath });

    if (file) {
        return { result: file }
    }
}

export async function deleteStaff(searchParams) {
    const email = searchParams.get('email');

    //get profile picture
    const fileName = await User.findOne({ email: email }).select({ profilePicture: 1, _id: 0 });

    if (fileName && fileName?.profilePicture !== 'default.png') {
        //delete profile picture
        const filepath = path.join(initialPath, 'files', 'profile-pictures', fileName.profilePicture)

        await deleteFile({ filePath: filepath });
    }

    const deleted = await User.deleteOne({ email: email })

    console.log('staff  deleted', deleted);

    const session = await getSession('session');
    const notificationObject = {
        title: 'User/staff profile deleted',
        details: `${session?.fullName} deleted the user with the email ${email}`,
        recipients: [session?.email]
    }

    await createNotification(notificationObject);

    return { result: true }
}

export async function searchForStaff(searchParams) {
    const staffName = searchParams.get('name');

    const existingUsers =
        await User.find({ fullName: { $regex: `(^${staffName}|\\s${staffName})`, $options: 'i' }, },)
            .select({ fullName: 1, email: 1 })

    console.log('existing staff', existingUsers);

    return { result: existingUsers }
}

export async function updateStaff(searchParams) {
    const email = searchParams.get('email');
    const data = JSON.parse(searchParams.get('data'));
    let filename = JSON.parse(searchParams.get('filenames'));// Array of names of files to be used to retrieve the files
    let profilePicture = null

    console.log('data', data, filename)

    if (data.imageChanged) {
        console.log('image changed');
        profilePicture = searchParams.get(filename[0]);
        const extension = profilePicture.name.split('.').reverse()[0]

        const originalName = data.originalFilename;

        //reuse the existing file if it is not the default profile picture
        filename = originalName !== 'default.png' ? originalName : `${crypto.randomUUID()}.${extension}`
    }
    else {
        console.log('image did not change');
        filename = null
    }

    //hash the password if the password was changed
    const passwordHash = data.passwordChanged ? await bcrypt.hash(data.password, Number(process.env.SALT)) : data.password;

    console.log('filename', filename, passwordHash)

    //delete sensitive read only keys from the object received from the user. 
    //Only users with special privileges can alter these fields. These fields include:
    //privileges, projectGroup,projectGroupRole,projectColor,designation
    delete data.privileges;
    delete data.projectGroup;
    delete data.projectGroupRole;
    delete data.designation;

    //saved the data to database
    const saved = await User.updateOne({ email: email },
        { $set: { ...data, profilePicture: filename ? filename : data.profilePicture, password: passwordHash } }
    );


    if (saved?.modifiedCount) {
        ///saved the files to storage, if any file was uploaded
        if (filename) {
            saveFile({ folder: 'profile-pictures', fileArray: [{ filename: filename, filedata: profilePicture }] })
        }

        if (data.emailChanged) {
            //log the user out so that they can log in with the new email
            const loggedOut = await logOut()

            if (loggedOut)
                return { result: true }
        }
        else {
            return { result: true }
        }

        const session = await getSession('session');
        const notificationObject = {
            title: 'User/staff profile modified',
            details: `${session?.fullName} modified the profile of the user with the email ${email}`,
            recipients: [session?.email]
        }

        await createNotification(notificationObject);
    }
}

export async function checkPassword(searchParams) {
    const password = searchParams.get('password');
    const session = await getSession();
    const email = session?.email;

    if (email) {
        const result = await User.findOne({ email: email }).select({ _id: 0, password: 1 })

        const match = await bcrypt.compare(password, result?.password);

        console.log('match', match);

        if (match) return { result: true }
        else return { result: false }
    }
}

export async function getPrivileges(searchParams) {
    const name = searchParams.get('name');

    const privileges = name ? await Privileges.findOne({ name: name }) : await Privileges.find({}).select({ name: 1, _id: 0 })

    return { result: privileges }
}

export async function editPrivileges(searchParams) {
    const name = searchParams.get('name');
    const privilegeObject = JSON.parse(searchParams.get('privilegeObject'));

    const result = await Privileges.updateOne({ name: name }, { $set: { privilegeObject: privilegeObject } });

    if (result.modifiedCount) {
        const session = await getSession('session');
        const notificationObject = {
            title: 'Saved Privilege modified',
            details: `${session?.fullName} modified the privilege named ${name}`,
            recipients: [session?.email]
        }

        await createNotification(notificationObject);
        return { result: true }
    }
}

export async function createPrivileges(searchParams) {
    const name = searchParams.get('name');
    const privilegeObject = JSON.parse(searchParams.get('privilegeObject'));

    const privilege = new Privileges({ name: name, privilegeObject: privilegeObject })

    const result = await privilege.save();

    if (result._id) {
        const session = await getSession('session');
        const notificationObject = {
            title: 'New privilege created',
            details: `${session?.fullName} create a new privilege named ${name}`,
            recipients: [session?.email]
        }

        await createNotification(notificationObject);
        return { result: true }
    }

}

export async function deletePrivilege(searchParams) {
    const name = searchParams.get('name');

    const result = await Privileges.deleteOne({ name: name })

    if (result.deletedCount) {
        const session = await getSession('session');
        const notificationObject = {
            title: 'Saved privilege deleted',
            details: `${session?.fullName} deleted the privilege named ${name}`,
            recipients: [session?.email]
        }

        await createNotification(notificationObject);
        return { result: true }
    }
}

const createScheduleNotification = ({ dataObject, edit }) => {
    return {
        title: edit ? 'Change of plans' : `New ${dataObject?.type}`,

        details: `A new schedule has been created for ${moment(dataObject?.date).format('D-MMMM-yyyy')} 
        from ${dataObject?.startTime} to ${dataObject?.endTime}`,

        recipients: dataObject?.selectedStaff ?? [],
    };
}

export async function createSchedule(searchParams) {
    const dataObject = JSON.parse(searchParams.get('dataObject'));

    console.log('dataObject', dataObject);

    const schedule = new Schedules(dataObject)
    const result = await schedule.save();

    if (result?._id) {
        const notificationObject = createScheduleNotification({ dataObject: dataObject })

        const notificationSentToMembers = await createNotification({ ...notificationObject })

        console.log('notificationSentToMembers', notificationSentToMembers)

        return { result: result?._id }
    }
}

export async function saveScheduleEdit(searchParams) {
    const dataObject = JSON.parse(searchParams.get('dataObject'));
    const id = searchParams.get('id');

    const result = await Schedules.updateOne({ _id: id }, { $set: dataObject }, { upsert: false })

    console.log('result', id, result, dataObject);

    if (result.modifiedCount) {
        const notificationObject = createScheduleNotification({ dataObject: dataObject, edit: true })

        const notificationSentToMembers = await createNotification({ ...notificationObject })

        console.log('notificationSentToMembers', notificationSentToMembers)

        return { result: id }
    }
}

export async function deleteSchedule(searchParams) {
    const id = searchParams.get('id');

    const result = await Schedules.findOneAndDelete({ _id: id, }, { rawResult: true })

    console.log('result', id, result);

    if (result.ok) {
        const dataObject = result.value;

        const notificationObject = {
            title: 'Change of plans',

            details: `The ${dataObject?.type} titled "${dataObject?.label}" scheduled for ${dataObject?.startTime} to
             ${dataObject?.endTime} on ${dataObject?.date} 
            has been canceled`,

            recipients: dataObject?.selectedStaff
        }

        await createNotification({ ...notificationObject })
        return { result: true }
    }

}

export async function getNotifications(searchParams) {
    const session = await getSession('session');
    const email = session?.email;

    if (email) {
        const undelivered = await Notifications.count({ recipients: email, delivered: false });

        return { result: { message: `notif count ${undelivered}`, notificationCount: undelivered } }
    }
    else {
        return { message: 'not logged in' }
    }
}

export async function getNotificationList(searchParams) {
    const session = await getSession('session');
    const email = session?.email;

    if (email) {
        const undelivered = await Notifications.find({ recipients: email }).sort({ _id: -1 });
        const changedToDelivered = await Notifications.updateMany({ recipients: email, delivered: false },
            { $set: { delivered: true } }, { $upsert: false })

        return { result: undelivered }
    }
    else {
        return { result: false }
    }
}

export async function getGoalData(searchParams) {
    const projectId = searchParams.get('projectId');
    const goalName = searchParams.get('goalName');
    const phaseName = searchParams.get('phaseName');

    const workPhases = await ProjectGroups.findOne({ _id: projectId }).select({ workPhases: 1 });
    const chats = await ProjectChats.find({ projectId: projectId, workPhaseName: phaseName, goalName: goalName })
        .select({ goalName: 0, projectId: 0, workPhaseName: 0 }).sort({ _id: 1 });

    const goalObject = Object.values(
        Object.values(workPhases?.workPhases ?? {}).find(phaseObject => phaseObject.phaseName === phaseName).goals)
        .find(goal => goal?.goalName === goalName);

    if (chats && goalObject) {
        const session = await getSession('session');
        if (session) {
            return { result: { chats: chats, email: session.email, goalObject: goalObject } }
        }
    }
}

export async function getGoalChatFiles(searchParams) {
    const projectId = searchParams.get('projectId');
    const goalName = searchParams.get('goalName');
    const phaseName = searchParams.get('phaseName');

    const chatFiles = await ProjectChats.find({ projectId: projectId, workPhaseName: phaseName, goalName: goalName, file: true })
        .select({ goalName: 0, projectId: 0, workPhaseName: 0 }).sort({ _id: 1 });

    console.log('chatFiles', chatFiles)

    if (chatFiles) {
        return { result: chatFiles }
    }
}

export async function sendProjectGroupChat(searchParams) {
    const projectId = searchParams.get('projectId');
    const goalName = searchParams.get('goalName');
    const phaseName = searchParams.get('phaseName');
    const message = searchParams.get('message');
    const session = await getSession('session');
    const link = searchParams.get('link');
    const linkArray = JSON.parse(searchParams.get('linkArray'));
    const email = session?.email
    const dateTime = moment().format('yyyy-MM-DD h:mm a').toString();


    if (email) {
        const newChat = new ProjectChats({
            sender: email,
            message: message,
            goalName: goalName,
            workPhaseName: phaseName,
            projectId: projectId,
            dateTime: dateTime,
            link: link,
            linkArray: linkArray || []
        })

        const result = await newChat.save();

        console.log('result', result)

        if (result?._id) {
            return { result: { sender: email, message: message, dateTime: dateTime } }
        }
        else {
            return { result: false }
        }
    }
    else {
        return { result: false }
    }
}

export async function sendProjectGroupChatFile(searchParams) {
    const projectId = searchParams.get('projectId');
    const goalName = searchParams.get('goalName');
    const phaseName = searchParams.get('phaseName');
    const session = await getSession('session');
    const email = session?.email
    const dateTime = moment().format('yyyy-MM-DD h:mm a').toString();

    if (email) {
        const filenames = JSON.parse(searchParams.get('filenames'));

        const fileArr = filenames.map(item => searchParams.get(item))
        const fileToSave = []

        console.log('files', filenames, fileArr)

        const getFileData = (files) => {
            const fileData = files.map(file => {
                const extension = file.name.split('.').reverse()[0]
                const fileName = `${crypto.randomUUID()}.${extension}`

                fileToSave.push({ filename: fileName, filedata: file });

                return { fileName: fileName, fileExtension: extension }
            })

            console.log('filedata', fileData);
            return fileData;
        }

        const fileData = getFileData(fileArr);

        const newChat = new ProjectChats({
            sender: email,
            goalName: goalName,
            message: '',
            workPhaseName: phaseName,
            projectId: projectId,
            dateTime: dateTime,

            file: true,
            fileDataArray: fileData,
        })

        const result = await newChat.save();

        console.log('result', result)

        if (result?._id) {
            //save files
            await saveFile({ folder: 'group-chat-files', fileArray: fileToSave });

            return { result: { sender: email, file: true, fileDataArray: fileData, dateTime: dateTime } }
        }
        else {
            return { result: false }
        }
    }
    else {
        return { result: false }
    }
}

export async function getFileByName(searchParams) {
    const filename = searchParams.get('filename');
    const folder = searchParams.get('folder');

    let filepath = path.join(initialPath, 'files', folder, filename);

    const file = await fetchFile({ filePath: filepath });

    console.log('files', filename, folder, filepath, file);

    if (file) {
        return { result: file }
    }
}

export async function getLinkArray(searchParams) {
    const projectId = searchParams.get('projectId');
    const goalName = searchParams.get('goalName');
    const phaseName = searchParams.get('phaseName');

    const linkArr = await ProjectChats.find({ projectId: projectId, workPhaseName: phaseName, goalName: goalName, link: true })
        .select({ linkArray: 1, dateTime: 1 }).sort({ _id: 1 });

    console.log('linkArr', linkArr)

    if (linkArr)
        return { result: linkArr }
}

const updateWorkPhase = async ({ projectId, workPhaseGenerator, type, goalName, phaseName,
    notificationMsg, notificationTitle }) => {
    //Get the workphases for the projectId
    const project = await ProjectGroups.findOne({ _id: projectId }).select({ workPhases: 1, projectName: 1 });

    if (project) {
        const newWorkPhases = workPhaseGenerator(project.workPhases);

        //update the workphase
        const result = await ProjectGroups.updateOne({ _id: projectId }, { $set: { workPhases: newWorkPhases } })

        if (result.modifiedCount) {
            const session = await getSession('session');

            const notificationObject = {
                title: notificationTitle ?? `New ${type} added`,

                details: notificationMsg ?
                    notificationMsg({ fullName: session?.fullName, projectname: project.projectName })
                    : `${session?.fullName} added a new ${type} to the
                  ${type === 'task' ? 'Goal' : 'Workphase'} named ${type === 'task' ? goalName : phaseName} in 
                  ${type === 'task' ? phaseName : project.projectname}`,

                recipients: [session?.email]
            }

            await createNotification(notificationObject);

            return newWorkPhases
        }
    }
}

export async function addNewGoalOrTask(searchParams) {
    const projectId = searchParams.get('projectId');
    const goalName = searchParams.get('goalName');
    const phaseName = searchParams.get('phaseName');
    const tasks = JSON.parse(searchParams.get('tasks'));
    const type = searchParams.get('type');

    console.log('add new goal or task', projectId, goalName, phaseName, tasks, type)

    const workPhaseGenerator = (workPhases) => {
        workPhases[phaseName].goals[goalName] = {
            goalName: goalName,
            tasks: type === 'goal' ? tasks : [...workPhases[phaseName].goals[goalName].tasks, ...tasks],
            status: 'toDo'
        };
        return workPhases
    }

    const result = await updateWorkPhase({
        projectId: projectId, workPhaseGenerator: workPhaseGenerator, type: type,
        phaseName: phaseName, goalName: goalName,
    })

    if (result)
        return { result: { data: result } }
}

export async function changeGoalStatus(searchParams) {
    const projectId = searchParams.get('projectId');
    const goalName = searchParams.get('goalName');
    const workPhase = searchParams.get('phaseName');
    const newStatus = searchParams.get('newStatus');

    const workPhaseGenerator = (workPhases) => {
        const newTaskArray = workPhases[workPhase].goals[goalName].tasks?.map(task => {
            return { ...task, status: newStatus };
        });

        workPhases[workPhase].goals[goalName].status = newStatus;

        workPhases[workPhase].goals[goalName].tasks = newTaskArray;

        return workPhases
    }

    const notificationMsg = ({ projectname, fullName }) => {
        return `${fullName} changed the status of the goal in ${projectname} project group named ${goalName} to ${newStatus}`
    }

    const result = await updateWorkPhase({
        projectId: projectId, workPhaseGenerator: workPhaseGenerator, type: 'goal', notificationMsg: notificationMsg,
        goalName: goalName, phaseName: workPhase, notificationTitle: 'Status of Goal changed',
    })

    if (result)
        return { result: true }
}

export async function changeTaskStatus(searchParams) {
    const projectId = searchParams.get('projectId');
    const goalName = searchParams.get('goalName');
    const workPhase = searchParams.get('phaseName');
    const newStatus = searchParams.get('newStatus');
    const taskIndex = searchParams.get('taskIndex');

    const workPhaseGenerator = (workPhases) => {
        workPhases[workPhase].goals[goalName].tasks[Number(taskIndex)].status = newStatus;
        return workPhases
    }

    const notificationMsg = ({ projectname, fullName }) => {
        return `${fullName} changed the status of the task in the goal named ${goalName} to ${newStatus}. 
        The goal is in the workphase named ${workPhase} in ${projectname} project group`
    }

    const result = await updateWorkPhase({
        projectId: projectId, workPhaseGenerator: workPhaseGenerator, notificationMsg: notificationMsg,
        notificationTitle: 'Status of Task changed',
    })

    if (result)
        return { result: true }
}

//export async function LoginAuth(searchParams) {
/* This is where the auth flow starts for login
The steps are as follows:
1. Save the current payload in a session object named 'pendingRequest' using the key 'payload'.
2. Save the current url in the session object named 'pendingRequest' using the key 'url'.
3. Redirect the user to the login page.
4. After login, check if there is a session key named 'pendingRequest'.*/
//}

export async function testAuth(searchParams) {
    /*  return { result: { authSuccess: true } } */
}

export async function startTestAuth(searchParams) {
    /*     const type = searchParams.get('authType');
    
        const authUrl = ''
    
        switch (type) {
            case 'login':
                authUrl = '/login';
                break;
            default:
                authUrl = '/non'
        }
    
        return { authErr: 'login', authUrl: authUrl, type: authType } */
}


export async function getStaffTaskScheduleForDate(searchParams) {
    const date = searchParams.get('date');
    const staffEmail = searchParams.get('staffEmail');

    const dateMoment = moment(date, 'yyyy-MM-DD')
    const projectGroups = await ProjectGroups.find({});

    /*Final result Should be of the form
      [{ startDate: '2023-06-26',
         startTime: '11:00 am',
         endTime: '12:30 pm',
         hours: '112',
         minutes: '',
         endDate: '2023-07-10',
         state: 'inProgress',
         budget: 2197,
         type: 'event',
         label: 'Commence construction',
         description: 'Between Two teams'}] */

    const scheduleArray = []

    projectGroups.forEach(group => {
        //group contains: _id,color,projectName,purpose,workPhases. WorkPhases is an object.
        Object.entries(group.workPhases).forEach(([phaseName, phaseObject], index) => {
            console.log('phase done', phaseObject)
            //phaseObject contains:phaseName,goals. Goals is an object
            Object.entries(phaseObject.goals).forEach(([goalName, goalObject], index) => {
                console.log('goal done', goalObject)
                //goalObject contains: goalName,status, tasks. Tasks is an array
                goalObject.tasks.forEach((taskObject, index) => {
                    console.log('in task done', taskObject)
                    const taskAssignment = taskObject.taskAssignmentMapping[staffEmail];

                    const generalDataObject = {
                        projectId: group._id?.toString(),
                        phaseName: phaseName,
                        goalName: goalName,
                        taskIndex: index,
                        hours: taskObject.hours,
                        minutes: taskObject.minutes,
                        state: taskObject?.status ?? 'toDo',
                        budget: taskObject.taskBudget,
                        type: 'event',
                        label: taskObject.taskName,
                        description: taskObject.taskName,
                    }


                    //taskAssignment is an array of objects
                    //If the taskAssignment is not empty, then this staff is part of those on this task.
                    //If the taskAssignment contains the date specified, then add the data to the scheduleArray
                    if (taskAssignment) {
                        /*    const computeTaskTImeForDate = ({ currentEndTime }) => {
                               const newEndTime = moment(currentEndTime, 'hh:mm a').add(30, 'minutes').format('hh:mm a');
                               return newEndTime
                           }
    */
                        let tasksForToday = 0
                        let initialTime = null;

                        /*  const timeArray = assignmentObject.time.split('-');
                         const  startTime=timeArray[0]
                         //Multiply the length of the taskAssignment by 30 and add the product (in minutes) to the startTime
                         const totalMinutes=taskAssignment.length * 30;
                         const endTime=moment(startTime,'hh:mm a').add(totalMinutes,'minutes').format('hh:mm a')
  */

                        taskAssignment.forEach(assignmentObject => {
                            //assignmentObject contains: date, time.
                            if (dateMoment.isSame(moment(assignmentObject.date, 'yyyy-MM-DD'), 'date')) {
                                initialTime = initialTime ?? assignmentObject.time.split('-')[0]
                                tasksForToday++;
                                /*    scheduleArray.push({
                                       startDate: taskObject.startDate,
                                       startTime: timeArray[0],
                                       endTime: timeArray.reverse()[0],
                                       endDate: taskObject.endDate,
                                       ...generalDataObject
                                   }) */
                            }
                        })

                        if (initialTime) {
                            //Multiply the number of time slots for today by 30 and add the product (in minutes) to the startTime
                            const totalMinutes = tasksForToday * 30;
                            const endTime = moment(initialTime, 'h:mma').add(totalMinutes, 'minutes').format('h:mm a')

                            scheduleArray.push({
                                startDate: date,
                                startTime: initialTime,
                                endTime: endTime,
                                endDate: date,
                                ...generalDataObject
                            })
                        }


                    }
                    //Check if the date in the query is between the start and end date of this task

                    /*  const taskIsWithinDate = dateMoment.isBetween(moment(taskObject.startDate, 'yyyy-MM-DD'),
                         moment(taskObject.endDate, 'yyyy-MM-DD'), 'date')
 
                     console.log('taskIsWithinData', taskIsWithinDate);
 
                     if(taskIsWithinDate){
                         //Check if the 
                     } */
                })
            })
        })
    })

    console.log('projectGroups', scheduleArray);

    if (projectGroups)
        return { result: scheduleArray }
}

// Creating folders
// Import Folder model if needed

export async function createFolder(requestBody) {
    try {
        // Parse JSON data from the request body
        const { name } = req.json();

        // Assuming you have a Folder model defined
        const folder = new Folder({ name });

        // Save the folder to the database
        await folder.save();

        // Return the created folder
        return { folder };
    } catch (error) {
        // Handle errors
        console.error('Error creating folder:', error);
        return { error: 'Server error' }; // Return error message
    }
}



