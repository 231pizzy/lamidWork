'use client'

import { Box, IconButton, Typography } from "@mui/material";
import { lighten } from '@mui/material/styles';
import AddIcon from "@mui/icons-material/AddOutlined";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "@/Components/redux/routeSlice";
import { ProfileAvatar } from "@/Components/ProfileAvatar";
import { ProfileAvatarGroup } from "@/Components/ProfileAvatarGroup";
import { getProjectGroup } from "./helper";
import { useRouter } from "next/navigation";
import CreateTeamModal from "@/Components/CreateTeamModal/CreateTeamModal";

function Team() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        /* Set Page title */
        dispatch(setPageTitle({ pageTitle: 'Team' }));

        getProjectGroup({
            dataProcessor: (result) => {
                updateState({
                    projectGroups: [...result]
                });
            }
        })
    }, [])

    const [state, setState] = useState({
        projectGroups: [], membersEmails: {}, uniqueEmailSet: []
    });

    const updateState = (newValue) => {
        setState((previousValue) => {
            return { ...previousValue, ...newValue };
        });
    }

    useEffect(() => {
        if (state.projectGroups?.length) {
            // get the members of each task in the project group
            const teamMembersEmails = {};
            const emailArray = [];
            state.projectGroups.forEach(group => {
                teamMembersEmails[group.projectName] = []
                Object.values(group.workPhases).forEach(phaseObject => {
                    Object.values(phaseObject.goals).forEach(goal => {
                        goal.tasks.forEach(task => {
                            teamMembersEmails[group.projectName] = [...new Set([...teamMembersEmails[group.projectName],
                            ...Object.keys(task.taskAssignmentMapping)])];

                            emailArray.push(...Object.keys(task.taskAssignmentMapping))
                        })
                    })
                })
            })

            updateState({ membersEmails: teamMembersEmails, uniqueEmailSet: [...new Set(emailArray)] })
        }

    }, [state.projectGroups])

    const gotoProjectGroup = (data) => {
        console.log('clicked team', data);
        //  const projectId = event.target.id;
        if (data?.id) {
            router.push(`/admin/project-group-detail/?projectId=${data?.id}&&projectName=${data?.name}&&projectColor=${data?.color}`,
               /*  { state: { projectId: data?.id, projectName: data?.name, projectColor: data?.color } } */)
        }
    }

    const getEmailArray = (groupObject) => {
        const emailArray = []
        Object.values(groupObject.workPhases).forEach(phaseObject => {
            Object.values(phaseObject.goals).forEach(goal => {
                goal.tasks.forEach(task => {
                    emailArray.push(...Object.keys(task.taskAssignmentMapping))
                })
            })
        });

        return [...new Set(emailArray)]
    }

    console.log('team state', state)

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <Box sx={{ maxWidth: '100%', }}>
            {/* Tool bar section */}
            <Box sx={{
                px: 3, py: 2, display: 'flex', mb: 2, bgcolor: '#F5F5F5',
                borderBottom: '1px solid rgba(28, 29, 34, 0.1)'
            }}>
                <Typography
                    sx={{ mr: 4, pb: .5, fontWeight: 700, fontSize: { xs: 15, md: 17 }, color: 'black' }}  >
                    TEAMS
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <IconButton sx={{ height: 30, width: 30 }} onClick={openModal} style={{ backgroundColor: '#BF0606' }}>
                    <AddIcon sx={{ fontSize: 26, color: 'white' }} />
                </IconButton>
                <CreateTeamModal
                    open={isModalOpen}
                    handleCancel={closeModal}
                />
            </Box>

            {/* Body */}
            {Boolean(state.projectGroups.length) ?
                <Box sx={{ display: 'flex', alignItems: 'center', px: { xs: 1.5, md: 3 }, py: 2, flexWrap: 'wrap' }}>
                    {state.projectGroups.map((groupObject, index) => {
                        const emailArray = getEmailArray(groupObject);

                        return (
                            <Box key={index} sx={{
                                mr: { sm: 2, md: 4 }, mb: 2, border: '1px solid #1C1D221A',
                                width: { xs: '100%', sm: 'max-content' },
                                boxShadow: '0px 6px 12px 0px #4F4F4F14',
                                borderRadius: '16px', cursor: 'pointer'
                            }} onClick={() => {
                                gotoProjectGroup({
                                    id: groupObject?._id,
                                    name: groupObject?.projectName,
                                    color: groupObject?.color
                                })
                            }}>
                                {/* Heading */}
                                <Box sx={{
                                    display: 'flex', alignItems: 'center', px: 2, py: 1,
                                    borderBottom: '1px solid #1C1D221A'
                                }}>
                                    {/* Avatar */}
                                    <ProfileAvatar {...{
                                        src: null, fullName: groupObject?.projectName,
                                        diameter: 40, styleProp: {
                                            color: groupObject?.color,
                                            mr: 2, bgcolor: lighten(groupObject?.color, 0.9)
                                        }
                                    }} />
                                    {/* Project group name */}
                                    <Typography sx={{ fontWeight: 700, fontSize: 16, textTransform: 'uppercase' }}>
                                        {groupObject?.projectName}
                                    </Typography>
                                </Box>

                                {/* Avatar group */}
                                <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 2 }}>
                                    <ProfileAvatarGroup {...{
                                        emailArray: emailArray, diameter: 30,
                                        color: groupObject?.color, bgcolor: 'white', max: 5
                                    }} />
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
                : <Typography align="center" sx={{
                    fontWeight: 700, mx: 5, my: 2,
                    fontSize: 19, textTransform: 'uppercase'
                }}>
                    No teams at the moment.
                </Typography>}
        </Box>
    );
}

export default Team;
