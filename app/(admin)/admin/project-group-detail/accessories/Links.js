'use client'

import { Box, IconButton, Slide, Tab, Tabs, Typography } from "@mui/material";

import moment from "moment";

import { useEffect, useMemo, useState } from "react";

import Close from '@mui/icons-material/Close';

import { useDispatch, } from "react-redux";

import IconElement from "@/Components/IconElement";
import { getAllFilesForChat, getAllLinksForChat } from "../helper";

const CsvSvg = '/icons/CsvSvg.svg'
const ExcelSvg = '/icons/ExcelSvg.svg'
const PdfSvg = '/icons/pdfSvg.svg'
const TxtSvg = '/icons/TxtSvg.svg'
const DownloadSvg = '/icons/DownloadSvg.svg'

const extStyling = { width: '70px', height: '70px' }

const icon = (icon) => <IconElement {...{ src: icon, style: extStyling }} />

const fileExtIcons = {
    'pdf': icon(PdfSvg),
    'txt': icon(TxtSvg),
    'csv': icon(CsvSvg),
    'xlsx': icon(ExcelSvg)
}

const imageExtensions = ['png', 'jpg', 'jpeg'];

export function Links({ closeView, projectId, phaseName, goalName }) {
    console.log('all files shared in the group chat', projectId, phaseName, goalName);
    const dispatch = useDispatch();

    //const savedFormData = useSelector(state => state.newProjectGroup.projectData);

    const [chatfiles, setFiles] = useState({})

    const [state, setState] = useState({
        openModal: false, currentTab: 0, links: []
    });


    const updateState = (newValue) => {
        setState((previousValue) => {
            return { ...previousValue, ...newValue };
        });
    }

    useEffect(() => {
        getAllLinksForChat({
            projectId: projectId, goalName: goalName, phaseName: phaseName,
            dataProcessor: (result) => {
                console.log('goal chat links', result);
                if (result) {

                    const linkArr = []

                    result.forEach(resultData =>
                        resultData.linkArray.forEach(link => {
                            link = link.startsWith('www.') ? `https://${link}` : link
                            linkArr.push({
                                _id: resultData._id, dateTime: resultData.dateTime,
                                link: link,
                            })
                        }))

                    updateState({
                        links: linkArr
                    });
                }
            }
        })
    }, [])

    const openModal = () => {
        updateState({ openModal: true });
    }


    const closeModal = () => {
        updateState({ openModal: false });
        closeView();
    }

    const switchTab = (event, index) => {
        updateState({ currentTab: index })
    }

    const groupByDate = useMemo(() => {
        const formattedObject = {}

        state.links.forEach(itemObject => {
            const date = moment(itemObject.dateTime, 'yyyy-MM-DD h:mma').format('DD/MM/yyyy').toString()
            formattedObject[date] = [...formattedObject[date] ?? [], itemObject]
        })

        return formattedObject;
    }, [state.links])

    console.log('link state', state);

    return <Box sx={{}}>
        {Object.entries(groupByDate).map(([date, dataArray], index) => {
            return <Box key={index}>
                {/* Date*/}
                <Typography sx={{ width: '100%', bgcolor: '#1C1D220F', fontWeight: 600, fontSize: 14, px: 3, py: 1 }}>
                    {date}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', px: 2, py: 1 }}>
                    {dataArray.map((dataObject, index) => {
                        return <Box align='center' key={index} sx={{ mb: 2, px: 2 }}>
                            {/* download button */}
                            <a href={dataObject?.link} target="_blank">
                                <Typography>
                                    {dataObject?.link}
                                </Typography>
                            </a>
                        </Box>
                    })}
                </Box>
            </Box>
        })}
    </Box>
}