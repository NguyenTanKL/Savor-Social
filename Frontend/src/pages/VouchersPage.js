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
import Divider from '@mui/material/Divider';
import Stack from "@mui/material/Stack";
import Item from "@mui/material/ListItem";
import HeaderProfile from "../components/HeaderProfile";
import { styled } from '@mui/material/styles';
import {QRCodeSVG} from 'qrcode.react';
import axios from "axios";
import { BACKENDURL } from "../utils/const";
const API_USER = `${BACKENDURL}/api/user`;

function VouchersPage( {userId} ) {
    const user = useSelector(state => state.user.user);

    const [vouchers, setVouchers] = useState([]);

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                const response = await axios.get(`${API_USER}/vouchers/${userId}`);
                setVouchers(response.data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        
        fetchVouchers();
    }, [userId]);

    const [selectedCode, setSelectedCode] = useState(null);

    const handleUseClick = (code) => {
        setSelectedCode(code);
    };

    const handleClose = () => {
        setSelectedCode(null);
    };
    
    const handleDelete = async (voucherId) => {
        if (!window.confirm("Are you sure you want to delete this voucher?")) return;

        try {
          const response = await axios.delete(`${API_USER}/${userId}/voucher/${voucherId}`);
            
          if (response.status === 200) {
            alert("Voucher deleted successfully!");
            setVouchers((prevVouchers) => prevVouchers.filter(v => v._id !== voucherId));
          }
        } catch (error) {
          console.error("Delete failed:", error);
          alert("Failed to delete voucher");
        }
    };   

    return (
        <div className="vouchers-page">
            <div className="voucherpage">
                <HeaderProfile user={user} userId={user._id}/>
            </div>
            <Divider style={{ marginTop: "10px", marginBottom: "10px" }} />
            <div style={{marginLeft: "20px"}}>
                <Grid2 container spacing={ 1 } columns={ 12 }>
                    {vouchers.map((voucher) => (
                    <Grid2 key={voucher._id} item xs={12} sm={6} md={4} sx={{ pr: 2 }}>
                        <Card style={{backgroundColor: "#f5f5f5"}} sx={{ display: 'flex', width: "100%"}}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography component="div" variant="h6" style={{ fontWeight: "bold" }}>
                                        {voucher.name}
                                    </Typography>
                                    <Typography
                                        variant="subtitle1"
                                        component="div"
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        Date start: {voucher.release_day}
                                    </Typography>
                                    <Typography
                                        variant="subtitle1"
                                        component="div"
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        Date end: {voucher.expire_day}
                                    </Typography>
                                    <Stack direction="row" spacing={0}>
                                        <Item>
                                            <Button 
                                                variant="contained" 
                                                color="primary" 
                                                style={{width: "50px", marginTop: "10px"}}
                                                onClick={() => handleUseClick(voucher.code)}
                                            >
                                                Use
                                            </Button>
                                        </Item>
                                        <Item>
                                            <Button 
                                                variant="contained" 
                                                color="error" 
                                                style={{width: "40px", marginTop: "10px"}}
                                                onClick={() => handleDelete(voucher._id)}
                                            >
                                                Delete
                                            </Button> 
                                        </Item>
                                    </Stack>
                                </CardContent>
                            </Box>
                            <CardMedia
                                component="img"
                                sx={{ width: "170px", height: "200px", objectFit: "cover", right: "0" }}
                                src={voucher.img}
                                alt={voucher.name}
                            />
                        </Card>
                    </Grid2>
                    ))}
                </Grid2>
                {selectedCode && (
                    <div style={styles.popupOverlay}>
                    <div style={styles.popupContent}>
                        <h3>Scan this QR to use</h3>
                        <QRCodeSVG value={selectedCode} size={180} />
                        <br></br>
                        <Button variant="contained" 
                                color="error" 
                                style={{width: "40px", marginTop: "10px"}} onClick={handleClose}
                        >
                            Close
                        </Button>
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

const styles = {
    voucherCard: {
      border: '1px solid #ddd',
      borderRadius: '10px',
      padding: '16px',
      marginBottom: '12px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    },
    useButton: {
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '10px',
    },
    popupOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    },
    popupContent: {
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '12px',
      textAlign: 'center',
      boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    },
    closeButton: {
      marginTop: '16px',
      padding: '6px 12px',
      backgroundColor: '#dc3545',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    }
  };
  

export default VouchersPage