'use client'

import { Box, Button, Checkbox, Slide, Typography } from "@mui/material";

import moment from "moment";
import { ProfileAvatarGroup } from "@/Components/ProfileAvatarGroup";
import { useMemo, useState } from "react";

import Close from '@mui/icons-material/Close';

import { useDispatch } from "react-redux";

import { openSnackbar } from "@/Components/redux/routeSlice";
import { changeTaskStatus } from "../helper";

const status1 = {
    toDo: { label: 'To Do', bgcolor: '#0BC5EE1A', color: '#0BC5EE', nextStage: 'Click to start the goal', newStatus: 'inProgress', previousStatus: '' },
    inProgress: {
        label: 'In Progress', bgcolor: '#F293231A', color: '#F29323', nextStage: 'move to review', newStatus: 'review',
        previousStatus: 'toDo'
    },
    review: {
        label: 'Review', bgcolor: '#C809C81A', color: '#C809C8', nextStage: 'move to completed', newStatus: 'completed',
        previousStatus: 'inProgress'
    },
    completed: { label: 'Completed', bgcolor: '#03B2031A', color: '#03B203', previousStatus: 'review' },
};



export function TaskDetails({ index, taskData, closeView, projectId, phaseName, goalName }) {
    console.log('selected task name', taskData)

    const dispatch = useDispatch();

    const [state, setState] = useState({
        status: taskData?.status
    });


    const updateState = (newValue) => {
        setState((previousValue) => {
            return { ...previousValue, ...newValue };
        });
    }

    const formatMoney = ({ amount, currency = 'NGN' }) => {
        return Number(amount).toLocaleString('en-NG', { style: 'currency', currency: currency })
    }


    const formatTime = (timeInMinutes) => {
        if (timeInMinutes === 0) {
            return `${timeInMinutes}minutes`;
        }
        const hours = Math.trunc(timeInMinutes / 60);
        const hourStr = hours ? hours > 1 ? `${Number(hours).toLocaleString()}hours` : `${Number(hours).toLocaleString()}hour` : '';
        const mins = timeInMinutes % 60;
        const minStr = mins ? mins > 1 ? `${Number(mins).toLocaleString()}minutes` : `${Number(mins).toLocaleString()}minute` : '';

        const time = `${hourStr} ${minStr}`

        return time;
    }

    const completedTask = (event) => {
        const newStatus = state.status === 'toDo' ? 'inProgress' : state.status === 'inProgress' ? 'completed' : 'inProgress'

        changeTaskStatus({
            projectId: projectId, goalName: goalName, phaseName: phaseName, newStatus: newStatus, taskIndex: index,
            dataProcessor: (result) => {
                if (result)
                    updateState({ status: newStatus });
            }
        })

        /*  changeTaskStatus(updateState, remoteRequest, dispatch, openSnackbar, navigate,
             projectId, goalName, phaseName, index, newStatus) */
    }

    const computeTimebank = (taskData) => {
        return formatTime((Number(taskData.hours || 0) * 60) + Number(taskData.minutes || 0))
    }

    const computeDate = (taskData) => {
        return `${moment(taskData.startDate, 'yyyy-MM-DD').format('MMM Do')} - ${moment(taskData.endDate, 'yyyy-MM-DD').format('MMM Do')}`
    }

    const computeBudget = (taskData) => {
        return formatMoney({ amount: Number(taskData.taskBudget || 0) })
    }

    const scheduleData = [
        { label: 'Date', valueGenerator: computeDate },
        { label: 'Time-Bank', valueGenerator: computeTimebank },
        { label: 'Amount', valueGenerator: computeBudget },
    ]

    const statusData = useMemo(() => { return status1[state.status] }, [state.status])

    return <Slide direction="left" in={true} mountOnEnter unmountOnExit>
        <Box sx={{
            height: '100%', bgcolor: 'white', overflowY: 'hidden', pb: 4,
            position: 'absolute', top: '0%', right: '0%', width: { xs: '90%', sm: '70%', md: '60%', lg: '45%', xl: '42%' },
        }}>
            {/* Toolbar */}
            <Box sx={{
                display: 'flex', boxShadow: '0px 6px 12px rgba(79, 79, 79, 0.08)', alignItems: 'center', mb: 2,
                py: 3, px: { xs: 1.5, sm: 4 }, flexWrap: 'nowrap', borderBottom: '1px solid rgba(28, 29, 34, 0.1)', bgcolor: 'white'
            }}>
                {/* Close form */}
                <Close onClick={closeView}
                    sx={{ cursor: 'pointer', color: '#8D8D8D', fontSize: 35, }} />

                {/* Heading label */}
                <Typography noWrap sx={{ fontWeight: 700, fontSize: { xs: 13, sm: 17, }, mx: 3 }}>
                    TASK {index + 1} PROGRESS
                </Typography>

                {/* Status tag */}
                <Typography sx={{
                    fontWeight: 600, fontSize: 13, color: statusData?.color, bgcolor: statusData?.bgcolor, mr: 5,
                    maxWidth: 'max-content', px: 1, py: .2, border: `1px solid ${statusData?.color}`, borderRadius: '8px'
                }}>
                    {statusData?.label}
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <Button variant="text" sx={{
                    p: 0, px: 2, py: .5, fontSize: 14, bgcolor: '#F3F3F3', border: '1px solid #1C1D221A',
                    boxShadow: '0px 8px 12px 0px #0000000A', color: 'black'
                }} onClick={completedTask} >
                    <Checkbox checked={state.status === 'completed'} value={state.status === 'completed'}
                        onChange={() => { }} sx={{ p: 0, pr: 1 }} />
                    {state.status === 'toDo' ? 'START TASK' : 'MARK TASK AS COMPLETED'}
                </Button>
            </Box>


            {/* Body */}
            <Box sx={{ height: '86vh', overflowY: 'auto' }}>
                {/* Name section */}
                <Box>
                    {/* Heading */}
                    <Typography sx={{ bgcolor: '#1C1D2212', color: '#5D5D5D', px: 3, py: 1, fontSize: 14, fontWeight: 600 }}>
                        Name
                    </Typography>

                    {/* Value */}
                    <Typography sx={{ fontSize: 15, px: 3, py: 1, }}>
                        {taskData.taskName}
                    </Typography>
                </Box>

                {/* Schedule and budget section */}
                <Box>
                    {/* Heading */}
                    <Typography sx={{ bgcolor: '#1C1D2212', color: '#5D5D5D', px: 3, py: 1, fontSize: 14, fontWeight: 600 }}>
                        Schedule and budget
                    </Typography>

                    {/* Date, time bank, and budget */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', py: 2, px: 3 }}>
                        {scheduleData.map((data, index) => {
                            return <Box sx={{ px: 1, py: .5, mr: 4, bgcolor: '#1C1D220A', border: '1px solid #1C1D221A', borderRadius: '12px' }}>
                                {/* Label */}
                                <Typography sx={{ color: '#5D5D5D', fontSize: 14, }}>
                                    {data.label}
                                </Typography>

                                {/* Value */}
                                <Typography sx={{ fontWeight: 600, fontSize: 14, }}>
                                    {data.valueGenerator(taskData)}
                                </Typography>
                            </Box>
                        })}
                    </Box>
                </Box>

                {/* Task assignee section */}
                <Box sx={{}}>
                    {/* Heading */}
                    <Typography sx={{ bgcolor: '#1C1D2212', color: '#5D5D5D', px: 3, py: 1, fontSize: 14, fontWeight: 600 }}>
                        Task Assignee
                    </Typography>

                    {/* Profile pictures */}
                    <Box sx={{ display: 'flex', alignItems: 'center', px: 3, py: 2 }}>
                        <ProfileAvatarGroup {...{
                            emailArray: Object.keys(taskData.taskAssignmentMapping), color: statusData?.color,
                            bgcolor: statusData?.bgcolor, diameter: 30, max: 6
                        }} />
                    </Box>
                </Box>

                {/* Task attachments and links */}
                <Box>
                    {/* Heading */}
                    <Typography sx={{ bgcolor: '#1C1D2212', color: '#5D5D5D', px: 3, py: 1, fontSize: 14, fontWeight: 600 }}>
                        Task attachments and Links
                    </Typography>

                    {/* Content */}
                </Box>
            </Box>
        </Box>
    </Slide>

}