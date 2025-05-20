import React from "react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import "./VoucherEditPage.css";
import VouchersPageDetail from "./VouchersPageDetail";
import axios from "axios";
import { BACKENDURL } from "../../utils/const";
const VOUCHER_API_URL = `${BACKENDURL}/api/vouchers`;
const POST_API_URL = `${BACKENDURL}/api/posts`;

function VoucherEditPage() {
    const navigate = useNavigate();
    const userStorage = useSelector(state => state.user.user);
    const { state } = useLocation();
    const { voucherId, restaurantId } = state || {};
    const [selectedVoucherType, setSelectedVoucherType] = useState(null);

    const [type, setType] = useState('lst_voucher');
    
    const [selectedImage, setSelectedImage] = useState(null);

    const [voucherData, setVoucherData] = useState({
        name: "",
        quantity: "",
        release_day: "",
        expire_day: "",
        description: "",
        img: "",
    });
    
    const handleChange = (e) => {
        setVoucherData({ ...voucherData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                const response = await axios.get(`${VOUCHER_API_URL}/voucher_detail/${voucherId}`);

                setVoucherData(response.data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        
        fetchVouchers();
    }, [type]);
    

    const handleUpdate = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", voucherData.name);
        formData.append("description", voucherData.description);
        formData.append("quantity", voucherData.quantity);
        formData.append("release_day", voucherData.release_day);
        formData.append("expire_day", voucherData.expire_day);

        if (selectedImage) {
        formData.append("image", selectedImage); // field name should match multer key
        }

        try {
        const response = await axios.put(
            `${VOUCHER_API_URL}/update/${voucherId}`,
            formData,
            {
            headers: {
                "Content-Type": "multipart/form-data"
            }
            }
        );
        alert("Voucher updated successfully!");
        } catch (error) {
        console.error("Failed to update voucher:", error);
        alert("Update failed");
        }
    };
    
    const handleNavigate = () => {
        navigate(`/vouchers`)
    };

    return (
        <div className="voucherpage">
            <HeaderProfile user={userStorage} userId = {userStorage._id} />
            <div
            className="editVoucher"
            style={{
                display: "flex",
                flexWrap: "wrap",
                borderRadius: "25px",
                padding: "20px",
                margin: "0 auto 10px auto",
                backgroundColor: "#EEEEEE",
                width: "90%",
                justifyContent: "center",
                gap: "20px",
            }}
            >
            {/* Image Upload Section */}
            <div style={{ flex: "1 1 300px", minWidth: "280px", textAlign: "center" }}>
                <h3>Upload Image</h3>
                <div>
                <img
                    alt="not found"
                    width="100%"
                    height="auto"
                    style={{
                    maxWidth: "500px",
                    maxHeight: "250px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    }}
                    src={
                    selectedImage
                        ? URL.createObjectURL(selectedImage)
                        : voucherData?.img || ""
                    }
                />
                <br /> <br />
                <Button
                    onClick={() => setSelectedImage(null)}
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                >
                    Remove
                </Button>
                </div>
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
                />
                </Button>
            </div>

            {/* Form Section */}
            <div style={{ flex: "1 1 300px", minWidth: "280px" }}>
                <form onSubmit={handleUpdate}>
                <TextField
                    fullWidth
                    required
                    label="Name of voucher"
                    name="name"
                    value={voucherData.name}
                    onChange={handleChange}
                    style={{ marginBottom: "15px" }}
                />
                <TextField
                    fullWidth
                    required
                    label="Number of vouchers"
                    name="quantity"
                    type="number"
                    value={voucherData.quantity}
                    onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                        setVoucherData({ ...voucherData, quantity: e.target.value });
                    }
                    }}
                    onBlur={() =>
                    setVoucherData({
                        ...voucherData,
                        quantity: Math.max(0, voucherData.quantity || 0),
                    })
                    }
                    inputProps={{ min: 0 }}
                    style={{ marginBottom: "15px" }}
                />
                <TextField
                    fullWidth
                    required
                    label="Release day"
                    name="release_day"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={voucherData.release_day ? voucherData.release_day.slice(0, 10) : ""}
                    onChange={handleChange}
                    style={{ marginBottom: "15px" }}
                />
                <TextField
                    fullWidth
                    required
                    label="Expiration day"
                    name="expire_day"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={voucherData.expire_day ? voucherData.expire_day.slice(0, 10) : ""}
                    onChange={handleChange}
                    style={{ marginBottom: "15px" }}
                />
                <TextField
                    fullWidth
                    required
                    label="Description"
                    name="description"
                    multiline
                    maxRows={10}
                    value={voucherData.description}
                    onChange={handleChange}
                    style={{ marginBottom: "15px" }}
                />
                <Button type="submit" variant="contained" fullWidth>
                    Update Voucher
                </Button>
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
  

export default VoucherEditPage