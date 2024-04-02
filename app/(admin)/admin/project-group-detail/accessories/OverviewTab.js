'use client'

import {
    Box, Button, lighten, Typography,
} from "@mui/material";

import TodoIcon from "@mui/icons-material/ThumbUpTwoTone";
import InProgressIcon from "@mui/icons-material/NearMeOutlined";
import ReviewIcon from "@mui/icons-material/StarOutline";
import CompletedIcon from "@mui/icons-material/CheckOutlined";
import NextArrow from "@mui/icons-material/KeyboardArrowRight";


import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";


import { setPageTitle } from "@/Components/redux/routeSlice.js";
import GroupSummary from "../../project-group/new-project/final-preview/GroupSummary.js";
import IconElement from "@/Components/IconElement.js";
import { getProjectGroupData } from "../helper.js";
import { useRef } from "react";
import { Budget, DurationSvg, GoalSvg, JusticeSvg, Receipt, TimerSvg } from "@/public/icons/icons.js";

/* const Budget = '/icons/Budget.svg'
const DurationSvg = '/icons/DurationSvg.svg'
const GoalSvg = '/icons/GoalSvg.svg'
const JusticeSvg = '/icons/JusticeSvg.svg'
const Receipt = '/icons/Receipt.svg'
const TimerSvg = '/icons/TimerSvg.svg' */

//const icon = (icon, iconStyle) => <IconElement {...{ src: icon, style: iconStyle }} />

