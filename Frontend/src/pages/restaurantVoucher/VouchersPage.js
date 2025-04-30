import React from "react";
import { useState, useEffect } from "react";
import {  useNavigate,useParams } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
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
import Stack from "@mui/material/Stack";
import Item from "@mui/material/ListItem";
import HeaderProfile from "../../components/HeaderProfile";
import { styled } from '@mui/material/styles';
import "./VouchersPage.css";
import VouchersPageDetail from "./VouchersPageDetail";
import axios from "axios";

const VOUCHER_API_URL = "http://localhost:5000/api/vouchers";
const POST_API_URL = "http://localhost:5000/api/posts";

function VouchersPage( {restaurantId}) {
    const userStorage = useSelector(state => state.user.user);
    const [selectedVoucherType, setSelectedVoucherType] = useState(null);
    const [voucherId, setVoucherId] = useState(null);

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
        restaurantId: "",
    });
    
    const handleChange = (e) => {
        setVoucherData({ ...voucherData, [e.target.name]: e.target.value });
    };

    const [voucher, setVoucher] = useState([]);

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                const response = await axios.get(`${VOUCHER_API_URL}/summary/${restaurantId}`);

                setVoucher(response.data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        
        fetchVouchers();
    }, [type]);

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        const formData = new FormData();
        formData.append("name", voucherData.name);
        formData.append("quantity", voucherData.quantity);
        formData.append("release_day", voucherData.release_day);
        formData.append("expire_day", voucherData.expire_day);
        formData.append("description", voucherData.description);
        formData.append("restaurantId", restaurantId);
      
        if (selectedImage) {
          formData.append("image", selectedImage);
        }
      
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found! Redirecting to login...");
          return;
        }
      
        try {
          // First: Create voucher
          const response = await fetch(`${VOUCHER_API_URL}/create`, {
            method: "POST",
            body: formData,
          });
      
          const data = await response.json();

          if (!response.ok) {
            alert(`Error creating voucher: ${data.message}`);
            return;
          }
      
          const voucherId = data.voucher._id; // get the new voucher ID from server response
      
          // Now: Create post with voucherId
          const form2 = new FormData();
          if (selectedImage) {
            form2.append("image", selectedImage);
          }
          form2.append("userId", restaurantId);
          form2.append("content", voucherData.name);
          form2.append("is_voucher", true);
          form2.append("voucher_id", voucherId); // <<--- here is the key!
      
          const res = await fetch(`${POST_API_URL}/createpost`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            method: "POST",
            body: form2,
          });
      
          const data2 = await res.json();
      
          if (res.ok) {
            alert("Voucher and Post created successfully!");
            setVoucherData({
              name: "",
              quantity: "",
              release_day: "",
              expire_day: "",
              description: "",
              restaurantId: "",
            });
            setSelectedImage(null);
          } else {
            alert(`Error creating post: ${data2.message}`);
          }
        } catch (error) {
          console.error("Error:", error);
          alert("Failed to create voucher or post");
        }
      };
      

    const handleDeleteVoucher = async (id) => {
        if (!window.confirm("Are you sure you want to delete this voucher?")) return;
    
        try {
            const response = await axios.delete(`${VOUCHER_API_URL}/delete/${id}`);
            if (response.status === 200) {
                alert("Voucher deleted successfully!");
                setVoucher((prevVouchers) => prevVouchers.filter(v => v._id !== id));
            }
        } catch (error) {
            console.error("Error deleting voucher:", error);
            alert("Failed to delete voucher");
        }
    };    

    return (
        <div className="voucherpage">
            <HeaderProfile user={userStorage}/>
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
                            <Grid2 item xs={12} sm={6} md={4} key={voucher._id} sx={{ pr: 2 }}>
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
                                                Number of vouchers: {voucher.quantity}
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
                                            <Stack direction="row" spacing={0}>
                                                <Item>
                                                    <Button 
                                                        variant="contained" 
                                                        color="primary" 
                                                        style={{width: "50px", marginTop: "10px"}}
                                                        onClick={() => (setSelectedVoucherType(voucher.name) ,setVoucherId(voucher._id))}>
                                                            Details
                                                    </Button>
                                                </Item>
                                                <Item>
                                                    <Button 
                                                        variant="contained" 
                                                        color="error" 
                                                        style={{width: "40px", marginTop: "10px"}}
                                                        onClick={() => handleDeleteVoucher(voucher._id)}>
                                                            Delete
                                                    </Button> 
                                                </Item>
                                            </Stack>
                                        </CardContent>
                                    </Box>
                                    <CardMedia
                                        component="img"
                                        sx={{ width: "170px", height: "200px", objectFit: "cover", right: "0" }}
                                        src={voucher.image}
                                        alt={voucher._id}
                                    />
                                </Card>
                            </Grid2>
                            ))}
                        </Grid2>
                    </div>
                ) : (
                    <VouchersPageDetail onBack={() => setSelectedVoucherType(null)} voucherType={selectedVoucherType} voucherId={voucherId}/>
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
                            if (event.target.files.length > 0) {
                                setSelectedImage(event.target.files[0]);
                            }
                        }}
                        multiple
                    />
                </Button>
            </div>
            <div style={{marginRight: "50px"}}>
            <form onSubmit={handleSubmit}>
                <div required id="restaurantId" name="restaurantId"></div>
                <TextField style={{width: "300px", marginBottom: "15px"}} required id="name" label="Name of voucher" name="name" value={voucherData.name} onChange={handleChange} />
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