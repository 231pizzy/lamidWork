'use client'

import {
    Avatar,
    Box, Button, Card, Divider, Grid, IconButton, Paper, Typography,
} from "@mui/material";


import { Bar } from 'react-chartjs-2';
import { LinearScale, CategoryScale, BarElement, Chart as ChartJS } from 'chart.js';

import AddIcon from "@mui/icons-material/AddOutlined";
import CircleIcon from "@mui/icons-material/Circle";
import TodoIcon from "@mui/icons-material/ThumbUpOutlined";
import InProgressIcon from "@mui/icons-material/NearMeOutlined";
import ReviewIcon from "@mui/icons-material/StarOutline";
import CompletedIcon from "@mui/icons-material/CheckOutlined";
import NextArrow from "@mui/icons-material/KeyboardArrowRight";


import {
    JusticeSvg, Budget, FundSvg, DebtorSvg, Receipt,
    MoneyCase, SavedSvg, TimerSvg, EditBoxSvg, TimeBottleSvg
} from '@/public/icons/icons.js'


import { lighten } from '@mui/material/styles';
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "@/Components/redux/routeSlice";

import { useRouter } from "next/navigation.js";
import { getDashboardData } from "./helper";
import { useRef } from "react";

//import CreateProjectGroup from "./new-project/CreateProjectGroup";


/* const JusticeSvg = '/icons/JusticeSvg.svg'
const Budget = '/icons/Budget.svg'
const FundSvg = '/icons/fundSvg.svg'
const DebtorSvg = '/icons/flat-color-icons_debt.svg'
const Receipt = '/icons/Receipt.svg'
const MoneyCase = '/icons/MoneyCase.svg'
const SavedSvg = '/icons/savedSvg.svg'
const TimerSvg = '/icons/timerSvg.svg'
const EditBoxSvg = '/icons/editBoxSvg.svg'
const TimeBottleSvg = '/icons/timeBottle.svg' */


const projects = [
    {
        id: '1',
        owner: 'MTN Nigeria Group',
        color: '#F34610',
        toDo: 273, inProgress: 344, review: 34, completed: 23,
        budget: '1000000', payment: '500000', balance: '500000',
        funds: '400000', savings: '100000', deficit: true,
        expenses: '800000', overRun: '400000',
        timeBank: '200', timeSpent: '50', timeLeft: '150'
    },
    {
        id: '2',
        owner: 'Etisalat Group',
        color: '#257AFB',
        toDo: 45, inProgress: 22, review: 45, completed: 0,
        budget: '1000000', payment: '500000', balance: '500000',
        funds: '400000', savings: '100000', deficit: true,
        expenses: '800000', overRun: '400000',
        timeBank: '240', timeSpent: '10', timeLeft: '230'
    },
    {
        id: '3',
        owner: 'Nigeria Brewery',
        color: '#F900BF',
        toDo: 211, inProgress: 78, review: 3, completed: 97,
        budget: '1000000', payment: '500000', balance: '500000',
        funds: '400000', savings: '100000', deficit: true,
        expenses: '800000', overRun: '400000',
        timeBank: '20', timeSpent: '10', timeLeft: '10'
    },
    {
        id: '4',
        owner: 'Nigeria Brewery',
        color: '#A52A2A',
        toDo: 111, inProgress: 32, review: 75, completed: 23,
        budget: '1000000', payment: '500000', balance: '500000',
        funds: '400000', savings: '100000', deficit: false,
        expenses: '800000', left: '400000',
        timeBank: '1200', timeSpent: '50', timeLeft: '1150'
    },
    {
        id: '5',
        owner: 'Dangote Group',
        color: '#F34610',
        toDo: 743, inProgress: 22, review: 643, completed: 232,
        budget: '1000000', payment: '500000', balance: '500000',
        funds: '400000', savings: '100000', deficit: true,
        expenses: '800000', overRun: '400000',
        timeBank: '100', timeSpent: '50', timeLeft: '50'
    },
    {
        id: '6',
        owner: 'Firstbank Group',
        color: '#257AFB',
        toDo: 32, inProgress: 3, review: 21, completed: 332,
        budget: '1000000', payment: '500000', balance: '500000',
        funds: '400000', savings: '100000', deficit: true,
        expenses: '800000', overRun: '400000',
        timeBank: '800', timeSpent: '340', timeLeft: '460'
    },

];

const companyTime = {
    timeLeft: '2000', timeSpent: '200', totalTime: '2200'
};

const totalProjectTimes = {
    timeLeft: projects.map(item => Number(item.timeLeft)).reduce((a, b) => a + b, 0),
    timeSpent: projects.map(item => Number(item.timeSpent)).reduce((a, b) => a + b, 0),
    totalTime: projects.map(item => Number(item.timeBank)).reduce((a, b) => a + b, 0)
}

