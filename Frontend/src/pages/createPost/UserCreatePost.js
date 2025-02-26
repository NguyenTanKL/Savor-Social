import React from "react";
import { useState } from "react";
import { Button, IconButton } from "@mui/material";
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from "@mui/material/TextField";
import HeaderProfile from "../../components/HeaderProfile";
import "./UserCreatePost.css";

function UserCreatePost() {
    const userData =
        {
            name: 'Nguyen Nhat Dang',
            account_name: '_dangnguyen',
            job: 'Food review',
            followers: '3.6K',
            following: '200',
            posts: '9',
            socialLinks: [
                { platform: 'Facebook', url: 'https://facebook.com/username' },
                { platform: 'Twitter', url: 'https://twitter.com/username' },
                { platform: 'LinkedIn', url: 'https://linkedin.com/in/username' }
            ],
            type: 'personal'
        };
    const [selectedImage, setSelectedImage] = useState(null);

    return(
        <div>
            <HeaderProfile user={userData}/>
            <h2 style={{textAlign: "center"}}>Create new post</h2>
            <div className="postVoucher" style={{ textAlign: "left", borderRadius: "25px", padding: "20px", margin: "0 20px 20px 20px", backgroundColor: "#EEEEEE"}}>
                <br></br>
                <div style={{marginRight: "100px", width: "75%", bottom: "0", borderRadius: "25px", height: "100%", textAlign: "center"}}>
                    <h3>Upload Image</h3>
                    {selectedImage && (
                        <div>
                            <img
                                alt="not found"
                                multiple
                                width={"500px"}
                                height={"250px"}
                                src={URL.createObjectURL(selectedImage)}
                            />
                            <br /> <br />
                            <Button onClick={() => setSelectedImage(null)} variant="contained" color="error" startIcon={<DeleteIcon />}>Remove</Button>
                        </div>
                    )}
                    <br />
                    <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                    >
                        Upload image
                        <VisuallyHiddenInput
                            type="file"
                            onChange={(event) => {
                                console.log(event.target.files);
                                setSelectedImage(event.target.files[0]);
                            }}
                            multiple
                        />
                    </Button>
                </div>
                <div style={{height: "100%"}}>
                    <form>
                        <TextField style={{width: "300px", marginBottom: "20px"}}  required id="outlined-multiline-required" label="Content" multiline maxRows={10}/>
                        <br></br>
                        <TextField style={{width: "300px", marginBottom: "20px"}}  required id="outlined-required" label="Location" min/>
                        <br></br>
                        <TextField style={{width: "300px", marginBottom: "20px"}} id="outlined-basic" label="Collaborators" variant="outlined"/>
                        <br></br>
                        <Button type="submit" variant="contained" style={{textAlign: "right"}}>Post</Button>
                    </form>
                </div>
            </div>
        </div>

    )
}

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export default UserCreatePost