'use client'

import { Box, } from "@mui/material";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { setPageTitle } from "@/Components/redux/routeSlice.js";

import { LayoutComponent } from "./LayoutComponent.js";
import { LayoutComponent2 } from "./LayoutComponent2.js";
import { LayoutComponent3 } from "./LayoutComponent3.js";
import { getProjectGroupData } from "../helper.js";

import { DurationSvg, JusticeSvg, TimerSvg } from "@/public/icons/icons.js";

const selectAssignee = '/images/selectAssign1.png'
/* 
const DurationSvg = '/icons/DurationSvg.svg'
const JusticeSvg = '/icons/JusticeSvg.svg'
const TimerSvg = '/icons/TimerSvg.svg' */

//const icon = (icon, iconStyle) => <IconElement {...{ src: icon, style: iconStyle }} />

export function TimeTrackerTab({ projectId }) {
    const dispatch = useDispatch();

    useEffect(() => {
        /* Set Page title */
        dispatch(setPageTitle({ pageTitle: 'Project Group' }));

        getProjectGroupData({
            projectId: projectId,
            dataProcessor: (result) => {
                updateState({
                    projectObject: { ...result },
                    workPhaseObject: Object.values(result?.workPhases)[0]
                });
            }
        })
    }, []);


    const [state, setState] = useState({
        projectObject: {}, currentTab: 0, workPhaseObject: {}, numberOfGoals: 10, lastGoalIndex: 4, startGoalIndex: 0,
        rowsPerPage: 4, currentPage: 1, selectedGoalIndex: undefined, selectedGoalObject: {},
        selectedTaskIndex: undefined, selectedTaskObject: {}
    });

    const updateState = (newValue) => {
        setState((previousValue) => {
            return { ...previousValue, ...newValue };
        });
    };

    const selectGoal = ({ index, goalObject, numberOfTasks }) => {
        updateState({
            selectedGoalIndex: index, selectedGoalObject: goalObject, numberOfTasks: numberOfTasks,
            selectedTaskObject: {}, selectedTaskIndex: undefined
        })
    }

    const unSelectGoal = () => {
        updateState({
            selectedGoalIndex: undefined, selectedGoalObject: {}, numberOfTasks: 0, selectedTaskObject: {},
            selectedTaskIndex: undefined
        })
    }

    const selectTask = ({ index, taskObject }) => {
        console.log('sent', taskObject)
        updateState({ selectedTaskIndex: index, selectedTaskObject: taskObject })
    }

    const unSelectTask = () => {
        updateState({ selectedTaskIndex: undefined, selectedTaskObject: {} })
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

    const computeWorkPhaseTime = ({ workPhaseObject }) => {
        const timeObject = { timeBank: 0, timeUsed: 0, timeRemaining: 0 };

        if (workPhaseObject) {
            Object.values(workPhaseObject.goals).forEach(goal => {
                goal.tasks.forEach(task => {
                    timeObject.timeBank += (Number(task?.hours || 0) * 60) + Number(task?.minutes || 0);
                    timeObject.timeUsed += (Number(task?.timeUsed || 0))
                })
            })


            timeObject.timeRemaining = timeObject?.timeBank - timeObject?.timeUsed;

            return timeObject;
        }
    }

    const workPhaseTimeTrackerData = ({ workPhaseObject }) => {
        const data = computeWorkPhaseTime({ workPhaseObject: workPhaseObject });
        const iconStyle = { marginLeft: '16px', height: '20px', width: '20px', color: '#257AFB' }
        const fontSize = 15

        return [
            {
                label: 'Time bank', icon: <TimerSvg style={{ ...iconStyle }} />, value: formatTime(data?.timeBank),
                bgcolor: '#257AFB1A', color: 'black', fontSize: fontSize, valueColor: '#257AFB'
            },
            {
                label: 'Time-used', icon: <DurationSvg style={{ ...iconStyle }} />, value: formatTime(data?.timeUsed),
                bgcolor: 'white', color: 'black', fontSize: fontSize, valueColor: '#257AFB'
            },
            {
                label: 'Time remaining', icon: <JusticeSvg style={{ ...iconStyle }} />, value: formatTime(data?.timeRemaining),
                bgcolor: 'white', color: 'black', fontSize: fontSize, valueColor: '#257AFB'
            },
        ]
    }

    const computeTimeBank = ({ goalObject }) => {
        let timeBank = 0;
        let timeSpent = 0

        goalObject.tasks.forEach(task => {
            timeBank += (Number(task.hours || 0) * 60) + Number(task.minutes || 0);
            timeBank += Number(task?.timeSpent || 0)
        })

        return { usedTime: timeSpent, total: timeBank }
    }

    const computeTotalTime = ({ projectObject }) => {
        const timeObject = { timeBank: 0, timeUsed: 0, timeRemaining: 0 };

        if (projectObject?.workPhases) {
            Object.values(projectObject?.workPhases).forEach(phase => {
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

    }

    const computeGoalData = ({ goalObject }) => {

        const timeBank = computeTimeBank({ goalObject: goalObject })

        const usedTime = timeBank?.usedTime;
        const totalTime = timeBank?.total;

        const formattedUsed = formatTime(usedTime)
        const formattedTotal = formatTime(totalTime)

        return {
            used: usedTime, total: totalTime, valueHeading:
                <div>
                    <TimerSvg style={{ height: '16px', width: '16px', marginRight: '8px' }} />  {`Time Bank : ${formattedTotal}`}
                </div>,
            valueData: `Time Spent : ${formattedUsed} out of ${formattedTotal}`
        }
    }

    const computeHeading = ({ phaseIndex }) => `WORKPHASE ${phaseIndex} TIME-BANK USAGE`;

    const headingBuilder = ({ index }) => `GOAL ${index} TIME - BANK USAGE`

    const headingBuilder2 = ({ index }) => `TIME BANK USAGE BREAKDOWN FOR TASK - ${index}`

    const taskHeadBuilder = ({ showDetails, taskObject }) => {
        const heading = <div>
            <TimerSvg style={{ height: '22px', width: '22px', marginRight: '8px' }} />
            Time Bank : {showDetails && formatTime((Number(taskObject?.hours || 0) * 60) + Number(taskObject?.minutes || 0))}
        </div>
        return heading
    }

    const timeTrackerSection1 = ({ projectObject }) => {

        const data = computeTotalTime({ projectObject: projectObject });
        const iconStyle = { marginLeft: '16px', height: '20px', width: '20px', color: '#257AFB' }
        const fontSize = 16
        return [
            {
                label: 'Project group time bank', icon: <TimerSvg style={{ ...iconStyle, color: 'white' }} />, value: formatTime(data?.timeBank),
                bgcolor: 'linear-gradient(90deg, #257AFB 0%, #234374 100%)', color: 'white', fontSize: fontSize, valueColor: 'white'
            },
            {
                label: 'Total time used', icon: <DurationSvg style={{ ...iconStyle, }} />, value: formatTime(data?.timeUsed),
                bgcolor: '#257AFB1A', color: 'black', fontSize: fontSize, valueColor: '#257AFB'
            },
            {
                label: 'Time remaining', icon: <JusticeSvg style={{ ...iconStyle, }} />, value: formatTime(data?.timeRemaining),
                bgcolor: 'white', color: 'black', fontSize: fontSize, valueColor: '#257AFB'
            },
        ]
    }

    const computeGoalTimeTracker = ({ goalObject }) => {
        const timeObject = { timeBank: 0, timeUsed: 0, timeRemaining: 0 };

        if (goalObject?.tasks) {
            goalObject.tasks.forEach(task => {
                timeObject.timeBank += (Number(task?.hours || 0) * 60) + Number(task?.minutes || 0);
                timeObject.timeUsed += (Number(task?.timeUsed || 0))
            })

            timeObject.timeRemaining = timeObject?.timeBank - timeObject?.timeUsed;

            return timeObject;
        }
    }

    const goalTimeTrackerData = ({ goalObject }) => {
        const data = computeGoalTimeTracker({ goalObject: goalObject });
        console.log('data', goalObject, data);
        const iconStyle = { marginLeft: '16px', height: '20px', width: '20px', color: '#257AFB' };
        const fontSize = 15;

        return [
            {
                label: 'Time bank', icon: <TimerSvg style={{ ...iconStyle }} />, value: formatTime(data?.timeBank),
                bgcolor: '#257AFB1A', color: 'black', fontSize: fontSize, valueColor: '#257AFB'
            },
            {
                label: 'Time-used', icon: <DurationSvg style={{ ...iconStyle }} />,
                value: formatTime(data?.timeUsed), bgcolor: 'white', color: 'black', fontSize: fontSize, valueColor: '#257AFB'
            },
            {
                label: 'Time remaining', icon: <JusticeSvg style={{ ...iconStyle }} />,
                value: formatTime(data?.timeRemaining), bgcolor: 'white', color: 'black', fontSize: fontSize, valueColor: '#257AFB'
            },
        ]
    }

    const taskValueBuilder = ({ taskObject }) => {
        return `Time Spent : ${formatTime(taskObject?.timeSpent || 0)} out of ${formatTime((Number(taskObject?.hours || 0) * 60) + Number(taskObject?.minutes || 0))}`
    }

    const indicatorData = ({ taskObject }) => {
        return { used: Number(taskObject?.timeSpent || 0), total: Number((Number(taskObject?.hours || 0) * 60) + Number(taskObject?.minutes || 0)) };
    }


    return (
        <Box sx={{ maxWidth: '100%', overflowY: 'auto', maxHeight: '80vh', }}>
            {/* project group, and workphases summary */}
            {Boolean(Object.keys(state.workPhaseObject).length) && <LayoutComponent {...{
                goalComputer: computeGoalData, computeHeading: computeHeading, projectObject: state.projectObject,
                workPhaseObject: state.workPhaseObject, tabBgcolor: '#EFF6FF', lightBgcolor1: '#EFF6FF', lightBgcolor2: '#257AFB0D',
                darkBgcolor: '#257AFB', cardBuilderSource2: workPhaseTimeTrackerData, cardBuilderSource1: timeTrackerSection1,
                selectGoal: selectGoal, unSelectGoal: unSelectGoal
            }} />}

            {/* Tasks under goal and goal financial Summary */}
            {state.selectedGoalIndex !== undefined && <LayoutComponent2 {...{
                lightBgcolor1: '#EFF6FF', lightBgcolor2: '#257AFB0D', darkBgcolor: '#257AFB',
                headingBuilder: headingBuilder, cardDataSource: goalTimeTrackerData, taskHeadingBuilder: taskHeadBuilder,
                taskValueBuilder: ({ taskObject }) =>
                    formatTime((Number(taskObject?.hours || 0) * 60) + Number(taskObject?.minutes || 0)),
                selectedGoalObject: state.selectedGoalObject, selectedGoalIndex: state.selectedGoalIndex, selectTask: selectTask,
                unSelectTask: unSelectTask
            }} />}

            {/* Expense and invoice breakdown for tasks */}
            {state.selectedTaskIndex !== undefined &&
                <LayoutComponent3 {...{
                    headBuilder: headingBuilder2, selectedTaskIndex: state.selectedTaskIndex, darkBgcolor: '#257AFB',
                    lightBgcolor1: '#EFF6FF', lightBgcolor2: '#257AFB1A', lightBgcolor3: '#FFFAFA', taskHeading: taskHeadBuilder,
                    instruction: 'Select an assignee to look at how their time- bank was used', image: selectAssignee,
                    selectedTaskObject: state.selectedTaskObject, taskValueBuilder: taskValueBuilder, indicatorData: indicatorData,
                }} />}

        </Box >)
}
