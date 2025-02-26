import React from "react";
import "./RestaurantCreatePost.css";
import { useState } from "react";
import { Button } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TextField from "@mui/material/TextField";
import HeaderProfile from "../../components/HeaderProfile";

function RestaurantCreatePost() {
    const userData =
        {
            name: 'Haidilao.vn',
            account_name: 'Haidilaovn',
            job: 'Nhà hàng lấu HAIDILAO VIETNAM',
            followers: '13.6K',
            following: '27',
            posts: '9',
            socialLinks: [
                { platform: 'Facebook', url: 'https://facebook.com/username' },
                { platform: 'Twitter', url: 'https://twitter.com/username' },
                { platform: 'LinkedIn', url: 'https://linkedin.com/in/username' }
            ],
            type: 'restaurant'
        };
    const [selectedImage, setSelectedImage] = useState(null);

    return(
        <div>
            <HeaderProfile user={userData}/>
            <h2 style={{textAlign: "center"}}>Create new advertisement post</h2>
            <div className="postVoucher" style={{ textAlign: "left", borderRadius: "25px", padding: "20px", margin: "0 20px 8px 20px", backgroundColor: "#EEEEEE"}}>
                <br></br>
                <div style={{marginRight: "100px", width: "75%", bottom: "0", height: "100%", textAlign: "center"}}>
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
                        <TextField style={{width: "300px", marginBottom: "15px"}}  required id="outlined-required" label="Target audience" />
                        <br></br>
                        <TextField style={{width: "300px", marginBottom: "15px"}}  required id="outlined-required" label="Number of advertisements" type="number" slotProps={{input: {min: 0}}} />
                        <br></br>
                        <TextField style={{width: "300px", marginBottom: "15px"}}  required id="outlined-required" label="Release day" type="date" InputLabelProps={{shrink: true}}/>
                        <br></br>
                        <TextField style={{width: "300px", marginBottom: "15px"}}  required id="outlined-required" label="Expiration day" type="date" InputLabelProps={{shrink: true}}/>
                        <br></br>
                        <TextField style={{width: "300px", marginBottom: "15px"}}  required id="outlined-multiline-required" label="Content" multiline maxRows={10} />
                        <br></br>
                        <Button type="submit" variant="contained" style={{textAlign: "right"}}>Next</Button>
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
export default RestaurantCreatePost