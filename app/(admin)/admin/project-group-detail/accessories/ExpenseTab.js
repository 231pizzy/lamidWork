'use client'

import { Box, } from "@mui/material";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { setPageTitle } from "@/Components/redux/routeSlice.js";

import { LayoutComponent } from "./LayoutComponent.js";
import { LayoutComponent2 } from "./LayoutComponent2";
import { LayoutComponent3 } from "./LayoutComponent3";

import { getProjectGroupData } from "../helper.js";
import IconElement from "@/Components/IconElement.js";
import { Budget, JusticeSvg, Receipt } from "@/public/icons/icons.js";

const selectAssignee = '/images/selectAssign.png'
/* 
const Budget = '/icons/Budget.svg'
const JusticeSvg = '/icons/JusticeSvg.svg'
const Receipt = '/icons/Receipt.svg' */

//const icon = (icon, iconStyle) => <IconElement {...{ src: icon, style: iconStyle }} />


export function ExpenseTab({ projectId }) {
    const dispatch = useDispatch();

    console.log('projct id', projectId)

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
        projectObject: {}, currentTab: 0, workPhaseObject: {}, numberOfTasks: 1, lastGoalIndex: 4, startGoalIndex: 0,
        rowsPerPage: 4, currentPage: 1, selectedGoalIndex: undefined, selectedGoalObject: {},
        selectedTaskIndex: undefined, selectedTaskObject: {}
    });

    const updateState = (newValue) => {
        setState((previousValue) => {
            return { ...previousValue, ...newValue };
        });
    }

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

    const formatMoney = ({ amount, currency = 'NGN' }) => {
        return Number(amount).toLocaleString('en-NG', { style: 'currency', currency: currency })
    }

    const computeWorkPhaseBudgetExpense = ({ workPhaseObject }) => {
        const money = { budget: 0, amountSpent: 0, remaining: 0 };

        if (workPhaseObject) {
            Object.values(workPhaseObject.goals).forEach(goal => {
                goal.tasks.forEach(task => {
                    money.budget += Number(task?.taskBudget || 0);
                    money.amountSpent += (Number(task?.amountSpent || 0))
                })
            })


            money.remaining = money?.budget - money?.amountSpent;

            return money;
        }
    }

    const workPhaseBudgetExpenseData = ({ workPhaseObject }) => {
        const data = computeWorkPhaseBudgetExpense({ workPhaseObject: workPhaseObject });
        const iconStyle = { marginLeft: '16px', height: '20px', width: '20px', color: '#4E944F' }
        const fontSize = 15

        return [
            {
                label: 'Budget', icon: <Budget style={{ ...iconStyle }} />, value: formatMoney({ amount: data?.budget }),
                bgcolor: 'rgba(78, 148, 79, 0.10)', color: 'black', fontSize: fontSize, valueColor: '#4E944F'
            },
            {
                label: 'Expense', icon: <Receipt style={{ ...iconStyle }} />,
                value: formatMoney({ amount: data?.amountSpent }), bgcolor: 'white', color: 'black', fontSize: fontSize,
                valueColor: '#4E944F'
            },
            {
                label: 'Balance', icon: <JusticeSvg style={{ ...iconStyle }} />, value: formatMoney({ amount: data?.remaining }),
                bgcolor: 'white', color: 'black', fontSize: fontSize, valueColor: '#4E944F'
            },
        ]
    }

    const computeGoalExpense = ({ goalObject }) => {
        const money = { budget: 0, amountSpent: 0, remaining: 0 };

        if (goalObject?.tasks) {
            goalObject.tasks.forEach(task => {
                money.budget += Number(task?.taskBudget || 0);
                money.amountSpent += (Number(task?.amountSpent || 0))
            })


            money.remaining = money?.budget - money?.amountSpent;

            return money;
        }
    }

    const goalExpenseData = ({ goalObject }) => {
        const data = computeGoalExpense({ goalObject: goalObject });
        console.log('data', goalObject, data);
        const iconStyle = { marginLeft: '16px', height: '20px', width: '20px', color: '#4E944F' }
        const fontSize = 15

        return [
            {
                label: 'Budget', icon: <Budget style={{ ...iconStyle }} />, value: formatMoney({ amount: data?.budget }),
                bgcolor: 'rgba(78, 148, 79, 0.10)', color: 'black', fontSize: fontSize, valueColor: '#4E944F'
            },
            {
                label: 'Expense', icon: <Receipt style={{ ...iconStyle }} />,
                value: formatMoney({ amount: data?.amountSpent }), bgcolor: 'white', color: 'black', fontSize: fontSize,
                valueColor: '#4E944F'
            },
            {
                label: 'Balance', icon: <JusticeSvg style={{ ...iconStyle }} />, value: formatMoney({ amount: data?.remaining }),
                bgcolor: 'white', color: 'black', fontSize: fontSize, valueColor: '#4E944F'
            },
        ]
    }

    const computeBudgetExpense = ({ goalObject }) => {
        let budget = 0;
        let amountSpent = 0

        goalObject.tasks.forEach(task => {
            budget += Number(task.taskBudget || 0);
            amountSpent += Number(task?.amountSpent || 0)
        })

        return { amountSpent: amountSpent, budget: budget }
    }

    const computeTotalBudgetExpense = ({ projectObject }) => {
        const money = { budget: 0, amountSpent: 0, remaining: 0 };

        if (projectObject?.workPhases) {
            Object.values(projectObject?.workPhases).forEach(phase => {
                Object.values(phase.goals).forEach(goal => {
                    goal.tasks.forEach(task => {
                        money.budget += Number(task?.taskBudget || 0);
                        money.amountSpent += Number(task?.amountSpent || 0)
                    })
                })
            })

            money.remaining = money?.budget - money?.amountSpent;

            return money;
        }

    }

    const computeGoalData = ({ goalObject }) => {

        const timeBank = computeBudgetExpense({ goalObject: goalObject })

        const amountSpent = timeBank?.amountSpent;
        const budget = timeBank?.budget;

        const formattedUsed = formatMoney({ amount: amountSpent })
        const formattedTotal = formatMoney({ amount: budget })

        return {
            used: amountSpent, total: budget, valueHeading:
                <div>
                    <Budget style={{ height: '16px', width: '16px', marginRight: '8px' }} />  {`Budget : ${formattedTotal}`}
                </div>,
            valueData: `Spent : ${formattedUsed} from ${formattedTotal}`
        }
    }

    const computeHeading = ({ phaseIndex }) => `EXPENSE & INVOICE FOR WORK PHASE - ${phaseIndex}`

    const headingBuilder = ({ index }) => `GOAL ${index} EXPENSES & INVOICE`

    const headingBuilder2 = ({ index }) => `EXPENSE AND INVOICE BREAKDOWN FOR TASK - ${index}`

    const taskHeadBuilder = ({ showDetails, taskObject }) => {
        const heading = <div>
            <Budget style={{ height: '22px', width: '22px', marginRight: '8px' }} />
            Budget {showDetails && formatMoney({ amount: taskObject?.taskBudget || 0 })}
        </div>
        return heading
    }

    const expenseSection1 = ({ projectObject }) => {
        const data = computeTotalBudgetExpense({ projectObject: projectObject });
        console.log('returned data', data);
        const iconStyle = { marginLeft: '16px', height: '20px', width: '20px', color: '#4E944F' }
        const fontSize = 16
        return [
            {
                label: 'Project group total budget', icon: <Budget style={{ ...iconStyle, color: 'white' }} />, value: formatMoney({ amount: data?.budget }),
                bgcolor: 'linear-gradient(90deg, #4E944F 0%, #225222 100%)', color: 'white', fontSize: fontSize, valueColor: 'white'
            },
            {
                label: 'Total expense', icon: <Receipt style={{ ...iconStyle, color: 'white' }} />, value: formatMoney({ amount: data?.amountSpent }),
                bgcolor: 'rgba(78, 148, 79, 0.10)', color: 'black', fontSize: fontSize, valueColor: '#4E944F'
            },
            {
                label: 'Balance', icon: <JusticeSvg style={{ ...iconStyle, color: 'white' }} />, value: formatMoney({ amount: data?.remaining }),
                bgcolor: 'white', color: 'black', fontSize: fontSize, valueColor: '#4E944F'
            },
        ]
    }

    const taskValueBuilder = ({ taskObject }) => {
        return `Spent : ${formatMoney({ amount: taskObject?.amountSpent || 0 })} out of ${formatMoney({ amount: taskObject?.taskBudget || 0 })}`
    }

    const indicatorData = ({ taskObject }) => {
        return { used: Number(taskObject?.amountSpent), total: Number(taskObject?.taskBudget) };
    }


    console.log('project group expense state', state);


    return (
        <Box sx={{ maxWidth: '100%', overflowY: 'auto', maxHeight: '80vh', }}>
            {/* project group, and workphases summary */}
            {Boolean(Object.keys(state.workPhaseObject).length) && <LayoutComponent {...{
                goalComputer: computeGoalData, computeHeading: computeHeading, projectObject: state.projectObject,
                workPhaseObject: state.workPhaseObject, tabBgcolor: '#F2FFF2', lightBgcolor1: '#F2FFF2', lightBgcolor2: '#299C290D',
                darkBgcolor: '#4E944F', cardBuilderSource2: workPhaseBudgetExpenseData, cardBuilderSource1: expenseSection1,
                selectGoal: selectGoal, unSelectGoal: unSelectGoal
            }} />}

            {/* Tasks under goal and goal financial Summary */}
            {state.selectedGoalIndex !== undefined && <LayoutComponent2 {...{
                lightBgcolor1: '#4E944F1A', lightBgcolor2: '#299C290D', darkBgcolor: '#4E944F',
                headingBuilder: headingBuilder, cardDataSource: goalExpenseData, taskHeadingBuilder: taskHeadBuilder,
                taskValueBuilder: ({ taskObject }) => formatMoney({ amount: taskObject?.taskBudget }),
                selectedGoalObject: state.selectedGoalObject, selectedGoalIndex: state.selectedGoalIndex, selectTask: selectTask,
                unSelectTask: unSelectTask
            }} />}

            {/* Expense and invoice breakdown for tasks */}
            {state.selectedTaskIndex !== undefined &&
                <LayoutComponent3 {...{
                    headBuilder: headingBuilder2, selectedTaskIndex: state.selectedTaskIndex, darkBgcolor: '#4E944F',
                    lightBgcolor1: '#F2FFF2', lightBgcolor2: '#4E944F1A', lightBgcolor3: '#FFFAFA', taskHeading: taskHeadBuilder,
                    instruction: 'Select an assignee to look at their expense and invoice', image: selectAssignee,
                    selectedTaskObject: state.selectedTaskObject, taskValueBuilder: taskValueBuilder, indicatorData: indicatorData,
                }} />}

        </Box >)
}