export function OverviewTab({ projectId, gotoTab, }) {

    const dispatch = useDispatch();
    const ref = useRef(null);

    console.log('projct id', projectId)

    useEffect(() => {
        /* Set Page title */
        dispatch(setPageTitle({ pageTitle: 'Project Group' }))
        updateState({ ref: ref })
    }, []);

    const [state, setState] = useState({
        projectObject: {}, currentTab: 0, ref: null
    });

    useEffect(() => {
        getProjectGroupData({
            projectId: projectId,
            dataProcessor: (result) => {
                updateState({
                    projectObject: { ...result },
                    workPhaseObject: Object.values(result?.workPhases)[0]
                });
            }
        })
    }, [state.currentTab]);

    const updateState = (newValue) => {
        setState((previousValue) => {
            return { ...previousValue, ...newValue };
        });
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

    const formatMoney = ({ amount, currency = 'NGN' }) => {
        return Number(amount).toLocaleString('en-NG', { style: 'currency', currency: currency })
    }

    const computeNumberOfGoals = () => {
        //   console.log('received', workPhases);
        const goals = Object.values(state.projectObject?.workPhases).map((phaseObject) =>
            Object.keys(phaseObject.goals).length).reduce((sum, number) => sum + number,)
        return goals;
    }

    const computeTaskStatusCount = ({ workPhase }) => {
        const countObject = { toDo: 0, inProgress: 0, review: 0, completed: 0 };

        Object.values(workPhase.goals).forEach(goal => {
            goal.tasks.forEach(task => {
                countObject[task.status] += 1;
            })
        })

        return countObject;
    }

    const goalsCards = ({ workPhase }) => {

        const data = computeTaskStatusCount({ workPhase: workPhase });
        const iconStyle = { marginLeft: '16px', height: '20px', width: '20px', borderRadius: '26.6667px', border: '1px solid currentColor' }

        return [
            {
                label: 'TO DO', icon: <TodoIcon sx={{ ...iconStyle }} />, value: data?.toDo,
                bgcolor: lighten('#19D3FC', 0.9), color: '#19D3FC'
            },
            { label: 'IN PROGRESS', icon: <InProgressIcon sx={{ ...iconStyle }} />, value: data?.inProgress, bgcolor: lighten('#F29323', 0.9), color: '#F29323' },
            { label: 'REVIEW', icon: <ReviewIcon sx={{ ...iconStyle }} />, value: data?.review, bgcolor: lighten('#C809C8', 0.9), color: '#C809C8' },
            { label: 'COMPLETED', icon: <CompletedIcon sx={{ ...iconStyle }} />, value: data?.completed, bgcolor: lighten('#03B203', 0.9), color: '#03B203' },
        ]
    }

    const computeTime = ({ workPhase }) => {
        const timeObject = { timeBank: 0, timeUsed: 0, timeRemaining: 0 };

        Object.values(workPhase.goals).forEach(goal => {
            goal.tasks.forEach(task => {
                timeObject.timeBank += (Number(task?.hours || 0) * 60) + Number(task?.minutes || 0);
                timeObject.timeUsed += (Number(task?.timeUsed || 0))
            })
        })

        timeObject.timeRemaining = timeObject?.timeBank - timeObject?.timeUsed;

        return timeObject;
    }

    const computeTotalTime = ({ workPhase }) => {
        const timeObject = { timeBank: 0, timeUsed: 0, timeRemaining: 0 };

        Object.values(state.projectObject?.workPhases).forEach(phase => {
            Object.values(phase.goals).forEach(goal => {
                goal.tasks.forEach(task => {
                    timeObject.timeBank += (Number(task?.hours || 0) * 60) + Number(task?.minutes || 0);
                    timeObject.timeUsed += (Number(task?.timeUsed || 0))
                })
            })
        })

        timeObject.timeRemaining = timeObject?.timeBank - timeObject?.timeUsed;

        return timeObject;
    }

    const computeTotalExpense = ({ workPhase }) => {
        const expenseObject = { budget: 0, expense: 0, balance: 0 };

        Object.values(state.projectObject?.workPhases).forEach(phase => {
            Object.values(phase.goals).forEach(goal => {
                goal.tasks.forEach(task => {
                    expenseObject.budget += Number(task?.taskBudget || 0);
                    expenseObject.expense += (Number(task?.amountSpent || 0))
                })
            })
        })

        expenseObject.balance = expenseObject?.budget - expenseObject?.expense;

        return expenseObject;
    }

    const timeTrackerCards = ({ workPhase }) => {
        const data = computeTime({ workPhase: workPhase });
        const iconStyle = { marginLeft: '16px', height: '20px', width: '20px', color: '#257AFB' };
        const fontSize = 14

        return [
            {
                label: 'Time bank', icon: <TimerSvg style={{ ...iconStyle }} />, value: formatTime(data?.timeBank),
                bgcolor: 'rgba(37, 122, 251, 0.10)', color: 'black', valueColor: '#257AFB', fontSize: fontSize, textTransform: 'inherit'
            },
            {
                label: 'Total time used', icon: <DurationSvg style={{ ...iconStyle }} />, value: formatTime(data?.timeUsed),
                bgcolor: 'white)', color: 'black', valueColor: '#257AFB', fontSize: fontSize, textTransform: 'inherit'
            },
            {
                label: 'Time Remaining', icon: <JusticeSvg style={{ ...iconStyle }} />, value: formatTime(data?.timeRemaining),
                bgcolor: 'white', color: 'black', valueColor: '#257AFB', fontSize: fontSize, textTransform: 'inherit'
            },
        ]
    }

    const computeExpense = ({ workPhase }) => {
        const expenseObject = { budget: 0, expense: 0, balance: 0 };

        Object.values(workPhase.goals).forEach(goal => {
            goal.tasks.forEach(task => {
                expenseObject.budget += Number(task?.taskBudget || 0);
                expenseObject.expense += (Number(task?.amountSpent || 0))
            })
        })

        expenseObject.balance = expenseObject?.budget - expenseObject?.expense;

        return expenseObject;
    }

    const expenseCards = ({ workPhase }) => {

        const data = computeExpense({ workPhase: workPhase });
        const iconStyle = { marginLeft: '16px', height: '20px', width: '20px', color: '#4E944F' }
        const fontSize = 14

        return [
            {
                label: 'Budget', icon: <Budget style={{ ...iconStyle }} />, value: formatMoney({ amount: data?.budget }),
                bgcolor: 'rgba(78, 148, 79, 0.10)', color: 'black', valueColor: '#4E944F', fontSize: fontSize, textTransform: 'inherit'
            },
            {
                label: 'Expense', icon: <Receipt style={{ ...iconStyle }} />, value: formatMoney({ amount: data?.expense }),
                bgcolor: 'white)', color: 'black', valueColor: '#4E944F', fontSize: fontSize, textTransform: 'inherit'
            },
            {
                label: 'Balance', icon: <JusticeSvg style={{ ...iconStyle }} />, value: formatMoney({ amount: data?.balance }),
                bgcolor: 'white', color: 'black', valueColor: '#4E944F', fontSize: fontSize, textTransform: 'inherit'
            },
        ]
    }

    const goalsBuilder = ({ phase, array }) => {
        return array({ workPhase: phase }).map((goal, index) =>
            <Box key={index} sx={{ bgcolor: goal.bgcolor, color: goal.color, border: `1px solid ${goal.color}`, borderRadius: '12px', px: 1.5, py: 1, mr: 2 }}>
                {/* Heading and icon */}
                <Typography sx={{ textTransform: goal?.textTransform ?? 'uppercase', fontSize: 14, mb: .5, fontWeight: 600, }}>
                    {goal.label}
                    {/* Icon */}
                    {goal.icon}
                </Typography>

                {/* Number */}
                <Typography sx={{ fontSize: goal?.fontSize ?? 19, fontWeight: 700, color: goal?.valueColor }}>
                    {goal.value}
                </Typography>
            </Box>)
    }

    const goalSection1 = () => {
        const data = computeNumberOfGoals({ workPhase: state.projectObject?.workPhases });
        const iconStyle = { marginLeft: '16px', height: '20px', width: '20px', color: 'white' }

        return [
            {
                label: 'PROJECT GROUP TOTAL GOALS', icon: <GoalSvg style={{ ...iconStyle }} />, value: data,
                bgcolor: 'linear-gradient(90deg, #257AFB 0%, #234374 100%)', color: 'white'
            },
        ]
    }

    const timeTrackerSection1 = () => {
        const data = computeTotalTime({ workPhase: state.projectObject?.workPhases });
        const iconStyle = { marginLeft: '16px', height: '20px', width: '20px', color: '#257AFB' }
        const fontSize = 16
        return [
            {
                label: 'Time bank', icon: <TimerSvg style={{ ...iconStyle }} />, value: formatTime(data.timeBank),
                bgcolor: 'linear-gradient(90deg, #257AFB 0%, #234374 100%)', color: 'white', fontSize: fontSize, valueColor: 'white'
            },
            {
                label: 'Time-used', icon: <DurationSvg style={{ ...iconStyle }} />, value: formatTime(data.timeUsed),
                bgcolor: '#257AFB1A', color: 'black', fontSize: fontSize, valueColor: '#257AFB'
            },
            {
                label: 'Time remaining', icon: <JusticeSvg style={{ ...iconStyle }} />, value: formatTime(data.timeRemaining),
                bgcolor: 'white', color: 'black', fontSize: fontSize, valueColor: '#257AFB'
            },
        ]
    }

    const expenseSection1 = () => {
        const data = computeTotalExpense({ workPhase: state.projectObject?.workPhases });
        const iconStyle = { marginLeft: '16px', height: '20px', width: '20px', color: 'white' }
        const fontSize = 16;

        return [
            {
                label: 'Budget', icon: <Budget style={{ ...iconStyle }} />, value: formatMoney({ amount: data.budget }),
                bgcolor: 'linear-gradient(90deg, #4E944F 0%, #225222 100%)', color: 'white', fontSize: fontSize, valueColor: 'white'
            },
            {
                label: 'Total Expense', icon: <Receipt style={{ ...iconStyle }} />, value: formatMoney({ amount: data.expense }),
                bgcolor: 'rgba(78, 148, 79, 0.10)', color: 'black', fontSize: fontSize, valueColor: '#4E944F'
            },
            {
                label: 'Balance', icon: <JusticeSvg style={{ ...iconStyle }} />, value: formatMoney({ amount: data.balance }),
                bgcolor: 'white', color: 'black', fontSize: fontSize, valueColor: '#4E944F'
            },
        ]
    }

    const summary = ({ type, headingLabel, gotoHandler, gotoLabel, section1Array, section2Array, tabIndex }) => {
        return <Box sx={{
            width: { xs: 'max-content' }, borderRadius: '16px', mb: 4,
            border: '1px solid #1C1D221A', boxShadow: '0px 6px 12px 0px #4F4F4F14'
        }}>
            {/* Heading */}
            <Box sx={{
                px: 3, py: 1, display: 'flex', alignItems: 'center', bgcolor: '#EFF6FF',
                borderRadius: '16px 16px 0 0', mb: 1.5
            }}>
                {/* Title */}
                <Typography sx={{ fontSize: 17, fontWeight: 700, textTransform: 'uppercase' }}>
                    {headingLabel}
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                {/* Goto button */}
                <Button variant="text" sx={{
                    display: 'flex', alignItems: 'center',
                    fontSize: 13, fontWeight: 600
                }} onClick={() => { gotoTab('', Number(tabIndex)) }}>
                    {gotoLabel}
                    <NextArrow />
                </Button>
            </Box>

            {/* Body */}
            <Box>
                {/* Project group total goals section */}
                <Box>
                    {/* Heading */}
                    <Typography sx={{
                        textTransform: 'uppercase', bgcolor: '#1C1D220F', fontSize: 14, fontWeight: 600,
                        px: 2, py: 1
                    }}>
                        Project group {type}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* Data Card */}
                        {section1Array()?.map((data, index) =>
                            <Box key={index} sx={{
                                background: data.bgcolor,
                                borderRadius: '16px', color: data.color, px: 1.5, py: 1,
                                boxShadow: '8px 8px 20px 0px #4F4F4F14', maxWidth: 'max-content', mx: 2, my: 2

                            }}>
                                {/* Heading and Icon */}
                                <Typography sx={{ textTransform: 'uppercase', fontSize: 14, mb: .5, fontWeight: 600, }}>
                                    {data.label}
                                    {/* Icon */}
                                    {data.icon}
                                </Typography>

                                {/* value */}
                                <Typography sx={{ fontSize: data?.fontSize ?? 20, fontWeight: 600, color: data?.valueColor }}>
                                    {data.value}
                                </Typography>
                            </Box>
                        )}

                    </Box>

                </Box>

                {/* Workphases section */}
                <Box sx={{ maxHeight: '30vh', overflowY: 'auto' }}>
                    {Object.values(state.projectObject?.workPhases).map((phase, index) =>
                        <Box key={index}>
                            {/* Heading */}
                            <Typography sx={{
                                textTransform: 'uppercase', bgcolor: '#1C1D220F', fontSize: 14, fontWeight: 600,
                                px: 2, py: 1
                            }}>
                                Workphase - {index + 1} {type}
                            </Typography>

                            {/* Data cards */}
                            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 2 }}>
                                {goalsBuilder({ phase: phase, array: section2Array })}
                                {/*  {section2Builder({ workPhase: phase })} */}

                            </Box>
                        </Box>
                    )}
                </Box>

            </Box>
        </Box>
    }

    const getBoxTop = () => {
        if (state.ref?.current) {
            return state.ref.current.getBoundingClientRect().top;
        }
    }

    console.log('project group detail state', state);

    const tabStyle = { fontSize: 14, fontWeight: 600, p: 0, m: 0 }

    return <Box ref={state.ref} sx={{ maxHeight: `calc(100vh - ${getBoxTop()}px)`, overflowY: 'scroll' }}>
        {Boolean(Object.keys(state.projectObject).length) ?
            <Box sx={{ borderRadius: '16px', }}>
                {/*  Project group summary */}
                <GroupSummary {...{
                    workPhaseData: state.projectObject?.workPhases ?? {},
                    bgcolor: '#257AFB0D', color: '#257AFB'
                }} />

                {/* Goals,time tracker, and invoices */}

                <Box sx={{ px: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {/* Goals */}
                    {summary({
                        type: 'goals', headingLabel: 'Goals', gotoHandler: () => { }, gotoLabel: 'Go to Goals',
                        section1Array: goalSection1, section2Array: goalsCards, tabIndex: 1
                    })}

                    {/* Time tracker */}
                    {summary({
                        type: 'time bank', headingLabel: 'Time Tracker', gotoHandler: () => { }, gotoLabel: 'Go to Time Tracker',
                        section1Array: timeTrackerSection1, section2Array: timeTrackerCards, tabIndex: 2
                    })}

                    {/* Expense and budget */}
                    {summary({
                        type: 'Budget & Expense', headingLabel: 'Expense & Invoice', gotoHandler: () => { }, gotoLabel: 'Go to Expense & Invoice', section1Array: expenseSection1, section2Array: expenseCards, tabIndex: 3
                    })}
                </Box>

            </Box >
            : <Typography align='center' sx={{ mt: 4, fontWeight: 700, fontSize: 18 }}>
                Fetching data...
            </Typography>

        }
    </Box>

}
