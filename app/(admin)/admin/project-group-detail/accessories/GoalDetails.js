'use client'

import {
    Box, Button, IconButton, InputAdornment, Modal, OutlinedInput, Typography,
} from "@mui/material";


import AddIcon from "@mui/icons-material/AddOutlined";
import NextArrow from "@mui/icons-material/KeyboardArrowRight";

import AttachmentIcon from "@mui/icons-material/Attachment";
import SendIcon from "@mui/icons-material/SendOutlined";

import PlayIcon from "@mui/icons-material/PlayArrow";

import FlagIcon from "@mui/icons-material/Flag";
import BackIcon from "@mui/icons-material/WestOutlined";


import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import { ProfileAvatar } from "@/Components/ProfileAvatar.js";

import { openSnackbar, setPageTitle } from "@/Components/redux/routeSlice.js";

import { TaskDetails } from "./TaskDetails";

import moment from "moment";
import { resetProjectGroupData, updateProjectGroupData } from "@/Components/redux/newProjectGroup";

import { AddGoal } from "./AddGoal";
import { Gallery } from "./Gallery";
import IconElement from "@/Components/IconElement";
import { changeGoalStatus, getGoalData, sendFileToChat, sendGroupChat } from "../helper";


const CsvSvg = '/icons/CsvSvg.svg'
const ExcelSvg = '/icons/ExcelSvg.svg'
const PdfSvg = '/icons/pdfSvg.svg'
const TxtSvg = '/icons/TxtSvg.svg'

const NoMessageImg = '/images/no-message.png';


const extStyling = { width: '70px', height: '70px' }

const icon = (icon) => <IconElement {...{ src: icon, style: extStyling }} />

const status1 = {
    toDo: { label: 'To Do', bgcolor: '#0BC5EE1A', color: '#0BC5EE', nextStage: 'Click to start the goal', newStatus: 'inProgress' },
    inProgress: { label: 'In Progress', bgcolor: '#F293231A', color: '#F29323', nextStage: 'move to review', newStatus: 'review' },
    review: { label: 'Review', bgcolor: '#C809C81A', color: '#C809C8', nextStage: 'move to completed', newStatus: 'completed' },
    completed: { label: 'Completed', bgcolor: '#03B2031A', color: '#03B203', },
};

const messageStyles = {
    sameUser: {
        bgcolor: '#3D030314', borderRadius: '16px 0 16px 16px', border: '2px solid #1C1D221A'
    },
    differentUser: {
        bgcolor: '#F9F9F9', borderRadius: '0 16px 16px 16px', border: '2px solid #1C1D221A'
    }
}


const imageExtensions = ['png', 'jpg', 'jpeg'];
const fileExtIcons = {
    'pdf': icon(PdfSvg),
    'txt': icon(TxtSvg),
    'csv': icon(CsvSvg),
    'xlsx': icon(ExcelSvg)
}