const iconStyle1 = { color: 'white', height: '20px', width: 'auto' }
const iconStyle2 = { color: 'white', height: '36px', width: 'auto' }
const iconStyle3 = { width: '24px', height: '24px' }

const summaryData = [
    {
        label: "COMPANY'S TIME LEFT", value: companyTime.timeLeft, background: 'white', icon: null,
        labelColor: 'black', valueColor: '#BF0606', border: '1px solid rgba(28, 29, 34, 0.1)',
        shadow: '0px 6px 12px rgba(79, 79, 79, 0.08)', width: '220px', marginLeft: 2,
        iconAlign: 'flex-start', type: 'time', valueKey: 'timeLeft',
    },
    {
        label: "COMPANY'S TIME SPENT ON PROJECT GROUPS", value: companyTime.timeSpent,
        background: 'rgba(191, 6, 6, 0.1)', icon: null, valueKey: 'timeSpent',
        labelColor: '#BF0606', valueColor: '#BF0606', border: '1px solid #BF0606',
        shadow: '0px 6px 12px rgba(79, 79, 79, 0.08)', width: '300px', marginLeft: 2,
        iconAlign: 'flex-start', type: 'time'
    },
    {
        label: "COMPANY'S TIME", value: companyTime.totalTime,
        background: 'linear-gradient(90deg, #BF0606 0%, #450909 81.8%)',
        icon: <EditBoxSvg style={{ ...iconStyle1 }} />,
        labelColor: 'white', valueColor: 'white', border: '', valueKey: 'timeBank',
        shadow: '0px 6px 12px rgba(79, 79, 79, 0.08)', width: '200px', marginLeft: 2,
        iconAlign: 'flex-start', type: 'time'
    },
    {
        label: "PROJECT GROUPS TOTAL TIME REMAINING", value: totalProjectTimes.timeLeft, background: '#2BB439',
        icon: <TimerSvg style={{ ...iconStyle2 }} />, valueKey: 'timeLeft',
        labelColor: 'white', valueColor: 'white', border: '',
        shadow: '0px 8px 12px rgba(0, 0, 0, 0.04)', width: '305px', marginLeft: 2,
        iconAlign: 'center', type: 'time'
    },
    {
        label: "PROJECT GROUPS TOTAL TIME SPENT", value: totalProjectTimes.timeSpent, background: '#F2890D',
        icon: <TimerSvg style={{ ...iconStyle2 }} />, valueKey: 'timeSpent',
        labelColor: 'white', valueColor: 'white', border: '',
        shadow: '0px 8px 12px rgba(0, 0, 0, 0.04)', width: '275px', marginLeft: 2,
        iconAlign: 'center', type: 'time'
    },
    {
        label: "PROJECT GROUPS TOTAL TIME BANK", value: totalProjectTimes.totalTime, background: '#0094FF',
        icon: <TimerSvg style={{ ...iconStyle2 }} />, valueKey: 'timeBank',
        labelColor: 'white', valueColor: 'white', border: '',
        shadow: '0px 8px 12px rgba(0, 0, 0, 0.04)', width: '275px', marginLeft: 2,
        iconAlign: 'center', type: 'time'
    },
]

const summaryData2 = [
    {
        label: "TOTAL CLIENT BILL", value: '4000000', valueKey: 'totalBill',
        background: 'linear-gradient(90deg, #BF0606 0%, #450909 81.8%)',
        icon: <MoneyCase style={{ ...iconStyle3 }} />,
        labelColor: 'white', valueColor: 'white', border: '1px solid rgba(28, 29, 34, 0.1)',
        shadow: '0px 8px 12px rgba(0, 0, 0, 0.04)', width: '160px', marginLeft: 2,
        iconColor: 'white', type: 'money'
    },
    {
        label: "TOTAL CLIENT PAYMENT", value: '2000000',
        background: 'white', valueKey: 'totalPayment',
        icon: <Budget style={{ ...iconStyle3 }} />,
        labelColor: 'black', valueColor: 'black', border: '1px solid rgba(191, 6, 6, 0.5)',
        shadow: '0px 8px 12px rgba(0, 0, 0, 0.04)', width: '170px', marginLeft: 2,
        iconColor: '#9F9F9F', type: 'money'
    },
    {
        label: "TOTAL AMOUNT SAVED FROM PAYMENT", value: '400000',
        background: 'white', valueKey: 'totalSaving',
        icon: <SavedSvg style={{ ...iconStyle3 }} />,
        labelColor: 'black', valueColor: 'black', border: '1px solid rgba(28, 29, 34, 0.1)',
        shadow: '0px 8px 12px rgba(0, 0, 0, 0.04)', width: '260px', marginLeft: 2,
        iconColor: '#9F9F9F', type: 'money'
    },
    {
        label: "TOTAL BALANCE FROM CLIENT", value: '2000000',
        background: 'rgba(191, 6, 6, 0.05)', valueKey: 'totalBalance',
        icon: <JusticeSvg style={{ ...iconStyle3 }} />,
        labelColor: '#BF0606', valueColor: '#BF0606', border: '1px solid rgba(191, 6, 6, 0.4)',
        shadow: '0px 8px 12px rgba(0, 0, 0, 0.04)', width: '205px', marginLeft: 2,
        iconColor: '#BF0606', type: 'money'
    },
]

