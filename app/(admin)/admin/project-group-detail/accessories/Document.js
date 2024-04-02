'use client'

import { Box, IconButton, Slide, Tab, Tabs, Typography } from "@mui/material";

import moment from "moment";

import { useEffect, useMemo, useState } from "react";

import Close from '@mui/icons-material/Close';

import { useDispatch, } from "react-redux";

import IconElement from "@/Components/IconElement";
import { getAllFilesForChat } from "../helper";

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

export function Documents({ closeView, projectId, phaseName, goalName }) {
    console.log('all files shared in the group chat', projectId, phaseName, goalName);
    const dispatch = useDispatch();

    //const savedFormData = useSelector(state => state.newProjectGroup.projectData);

    const [chatfiles, setFiles] = useState({})

    const [state, setState] = useState({
        openModal: false, currentTab: 0, files: [], chatfiles: []
    });


    const updateState = (newValue) => {
        setState((previousValue) => {
            return { ...previousValue, ...newValue };
        });
    }

    useEffect(() => {
        getAllFilesForChat({
            projectId: projectId, goalName: goalName, phaseName: phaseName,
            dataProcessor: (result) => {
                console.log('goal chat files', result);
                if (result) {
                    const fileArray = []

                    result.forEach(resultData =>
                        resultData.fileDataArray.forEach(fileData => {
                            fileArray.push({
                                _id: resultData._id, dateTime: resultData.dateTime,
                                name: fileData.fileName, extension: fileData.fileExtension
                            })

                        }))

                    updateState({
                        files: fileArray
                    });
                }
            }
        })
    }, [])

    useEffect(() => {
        if (state.files?.length) state.files.forEach(async (item) => {
            console.log('gallery item', item);
            getFilePath(item.name)
        })

    }, [state.files])

    const getFilePath = async (filename) => {
        !chatfiles[filename] && fetch(`/api/get-file-by-name/?folder=group-chat-files&&filename=${filename}`,
            { method: 'GET' }).then(resp => {
                resp.blob().then(blob => {
                    console.log('setting image', filename)
                    setFiles((prevFiles) => ({ ...prevFiles, [filename]: URL.createObjectURL(blob), }))
                })
            })

    }

    const groupByDate = useMemo(() => {
        const formattedObject = {}

        state.files.forEach(itemObject => {
            const date = moment(itemObject.dateTime, 'yyyy-MM-DD h:mma').format('DD/MM/yyyy').toString()
            formattedObject[date] = [...formattedObject[date] ?? [], itemObject]
        })

        return formattedObject;
    }, [state.files])

    console.log('document state', chatfiles, state);


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
                            <a href={chatfiles[dataObject.name] || '/images/loading.png'} download={dataObject.name}>
                                <IconButton sx={{ color: '#5D5D5D', my: 1, p: 0, }}>
                                    <IconElement {...{ src: DownloadSvg }} />
                                </IconButton>
                            </a>

                            {/* File image */}
                            <Box>
                                {imageExtensions.includes(dataObject.extension) ?
                                    <img src={chatfiles[dataObject.name] || '/images/loading.png'} alt='image'
                                        style={{ width: '70px', height: '70px' }} />
                                    : fileExtIcons[dataObject.extension]}
                            </Box>
                        </Box>
                    })}
                </Box>
            </Box>
        })}
    </Box>
}