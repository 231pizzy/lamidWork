import { Avatar, Box, Button, Card, Grid, Typography, lighten } from "@mui/material";

import NextArrow from "@mui/icons-material/KeyboardArrowRight";
import CircleIcon from "@mui/icons-material/Circle";
import TodoIcon from "@mui/icons-material/ThumbUpOutlined";
import InProgressIcon from "@mui/icons-material/NearMeOutlined";
import ReviewIcon from "@mui/icons-material/StarOutline";
import CompletedIcon from "@mui/icons-material/CheckOutlined";

export default function ProjectGroups({ goalStatusData, gotoProjectGroup, gotoPage }) {

    return <Grid item xs={12} sx={{ mt: 4 }}>

        <Box sx={{
            borderRadius: '16px', boxShadow: '0px 6px 12px rgba(79, 79, 79, 0.08)',
            width: '100%', maxWidth: '100%', bgcolor: '#FFFFFF',
            border: '1px solid rgba(28, 29, 34, 0.1)', pb: 1,
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5, px: 2, alignItems: 'center' }}>
                <Typography noWrap sx={{ fontWeight: 700 }}>
                    PROJECT GROUP
                </Typography>
                <Box sx={{ flexGrow: 1 }} />

                <Button id='/admin/project-group' sx={{ fontSize: { xs: 12, sm: 14 } }}
                    onClick={gotoPage}>
                    Go to Group
                    <NextArrow fontSize="small" sx={{ ml: -.5 }} />
                </Button>
            </Box>

            <Box sx={{
                borderTop: '1px solid rgba(28, 29, 34, 0.1)',
                'borderRadius': '0px 0px 16px 16px', pb: 2, '&::-webkit-scrollbar': { width: 0 },
                maxHeight: '270px', overflowY: 'scroll'
            }}>
                {/* Project groups */}
                {Boolean(Object.keys(goalStatusData).length) && <Grid container sx={{ px: 1, }}>
                    {Object.entries(goalStatusData).map(([groupName, groupObj], index) => {

                        return <Grid key={index} item xs={12} md={6} lg={4} xl={3} sx={{ mt: 2, }} spacing={1}>
                            <Card sx={{
                                width: { xs: '100%', md: '300px', lg: '300px' },
                                borderBottom: '1px solid rgba(28, 29, 34, 0.1)',
                                borderRadius: '16px',
                            }}>
                                {/* Heading */}
                                <Typography noWrap sx={{
                                    px: 1, py: 1, display: 'flex', alignItems: 'center',
                                    fontSize: { xs: 12, md: 13 }, background: 'rgba(243, 70, 16, 0.1)',
                                    fontWeight: 500, textTransform: 'uppercase', bgcolor: lighten(groupObj.color, 0.9)
                                }}>
                                    <CircleIcon fontSize="small"
                                        sx={{ mr: .5, height: 16, color: groupObj.color }} />

                                    {groupName}

                                    <Box sx={{ flexGrow: 1 }} />

                                    <Button sx={{ p: 0 }} id={groupObj.projectId}
                                        onClick={() => {
                                            gotoProjectGroup({
                                                id: groupObj?.projectId,
                                                name: groupName, color: groupObj?.color
                                            })
                                        }}>
                                        <Typography noWrap
                                            sx={{ fontWeight: 600, fontSize: { xs: 11, sm: 11 } }}>
                                            Go to project group
                                        </Typography>
                                        <NextArrow fontSize="small" sx={{ ml: -.5 }} />
                                    </Button>
                                </Typography>


                                {/* Body */}
                                <Grid container  >
                                    <Grid item xs={6} >
                                        <Typography noWrap sx={{
                                            pl: 3, py: 1,
                                            color: '#333333', fontSize: { xs: 12, sm: 13 },
                                            display: 'flex', alignItems: 'center'
                                        }}>
                                            <Avatar sx={{
                                                mr: 1.5,
                                                height: '24px', width: '24px',
                                                background: 'rgba(25, 211, 252, 0.2)', border: '0.675px solid #19D3FC'
                                            }}>
                                                <TodoIcon fontSize="small" sx={{ height: 16, width: 16, color: '#19D3FC' }} />
                                            </Avatar>
                                            To do ({groupObj.toDo})
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography noWrap sx={{
                                            pr: 2, py: 1, fontSize: { xs: 12, sm: 13 },
                                            display: 'flex', alignItems: 'center'
                                        }}>
                                            <Avatar sx={{
                                                mr: 1.5,
                                                height: '24px', width: '24px', background: 'rgba(242, 147, 35, 0.2)',
                                                border: '0.675px solid #F29323'
                                            }}>
                                                <InProgressIcon fontSize="small"
                                                    sx={{ height: 16, width: 16, color: '#F29323' }} />
                                            </Avatar>
                                            In progress ({groupObj.inProgress})
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography noWrap sx={{
                                            pl: 3, py: 1, color: '#333333',
                                            fontSize: { xs: 12, sm: 13 },
                                            display: 'flex', alignItems: 'center'
                                        }}>
                                            <Avatar sx={{
                                                mr: 1.5,
                                                height: '24px', width: '24px', background: 'rgba(200, 9, 200, 0.2)',
                                                border: '0.675px solid #C809C8'
                                            }}>
                                                <ReviewIcon fontSize="small"
                                                    sx={{ height: 16, width: 16, color: '#C809C8' }} />
                                            </Avatar>
                                            Review ({groupObj.review})
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Typography noWrap sx={{
                                            pr: 2, py: 1, fontSize: { xs: 12, sm: 13 },
                                            display: 'flex', alignItems: 'center'
                                        }}>
                                            <Avatar sx={{
                                                mr: 1.5,
                                                height: '24px', width: '24px', background: 'rgba(3, 178, 3, 0.2)',
                                                border: '0.675px solid #03B203'
                                            }}>
                                                <CompletedIcon fontSize="small"
                                                    sx={{ height: 16, width: 16, color: '#03B203' }} />
                                            </Avatar>
                                            Completed ({groupObj.completed})
                                        </Typography>
                                    </Grid>
                                </Grid>

                            </Card>

                        </Grid>
                    }
                    )}
                </Grid>}
            </Box>
        </Box>
    </Grid>
}