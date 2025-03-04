import Stack from '@mui/joy/Stack';
import {Avatar} from "@mui/material";
import Typography from '@mui/joy/Typography';
function Comment({createAt, username, profilePic, text}) {
    return(
        <Stack sx={{gap:4}}>
            <Avatar alt={username} src={profilePic} />
            <Stack direction={"column"}> 
                <Stack sx={{gap:2}}>
                    <Typography >
                        {username}
                    </Typography>
                    <Typography>
                        {text}
                    </Typography>
                </Stack>
                <Typography>
                    {createAt}
                </Typography>
            </Stack>
        </Stack>
    )
}
export default Comment