const summaryData3 = [
    {
        label: "TOTAL PROJECT BUDGET", value: '1600000', valueKey: 'totalBudget',
        background: 'linear-gradient(90deg, #BF0606 0%, #450909 81.8%)',
        icon: <MoneyCase style={{ ...iconStyle3 }} />,
        labelColor: 'white', valueColor: 'white', border: '1px solid rgba(28, 29, 34, 0.1)',
        shadow: '0px 8px 12px rgba(0, 0, 0, 0.04)', width: '167px', marginLeft: 2,
        iconColor: 'white', type: 'money'
    },
    {
        label: "TOTAL GROUP EXPENSE", value: '1000000',
        background: 'white', valueKey: 'totalExpense',
        icon: <Receipt style={{ ...iconStyle3 }} />,
        labelColor: 'black', valueColor: 'black', border: '1px solid rgba(28, 29, 34, 0.1)',
        shadow: '0px 8px 12px rgba(0, 0, 0, 0.04)', width: '165px', marginLeft: 2,
        iconColor: '#9F9F9F', type: 'money'
    },
    {
        label: "TOTAL FUNDS LEFT", value: '200000',
        background: 'white', valueKey: 'totalFundLeft',
        icon: <TimeBottleSvg style={{ ...iconStyle3 }} />,
        labelColor: 'black', valueColor: 'black', border: '1px solid rgba(28, 29, 34, 0.1)',
        shadow: '0px 8px 12px rgba(0, 0, 0, 0.04)', width: '140px', marginLeft: 2,
        iconColor: '#9F9F9F', type: 'money'
    },
    {
        label: "TOTAL GROUP OVERRUN", value: '800000',
        background: 'rgba(191, 6, 6, 0.05)', valueKey: 'totalOverrun',
        icon: <DebtorSvg style={{ ...iconStyle3 }} />,
        labelColor: '#BF0606', valueColor: '#BF0606', border: '1px solid rgba(191, 6, 6, 0.4)',
        shadow: '0px 8px 12px rgba(0, 0, 0, 0.04)', width: '170px', marginLeft: 2,
        iconColor: '#BF0606', type: 'money'
    },
]

const barChartOptions = {
    scales: {
        y: {
            grid: {
                display: false
            },
            ticks: {
                callback: function (value, index, values) {
                    return `${value}mins`
                }
            }
        },
        x: {
        }
    },
}

const barColors = { 'timeBankInMinutes': '#0094FF', 'timeSpentInMinutes': '#F2890D', 'timeLeftInMinutes': '#2BB439', }

const barLabels = [{ value: 'timeBankInMinutes', label: 'Time Bank' },
{ value: 'timeSpentInMinutes', label: 'Time Spent' }, { value: 'timeLeftInMinutes', label: 'Time Left' }]

ChartJS.register(CategoryScale, LinearScale, BarElement);

