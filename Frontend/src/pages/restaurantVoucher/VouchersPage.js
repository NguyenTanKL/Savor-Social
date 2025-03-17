import React from "react";
import { useState, useEffect } from "react";
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
import axios from "axios";

const API_URL = "http://localhost:5000/api/vouchers";

function VouchersPage() {

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

    const [voucherData, setVoucherData] = useState({
        name: "",
        quantity: "",
        release_day: "",
        expire_day: "",
        type: "",
        description: "",
    });
    
    const handleChange = (e) => {
        setVoucherData({ ...voucherData, [e.target.name]: e.target.value });
    };

    const [voucher, setVoucher] = useState([]);

    useEffect(() => {
            const fetchVouchers = async () => {
                try {
                    const response = await axios.get(`${API_URL}/summary`);
    
                    setVoucher(response.data);
                } catch (error) {
                    console.error("Error fetching messages:", error);
                }
            };
            
            fetchVouchers();
        }, [type]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_URL}/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(voucherData),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Voucher created successfully!");
                setVoucherData({
                    name: "",
                    quantity: "",
                    img: "",
                    release_day: "",
                    expire_day: "",
                    description: "",
                });
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error creating voucher:", error);
            alert("Failed to create voucher");
        }
    };

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
                {!selectedVoucherType ? (
                    <div style={{marginLeft: "20px"}}>
                        <Grid2 container spacing={ 1 } columns={ 12 }>
                            {voucher.map((voucher) => (
                            <Grid2 item xs={12} sm={6} md={4} key={voucher.id} sx={{ pr: 2 }}>
                                <Card style={{backgroundColor: "#f5f5f5"}} sx={{ display: 'flex', width: "100%"}}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Typography component="div" variant="h6">
                                                {voucher._id}
                                            </Typography>
                                            <Typography
                                                variant="subtitle1"
                                                component="div"
                                                sx={{ color: 'text.secondary' }}
                                            >
                                                Number of vouchers: {voucher.total}
                                            </Typography>
                                            <Typography
                                                variant="subtitle1"
                                                component="div"
                                                sx={{ color: 'text.secondary' }}
                                            >
                                                Date start: {voucher.formattedDateStart}
                                            </Typography>
                                            <Typography
                                                variant="subtitle1"
                                                component="div"
                                                sx={{ color: 'text.secondary' }}
                                            >
                                                Date end: {voucher.formattedDateEnd}
                                            </Typography>
                                            <Button 
                                                variant="outlined" 
                                                color="dark" 
                                                style={{width: "70px", marginTop: "10px"}}
                                                onClick={() => setSelectedVoucherType(voucher._id)}>
                                                    Details
                                            </Button>
                                        </CardContent>
                                    </Box>
                                    <CardMedia
                                        component="img"
                                        sx={{ width: "170px", height: "200px", objectFit: "cover", right: "0" }}
                                        image={voucher.image}
                                        alt={voucher._id}
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
            <form onSubmit={handleSubmit}>
                <TextField style={{width: "300px", marginBottom: "15px"}} required id="name" label="Name of voucher (unique)" name="name" value={voucherData.name} onChange={handleChange} />
                <br></br>
                <TextField 
                    style={{width: "300px", marginBottom: "15px"}} 
                    required id="quantity" 
                    label="Number of vouchers" 
                    name="quantity" type="number" 
                    value={voucherData.quantity} 
                    onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 0 || e.target.value === "") {
                            setVoucherData({ ...voucherData, quantity: e.target.value });
                        }
                    }}
                    onBlur={() => setVoucherData({ ...voucherData, quantity: Math.max(0, voucherData.quantity || 0) })}
                    inputProps={{ min: 0 }}
                />
                <br></br>
                <TextField style={{width: "300px", marginBottom: "15px"}} required id="release_day" label="Release day" name="release_day" type="date" InputLabelProps={{ shrink: true }} value={voucherData.release_day} onChange={handleChange} />
                <br></br>
                <TextField style={{width: "300px", marginBottom: "15px"}} required id="expire_day" label="Expiration day" name="expire_day" type="date" InputLabelProps={{ shrink: true }} value={voucherData.expire_day} onChange={handleChange} />
                <br></br>
                <TextField style={{width: "300px", marginBottom: "15px"}} required id="description" label="Description" name="description" multiline maxRows={10} value={voucherData.description} onChange={handleChange} />
                <br></br>
                <Button type="submit" variant="contained">Post Voucher</Button>
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