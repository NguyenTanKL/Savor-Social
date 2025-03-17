import React, { useState } from "react";
import Select from "react-select";
import axios from "axios";
import "./CreatePage.css";

function CreatePage() {
    const [content, setContent] = useState("");
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [location, setLocation] = useState({username:"", name: "", lat: "", lng: "" });
    const [tags, setTags] = useState([]);
    const [rating, setRating] = useState(5);
    const [selectedTags, setSelectedTags] = useState([]);
    
    const tagOptions = ["Đồ ăn Nhật", "Đồ ăn Thái", "Đồ ăn chay", "Hải sản", "Fast food"];
    
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const imageURLs = files.map((file) => URL.createObjectURL(file));
        setImages([...images, ...imageURLs]);
    };

    const handleVideoUpload = (e) => {
        const files = Array.from(e.target.files);
        const videoURLs = files.map((file) => URL.createObjectURL(file));
        setVideos([...videos, ...videoURLs]);
    };

    const handleSubmit = async () => {
        try {
            const userId = "65d1234567890abcdef12345"; // Tạm thời gán userId
            const postData = {
                userId,
                content,
                images,
                videos,
                location,
                tags: selectedTags,
                rating
            };

            const response = await axios.post("http://localhost:5000/api/a", postData);
            alert("Bài viết đã được đăng!");
            console.log("Post created:", response.data);
        } catch (error) {
            console.error("Lỗi đăng bài:", error);
        }
    };

    return (
        <div className="create-page">
            <h2>Đăng bài mới</h2>
            
            <textarea 
                placeholder="Chia sẻ món ăn của bạn..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />

            {/* Upload ảnh */}
            <div className="upload-section">
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
                <div className="preview-container">
                    {images.map((img, index) => (
                        <img key={index} src={img} alt="Preview" className="preview-image" />
                    ))}
                </div>
            </div>

            {/* Upload video */}
            <div className="upload-section">
                <input type="file" accept="video/*" multiple onChange={handleVideoUpload} />
                <div className="preview-container">
                    {videos.map((vid, index) => (
                        <video key={index} src={vid} controls className="preview-video"></video>
                    ))}
                </div>
            </div>

            {/* Địa điểm */}
            <div className="location-section">
                <input 
                    type="text"
                    placeholder="Tên nhà hàng (nếu có)"
                    value={location.name}
                    onChange={(e) => setLocation({ ...location, name: e.target.value })}
                />
                <input 
                    type="text"
                    placeholder="Kinh độ"
                    value={location.lng}
                    onChange={(e) => setLocation({ ...location, lng: e.target.value })}
                />
                <input 
                    type="text"
                    placeholder="Vĩ độ"
                    value={location.lat}
                    onChange={(e) => setLocation({ ...location, lat: e.target.value })}
                />
            </div>

            {/* Chọn tag */}
            <div className="tag-section">
                <select multiple value={selectedTags} onChange={(e) => setSelectedTags([...e.target.selectedOptions].map(o => o.value))}>
                    {tagOptions.map((tag, index) => (
                        <option key={index} value={tag}>{tag}</option>
                    ))}
                </select>
            </div>

            {/* Đánh giá */}
            <div className="rating-section">
                <input 
                    type="number"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                />
            </div>

            {/* Nút đăng bài */}
            <button className="submit-button" onClick={handleSubmit}>Đăng bài</button>
        </div>
    );
}

export default CreatePage;
