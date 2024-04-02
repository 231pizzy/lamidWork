// 'use client'
// import { Box, Button, Modal, Typography, Slide, TextField } from "@mui/material";
// import Close from '@mui/icons-material/Close';

// export default function CreateTeamModal() {


//     return (
//         <Modal>
//         <Slide direction="left" in={true} mountOnEnter unmountOnExit>
//             <Box sx={{
//                 height: '100%', bgcolor: 'white', overflowY: 'hidden', pb: 4,
//                 position: 'absolute', top: '0%', right: '0%', width: { xs: '90%', sm: '70%', md: '60%', lg: '45%', xl: '42%' },
//             }}>
//                 {/* Heading */}
//                 <Box sx={{
//                     display: 'flex', boxShadow: '0px 6px 12px rgba(79, 79, 79, 0.08)', alignItems: 'center',
//                     py: 2, px: { xs: 1.5, sm: 4 }, mb: 3,
//                     borderBottom: '1px solid rgba(28, 29, 34, 0.1)', bgcolor: 'white',
//                 }}>
//                     {/* Close form */}
//                     <Close 
//                         sx={{ cursor: 'pointer', color: '#8D8D8D', fontSize: 32, mr: 4 }} />

//                     {/* Heading label */}
//                     <Typography sx={{ fontWeight: 700, fontSize: { xs: 13, sm: 17, md: 18 } }}>
//                         ADD NEW DOCUMENT
//                     </Typography>

//                     <Box sx={{ flexGrow: 1 }} />
//                     <Button variant="contained" sx={{ py: .5, px: 2 }}>
//                         Save
//                     </Button>
//                 </Box>

//                 {/* Body */}
//             </Box>
//         </Slide>
//     </Modal>
//     );
// }


import { Box, Button, Modal, Typography, Slide, TextField } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

export default function CreateTeamModal({ open, handleCancel }) {
    return (
        <Modal open={open}>
            <Slide direction="left" in={open} mountOnEnter unmountOnExit>
                <Box sx={{
                    height: '100%', bgcolor: 'white', overflowY: 'hidden', pb: 4,
                    position: 'absolute', top: '0%', right: '0%', width: { xs: '90%', sm: '70%', md: '60%', lg: '45%', xl: '42%' },
                }}>
                    {/* Heading */}
                    <Box sx={{
                        display: 'flex', boxShadow: '0px 6px 12px rgba(79, 79, 79, 0.08)', alignItems: 'center',
                        py: 2, px: { xs: 1.5, sm: 4 }, mb: 3,
                        borderBottom: '1px solid rgba(28, 29, 34, 0.1)', bgcolor: 'white',
                    }}>
                        {/* Close form */}
                        <CloseIcon onClick={handleCancel} sx={{ cursor: 'pointer', color: '#8D8D8D', fontSize: 32, mr: 4 }} />

                        {/* Heading label */}
                        <Typography sx={{ fontWeight: 700, fontSize: { xs: 13, sm: 17, md: 18 } }}>
                            CREATE NEW TEAM
                        </Typography>

                        <Box sx={{ flexGrow: 1 }} />
                        <Button variant="contained" sx={{ py: .5, px: 2 }} style={{ backgroundColor: '#BF0606', color: 'white' }}>
                            CREATE
                        </Button>
                    </Box>

                    {/* Body */}
                </Box>
            </Slide>
        </Modal>
    );
}
