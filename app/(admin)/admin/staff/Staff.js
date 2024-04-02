'use client'

import { Box, Typography, Modal, IconButton, Button } from "@mui/material";

import AddIcon from "@mui/icons-material/AddOutlined";
import SearchIcon from "@mui/icons-material/SearchOutlined";

import DeleteIcon from "@mui/icons-material/DeleteOutline";

import { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";

import { openSnackbar, setDashboardView, setPageTitle } from "@/Components/redux/routeSlice";

import AddStaff from "./accessories/AddStaff";

import Prompt from "@/Components/Prompt";

import { ProfileAvatar } from "@/Components/ProfileAvatar";

import { SearchBox } from "@/Components/SearchBox";
import { deleteStaff, getStaff, searchForStaff } from "./helper";
import { getBoxTop } from "@/Components/getBoxTop";
import { useRouter } from "next/navigation";
import { postRequestHandler } from "@/Components/requestHandler";

export default function Staff() {
    const ref = useRef(null);
    const dispatch = useDispatch();
    const router = useRouter()

    const [state, setState] = useState({
        currentTab: '', showAddStaffForm: false, staffAdded: 0, staffRecords: [], ref: ref,
        email: '', showPrompt: false, deleteStaff: null, showSearchBox: false, searchAnchor: useRef(null)
    });

    const updateState = (newValue) => {
        console.log('chnaging state', newValue)
        setState((previousValue) => {
            return { ...previousValue, ...newValue };
        });
    }

    useEffect(() => {
        /* Set Page title */
        dispatch(setPageTitle({ pageTitle: 'Staff' }));
        updateState({ ref: ref })
    }, [])

    useEffect(() => {
        getStaff({
            email: null, list: true, dataProcessor: (result) => {
                updateState({ email: result?.email, staffRecords: [...result.data] })
            }
        })
    }, [state.staffAdded])


    const handleViewProfile = (email) => {
        console.log('email', email)
        router.push(`/admin/staff-profile/?email=${email}`, /* { state: { email: email, self: false } } */);
    }

    const buildStaff = (label, data) => {
        return <Typography noWrap={(label === 'Work-Group') ? true : false}
            sx={{
                width: {}, mb: 2, color: '#8D8D8D',
                fontWeight: 600, fontSize: { xs: 12, md: 13 },
            }}>
            {label}:
            <Typography sx={{
                width: '100%',
                ml: .3, wordBreak: 'break-word',
                display: 'inline', color: '#333333', textTransform: label === 'Email' ? 'lowercase' : 'capitalize',
                fontWeight: 600, fontSize: { xs: 12, md: 13 },
            }}>
                {data}
            </Typography>
        </Typography>
    }

    const showSearchBox = () => {
        updateState({ showSearchBox: true })
    }

    const removeSearchBox = () => {
        updateState({ showSearchBox: false })
    }

    const openAddStaffForm = () => {
        updateState({ showAddStaffForm: true });
    }

    const closeAddStaffForm = ({ staffAdded }) => {
        updateState({ showAddStaffForm: false, staffAdded: staffAdded ? state.staffAdded + 1 : state.staffAdded });
    }

    const confirmDeleteStaff = (email, fullName) => {
        updateState({ deleteStaff: { email: email, fullName: fullName } });
    }

    const closePrompt = () => {
        updateState({ deleteStaff: null })
    }

    const findStaff = (value, callback) => {
        searchForStaff({
            name: value, dataProcessor: (result) => {
                callback(result)
            }
        })
        /*   searchForStaff(value, updateState, remoteRequest,
              dispatch, openSnackbar, navigate, callback) */
    }

    /* const startTestAuth = () => {
        postRequestHandler({
            route: '/api/start-test-auth',
            body: { data: 'dadasa' },
            successCallback: (result) => {
                console.log('result', result)
            },
            errorCallback: (err) => {
                console.log('err', err)
            }
        })
    } */

    const removeStaff = () => {
        const email = state.deleteStaff.email;

        deleteStaff({
            email: email, dataProcessor: (result) => {
                { updateState({ staffRecords: staffRecords.filter(record => record.email !== email), deleteStaff: null }) };
                dispatch(openSnackbar({ message: '1 user has been deleted', severity: 'success' }))
            }
        })
    }

    const handleMenuClick = (email) => {
        //Find the staff
        handleViewProfile(email);
        removeSearchBox()
    }

    const staffRecords = useMemo(() => { return state.staffRecords }, [state.staffRecords])
    const adminData = useMemo(() => { return state.staffRecords.find(staff => staff.email === state.email) }, [state.staffRecords])


    return (
        <Box sx={{ maxWidth: '100%', maxHeight: { xs: 'calc(100vh - 5vh)', md: 'calc(100vh - 78px)' }, overflowY: 'hidden' }}>
            {/* Toolbar */}
            <Box sx={{
                bgcolor: '#F5F5F5', borderBottom: '1px solid rgba(28, 29, 34, 0.1)',
                display: 'flex', px: 2, py: 1, alignItems: 'center', pr: 3
            }}>
                <Typography noWrap sx={{ fontWeight: 700, fontSize: { xs: 14, sm: 17 } }}>
                    Staff({staffRecords?.length})
                </Typography>
                <Box sx={{ flexGrow: 1 }} />

                {/*  <Button variant="contained" onClick={startTestAuth} sx={{ mr: 3 }}>
                    Start Auth
                </Button> */}

                {state.showSearchBox ?
                    <SearchBox searchAnchor={state.searchAnchor}
                        placeholder='Search Staff' findValue={findStaff} itemKey='fullName'
                        menuClick={handleMenuClick} valueKey='email' />
                    : <SearchIcon fontSize="small" onClick={showSearchBox}
                        sx={{ mr: 4, height: 24, width: 24, color: '#8D8D8D' }} />
                }

                <IconButton onClick={openAddStaffForm} sx={{
                    height: 30, width: 30, bgcolor: '#BF0606'
                }}>
                    <AddIcon sx={{ color: 'white', fontSize: 18 }} />
                </IconButton>
            </Box>

            {/* Body */}
            <Box ref={state.ref} sx={{
                bgcolor: '#FBFBFB', px: 2, py: 2, height: `calc(100vh - ${getBoxTop(state.ref)}px - 32px)`, overflowY: 'scroll'
            }}>
                {/* Admin data */}
                <Box sx={{
                    display: 'flex', flexWrap: 'wrap', maxWidth: 'max-content', cursor: 'pointer',
                    bgcolor: 'white', border: '2px solid rgba(28, 29, 34, 0.1)', px: 2, py: 2, mb: 3, borderRadius: '16px'
                }} onClick={() => { handleViewProfile(adminData?.email) }}>
                    {/* Profile picture */}
                    <ProfileAvatar src={adminData?.profilePicture} fullName={adminData?.fullName} diameter='100px' />

                    {/* Admin name and email */}
                    <Box sx={{ mx: 2, my: 'auto' }}>
                        {/* Full name */}
                        <Typography
                            sx={{
                                fontSize: { xs: 15, md: 17 }, textTransform: 'capitalize',
                                fontWeight: 700, mb: 2, color: 'black'
                            }}>
                            {adminData?.fullName}
                        </Typography>
                        {/* email */}
                        <Typography
                            sx={{ fontSize: { xs: 13, md: 15 }, color: '#8D8D8D', fontWeight: 500 }}>
                            {adminData?.email}
                        </Typography>
                    </Box>

                    {/* Admin role   */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', }}>
                        <Typography
                            sx={{
                                width: 'max-content', ml: 3, fontWeight: 600,
                                borderRadius: '44px', fontSize: { xs: 12, md: 14 },
                                mb: 3, py: 1, px: 2, bgcolor: 'rgba(191, 6, 6, 0.1)',
                                display: 'flex', justifyContent: 'center', color: '#BF0606'
                            }}>
                            Admin
                        </Typography>
                    </Box>
                </Box>

                {/* Staff section */}
                <Box sx={{ display: 'flex', alignItems: 'stretch', flexWrap: 'wrap' }}>
                    {staffRecords?.map(staff =>
                        staff?.email !== state.email && <Box onClick={() => { handleViewProfile(staff?.email) }}
                            sx={{
                                mb: 3, mr: { sm: 3 }, width: { xs: '100%', sm: 'auto' }, cursor: 'pointer',
                                p: 2, width: { xs: '100%', sm: '200px', md: '210px', lg: '260px', xl: '230px' },
                                bgcolor: 'white', border: '2px solid rgba(28, 29, 34, 0.1)', borderRadius: '16px'
                            }}>

                            {/* Profile picture and delete button*/}
                            <Box sx={{ px: 3, mb: 2, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                                {/* Profile picture */}
                                <ProfileAvatar src={staff?.profilePicture} fullName={staff?.fullName} diameter='80px' />

                                {/* Delete button */}
                                <DeleteIcon sx={{ position: 'absolute', right: 0, mr: 2, mt: 1 }}
                                    onClick={(event) => {
                                        event.stopPropagation(); confirmDeleteStaff(staff?.email, staff?.fullName)
                                    }} />
                            </Box>

                            {/* Full name */}
                            <Typography
                                sx={{
                                    fontWeight: 600, textTransform: 'capitalize',
                                    fontSize: { xs: 14, md: 16 }, pb: 2,
                                    display: 'flex', justifyContent: 'center',
                                }}>
                                {staff?.fullName}
                            </Typography>

                            {/* Body */}
                            <Box sx={{
                                display: 'block',
                                width: { xs: '100%', },
                            }}>
                                {buildStaff('Team', staff?.team)}
                                {buildStaff('Work-Group', staff?.workGroups?.join(','))}
                                {buildStaff('Email', staff?.email)}
                            </Box>
                        </Box>)}
                </Box>
            </Box>

            <Modal open={state.showAddStaffForm} onClose={closeAddStaffForm}>
                <AddStaff closeForm={closeAddStaffForm} />
            </Modal>

            {state.deleteStaff && <Prompt open={state.deleteStaff}
                message={<Typography sx={{ textTransform: 'none', fontWeight: 600 }}>
                    You are about to remove <Typography component='span' sx={{ color: '#BF0606' }}>{state.deleteStaff.fullName}</Typography> from your staff group
                </Typography>} proceedTooltip='Alright, delete' cancelTooltip='No, do not delete' onCancel={closePrompt}
                onProceed={removeStaff} onClose={closePrompt} />}
        </Box >)
}
