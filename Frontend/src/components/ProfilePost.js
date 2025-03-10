import { Grid2 } from "@mui/material";
import { useState } from "react";
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Stack from '@mui/joy/Stack';
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import {Avatar} from "@mui/material";
import Typography from '@mui/joy/Typography';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Divider from '@mui/material/Divider';
import Comment from "./Comment";
function ProfilePost({item}) {
    const [open, setOpen] = useState(false);
    return(
    <>
        <Grid2 item key={item.id} style={{ width: "307.66px", height: "307.66px" }}>
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            cursor:"pointer"
          }}
          onClick={() => setOpen(true)}
        />
        </Grid2>
        <Modal
            open={open}
            onClose={(_event) => {
              setOpen(false);
            }}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          
            <Sheet variant="outlined" sx={{ width:"65%",height:"80%", borderRadius: 'md' }}>
            <Stack direction="row">
              <Box sx={{width: "55%", height: "100%", overflow:"hidden", flex:3 }}>
                  <img 
                  src={item.thumbnailUrl}
                  style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}/>
              </Box>
              <Stack direction={"column"} sx={{flex:2}} >
                <Stack direction={"row"}  sx={{alignItems:"center", justifyContent:"space-between", gap:1 }}>
                    <Stack direction={"row"} sx={{alignItems:"center"}}>
                      <Avatar>R</Avatar>
                      <Typography>Rin211</Typography>
                    </Stack>
                    <Box>
                      <MoreHorizIcon sx={{cursor:"pointer",  ml: "auto" }}/>
                    </Box>
                </Stack>
                <Divider sx={{ width: "100%", my: 1 }} />
                <Stack sx={{width:"100%", alignItems:"center", maxHeight:"350px",overflowY:"auto"}}>
                    <Comment 
                    createAt='1d ago'
                    username='Huy'
                    profilePic='.\src\image'
                    text="Dummy"
                    />
                </Stack>
              </Stack>
            

            </Stack>
           
            <ModalClose 
        variant="outlined" 
        onClick={() => setOpen(false)}/>

        </Sheet>
</Modal>
    </>
    )

}
export default ProfilePost