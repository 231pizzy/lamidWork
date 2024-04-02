import { Box, Button, Card, Grid, IconButton, LinearProgress, Paper, Typography } from "@mui/material";

import NextArrow from "@mui/icons-material/KeyboardArrowRight";
import TimerIcon from "@mui/icons-material/TimerOutlined";
import ListIcon from "@mui/icons-material/ListOutlined";
import CalendarIcon from "@mui/icons-material/CalendarMonth";
import FlagIcon from "@mui/icons-material/Flag";
import TodoIcon from "@mui/icons-material/ThumbUpOutlined";
import InProgressIcon from "@mui/icons-material/NearMeOutlined";
import ReviewIcon from "@mui/icons-material/StarOutline";
import CompletedIcon from "@mui/icons-material/CheckOutlined";

import AddIcon from "@mui/icons-material/AddOutlined";
import { ProfileAvatarGroup } from "@/Components/ProfileAvatarGroup";
import moment from "moment";
const statusData = [
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

export default function Tasks({ getAllTaskByStatus }) {
    const headingElement = ({ icon, label }) => {
        return <Typography sx={{ fontSize: 13, fontWeight: 600, px: 1.5, py: .5, bgcolor: '#F2F2F2E5', color: '#1C1D2280' }}>
            {/* Icon */}
            {icon}
            {/* Label */}
            {label}
        </Typography>
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

    const progress = ({ valueKey, goalObject }) => {
        const statusObject = statusData.find(item => item.valueKey === valueKey);
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

    return <Grid item xs={12} sx={{ mt: 4, }}>
        <Box sx={{
            borderRadius: '16px', boxShadow: '0px 6px 12px rgba(79, 79, 79, 0.08)',
            width: '100%', maxWidth: '100%', bgcolor: '#FFFFFF',
            border: '1px solid rgba(28, 29, 34, 0.1)', pb: 1
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5, px: 2, alignItems: 'center' }}>
                <Typography noWrap sx={{ fontWeight: 700 }}>
                    MY TASKS
                </Typography>
                <Box sx={{ flexGrow: 1 }} />

                <Button id='/admin/task' sx={{ p: 0, fontSize: { xs: 12, sm: 14 } }}>
                    Go to Tasks
                    <NextArrow fontSize="small" sx={{ ml: -.5 }} />
                </Button>
            </Box>

            <Box sx={{
                borderTop: '1px solid rgba(28, 29, 34, 0.1)',
                pb: 2,
            }}>
                <Grid container sx={{}}>
                    {statusData.map((status, index) => {
                        const groupArray = getAllTaskByStatus(status.valueKey)
                        return <Grid item xs={12} md={6} lg={4} xl={3}
                            sx={{ mt: 2, px: { xs: 1, lg: 1 } }} spacing={1}
                        >
                            <Card sx={{
                                width: { xs: '100%', md: '320px', lg: '320px' },
                                borderBottom: '1px solid rgba(28, 29, 34, 0.1)',
                                borderRadius: '16px',
                            }}>
                                {/* heading */}
                                <Box noWrap sx={{
                                    maxWidth: '100%',
                                    px: 2, py: 1.5, display: 'flex', alignItems: 'center',
                                    fontSize: 14, bgcolor: status.bgcolor,
                                    fontWeight: 600, textTransform: 'uppercase',
                                }}>

                                    {status.icon({
                                        bgcolor: status.bgcolor, color: status.color,
                                        border: `1px solid ${status.color}`, borderRadius: '26.6667px', fontSize: 34
                                    })}

                                    <Typography sx={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 15, ml: 2 }}>
                                        {status.label} ({groupArray.length})
                                    </Typography>


                                    <Box sx={{ flexGrow: 1 }} />

                                    {status.valueKey === 'toDo' && <IconButton sx={{
                                        height: '33px', width: '33px',
                                        background: '#BF0606', border: '0.675px solid #19D3FC'
                                    }}>
                                        <AddIcon fontSize="small" sx={{ height: 24, width: 24, color: 'white' }} />
                                    </IconButton>}
                                </Box>

                                {/* Body */}
                                <Paper sx={{
                                    background: 'rgba(28, 29, 34, 0.08)', '&::-webkit-scrollbar': { width: 0 },
                                    height: '400px', overflowY: 'auto', px: 1.5, py: 2
                                }}>
                                    {groupArray.map((object, indx) => {
                                        return Boolean(Object.keys(object).length) &&
                                            <Box key={indx}
                                                sx={{ bgcolor: 'white', borderRadius: '16px', mb: 3, cursor: 'pointer' }}
                                            >
                                                {/* Row 1: task name and members */}
                                                <Box sx={{ p: 1, }} >
                                                    {/* Goal name */}
                                                    <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 1 }}>
                                                        {object.taskName}
                                                    </Typography>
                                                    {/* Members avatar group */}

                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                                                        <ProfileAvatarGroup {...{
                                                            emailArray: Object.keys(object?.taskAssignmentMapping), diameter: 30, color: status.color, bgcolor: status.bgcolor, max: 3
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
                                                        Duration: {moment(object.startDate, 'yyyy-MM-DD').format('MMM D')} - {moment(object.endDate, 'yyyy-MM-DD').format('MMM D')}

                                                        {/* Flag icon */}
                                                        <FlagIcon sx={{ ml: 1, color: '#FF0000' }} />
                                                    </Typography>
                                                </Box>

                                                {/* Row 3 and 4: timebank and progress */}
                                                <Box sx={{ pb: 1 }}>
                                                    {progress({
                                                        valueKey: status.valueKey,
                                                        goalObject: object.goalObject
                                                    }).map((data, index) => {
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
                                </Paper>

                            </Card>





                        </Grid>
                    })}
                </Grid>

            </Box>


        </Box>

    </Grid>
}