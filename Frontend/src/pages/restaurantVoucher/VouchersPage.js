import React from "react";
import { useState } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField'
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Box from "@mui/material/Box";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Grid2 from "@mui/material/Grid";
import HeaderProfile from "../../components/HeaderProfile";
import { styled } from '@mui/material/styles';
import "./VouchersPage.css";
import VouchersPageDetail from "./VouchersPageDetail";

function VouchersPage() {

    const [voucher, setVoucher] = useState([
        {
            id: 1,
            type: "voucherTet",
            name: "Voucher Tet",
            date_start: "20/01/2025",
            date_end: "09/02/2025",
            count: 100,
            img: "https://i.pinimg.com/736x/e6/1c/4c/e61c4c1c4ac1f7261e35fd0cb95bac93.jpg",
        },
        {
            id: 2,
            type: "voucherVal",
            name: "Voucher Valentine",
            date_start: "12/02/2025",
            date_end: "16/02/2025",
            count: 50,
            img: "https://i.pinimg.com/736x/75/93/ca/7593cadd986fb6fb79da6272efb4a3dd.jpg",
        },
        {
            id: 3,
            type: "voucherChrist",
            name: "Voucher Christmas",
            date_start: "20/12/2024",
            date_end: "26/12/2024",
            count: 80,
            img: "https://i.pinimg.com/474x/9a/e0/05/9ae005c10cab8052783d0b41b1840bb8.jpg",
        }
    ]);

    const [selectedVoucherType, setSelectedVoucherType] = useState(null);
    
    const userData = {
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
        is_res: true
    };

    const tabs  =  [
        { label: "List of vouchers", value: "lst_voucher" },
        { label: "Post voucher", value: "post_voucher" },
    ];

    const [type, setType] = useState('lst_voucher');
    
    const [selectedImage, setSelectedImage] = useState(null);

    return (
        <div className="voucherpage">
            <HeaderProfile user= {userData}/>
            <div style={{ marginBottom: "20px" }}>
                {tabs.map((tab) => (
                <Button
                    key={tab.value}
                    size="small"
                    style={{
                    marginLeft: "30px",
                    padding: "10px 20px",
                    background: type === tab.value ? "#333" : "#f0f0f0",
                    color: type === tab.value ? "#fff" : "#000",
                    border: "1px solid #ccc",
                    size: "small",
                    cursor: "pointer",
                    }}
                    onClick={() => setType(tab.value)}
                >
                    {tab.label}
                </Button>
                ))}
            </div>
        <div>
        {type === "lst_voucher" ? (
            <div>
                {! selectedVoucherType ? (
                    <div style={{marginLeft: "20px"}}>
                        <Grid2 container spacing={ 1 } columns={ 12 }>
                            {voucher.map((voucher) => (
                            <Grid2 item xs={12} sm={6} md={4} key={voucher.id} sx={{ pr: 2 }}>
                                <Card style={{backgroundColor: "#f5f5f5"}} sx={{ display: 'flex', width: "100%"}}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Typography component="div" variant="h6">
                                                {voucher.name}
                                            </Typography>
                                            <Typography
                                                variant="subtitle1"
                                                component="div"
                                                sx={{ color: 'text.secondary' }}
                                            >
                                                Number of vouchers: {voucher.count}
                                            </Typography>
                                            <Typography
                                                variant="subtitle1"
                                                component="div"
                                                sx={{ color: 'text.secondary' }}
                                            >
                                                Date start: {voucher.date_start}
                                            </Typography>
                                            <Typography
                                                variant="subtitle1"
                                                component="div"
                                                sx={{ color: 'text.secondary' }}
                                            >
                                                Date end: {voucher.date_end}
                                            </Typography>
                                            <Button 
                                                variant="outlined" 
                                                color="dark" 
                                                style={{width: "70px", marginTop: "10px"}}
                                                onClick={() => setSelectedVoucherType(voucher.type)}>
                                                    Details
                                            </Button>
                                        </CardContent>
                                    </Box>
                                    <CardMedia
                                        component="img"
                                        sx={{ width: 160    , height: 200, objectFit: "cover", right: "0" }}
                                        image={voucher.img}
                                        alt={voucher.name}
                                    />
                                </Card>
                            </Grid2>
                            ))}
                        </Grid2>
                    </div>
                ) : (
                    <VouchersPageDetail onBack={() => setSelectedVoucherType(null)} voucherType={selectedVoucherType}/>
                )}
            </div>
        ) : (
        <div className="postVoucher" style={{ textAlign: "left", borderRadius: "25px", padding: "10px", margin: "0 20px 10px 20px", backgroundColor: "#EEEEEE"}}>
            <div style={{marginRight: "20px", bottom: "0", height: "100%", width: "100%", textAlign: "center"}}>
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
            <div style={{marginRight: "50px"}}>
                <form>
                    <TextField style={{width: "300px", marginBottom: "15px"}} required id="outlined-required" label="Name of voucher"/>
                    <br></br>
                    <TextField style={{width: "300px", marginBottom: "15px"}} required id="outlined-required" label="Number of voucher" type="number" slotProps={{input: {min: 0}}}/>
                    <br></br>
                    <TextField style={{width: "300px", marginBottom: "15px"}} required id="outlined-required" label="Release day" type="date" InputLabelProps={{ shrink: true }}/>
                    <br></br>
                    <TextField style={{width: "300px", marginBottom: "15px"}} required id="outlined-required" label="Expiration day" type="date" InputLabelProps={{ shrink: true }}/>
                    <br></br>
                    <TextField style={{width: "300px", marginBottom: "15px"}} required id="outlined-multiline-required" label="Description" multiline maxRows={10}/>
                    <br></br>
                    <Button type="submit" variant="contained">Post vouchers</Button>
                </form>
            </div>
        </div>
        )}
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
  

export default VouchersPage