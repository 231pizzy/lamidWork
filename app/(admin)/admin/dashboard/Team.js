import { Box, Button, Card, Grid, Paper, Typography, lighten } from "@mui/material";

import NextArrow from "@mui/icons-material/KeyboardArrowRight";
import { ProfileAvatar } from "@/Components/ProfileAvatar";
import { ProfileAvatarGroup } from "@/Components/ProfileAvatarGroup";
import { useRouter } from "next/navigation";

export default function Team({ handleGoto, projectGroups }) {
    const router = useRouter();

    const gotoProjectGroup = (data) => {
        //  const projectId = event.target.id;
        if (data?.id) {
            router.push(`/admin/project-group-detail/?projectId=${data?.id}&&projectName=${data?.name}&&projectColor=${data?.color}`,
             /*    { state: { projectId: data?.id, projectName: data?.name, projectColor: data?.color } } */)
        }
    }

    const getTeamsInProjectGroup = (projectObject) => {
        //required: project name,total number of tasks,number of completed tasks, project id,members emails,project color
        const object = { projectName: '', taskCount: 0, completedTasks: 0, projectId: '', members: [], color: '' }

        if (projectObject) {
            object.projectName = projectObject.projectName;
            object.projectId = projectObject._id;
            object.color = projectObject.color;

            Object.values(projectObject.workPhases).forEach(phaseObject => {
                //    console.log('phase',phaseObject)
                Object.values(phaseObject.goals).forEach(goalObject => {
                    console.log('the goal', goalObject)
                    object.taskCount += goalObject.tasks?.length;
                    goalObject.tasks?.filter(task => task.status === 'completed');
                    goalObject.tasks?.forEach(task => {
                        object.members.push(...Object.keys(task.taskAssignmentMapping))
                    })
                })
            })
            return object
        }
        else {
            return {}
        }
    }

    return <Grid item xs={12} md={6} xl={3.5} sx={{ mt: 4, pr: { sm: 2, xl: 0 } }}>
        <Box disableGutters sx={{
            borderRadius: '16px', boxShadow: '0px 6px 12px rgba(79, 79, 79, 0.08)',
            width: { xs: '100%', md: '360px' }, maxWidth: '100%', bgcolor: '#FFFFFF',
            border: '1px solid rgba(28, 29, 34, 0.1)',
        }}>
            {/* Heading */}
            <Card sx={{
                px: 2, py: 2, display: 'flex', justifyContent: 'center',
                alignItems: 'center', borderRadius: '16px 16px 0px 0px', borderBottom: '1px solid #1C1D221A'
            }}>
                <Typography noWrap sx={{
                    alignItems: 'center', display: 'flex',
                    fontSize: 15, fontWeight: 700
                }}>
                    TEAMS
                </Typography>
                <Box sx={{ flexGrow: 1 }} />

                <Button id='/admin/team' sx={{ p: 0, fontSize: { xs: 12, sm: 14 } }} onClick={handleGoto}>
                    Go to Team
                    <NextArrow fontSize="small" sx={{ ml: -.5 }} />
                </Button>
            </Card>

            {/* Body */}
            <Paper sx={{
                height: '400px', overflowY: 'auto', borderRadius: ' 0px 0px 16px 16px',
                '&::-webkit-scrollbar': { width: 0 },
            }}>
                {/* Items */}
                {projectGroups?.map(projectObject => {
                    const team = getTeamsInProjectGroup(projectObject);

                    return <Box sx={{
                        my: 1, borderRadius: '16px', border: '1px solid rgba(28, 29, 34, 0.1)',
                        m: 2, px: 1, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        {/* Avatar of project name */}
                        <Box sx={{
                            width: '50px', display: 'flex',
                            justifyContent: 'center', alignItems: 'center'
                        }}>
                            <ProfileAvatar {...{
                                src: null, fullName: team.projectName, diameter: 50,
                                styleProp: {
                                    letterSpacing: 0, color: team.color, bgcolor:
                                        lighten(team.color, 0.9)
                                }
                            }} />
                        </Box>

                        {/* Body */}
                        <Box sx={{ width: '100%', px: 1 }}>
                            <Typography noWrap sx={{
                                textTransform: 'uppercase', mb: 1, fontSize: { xs: 12, sm: 14 },
                                fontWeight: 700, maxWidth: { xs: '210px', sm: '230px' }, overflowX: 'clip'
                            }}>
                                {team.projectName}
                            </Typography>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography sx={{ color: '#8D8D8D', fontWeight: 600, fontSize: { xs: 12, sm: 14 } }}>
                                    All Tasks:
                                    <Typography sx={{
                                        ml: .3,
                                        display: 'inline', color: '#333333',
                                        fontWeight: 600, fontSize: { xs: 12, sm: 14 }
                                    }}>
                                        {team.taskCount}
                                    </Typography>
                                </Typography>

                                <Box sx={{ flexGrow: 1 }} />

                                <Typography sx={{ color: '#8D8D8D', fontWeight: 600, fontSize: { xs: 12, sm: 14 } }}>
                                    Completed Tasks:
                                    <Typography sx={{
                                        ml: .3, display: 'inline',
                                        color: '#333333', fontWeight: 600, fontSize: { xs: 12, sm: 14 }
                                    }}>
                                        {team.completedTasks}
                                    </Typography>
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <ProfileAvatarGroup {...{
                                    emailArray: team.members, color: team.color, bgcolor:
                                        lighten(team.color, 0.9), diameter: 30, max: 3
                                }} />
                                <Box sx={{ flexGrow: 1 }} />
                                <Button variant="text" sx={{ px: 1, py: 0, fontSize: 13, }}
                                    onClick={() => {
                                        gotoProjectGroup({
                                            id: team?.projectId, name: team?.projectName,
                                            color: team?.color
                                        })
                                    }}>
                                    View Team
                                    <NextArrow sx={{ ml: -.5 }} fontSize="small" />
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                })}

            </Paper>
        </Box>
    </Grid>
}