let lastDate = moment().format('yyyy-MM-DD h:mm a');
const linkRegExp = /(?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*/g;

export function GoalDetails({ projectId, status, goalName, goBack, phaseName }) {

    const dispatch = useDispatch();

    console.log('projct id', projectId);

    const [chatfiles, setFiles] = useState({})

    const [state, setState] = useState({
        goalObject: {}, message: '', chatArray: [], status: status, showTaskDetails: false, selectedTaskId: null,
        selectedTaskIndex: null, selectedTaskData: {}, email: '', openTaskForm: false, openGallery: false,
        files: null, chatfiles: {}
    });

    useEffect(() => {
        handleGetGoalData('openTaskForm')
    }, [state.openTaskForm]);

    useEffect(() => {
        /* Set Page title */
        dispatch(setPageTitle({ pageTitle: 'Project Group' }))

        //  handleGetGoalData('inital')
    }, []);

    const updateState = (newValue) => {
        setState((previousValue) => {
            return { ...previousValue, ...newValue };
        });
    }

    useEffect(() => {
        //   handleGetGoalData('showTaskDetails')
    }, [state.showTaskDetails]);

    useEffect(() => {
        if (state.files) {
            //send files to the server and remove it later
            sendFileToChat({
                projectId: projectId, goalName: goalName, phaseName: phaseName, fileArray: state.files,
                dataProcessor: (result) => {
                    if (result) {
                        updateState({ files: null, chatArray: [...state.chatArray, result], });
                    }
                }
            })
        }
    }, [state.files])

    useEffect(() => {
        const dataSet = []
        state.chatArray.filter(item => item.file === true).map(stuff => dataSet.push(...stuff.fileDataArray))

        if (dataSet?.length) dataSet.forEach((item, index) => {
            console.log(`item ${index}`, item);
            /*  if (!chatfiles[item.fileName]) {
                 setFiles({ ...chatfiles, [item.fileName]: '/images/loading.png' }) */
            getFilePath(item.fileName)
            //  }
        })
    }, [state.chatArray])

    const handleGoBack = () => {
        goBack()
    }

    const handleGetGoalData = (from) => {
        console.log('handleGetGoalData called', from)
        getGoalData({
            projectId: projectId, goalName: goalName, phaseName: phaseName,
            dataProcessor: (result) => {
                if (result) {
                    updateState({
                        goalObject: { ...result?.goalObject },
                        chatArray: [...result?.chats],
                        email: result?.email
                    });
                }
            }
        })
    }

    const sendChat = () => {

    }

    const handleTextInput = (event) => {
        updateState({ message: event.currentTarget.value });
    }

    const findLink = (stringData) => {
        const matches = stringData.match(linkRegExp)

        console.log('matches', matches);
        return matches
    }

    const handleSendChat = (event) => {
        if (state.message.length) {
            const linkArray = findLink(state.message);

            sendGroupChat({
                projectId: projectId, goalName: goalName, phaseName: phaseName,
                linkArray: linkArray, link: Boolean(linkArray), message: state.message,
                dataProcessor: (result) => {
                    if (result) {
                        updateState({
                            chatArray: [...state.chatArray, result], message: ''
                        })
                    }
                }
            })
        }
    }

    const showTaskForm = () => {
        //Create a new project group redux object and use the current phase as the key of the phase
        dispatch(updateProjectGroupData({
            update: {
                workPhases: {
                    [phaseName]: {
                        phaseName: phaseName,
                        goals: {
                            1: {
                                goalName: goalName,
                                tasks: []
                            }
                        }
                    }
                }
            }
        }));

        updateState({ openTaskForm: true }); //open the form
    }

    const closeTaskForm = () => {
        //Reset the project group redux object
        dispatch(resetProjectGroupData());

        updateState({ openTaskForm: false })
    }

    const statusData = useMemo(() => { return status1[state.status] }, [state.status])

    const handleChangeGoalStatus = () => {
        changeGoalStatus({
            projectId: projectId, phaseName: phaseName, goalName: goalName, newStatus: statusData.newStatus,
            dataProcessor: (result) => {
                if (result)
                    updateState({ status: statusData.newStatus });
            }
        })
        /*    changeGoalStatus(updateState, remoteRequest, dispatch, openSnackbar, navigate,
               projectId, goalName, phaseName, statusData.newStatus) */
    }

    const openTaskDetails = ({ taskId, taskIndex, taskData }) => {
        updateState({ showTaskDetails: true, selectedTaskId: taskId, selectedTaskIndex: taskIndex, selectedTaskData: taskData })
    }

    const closeTaskDetails = () => {
        handleGetGoalData('closeTaskDetails')
        updateState({ showTaskDetails: false, selectedTaskId: null, selectedTaskIndex: null, selectedTaskData: {} })
    }

    const openGallery = () => {
        updateState({ openGallery: true })
    }

    const closeGallery = () => {
        updateState({ openGallery: false })
    }

    const setLastDate = (chatDate) => {
        const date1 = moment(chatDate, 'yyyy-MM-DD h:mm a');
        const date2 = moment(lastDate, 'yyyy-MM-DD h:mm a')
        const theSame = date1.isSame(date2, 'date');

        lastDate = theSame ? date2 : date1

        return !theSame
    }

    const getFilePath = async (filename) => {
        console.log('getFilePath called', filename, chatfiles[filename]);

        !chatfiles[filename] && fetch(`/api/get-file-by-name/?folder=group-chat-files&&filename=${filename}`,
            { method: 'GET' }).then(resp => {
                resp.blob().then(blob => {
                    console.log('setting image', filename)
                    setFiles((prevFiles) => ({ ...prevFiles, [filename]: URL.createObjectURL(blob), }))
                })
            })
    }

    const handleFileUpload = (event) => {
        const files = event.target.files;
        if (files) {
            const tmpFilesArr = Array.from({ length: files.length }).map((v, indx) => files.item(indx))
            updateState({ files: tmpFilesArr });
            setTimeout(() => {
                event.target.files = null;
            }, [100])
        }
    }

    const renderFiles = (fileDataArray, userIsSender) => {
        console.log('rendering files', fileDataArray);
        const stying = userIsSender ? messageStyles.sameUser : messageStyles?.differentUser;

        return <Box sx={{
            display: 'flex', alignItems: 'center', flexWrap: 'wrap',
            px: 2, py: 1, mx: 2, maxWidth: '50%', ...stying
        }}>
            {fileDataArray.map((dataObject, index) => {
                console.log('dataoject', dataObject);
                return <Box key={index} sx={{ mr: 2, mb: 2 }}>
                    {imageExtensions.includes(dataObject.fileExtension) ?
                        <img src={chatfiles[dataObject.fileName] || '/images/loading.png'} alt='image'
                            style={{ width: '70px', height: '70px' }} />
                        : fileExtIcons[dataObject.fileExtension]}
                </Box>
            })}
        </Box>
    }

    const readyForNext = useMemo(() => {
        return !Boolean(state.goalObject?.tasks?.filter(task => task?.status !== statusData?.newStatus)?.length)
    }, [state.goalObject])

    console.log('project group goal detail state', chatfiles, state, readyForNext);

    return (
        <Box sx={{ maxHeight: '82vh', overflowY: 'hidden' }}>
            {/* Tool bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', px: 3, py: 1.5, bgcolor: statusData?.bgcolor }}>
                {/* Back button */}
                <IconButton sx={{ bgcolor: 'white', height: 28, width: 28, mr: 3 }} onClick={handleGoBack}>
                    <BackIcon sx={{ cursor: 'pointer', fontSize: 24, }} />
                </IconButton>

                {/* Goal  name */}
                <Typography noWrap sx={{ fontWeight: 700, fontSize: 18, mr: 4, maxWidth: 300, textTransform: 'capitalize' }}>
                    {goalName ?? 'Goal name'}
                </Typography>

                {/* Goal status */}
                <Typography sx={{
                    fontWeight: 600, fontSize: 14, color: statusData?.color, bgcolor: statusData?.bgcolor,
                    maxWidth: 'max-content', px: 1, py: .2, border: `1px solid ${statusData?.color}`, borderRadius: '8px'
                }}>
                    {statusData?.label}
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                {/*  Due date close */}
                <Typography sx={{
                    fontWeight: 700, fontSize: 14, color: '#BF0606', bgcolor: '#BF060614',
                    display: 'flex', alignItems: 'baseline', px: 1, py: .5, borderRadius: '8px'
                }}>
                    {/* Label */}
                    Due date close
                    {/* Flag */}
                    <FlagIcon sx={{ color: '#FF0000', fontSize: 18, ml: 1 }} />
                </Typography>
            </Box>

            {/* Content */}
            {Boolean(state.goalObject?.tasks) ?
                <Box sx={{
                    maxHeight: '75vh', pb: 4, px: 2, pt: 2, borderTop: '2px solid #1C1D221A',
                    overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'
                }}>
                    {/* Goal details */}
                    <Box sx={{
                        maxWidth: { md: '30%' }, minWidth: { md: '30%' }, border: '2px solid #1C1D221A',
                        borderRadius: '16px', ml: 2
                    }}>
                        {/* section 1:Heading, Goal name,goto next stage button, */}
                        <Box sx={{ borderRadius: '16px 16px 0 0' }}>
                            {/* Label and goto next stage button*/}
                            <Box sx={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1,
                                bgcolor: '#F5F5F5', borderRadius: '16px 16px 0 0'
                            }}>
                                {/* Label */}
                                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                                    GOAL DETAILS
                                </Typography>

                                {/* Goto next stage button */}
                                {Boolean(statusData?.nextStage) && <Button variant="outlined" sx={{ bgcolor: 'white' }}
                                    onClick={handleChangeGoalStatus}>
                                    {statusData?.nextStage}
                                </Button>}
                            </Box>

                            {/* Goal name */}
                            <Box sx={{ px: 2, py: 2 }}>
                                {/* Label */}
                                <Typography sx={{ color: '#5D5D5D', fontSize: 15, fontWeight: 600, pb: 1 }}>
                                    Name
                                </Typography>
                                {/* Value */}
                                <Typography sx={{
                                    fontSize: 15, fontWeight: 500, border: '2px solid #1C1D221A', p: 1,
                                    borderRadius: '8px'
                                }}>
                                    {state.goalObject?.goalName}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Section 2: Heading, add task, task list */}
                        <Box>
                            {/* Heading:Label: Tasks under goal (number of goals), add task button */}
                            <Box sx={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1,
                                bgcolor: '#F5F5F5'
                            }}>
                                {/* Label */}
                                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                                    TASKS UNDER GOAL {state.goalObject?.tasks?.Length}
                                </Typography>
                                {/* Add task button */}
                                <Button variant="text" sx={{ fontWeight: 600, fontSize: 14, p: 0 }}
                                    onClick={showTaskForm}>
                                    <AddIcon sx={{ fontSize: 15 }} />ADD TASK
                                </Button>
                            </Box>

                            {/* Task list  */}
                            <Box sx={{ p: 2, height: '40vh', overflowY: 'auto' }}>
                                {state.goalObject?.tasks?.map((task, index) => {
                                    const taskStatusObject = status1[task.status]
                                    return <Box key={index} sx={{
                                        border: '1px solid #1C1D221A', mb: 2, borderRadius: '8px',
                                        boxShadow: '0px 6px 12px 0px #4F4F4F14'
                                    }}>
                                        {/* Heading: Label: Task index  and see task progress button*/}
                                        <Box sx={{
                                            display: 'flex', alignItems: 'center',
                                            pl: 2, py: 1, bgcolor: '#F5F5F5'
                                        }}>
                                            {/* Label: Task index */}
                                            <Typography sx={{ fontSize: 15, fontWeight: 700, mr: 2 }}>
                                                Task {index + 1}
                                            </Typography>

                                            {/* Status tag */}
                                            <Typography sx={{
                                                fontWeight: 600, fontSize: 13, color: taskStatusObject?.color,
                                                bgcolor: taskStatusObject?.bgcolor, mr: 2, maxWidth: 'max-content', px: 1,
                                                py: .2, border: `1px solid ${taskStatusObject?.color}`, borderRadius: '8px'
                                            }}>
                                                {taskStatusObject?.label}
                                            </Typography>

                                            <Box sx={{ flexGrow: 1 }} />

                                            {/* see task progress button */}
                                            <Button variant="text" sx={{
                                                p: 0, fontSize: 13, fontWeight: 600,
                                            }} onClick={() => { openTaskDetails({ taskId: task.id, taskIndex: index, taskData: task }) }}>
                                                see task progress<NextArrow sx={{ ml: -.5 }} />
                                            </Button>
                                        </Box>

                                        {/* Task name */}
                                        <Typography align="justify" sx={{ px: 2, py: 2, fontSize: 15 }}>
                                            {task?.taskName}
                                        </Typography>
                                    </Box>
                                })}
                            </Box>
                        </Box>
                    </Box>

                    {/* Chatbox */}
                    <Box sx={{
                        borderRadius: '16px', width: '65%', height: '70vh', overflowY: 'hidden',
                        position: 'relative', border: '2px solid #1C1D221A', mb: 3
                    }}>
                        {/* Heading */}
                        <Box sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#F5F5F5',
                            py: 2, px: 2, borderRadius: '16px 16px 0 0'
                        }}>
                            {/* Label: GOAL CONVERSATION */}
                            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                                GOAL CONVERSATION
                            </Typography>

                            {/* Gallery label and icon */}
                            <Button variant="text" sx={{
                                display: 'flex', alignItems: 'center', color: 'black',
                                fontWeight: 700, fontSize: 15, py: 1,
                            }} onClick={openGallery}>
                                {/* Attachment icon */}
                                <AttachmentIcon sx={{ rotate: '120deg', height: 18, color: '#5D5D5D' }} />
                                {/* Label: Gallery */}
                                Gallery
                                {/* Play icon */}
                                <PlayIcon sx={{ height: 18, color: '#5D5D5D', }} />
                            </Button>
                        </Box>

                        {/* Chat zone */}
                        <Box sx={{ height: '50vh', }}>
                            <Box sx={{ height: '100%', overflowY: 'auto' }}>
                                {!Boolean(state.chatArray.length) ?
                                    <Box align='center' sx={{}}>
                                        {/* No message */}
                                        <Typography sx={{ mx: 2, mb: 2, mt: 5, fontWeight: 700, fontSize: 20 }}>
                                            NO MESSAGE
                                        </Typography>

                                        {/* Image */}
                                        <img src={NoMessageImg} alt="no-message" style={{ width: '30%', height: '30%' }} />
                                    </Box>
                                    : <Box sx={{ p: 2 }}>

                                        {/* Render the array of chats here */}
                                        {state.chatArray.map((chatObject, index) => {
                                            const userIsSender = chatObject?.sender === state.email;
                                            const stying = userIsSender ? messageStyles.sameUser : messageStyles?.differentUser;

                                            return <Box key={index}>
                                                {/* Date */}
                                                {setLastDate(chatObject.dateTime) && <Typography noWrap sx={{
                                                    fontSize: 13, color: '#8D8D8D', py: 2, display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center', px: 2
                                                }}>
                                                    <div style={{
                                                        background: '#1C1D221A', height: '1px', width: '100%',
                                                        marginRight: '20px'
                                                    }}></div>
                                                    {moment(lastDate).format('ddd, Do MMM')}
                                                    <div style={{
                                                        background: '#1C1D221A', height: '1px', width: '100%',
                                                        marginLeft: '20px'
                                                    }}></div>
                                                </Typography>}

                                                <Box key={index} sx={{
                                                    display: 'flex', alignItems: 'center', py: 2,
                                                    flexDirection: userIsSender ? 'row-reverse' : 'row'
                                                }}>
                                                    {/* profile picture of sender */}
                                                    <Box sx={{ alignSelf: 'flex-start' }}>
                                                        <ProfileAvatar {...{
                                                            src: chatObject.sender,
                                                            diameter: 40, fullName: 'ds', byEmail: true
                                                        }} />
                                                    </Box>

                                                    {/*  message*/}
                                                    {chatObject?.file ? renderFiles(chatObject.fileDataArray, userIsSender) :
                                                        <Typography sx={{
                                                            px: 2, py: 1, mx: 2, maxWidth: '70%', ...stying
                                                        }}>
                                                            {chatObject.message}
                                                        </Typography>}

                                                    {/* Date */}
                                                    <Typography noWrap sx={{
                                                        fontSize: 13, color: '#8D8D8D',
                                                        alignSelf: 'flex-end', mb: 1
                                                    }}>
                                                        {moment(chatObject.dateTime, 'yyyy-MM-DD h:mm a').format('hh:mma')}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                        })}
                                    </Box>}
                            </Box>

                            {/* Chat taxt box and send button */}
                            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 2, bgcolor: 'white', borderTop: '1px solid #1C1D221A', height: 'max-content' }}>
                                {/* Profile avatar */}
                                <ProfileAvatar {...{
                                    src: state.email, byEmail: true,
                                    diameter: 30, fullName: 'ds', styleProp: { mr: 2 }
                                }} />

                                {/* Text box */}
                                <OutlinedInput value={state.message} placeholder="write message"
                                    onChange={handleTextInput}
                                    onKeyDown={(event) => { event.key === 'Enter' ? handleSendChat(event) : null }} sx={{
                                        bgcolor: '#F5F5F5',
                                        width: '100%', fontSize: 14, borderRadius: '12px'
                                    }}
                                    endAdornment={<InputAdornment position="end">
                                        <IconButton sx={{}} onClick={handleSendChat}>
                                            <SendIcon />
                                        </IconButton>
                                    </InputAdornment>} />

                                {/* Send file */}
                                <IconButton component='label' sx={{ ml: 1 }}>
                                    <AttachmentIcon sx={{ rotate: '120deg', height: 22, color: '#5D5D5D' }} />
                                    <input type="file" style={{ display: 'none' }} multiple onChange={handleFileUpload} />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>
                </Box >
                : <Typography align='center' sx={{ mt: 4, fontWeight: 700, fontSize: 18 }}>
                    Fetching data...
                </Typography>}

            <Modal open={state.showTaskDetails} onClose={closeTaskDetails}>
                <TaskDetails {...{
                    index: state.selectedTaskIndex, taskData: state.selectedTaskData, closeView: closeTaskDetails,
                    projectId: projectId, goalName: goalName, phaseName: phaseName
                }} />
            </Modal>


            <Modal open={state.openTaskForm} onClose={closeTaskForm}>
                <AddGoal {...{
                    type: 'task', viewTitle: 'ADD NEW TASK UNDER GOAL', closeView: closeTaskForm, goalName: goalName,
                    projectId: projectId, phaseName: phaseName, phaseIndex: state.currentTab,
                }} />
            </Modal>

            <Modal open={state.openGallery} onClose={closeGallery}>
                <Gallery {...{
                    closeView: closeGallery, goalName: goalName, projectId: projectId, phaseName: phaseName
                }} />
            </Modal>
        </Box>
    )
}
