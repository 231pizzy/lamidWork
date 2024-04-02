'use client'

import { Box, Button, IconButton, LinearProgress, Modal, Typography, } from "@mui/material";


import FlagIcon from "@mui/icons-material/Flag";
import AddIcon from "@mui/icons-material/AddOutlined";
import TodoIcon from "@mui/icons-material/ThumbUpTwoTone";
import InProgressIcon from "@mui/icons-material/NearMeOutlined";
import ReviewIcon from "@mui/icons-material/StarOutline";
import CompletedIcon from "@mui/icons-material/CheckOutlined";
import TimerIcon from "@mui/icons-material/TimerOutlined";
import NextArrow from "@mui/icons-material/KeyboardArrowRight";
import ListIcon from "@mui/icons-material/ListOutlined";
import CalendarIcon from "@mui/icons-material/CalendarMonth";


import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import { openSnackbar, setPageTitle } from "@/Components/redux/routeSlice.js";
import moment from "moment";

import { ProfileAvatarGroup } from "@/Components/ProfileAvatarGroup.js";

import { GoalDetails } from "./GoalDetails.js";

import { AddGoal } from "./AddGoal.js";

import { resetProjectGroupData, updateProjectGroupData } from "@/Components/redux/newProjectGroup.js";
import { getWorkPhases } from "../helper.js";
import { useRef } from "react";

const status = [
    {
        label: 'To Do', bgcolor: '#0BC5EE1A', color: '#0BC5EE', valueKey: 'toDo',
        icon: (props) => <TodoIcon sx={{ ...props }} />
    },
    {
        label: 'In Progress', bgcolor: '#F293231A', color: '#F29323', valueKey: 'inProgress',
        icon: (props) => <InProgressIcon sx={{ ...props }} />
    },
    {
        label: 'Review', bgcolor: '#C809C81A', color: '#C809C8', valueKey: 'review',
        icon: (props) => <ReviewIcon sx={{ ...props }} />
    },
    {
        label: 'Completed', bgcolor: '#03B2031A', color: '#03B203', valueKey: 'completed',
        icon: (props) => <CompletedIcon sx={{ ...props }} />
    },
];