export default function ProjectGroup() {
    const dispatch = useDispatch();
    const router = useRouter();
    const ref = useRef(null)


    const [state, setState] = useState({
        createProject: false, newProjectGroupData: {}, dashboardData: {}, projectGroups: 0, ref: null
    });

    useEffect(() => {
        handleGetProjectGroupDashboard()
    }, [state.projectGroups])


    const updateState = (newValue) => {
        setState((previousValue) => {
            return { ...previousValue, ...newValue };
        });
    }

    useEffect(() => {
        /* Set Page title */
        dispatch(setPageTitle({ pageTitle: 'Project Group' }))
        updateState({ ref: ref })
    }, []);

    const handleGetProjectGroupDashboard = () => {
        getDashboardData({
            dataProcessor: (result) => {
                updateState({ dashboardData: { ...result } });
            }
        })
    }

    const barChartLabel = Object.values(state.dashboardData)?.map(project => project?.projectName?.toLocaleUpperCase());



    const summaryCard = (label, value, background, icon, labelColor, valueColor,
        border, shadow, width, marginLeft, iconAlign, type, horizPadding) => {

        return <Card sx={{
            maxWidth: { xs: '100%', md: width },
            border: border,
            boxShadow: shadow,
            borderRadius: '16px', py: 1.5, px: { xs: 1.5, lg: horizPadding || 1.5 }, mb: 2,
            background: background, ml: { xs: 0, md: marginLeft },
            display: 'flex', justifyContent: 'space-between',
        }}>
            <Box sx={{ pr: 1 }}>
                <Typography sx={{
                    color: labelColor, whiteSpace: { xs: 'wrap', lg: 'nowrap' },
                    alignItems: 'center', justifyContent: 'left', mb: .5,
                    display: 'flex', fontSize: { xs: 13, md: 12 }, fontWeight: 600
                }}>
                    {label}
                </Typography>

                <Typography noWrap sx={{
                    justifyContent: 'left', fontSize: { xs: 11, md: 13, lg: 16 },
                    alignItems: 'center', lineHeight: '27px', color: valueColor,
                    display: 'flex', fontStyle: 'normal', fontWeight: 700
                }}>
                    {type === 'money' ?
                        Number(value).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }) :
                        value}
                </Typography>
            </Box>

            <Box sx={{ color: 'white', display: 'flex', alignItems: iconAlign }}>
                {icon}
            </Box>

        </Card>
    }

    const summaryCard2 = (label, value, background, icon, labelColor, valueColor,
        border, shadow, width, marginLeft, iconColor, type) => {
        return <Card sx={{
            width: { xs: '100%', md: width },
            border: border,
            boxShadow: shadow,
            borderRadius: '12px', p: 1.5, px: 1, mb: 2,
            background: background, mx: 1,
        }}>
            <Typography sx={{
                color: labelColor, whiteSpace: { xs: 'wrap', lg: 'nowrap' },
                alignItems: 'center', justifyContent: 'left', mb: .5,
                display: 'flex', fontSize: { xs: 13, md: 13 }, fontWeight: 500
            }}>
                {label}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', pr: 1 }}>
                <Typography noWrap sx={{
                    justifyContent: 'left', fontSize: { xs: 11, md: 12 },
                    alignItems: 'center', lineHeight: '27px', color: valueColor,
                    display: 'flex', fontStyle: 'normal', fontWeight: 700
                }}>
                    {type === 'money' ?
                        value :
                        `${value.toLocaleString()}hours`}
                </Typography>
                <Box sx={{
                    color: iconColor, justifyContent: 'right',
                    display: 'flex', alignItems: 'center', width: { xs: '20px', sm: 'auto' }
                }}>
                    {icon}
                </Box>
            </Box>



        </Card>
    }

    const getTimeLeft = ({ timeBank, timeSpent }) => Number(timeBank) - Number(timeSpent)

    const barChartDataSet = barLabels.map(item => {
        return {
            label: '',
            data: Object.values(state.dashboardData)?.map(project =>
                item.value === 'timeLeftInMinutes' ?
                    getTimeLeft({ timeBank: project?.timeBankInMinutes, timeSpent: project?.timeSpentInMinutes }) :
                    project[item.value]),
            backgroundColor: barColors[item.value],
            borderWidth: 1,
            barPercentage: 0.5,
            categoryPercentage: 0.5
        }
    })

    const barChartData = { labels: barChartLabel, datasets: barChartDataSet }

    const handleCreateNewGroup = (event) => {
        /*   console.log('create new project group');
          updateState({ createProject: true }); */

        router.push('/admin/project-group/new-project/basic-data');
    };


    const formatTime = (timeInMinutes) => {
        console.log('formatTime', timeInMinutes);
        if (timeInMinutes === 0) {
            return `${timeInMinutes}minutes`;
        }
        const hours = Math.trunc(timeInMinutes / 60);
        const hourStr = hours ? hours > 1 ? `${Number(hours).toLocaleString()}hours` : `${Number(hours).toLocaleString()}hour` : '';
        const mins = timeInMinutes % 60;
        const minStr = mins ? mins > 1 ? `${Number(mins).toLocaleString()}minutes` : `${Number(mins).toLocaleString()}minute` : '';

        const time = `${hourStr} ${minStr}`
        console.log('used time is', timeInMinutes, time)

        return time;
    }

    const formatMoney = ({ amount, currency = 'NGN' }) => {
        return Number(amount).toLocaleString('en-NG', { style: 'currency', currency: currency })
    }

    const projGroupSummData = (project) => [
        {
            heading: 'Client Account', data: [
                {
                    label: 'Client Payment', key: 'payment', whiteBgColor: true,
                    icon: <Budget />, value: project?.totalClientPayment
                },
                {
                    label: 'Client Balance', key: 'balance', whiteBgColor: false,
                    icon: <JusticeSvg />, value: project?.totalBudget - project?.totalClientPayment
                },]
        },
        {
            heading: "Client's payment breakdown", data: [
                {
                    label: 'Project funds', key: 'funds', whiteBgColor: true,
                    icon: <FundSvg />, value: project?.totalClientPayment
                },
                {
                    label: 'Amount Saved', key: 'balance', whiteBgColor: false,
                    icon: <SavedSvg />, value: 0
                },]
        },
        {
            heading: "Project group fund expense", data: [
                {
                    label: 'Project funds', key: 'funds', whiteBgColor: true,
                    icon: <FundSvg />, value: project?.totalClientPayment
                },
                {
                    label: 'Project Expenses', key: 'expenses', whiteBgColor: false,
                    icon: <Receipt />, value: project?.amountSpent
                },
                (project?.totalClientPayment - project?.amountSpent < 0) ?
                    {
                        label: 'Funds Over run', key: 'overRun', whiteBgColor: true,
                        icon: <DebtorSvg />, value: project?.totalClientPayment - project?.amountSpent
                    } : {
                        label: 'Funds Left', key: 'left', whiteBgColor: true,
                        icon: <TimeBottleSvg />, value: project?.totalClientPayment - project?.amountSpent
                    },
            ]
        }
    ]

    const computeTotalTimeBank = useMemo(() => {
        let timeBank = 0;
        Object.values(state.dashboardData).forEach(workPhase => {
            timeBank += Number(workPhase?.timeBankInMinutes ?? 0);
        })

        return timeBank
    }, [state.dashboardData])

    const computeTotalTimeSpent = useMemo(() => {
        let timeSpent = 0;
        Object.values(state.dashboardData).forEach(workPhase => {
            timeSpent += Number(workPhase?.timeSpentInMinutes ?? 0);
        })

        return timeSpent
    }, [state.dashboardData])

    const computeTotalTimeLeft = useMemo(() => {
        return computeTotalTimeBank - computeTotalTimeSpent
    })

    const timeData = useMemo(() => {
        return { timeBank: formatTime(computeTotalTimeBank), timeSpent: formatTime(computeTotalTimeSpent), timeLeft: formatTime(computeTotalTimeLeft) }
    }, [state.dashboardData])


    const computeTotalBill = useMemo(() => {
        let totalBudget = 0;
        Object.values(state.dashboardData).forEach(workPhase => {
            totalBudget += Number(workPhase?.totalBudget ?? 0);
        })

        return totalBudget
    }, [state.dashboardData])

    const computeTotalPayment = useMemo(() => {
        let totalClientPayment = 0;
        Object.values(state.dashboardData).forEach(workPhase => {
            totalClientPayment += Number(workPhase?.totalClientPayment ?? 0);
        })

        return totalClientPayment
    }, [state.dashboardData])

    const computeTotalBalance = useMemo(() => {

        return computeTotalBill - computeTotalPayment;
    }, [state.dashboardData])

    const computeTotalSaving = useMemo(() => {
        return 0;
    }, [state.dashboardData])

    const clientMoneyData = useMemo(() => {
        return {
            totalBill: formatMoney({ amount: computeTotalBill }),
            totalSaving: formatMoney({ amount: computeTotalSaving }),
            totalPayment: formatMoney({ amount: computeTotalPayment }),
            totalBalance: formatMoney({ amount: computeTotalBalance })
        }
    }, [state.dashboardData])

    const computeProjectBudget = useMemo(() => {
        let totalBudget = 0;
        Object.values(state.dashboardData).forEach(workPhase => {
            totalBudget += Number(workPhase?.totalBudget ?? 0);
        })

        return totalBudget
    }, [state.dashboardData])

    const computeTotalExpense = useMemo(() => {
        let totalExpense = 0;
        Object.values(state.dashboardData).forEach(workPhase => {
            totalExpense += Number(workPhase?.amountSpent ?? 0);
        })

        return totalExpense
    }, [state.dashboardData])

    const computeFundLeft = useMemo(() => {
        const fundsLeft = computeTotalPayment - computeTotalExpense;
        return fundsLeft > 0 ? fundsLeft : 0
    }, [state.dashboardData])

    const computeTotalOverrun = useMemo(() => {
        return computeTotalPayment - computeTotalExpense;
    }, [state.dashboardData])

    const projectMoneyData = useMemo(() => {
        return {
            totalBudget: formatMoney({ amount: computeProjectBudget }),
            totalExpense: formatMoney({ amount: computeTotalSaving }),
            totalFundLeft: formatMoney({ amount: computeFundLeft }),
            totalOverrun: formatMoney({ amount: computeTotalOverrun })
        }
    }, [state.dashboardData])


    const gotoProjectGroup = (data) => {
        if (data?.id) {
            router.push(`/admin/project-group-detail/?projectId=${data?.id}&&projectName=${data?.name}&&projectColor=${encodeURIComponent(data?.color)}`)
        }
    }

    const getBoxTop = () => {
        if (state.ref?.current) {
            return state.ref.current.getBoundingClientRect().top;
        }
    }

    console.log('project group state', state);

    return (
        <Box sx={{ maxWidth: '100%', maxHeight: { xs: 'calc(100vh - 5vh)', md: 'calc(100vh - 78px)' }, overflowY: 'hidden' }}>
            {/* Tool bar section */}
            <Box sx={{
                px: 3, py: 1, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(28, 29, 34, 0.1)',
                bgcolor: '#F5F5F5'
            }}>
                <Typography sx={{
                    display: 'flex', alignItems: 'center',
                    pb: .5, fontWeight: 700, fontSize: { xs: 15, md: 17 },
                    color: 'black'
                }}>
                    PROJECT GROUP
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <IconButton sx={{ bgcolor: '#BF0606', width: 32, height: 32 }} onClick={handleCreateNewGroup}>
                    <AddIcon fontSize="small"
                        sx={{ fontSize: '20px', color: 'white' }} />
                </IconButton>
            </Box>

            {/* Body */}
            <Box ref={state.ref} sx={{
                maxHeight: `calc(100vh - ${getBoxTop()}px  - 32px)`, overflowY: 'scroll'
            }}>
                {/* {Boolean(Object.keys(state.dashboardData).length) ? */}
                    <Box sx={{ py: 2, px: { xs: 1, md: 2 }, borderRadius: '16px', /* maxHeight: '82vh', overflowY: 'auto' */ }}>
                        {/* All project group section */}
                        <Paper sx={{ mb: 2, bgcolor: '#FBFBFB', borderRadius: '16px' }}>
                            {/* heading */}
                            <Box sx={{
                                bgcolor: 'rgba(191, 6, 6, 0.1)',
                                borderRadius: '16px 16px 0 0', px: 2, py: 1.5
                            }}>
                                <Typography sx={{ fontWeight: 700, fontSize: { xs: 13, sm: 14 } }}>
                                    ALL PROJECT GROUP
                                </Typography>
                            </Box>

                            {/* Content */}
                            <Box sx={{ p: 2 }}>
                                {/* Project groups */}
                                {Boolean(Object.keys(state.dashboardData).length) && <Grid container sx={{ maxHeight: '200px', pb: 1, overflowY: 'auto' }}  >
                                    {Object.values(state.dashboardData)?.map((groupObj, index) =>
                                        <Grid item xs={12} md={6} lg={4} xl={3} sx={{ mt: 2, }}  >
                                            <Card sx={{
                                                width: { xs: '100%', md: '300px', xl: '300px' },
                                                borderBottom: '1px solid rgba(28, 29, 34, 0.1)',
                                                borderRadius: '16px',
                                            }}>
                                                {/* Heading */}
                                                <Typography noWrap sx={{
                                                    px: 1, py: 1, display: 'flex', alignItems: 'center',
                                                    fontSize: { xs: 12, md: 13 }, background: lighten(groupObj?.color, 0.9),
                                                    fontWeight: 500, textTransform: 'uppercase'
                                                }}>
                                                    <CircleIcon fontSize="small"
                                                        sx={{ mr: .5, fontSize: 16, color: groupObj?.color }} />
                                                    {groupObj?.projectName}
                                                    <Box sx={{ flexGrow: 1 }} />
                                                    <Button id={groupObj?._id} sx={{ p: 0 }}
                                                        onClick={() => { gotoProjectGroup({ id: groupObj?.id, name: groupObj?.projectName, color: groupObj?.color }) }}>
                                                        <Typography noWrap id={groupObj?.id}
                                                            sx={{ fontWeight: 600, fontSize: { xs: 11, sm: 11 } }}>
                                                            Go to project group
                                                        </Typography>
                                                        <NextArrow id={groupObj?.id} fontSize="small" sx={{ ml: -.5 }} />
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
                                                        <Typography noWrap sx={{ pr: 2, py: 1, fontSize: 13, display: 'flex', alignItems: 'center' }}>
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
                                                        <Typography noWrap sx={{ pl: 3, py: 1, color: '#333333', fontSize: 13, display: 'flex', alignItems: 'center' }}>
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
                                                        <Typography noWrap sx={{ pr: 2, py: 1, fontSize: 13, display: 'flex', alignItems: 'center' }}>
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

                                        </Grid>)}
                                </Grid>}

                            </Box>
                        </Paper>

                        {/* Total time tracker section */}
                        <Paper sx={{ mb: 2, bgcolor: '#FBFBFB', borderRadius: '16px' }}>
                            {/* heading */}
                            <Box sx={{
                                bgcolor: 'rgba(191, 6, 6, 0.1)',
                                borderRadius: '16px 16px 0 0', px: 2, py: 1.5
                            }}>
                                <Typography sx={{ fontWeight: 700, fontSize: { xs: 13, sm: 14 } }}>
                                    TOTAL TIME TRACKER FOR ALL PROJECT GROUPS
                                </Typography>
                            </Box>

                            {/* Content */}
                            <Box sx={{ borderRadius: '16px', pb: 2 }}>
                                {/* Summary cards */}
                                <Box sx={{ borderBottom: '1px solid grey', px: { xs: 1, md: 2 }, pt: 2 }}>
                                    {/* First row */}
                                    <Box sx={{
                                        display: 'flex', flexWrap: { xs: 'wrap', md: '' },
                                        justifyContent: { xs: 'center', md: 'flex-end' }
                                    }}>
                                        {Array.from({ length: 3 }).map((item, index) => {
                                            const data = summaryData[index]
                                            return summaryCard(data.label, timeData[data.valueKey],
                                                data.background, data.icon, data.labelColor, data.valueColor,
                                                data.border, data.shadow, data.width, 2, data.iconAlign, 'time', 2)
                                        })}
                                    </Box>
                                    {/* Second row */}
                                    <Box sx={{
                                        display: 'flex', flexWrap: { xs: 'wrap', md: '' },
                                        justifyContent: { xs: 'center', md: 'flex-end' }
                                    }}>
                                        {Array.from({ length: 3 }).map((item, index) => {
                                            const data = summaryData[index + 3]
                                            return summaryCard(data.label, timeData[data.valueKey],
                                                data.background, data.icon, data.labelColor, data.valueColor,
                                                data.border, data.shadow, data.width, 2, data.iconAlign, 'time', 2)
                                        })}
                                    </Box>
                                </Box>

                                {/* Bar chart color descriptions */}
                                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, p: 2 }}>
                                    {barLabels.map(bar =>
                                        <Box sx={{
                                            borderRadius: '10px', alignItems: 'center',
                                            py: .5, px: 1, ml: { xs: 1, md: 2 },
                                            justifyContent: { xs: 'center', md: 'flex-end' },
                                            display: 'flex', border: `1px solid ${barColors[bar.value]}`,
                                            bgcolor: lighten(barColors[bar.value], 0.9)
                                        }}>
                                            <CircleIcon sx={{
                                                display: 'flex', alignItems: 'center',
                                                fontSize: '16px', mr: .5, color: barColors[bar.value]
                                            }} />
                                            <Typography sx={{
                                                fontWeight: 600, display: 'flex', alignItems: 'center',
                                                fontSize: { xs: 10, md: 11 },
                                                color: barColors[bar.value],
                                            }}>
                                                {bar.label}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>


                                {/* Bar chart */}
                                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'right' }, p: 1 }}>
                                    <Bar data={barChartData} options={barChartOptions} />
                                </Box>

                            </Box>
                        </Paper>

                        {/* Total budget and expense for all project group */}
                        <Paper sx={{ bgcolor: '#FBFBFB', borderBottom: '1px solid grey', borderRadius: '16px' }}>
                            {/* heading */}
                            <Box sx={{
                                bgcolor: 'rgba(191, 6, 6, 0.1)',
                                borderRadius: '16px 16px 0 0', px: 2, py: 1.5
                            }}>
                                <Typography sx={{ fontWeight: 700, fontSize: { xs: 13, sm: 14 } }}>
                                    TOTAL BUDGET AND EXPENSE FOR ALL PROJECT GROUP
                                </Typography>
                            </Box>

                            {/* Client(budget,payment,savings,balance)  heading*/}
                            <Box sx={{
                                bgcolor: 'rgba(28, 29, 34, 0.08)', px: 2, py: .5,
                                display: 'flex', justifyContent: 'center', whiteSpace: 'wrap',
                                flexWrap: 'wrap',
                                width: { xs: '100%', md: '80%' }, mx: 'auto', my: 2
                            }}>
                                <Typography sx={{
                                    display: 'flex',
                                    color: '#BF0606', mr: .5, whiteSpace: 'wrap',
                                    fontWeight: 700, fontSize: { xs: 12, sm: 13 }
                                }}>
                                    CLIENTS
                                </Typography>
                                <Typography sx={{
                                    display: 'flex',
                                    color: '#656565', whiteSpace: 'wrap',
                                    fontWeight: 600, fontSize: { xs: 12, sm: 13 }
                                }}>
                                    (BUDGET,PAYMENT,SAVINGS,BALANCE)
                                </Typography>
                            </Box>

                            {/* Content of Client(budget,payment,savings,balance) */}
                            <Box sx={{ display: 'flex', flexWrap: { xs: 'wrap', md: '' }, justifyContent: 'center' }}>
                                {Array.from({ length: 4 }).map((item, index) => {
                                    const data = summaryData2[index]
                                    return summaryCard2(data.label, clientMoneyData[data.valueKey],
                                        data.background, data.icon, data.labelColor, data.valueColor,
                                        data.border, data.shadow, data.width, 2, data.iconColor, 'money')
                                })}
                            </Box>

                            {/* Client(budget,payment,savings,balance)  heading*/}
                            <Box sx={{
                                bgcolor: 'rgba(28, 29, 34, 0.08)', px: 2, py: .5,
                                display: 'flex', justifyContent: 'center',
                                flexWrap: { xs: 'wrap', md: '' },
                                width: { xs: '100%', md: '65%' }, mx: 'auto', my: 2
                            }}>
                                <Typography sx={{
                                    color: '#BF0606', mr: .5,
                                    fontWeight: 700, fontSize: { xs: 12, sm: 13 }
                                }}>
                                    PROJECT GROUP
                                </Typography>
                                <Typography sx={{
                                    color: '#656565',
                                    fontWeight: 600, fontSize: { xs: 12, sm: 13 }
                                }}>
                                    (FUNDS,EXPENSE,FUNDS LEFT, & OVERRUN)
                                </Typography>
                            </Box>

                            {/* Content of Client(budget,payment,savings,balance) */}
                            <Box sx={{ display: 'flex', flexWrap: { xs: 'wrap', md: '' }, justifyContent: 'center' }}>
                                {Array.from({ length: 4 }).map((item, index) => {
                                    const data = summaryData3[index]
                                    return summaryCard2(data.label, projectMoneyData[data.valueKey],
                                        data.background, data.icon, data.labelColor, data.valueColor,
                                        data.border, data.shadow, data.width, 2, data.iconColor, 'money')
                                })}
                            </Box>

                            <Divider />

                            <Grid container sx={{ py: 2, px: { xs: 1, md: 2 } }} justifyContent='left' spacing={2} >
                                {Object.values(state.dashboardData).map(project =>
                                    <Grid item xs={12} md={4} xl={3} sx={{
                                        mb: 1
                                    }} >
                                        {/* Heading */}
                                        <Paper sx={{
                                            p: 2, display: 'flex', borderRadius: '16px 16px 0 0',
                                            bgcolor: lighten(project.color, 0.9),
                                            alignItems: 'center'
                                        }}>
                                            <CircleIcon sx={{ mr: 2, color: project.color }} />
                                            <Typography sx={{
                                                fontWeight: 700,
                                                fontSize: { xs: 12, lg: 14 }, color: project.color,
                                                textTransform: 'uppercase'
                                            }}>
                                                {project.projectName}
                                            </Typography>
                                        </Paper>

                                        {/* Project budget */}
                                        <Box sx={{ bgcolor: 'white', px: 2, pt: 1.5, pb: .5 }}>
                                            {summaryCard('Project Budget', project.totalBudget,
                                                `linear-gradient(90deg, ${lighten(project.color, 0.4)} \
                                        0%, ${project.color} 81.8%)`,
                                                <TimerSvg style={{ color: 'white', height: '36px', width: 'auto' }} />, 'white', 'white', '',
                                                '0px 8px 12px rgba(0, 0, 0, 0.04)', '100%', 0, 'center', 'money', 4)}
                                        </Box>

                                        {/*Others*/}
                                        {projGroupSummData(project).map(item =>
                                            <Grid justifyContent='space-around' container
                                                sx={{
                                                    borderRadius: '16px 16px 16px 16px',
                                                    boxShadow: '0px 6px 12px rgba(79, 79, 79, 0.08)'
                                                }}>
                                                <Grid item xs={12} sx={{
                                                    px: 2.5, py: .5,
                                                    bgcolor: 'rgba(28, 29, 34, 0.04)'
                                                }}>
                                                    <Typography sx={{
                                                        fontSize: { xs: 12, lg: 13 },
                                                        color: '#8D8D8D'
                                                    }}>
                                                        {item.heading}
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs container
                                                    sx={{
                                                        justifyContent: { xs: 'space-around', md: 'center' },
                                                        px: { xs: .5, lg: 1.5 }, pt: 1.5, bgcolor: 'white'
                                                    }} >
                                                    {item.data.map((content, index) =>
                                                        <Grid item xs={'auto'} lg={6} sx={{ pr: 2 }}>
                                                            {summaryCard2(content.label, formatMoney({ amount: content?.value }),
                                                                (content.whiteBgColor) ? 'white' : lighten(project.color, 0.9),
                                                                content.icon, 'black', project.color,
                                                                (content.whiteBgColor) ? '1px solid rgba(28, 29, 34, 0.1)'
                                                                    : `1px solid ${project.color}`,
                                                                '0px 8px 12px rgba(0, 0, 0, 0.04)', '100%', 0,
                                                                project.color, 'money', 0)}
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </Grid>
                                        )}



                                    </Grid>
                                )}


                            </Grid>


                        </Paper>

                    </Box >
                    {/* : <Typography align='center' sx={{ mt: 4, fontWeight: 700, fontSize: 18 }}>
                        No project group. Feel free to create one
                    </Typography>} */}
            </Box>



        </Box >)
}
