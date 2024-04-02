import { getRequestHandler, postRequestHandler } from "@/Components/requestHandler";

export function getProjectGroupData({ projectId, dataProcessor }) {
    getRequestHandler({
        route: `/api/get-project-group-data/?projectId=${projectId}`,
        successCallback: body => {
            const result = body?.result;
            dataProcessor(result)
        },
        errorCallback: err => {
            console.log('Something went wrong', err)
        }
    })
}

export function getWorkPhases({ index, projectId, dataProcessor }) {
    getRequestHandler({
        route: `/api/get-workphases/?index=${index}&&projectId=${projectId}`,
        successCallback: body => {
            const result = body?.result;
            dataProcessor(result)
        },
        errorCallback: err => {
            console.log('Something went wrong', err)
        }
    })
}

export function getGoalData({ projectId, goalName, phaseName, dataProcessor }) {
    getRequestHandler({
        route: `/api/get-goal-data/?goalName=${goalName}&&projectId=${projectId}&&phaseName=${phaseName}`,
        successCallback: body => {
            const result = body?.result;
            dataProcessor(result)
        },
        errorCallback: err => {
            console.log('Something went wrong', err)
        }
    })
}

export function getAllFilesForChat({ projectId, goalName, phaseName, dataProcessor }) {
    getRequestHandler({
        route: `/api/get-goal-chat-files/?goalName=${goalName}&&projectId=${projectId}&&phaseName=${phaseName}`,
        successCallback: body => {
            const result = body?.result;
            dataProcessor(result)
        },
        errorCallback: err => {
            console.log('Something went wrong', err)
        }
    })
}

export function sendGroupChat({ projectId, goalName, phaseName, link, linkArray, message, dataProcessor }) {

    postRequestHandler({
        route: `/api/send-goal-chat`,
        body: {
            goalName: goalName, projectId: projectId, phaseName: phaseName,
            link: link, linkArray: JSON.stringify(linkArray), message: message,
        },
        successCallback: body => {
            const result = body?.result;
            dataProcessor(result)
        },
        errorCallback: err => {
            console.log('Something went wrong', err)
        }
    })
}

export function sendFileToChat({ projectId, goalName, phaseName, fileArray, dataProcessor }) {
    const files = fileArray?.map((item, ind) => { return { file: item, filename: `file${ind}` } })

    postRequestHandler({
        route: `/api/send-goal-chat-files`,
        body: { goalName: goalName, projectId: projectId, phaseName: phaseName, },
        fileArray: [...files],
        successCallback: body => {
            const result = body?.result;
            dataProcessor(result)
        },
        errorCallback: err => {
            console.log('Something went wrong', err)
        }
    })
}

export function getAllLinksForChat({ projectId, goalName, phaseName, dataProcessor }) {
    getRequestHandler({
        route: `/api/get-goal-chat-links/?goalName=${goalName}&&projectId=${projectId}&&phaseName=${phaseName}`,
        successCallback: body => {
            const result = body?.result;
            dataProcessor(result)
        },
        errorCallback: err => {
            console.log('Something went wrong', err)
        }
    })
}

export function addNewGoalOrTask({ projectId, goalName, phaseName, type, tasks, dataProcessor }) {

    postRequestHandler({
        route: `/api/update-workphase`,
        body: {
            goalName: goalName, projectId: projectId, phaseName: phaseName,
            type: type, tasks: JSON.stringify(tasks)
        },
        successCallback: body => {
            const result = body?.result;
            dataProcessor(result)
        },
        errorCallback: err => {
            console.log('Something went wrong', err)
        }
    })
}

export function changeGoalStatus({ projectId, goalName, phaseName, newStatus, dataProcessor }) {

    postRequestHandler({
        route: `/api/change-goal-status`,
        body: {
            goalName: goalName, projectId: projectId, phaseName: phaseName, newStatus: newStatus
        },
        successCallback: body => {
            const result = body?.result;
            dataProcessor(result)
        },
        errorCallback: err => {
            console.log('Something went wrong', err)
        }
    })
}

export function changeTaskStatus({ projectId, goalName, phaseName, newStatus, taskIndex, dataProcessor }) {

    postRequestHandler({
        route: `/api/change-task-status`,
        body: {
            goalName: goalName, projectId: projectId, phaseName: phaseName, newStatus: newStatus, taskIndex: taskIndex
        },
        successCallback: body => {
            const result = body?.result;
            dataProcessor(result)
        },
        errorCallback: err => {
            console.log('Something went wrong', err)
        }
    })
}

export function getProfilePictures({ emailArray, dataProcessor }) {
    getRequestHandler({
        route: `/api/get-profile-pictures/?emailArray=${JSON.stringify(emailArray ?? [])}`,
        successCallback: body => {
            const result = body?.result;
            dataProcessor(result)
        },
        errorCallback: err => {
            console.log('Something went wrong')
        }
    })
}