export function GoalsTab({ projectId, gotoDetails, statusKey, goalName, hideBackButton, workPhaseName }) {
    const dispatch = useDispatch();
    const ref1 = useRef(null)
    const ref2 = useRef(null)

    const [state, setState] = useState({
        workPhase: {}, currentTab: 0, numberOfWorkPhases: 0, profilePictures: [], showGoalDetails: gotoDetails,
        clickedGoalName: goalName, clickedGoalStatus: statusKey, openGoalForm: false, ref1: ref1, ref2: ref2
    });

    useEffect(() => {
        hideBackButton(state.showGoalDetails);
    }, [state.showGoalDetails]);


    useEffect(() => {
        getWorkPhases({
            index: state.currentTab, projectId: projectId, dataProcessor: (result) => {
                updateState({
                    workPhase: { ...result.workPhase },
                    numberOfWorkPhases: result.numberOfWorkPhases
                });
            }
        })
    }, [state.currentTab, state.showGoalDetails, state.openGoalForm]);

    const updateState = (newValue) => {
        setState((previousValue) => {
            return { ...previousValue, ...newValue };
        });
    }

    useEffect(() => {
        /* Set Page title */
        dispatch(setPageTitle({ pageTitle: 'Project Group' }))
        updateState({ ref1: ref1, ref2: ref2 })
    }, []);

    const getBoxTop = (ref) => {
        if (ref.current) {
            return ref.current.getBoundingClientRect().top;
        }
    }

    const handleGoalsClick = (goalName, statusKey, phaseName) => {
        //  gotoGoalDetails({ goalName: goalName, statusKey: statusKey })
        updateState({
            clickedGoalName: goalName, clickedGoalStatus: statusKey, showGoalDetails: true,
            clickedPhaseName: state.workPhase?.phaseName
        })
    }

    const goBack = () => {
        updateState({ showGoalDetails: false })
    }

    const switchTab = (index) => {
        updateState({ currentTab: index })
    }

    const headingElement = ({ icon, label }) => {
        return <Typography sx={{ fontSize: 13, fontWeight: 600, px: 1.5, py: .5, bgcolor: '#F2F2F2E5', color: '#1C1D2280' }}>
            {/* Icon */}
            {icon}
            {/* Label */}
            {label}
        </Typography>
    }


    const formatTime = (timeInMinutes) => {
        if (timeInMinutes === 0) {
            return `${timeInMinutes}mins`;
        }
        const hours = Math.trunc(timeInMinutes / 60);
        const hourStr = hours ? hours > 1 ? `${Number(hours).toLocaleString()}hrs` : `${Number(hours).toLocaleString()}hr` : '';
        const mins = timeInMinutes % 60;
        const minStr = mins ? mins > 1 ? `${Number(mins).toLocaleString()}mins` : `${Number(mins).toLocaleString()}min` : '';

        const time = `${hourStr} ${minStr}`

        return time;
    }


    const computeTimeBank = ({ goalObject }) => {
        let timeBank = 0;
        let timeSpent = 0

        goalObject.tasks.forEach(task => {
            timeBank += (Number(task.hours || 0) * 60) + Number(task.minutes || 0);
            timeBank += Number(task?.timeSpent || 0)
        })

        return { timeSpent: { usedTime: timeSpent, total: timeBank }, timeBank: timeBank }
    }

    const computeProgress = ({ status, goalObject }) => {

        const done = goalObject.tasks.filter(task => task.status === status).length;
        const total = goalObject.tasks.length;

        return { done: done, total: total }
    }

    const progress = ({ valueKey, goalObject }) => {
        const statusObject = status.find(item => item.valueKey === valueKey);
        const progress = computeProgress({ status: valueKey, goalObject: goalObject });
        const timeBank = computeTimeBank({ goalObject: goalObject })

        return [{
            label: `Time Spent : ${formatTime(timeBank?.timeSpent.usedTime)} out of ${formatTime(timeBank?.timeSpent?.total)}`,
            title: `Time Bank : ${formatTime(timeBank?.timeBank)}`, color: statusObject?.color,
            icon: <TimerIcon sx={{ mr: 1 }} />,
            indicatorData: { numerator: timeBank?.timeSpent.usedTime, denominator: timeBank?.timeBank }
        },
        {
            label: 'Progress', title: 'Progress', done: progress?.done, total: progress?.total,
            icon: <ListIcon sx={{ mr: 1 }} />, color: '#BF0606',
            indicatorData: { numerator: progress?.done, denominator: progress?.total }
        },]
    }

    const showGoalForm = () => {
        //  dispatch(resetProjectGroupData());
        //Create a new project group redux object and use the current phase as the key of the phase
        dispatch(updateProjectGroupData({
            update: {
                workPhases: {
                    [state.workPhase?.phaseName]: {
                        phaseName: state.workPhase?.phaseName,
                        goals: {
                            1: {
                                goalName: '',
                                tasks: []
                            }
                        }
                    }
                }
            }
        }));

        updateState({ openGoalForm: true }); //open the form
    }

    const closeGoalForm = () => {
        //Reset the project group redux object
        dispatch(resetProjectGroupData());

        updateState({ openGoalForm: false })
    }

    const numberOfGoals = useMemo(() => {
        //Get number of goals in each phase that has each each status
        const count = { toDo: 0, inProgress: 0, review: 0, completed: 0 };
        if (Object.keys(state.workPhase).length) {
            Object.values(state.workPhase?.goals).forEach(goal => {
                count[goal?.status ?? 'toDo'] += 1
                /*    goal.tasks.forEach(task => {
                       count[task.status] += 1
                   }) */
            });

            return count
        }

    }, [state.workPhase])

    const computeDuration = ({ goalObject }) => {
        console.log('received', goalObject);
        let firstDate = moment().toDate();
        let lastDate = moment().toDate();

        if (Object.keys(goalObject).length) {

            goalObject.tasks.forEach(task => {
                const date1 = moment(task.startDate, 'yyyy-MM-DD');
                const date2 = moment(task.endDate, 'yyyy-MM-DD');

                firstDate = date1.isBefore(firstDate, 'day') ? date1 : firstDate;
                lastDate = date2.isAfter(lastDate, 'day') ? date2 : lastDate;
            })

            return `${moment(firstDate).format('MMM D')} - ${moment(lastDate).format('MMM D')}`
        }

    }

    const goalData = useMemo(() => {
        const goals = {}
        const emailArray = []
        if (Object.keys(state.workPhase).length) {
            Object.values(state.workPhase?.goals).forEach(goal => {
                goals[goal.goalName] = { toDo: {}, inProgress: {}, review: {}, completed: {}, goalObject: goal }
                goal.tasks.forEach(task => {

                    goals[goal.goalName][goal?.status ?? 'toDo'].members = [...goals[goal.goalName][task.status]?.members ?? [],
                    ...Object.keys(task.taskAssignmentMapping)]
                    emailArray.push(...Object.keys(task.taskAssignmentMapping));

                    const time = (Number(task.hours || 0) * 60) + Number(task.minutes || 0)

                    goals[goal.goalName][goal?.status ?? 'toDo']?.timeBank ?
                        goals[goal.goalName][goal?.status ?? 'toDo'].timeBank += time
                        : goals[goal.goalName][goal?.status ?? 'toDo'].timeBank = time

                    goals[goal.goalName][goal?.status ?? 'toDo']?.taskCount ?
                        goals[goal.goalName][goal?.status ?? 'toDo'].taskCount += 1
                        : goals[goal.goalName][goal?.status ?? 'toDo'].taskCount = 1
                })
            })
        }

        //  getProfilePictures(updateState, remoteRequest, dispatch, openSnackbar, navigate, emailArray);

        return goals

    }, [state.workPhase])

    console.log('goal data', goalData);

    console.log('project group goals state', state);

    return (
        <Box sx={{}}>
            {state.showGoalDetails ?
                <GoalDetails {...{
                    projectId: projectId, status: state.clickedGoalStatus, goalName: state.clickedGoalName,
                    goBack: goBack, phaseName: state.clickedPhaseName
                }} />
                : <Box ref={state.ref1}
                    sx={{ maxWidth: '100%', overflowY: 'hidden', maxHeight: `100%`, }}>
                    {/* Tool bar section */}
                    <Box sx={{
                        px: 2, display: 'flex', alignItems: 'center',
                        borderBottom: '1px solid rgba(28, 29, 34, 0.1)',
                        bgcolor: '#EFF6FF', px: 2, py: 2
                    }}>
                        {/* Tab buttons */}
                        <Box sx={{ display: 'flex', alignItems: 'center', overflowX: 'auto', }}>
                            {Array.from({ length: state.numberOfWorkPhases })?.map((phase, index) => {
                                return <Button key={index} variant={state.currentTab === index ? 'contained' : 'outlined'} id={index}
                                    onClick={() => { switchTab(index) }}
                                    sx={{
                                        bgcolor: state.currentTab === index ? '#257AFB' : 'white', fontWeight: 700,
                                        color: state.currentTab === index ? 'white' : '#257AFB', mr: 3, border: '1px solid #257AFB',
                                        ":hover": { background: '#EFF6FF', color: '#257AFB', border: '1px solid #257AFB' }
                                    }}>
                                    WORK PHASE {index + 1}
                                </Button>
                            })}
                        </Box>

                        <Box sx={{ flexGrow: 1 }} />

                    </Box>

                    {/* Body */}
                    <Box ref={state.ref2} sx={{ overflowY: 'scroll', maxHeight: `calc(100vh - ${getBoxTop(state.ref2)}px - 60px)` }}>
                        {Boolean(Object.keys(state.workPhase).length) ?
                            <Box >
                                {/* Goals running late*/}
                                <Box sx={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap',
                                    py: 3, borderBottom: '1px solid #1C1D221A', px: 2
                                }}>
                                    {status.slice(0, 3).map((data, index) => {
                                        return <Box key={index} sx={{
                                            p: 1, mr: 3, border: '1px solid #1C1D221A', borderRadius: '16px',
                                            boxShadow: '0px 6px 12px 0px #4F4F4F14'
                                        }}>
                                            {/* Label: goals running late and flag */}
                                            <Typography sx={{
                                                textTransform: 'uppercase', display: 'flex', fontSize: 15, fontWeight: 700,
                                                alignItems: 'center', justifyContent: 'space-between', mb: 1
                                            }}>
                                                {/* Label */}
                                                Goals Running Late
                                                {/* Flag */}
                                                <FlagIcon sx={{ ml: 4, color: '#FF0000' }} />
                                            </Typography>

                                            {/* Number of goals running late and status */}
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {/* Number of goals running late */}
                                                <Typography sx={{ fontSize: 17, fontWeight: 700, mr: 3 }}>
                                                    0
                                                </Typography>
                                                {/* Status of goals */}
                                                <Typography sx={{ px: .5, py: .2, bgcolor: data.bgcolor, color: data.color, fontSize: 13, fontWeight: 600, borderRadius: '8px' }}>
                                                    {data.label}
                                                </Typography>
                                                <Box sx={{ flexGrow: 1 }} />
                                                {/* Goto task button */}
                                                <Button variant="text" sx={{
                                                    display: 'flex', alignItems: 'center',
                                                    p: 0, fontSize: 13, fontWeight: 600,
                                                }}>
                                                    See tasks
                                                    <NextArrow />
                                                </Button>
                                            </Box>
                                        </Box>
                                    })}
                                </Box>

                                {/* Summary cards for todo, inprogress, review and completed goals */}
                                <Box sx={{
                                    display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'space-between',
                                    px: 2
                                }}>
                                    {status.map((statusData, index) => {
                                        return <Box key={index} sx={{ maxWidth: { xs: '100%', md: '400px' }, minWidth: { xs: '100%', md: '400px' }, borderRadius: '16px', mt: 3, border: '2px dashed #1C1D221A' }}>
                                            {/* Heading */}
                                            <Box sx={{
                                                px: 3, py: 2, bgcolor: statusData.bgcolor, borderRadius: '16px 16px 0 0',
                                                display: 'flex', alignItems: 'center'
                                            }}>
                                                {/* status Icon */}
                                                {statusData.icon({
                                                    bgcolor: statusData.bgcolor, color: statusData.color, border: `1px solid ${statusData.color}`,
                                                    borderRadius: '26.6667px', fontSize: 34
                                                })}
                                                {/* Status label and number of goals */}
                                                <Typography sx={{ fontWeight: 700, fontSize: 16, ml: 4, textTransform: 'uppercase' }}>
                                                    {statusData.label} ({numberOfGoals[statusData.valueKey]})
                                                </Typography>
                                                {/* Add button for toDo status ONLY */}
                                                <Box sx={{ flexGrow: 1 }} />
                                                {statusData.valueKey === 'toDo' &&
                                                    <IconButton sx={{ bgcolor: '#BF0606', color: 'white' }} onClick={showGoalForm}>
                                                        <AddIcon sx={{ fontSize: 30 }} />
                                                    </IconButton>}


                                            </Box>

                                            {/* Content */}
                                            <Box sx={{ maxHeight: '40vh', overflowY: 'auto', bgcolor: 'rgba(28, 29, 34, 0.08)', p: 2, }}>
                                                {Object.entries(goalData).map(([goalName, payload], index) => {
                                                    const object = payload[statusData.valueKey] ?? {};
                                                    const goalObject = payload?.goalObject
                                                    const duration = computeDuration({ goalObject: goalObject })
                                                    console.log('rendering goal object', goalObject)

                                                    return Boolean(Object.keys(object).length) && <Box key={index}
                                                        sx={{ bgcolor: 'white', borderRadius: '16px', mb: 3, cursor: 'pointer' }}
                                                        onClick={() => { handleGoalsClick(goalName, statusData?.valueKey) }}>
                                                        {/* Row 1: goal name and members */}
                                                        <Box sx={{ p: 1, }}>
                                                            {/* Goal name */}
                                                            <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 1 }}>
                                                                {goalName}
                                                            </Typography>
                                                            {/* Members avatar group */}
                                                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                                                <ProfileAvatarGroup {...{
                                                                    emailArray: object?.members, diameter: 30,
                                                                    color: statusData.color, bgcolor: 'white', max: 3
                                                                }} />
                                                            </Box>

                                                        </Box>

                                                        {/* Row 2: goal duration */}
                                                        <Box>
                                                            {/* Heading */}
                                                            {headingElement({ icon: <ListIcon sx={{ mr: 1 }} />, label: 'Goal duration' })}
                                                            {/* content */}
                                                            <Typography noWrap sx={{ bgcolor: '#FF00000D', color: '#FF0000', fontWeight: 600, fontSize: 13, maxWidth: 'max-content', display: 'flex', ml: 2, my: 1.5, px: 2, py: 1, alignItems: 'center', borderRadius: '8px' }}>
                                                                {/* Calendar icon */}
                                                                <CalendarIcon sx={{ mr: 1 }} />
                                                                {/* Date */}
                                                                Duration: {duration}
                                                                {/*    {moment().format('MMM D')} - {moment().add(2, 'days').format('MMM D')} */}
                                                                {/* Flag icon */}
                                                                <FlagIcon sx={{ ml: 1, color: '#FF0000' }} />
                                                            </Typography>
                                                        </Box>

                                                        {/* Row 3 and 4: timebank and progress */}
                                                        <Box sx={{ pb: 1 }}>
                                                            {progress({ valueKey: statusData.valueKey, goalObject: goalObject }).map((data, index) => {
                                                                return <Box key={index}>
                                                                    {/* Heading */}
                                                                    {headingElement({ icon: data.icon, label: data.title })}
                                                                    {/* Time spent */}
                                                                    <Box sx={{ mx: 2, my: 1.5 }}>
                                                                        {/* Label */}
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                            <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1.5, color: data.color, }}>
                                                                                {data.label}
                                                                            </Typography>

                                                                            {/* eg. 0/4 */}
                                                                            {index === 1 && <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1.5, color: 'black', }}>
                                                                                {data.done}/{data.total}
                                                                            </Typography>}
                                                                        </Box>

                                                                        {/* Progress bar */}
                                                                        <LinearProgress
                                                                            value={(data.indicatorData.numerator / data.indicatorData.denominator) * 100} variant='determinate'
                                                                            sx={{
                                                                                '& .MuiLinearProgress-barColorPrimary': {
                                                                                    backgroundColor: data.color
                                                                                },
                                                                                bgcolor: '#D9D9D9',
                                                                                borderRadius: '2px',
                                                                                height: '4px'
                                                                            }} />
                                                                    </Box>
                                                                </Box>
                                                            })}
                                                        </Box>
                                                    </Box>
                                                })}
                                            </Box>
                                        </Box>

                                    })}
                                </Box>


                            </Box >
                            : <Typography align='center' sx={{ mt: 4, fontWeight: 700, fontSize: 18 }}>
                                Fetching data...
                            </Typography>}
                    </Box>


                </Box >}

            <Modal open={state.openGoalForm} onClose={closeGoalForm}>
                <AddGoal {...{
                    type: 'goal', viewTitle: 'ADD GOAL TO WORK PHASE', closeView: closeGoalForm,
                    projectId: projectId, phaseName: state.workPhase?.phaseName, phaseIndex: state.currentTab,
                }} />
            </Modal>
        </Box>
    )
}
