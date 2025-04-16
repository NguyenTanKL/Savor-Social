import React, { useState, useEffect } from 'react';
import './EditProfilePage.css';
import axios from 'axios';

function EditProfilePage({userId}) {
  const USER_API_URL = "http://localhost:5000/api/user";

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    website: '',
    bio: '',
    email: '',
    phoneNumber: '',
    gender: '',
    showSuggestions: false,
  });

  useEffect(() => {
      // Fetch user data
      axios.get(`${USER_API_URL}/get-by-id/${userId}`).then(res => {
          setFormData(res.data);
      });
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Không tìm thấy token!");
        return;
      }

      await axios.put(`${USER_API_URL}/update-user`, formData,{
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Profile updated!');
    } catch (err) {
        alert('Update failed');
    }
  };

  return (
    <div className="edit-profile-page">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Change Profile Photo</label>
          <button type="button" className="change-photo-btn">Change Profile Photo</button>
        </div>
        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Website</label>
          <input type="text" name="website" value={formData.website} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Bio</label>
          <textarea name="bio" value={formData.bio} onChange={handleChange} maxLength="150"></textarea>
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="preferNotToSay">Prefer not to say</option>
          </select>
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="showSuggestions"
              checked={formData.showSuggestions}
              onChange={handleChange}
            />
            Show account suggestions on profiles
          </label>
        </div>
        <button type="submit" className="submit-btn">Submit</button>
        <button type="button" className="deactivate-btn">Temporarily deactivate my account</button>
      </form>
    </div>
  );
}

export default EditProfilePage;
