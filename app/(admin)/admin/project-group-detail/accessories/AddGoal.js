'use client'

import { Box, Button, Slide, Typography } from "@mui/material";


import { useState } from "react";

import Close from '@mui/icons-material/Close';

import { useDispatch, useSelector } from "react-redux";

import { openSnackbar, toggleBlockView } from "@/Components/redux/routeSlice";

import GoalName from "../../project-group/new-project/tasks/GoalName";
import Tasks from "../../project-group/new-project/tasks/Tasks";
import AssignTasks from "../../project-group/new-project/tasks/AssignTasks";

import { ModalMessage } from "@/Components/ModalMessage";
import IconElement from "@/Components/IconElement";
import { addNewGoalOrTask } from "../helper";

const ApprovedSvg = '/icons/ApprovedSvg.svg'

export function AddGoal({ type, viewTitle, closeView, projectId, phaseName, goalName, phaseIndex, goalIndex }) {
    console.log('date passed to add goal form', phaseName);
    const dispatch = useDispatch();

    const savedFormData = useSelector(state => state.newProjectGroup.projectData);

    const [state, setState] = useState({
        openModal: false
    });


    const updateState = (newValue) => {
        setState((previousValue) => {
            return { ...previousValue, ...newValue };
        });
    }

    const openModal = () => {
        updateState({ openModal: true });
    }

    const closeModal = () => {
        updateState({ openModal: false });
        closeView();
    }

    const saveData = () => {
        const goalData = savedFormData.workPhases[phaseName].goals[1];

        addNewGoalOrTask({
            projectId: projectId, goalName: goalData.goalName,
            phaseName: phaseName, type: type, tasks: goalData.tasks, dataProcessor: (result) => {
                openModal()
            }
        })

        /*   addNewGoalOrTask(updateState, dispatch,
              remoteRequest, openSnackbar, toggleBlockView, navigate, openModal,
              phaseName, goalData.goalName, goalData.tasks, projectId, type) */
    }

    const handleSave = () => {
        //Check if the goal name and task are filled and if the remainingMinutes in all the tasks is 0 
        let emptyEntries = {}
        Object.values(savedFormData.workPhases[phaseName].goals).forEach(goal => {
            if (!goal?.goalName) {
                emptyEntries['Goal name is required'] = 1
            }
            else if (!goal?.tasks?.length) {
                emptyEntries['All goals must have at least one task'] = 1
            }
            else if (goal?.tasks?.filter(task => task?.remainingMinutes !== 0)?.length) {
                emptyEntries['All task must be fully assigned'] = 1
            }
        })

        if (Object.keys(emptyEntries).length) {
            dispatch(openSnackbar({
                message: <Typography >
                    {Object.keys(emptyEntries).map(error => error)}
                </Typography>, severity: 'error'
            }))
        }
        else {
            //send the data to the server and close the view!!
            saveData();
        }
    }


    return <Slide direction="left" in={true} mountOnEnter unmountOnExit>
        <Box sx={{
            height: '100%', bgcolor: 'white', overflowY: 'hidden', pb: 4,
            position: 'absolute', top: '0%', right: '0%', width: { xs: '90%', md: '80%', lg: '80%', },
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
                    {viewTitle}
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <Button variant="contained" sx={{
                }} onClick={handleSave} >
                    Done
                </Button>
            </Box>


            {/* Body */}
            <Box sx={{ height: '86vh', overflowY: 'auto' }}>
                {/* Goal name */}
                {type === 'goal' && <GoalName workPhaseKey={phaseName} goalKey={1} single={true} />}
                {/* Create Task */}
                <Tasks workPhaseKey={phaseName} goalKey={1} single={true} />
                {/* Assign task */}
                <AssignTasks workPhaseKey={phaseName} goalKey={1} single={true} />
            </Box>

            {state.openModal && <ModalMessage {...{
                open: state.openModal, onClose: closeModal,
                message: `You just added a new ${type} to ${type === 'goal' ? phaseName : goalName}`,
                image: <IconElement {...{ src: ApprovedSvg, style: { height: '60px', width: '60px' } }} />
            }} />}
        </Box>


    </Slide>

}