// import React, { useState, useEffect } from 'react';
// import './EditProfilePage.css';
// import { styled } from '@mui/material/styles';
// import Button from '@mui/material/Button';
// import axios from 'axios';

// const USER_API_URL = "http://localhost:5000/api/user";

// function EditProfilePage({userId}) {
  
//   const token = localStorage.getItem("token");

//   const [formData, setFormData] = useState({
//     image: '',
//     name: '',
//     username: '',
//     website: '',
//     bio: '',
//     email: '',
//     phoneNumber: '',
//     gender: '',
//     showSuggestions: false,
//   });
//   const [selectedFile, setSelectedFile] = useState(null);

//   useEffect(() => {
//       // Fetch user data
//       axios.get(`${USER_API_URL}/get-by-id/${userId}`).then(res => {
//           setFormData(res.data);
//       });
//   }, [userId]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? checked : value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const data = new FormData();

//   // Append the avatar file
//       if (selectedFile) {
//         data.append('image', selectedFile); // 'avatar' matches what your backend expects (req.file)
//       }

//       // Append other form fields (strings)
//       data.append('name', formData.name);
//       data.append('username', formData.username);
//       data.append('website', formData.website);
//       data.append('bio', formData.bio);
//       data.append('email', formData.email);
//       data.append('phoneNumber', formData.phoneNumber);
//       data.append('gender', formData.gender);   

//       await axios.put(`${USER_API_URL}/update-user`, data, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       alert('Profile updated!');
//     } catch (err) {
//         alert('Update failed');
//         console.log(err);
//     }
//   };
//   return (
//     <div className="edit-profile-page">
//       <h2>Edit Profile</h2>
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label>Change Profile Photo</label>
//           <Button type="button" className="change-photo-btn" component="label"
//                 role={undefined}
//                 tabIndex={-1}>
//             Change Profile Photo
//             {selectedFile && (
//                 <div>
//                     <img
//                         alt="not found"
//                         multiple
//                         width={"200px"}
//                         height={"200px"}
//                         src={URL.createObjectURL(selectedFile)}
//                     />
//                 </div>
//             )}
//             <br></br>
//             <VisuallyHiddenInput
//                 type="file"
//                 onChange={(event) => {
//                     if (event.target.files.length > 0) {
//                         setSelectedFile(event.target.files[0]);
//                     }
//                 }}
//             />
//           </Button>
//           <br></br>
//         </div>
//         <div className="form-group">
//           <label>Name</label>
//           <input type="text" name="name" value={formData.name} onChange={handleChange} />
//         </div>
//         <div className="form-group">
//           <label>Username</label>
//           <input type="text" name="username" value={formData.username} onChange={handleChange} />
//         </div>
//         <div className="form-group">
//           <label>Website</label>
//           <input type="text" name="website" value={formData.website} onChange={handleChange} />
//         </div>
//         <div className="form-group">
//           <label>Bio</label>
//           <textarea name="bio" value={formData.bio} onChange={handleChange} maxLength="150"></textarea>
//         </div>
//         <div className="form-group">
//           <label>Email</label>
//           <input type="email" name="email" value={formData.email} onChange={handleChange} />
//         </div>
//         <div className="form-group">
//           <label>Phone Number</label>
//           <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
//         </div>
//         <div className="form-group">
//           <label>Gender</label>
//           <select name="gender" value={formData.gender} onChange={handleChange}>
//             <option value="">Select Gender</option>
//             <option value="male">Male</option>
//             <option value="female">Female</option>
//             <option value="other">Other</option>
//             <option value="preferNotToSay">Prefer not to say</option>
//           </select>
//         </div>
//         {/* <div className="form-group">
//           <label>
//             <input
//               type="checkbox"
//               name="showSuggestions"
//               checked={formData.showSuggestions}
//               onChange={handleChange}
//             />
//             Show account suggestions on profiles
//           </label>
//         </div> */}
//         <button type="submit" className="submit-btn" style={{width: "20%"}}>Submit</button>
//         {/* <button type="button" className="deactivate-btn">Temporarily deactivate my account</button> */}
//       </form>
//     </div>
//   );
// }

// const VisuallyHiddenInput = styled('input')({
//   clip: 'rect(0 0 0 0)',
//   clipPath: 'inset(50%)',
//   height: 1,
//   overflow: 'hidden',
//   position: 'absolute',
//   bottom: 0,
//   left: 0,
//   whiteSpace: 'nowrap',
//   width: 1,
// });

// export default EditProfilePage;
import React, { useState, useEffect } from 'react';
import './EditProfilePage.css';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { TextField, Box, Chip, Autocomplete, Typography } from '@mui/material';
import axios from 'axios';

const USER_API_URL = "http://localhost:5000/api/user";

function EditProfilePage({ userId }) {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    avatar: '',
    name: '',
    username: '',
    website: '',
    bio: '',
    email: '',
    phoneNumber: '',
    gender: '',
    showSuggestions: false,
    usertype: '', // Thêm usertype để kiểm tra loại người dùng
    preferences: [], // Thêm preferences cho người dùng bình thường
    foodTypes: [], // Thêm foodTypes cho nhà hàng
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [availableTags, setAvailableTags] = useState([]); // Danh sách tag gợi ý

  useEffect(() => {
    // Fetch user data
    axios.get(`${USER_API_URL}/get-by-id/${userId}`).then(res => {
      const userData = res.data;
      setFormData({
        ...userData,
        preferences: userData.preferences?.map(p => p.toLowerCase().trim()) || [],
        foodTypes: userData.foodTypes?.map(p => p.toLowerCase().trim()) || [],
      });
    });

    // Fetch available tags
    axios.get('http://localhost:5000/api/tags', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      setAvailableTags(res.data.map(tag => tag.toLowerCase().trim()));
    }).catch(err => {
      console.error('Failed to load tags:', err);
    });
  }, [userId, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handlePreferenceChange = (event, newValue) => {
    const normalizedValue = newValue.map(tag => tag.toLowerCase().trim());
    setFormData(prev => ({
      ...prev,
      preferences: normalizedValue,
    }));
  };

  const handleFoodTypesChange = (event, newValue) => {
    const normalizedValue = newValue.map(tag => tag.toLowerCase().trim());
    setFormData(prev => ({
      ...prev,
      foodTypes: normalizedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();

      // Append the avatar file
      if (selectedFile) {
        data.append('image', selectedFile); // 'avatar' matches what your backend expects (req.file)
      } else {
        data.append('avatar', formData.avatar); // Use existing avatar if no new file is selected
      }

      // Append other form fields
      data.append('name', formData.name);
      data.append('username', formData.username);
      data.append('website', formData.website);
      data.append('bio', formData.bio);
      data.append('email', formData.email);
      data.append('phoneNumber', formData.phoneNumber);
      data.append('gender', formData.gender);

      // Append preferences or foodTypes based on usertype
      if (formData.usertype === "normal") {
        data.append('preferences', JSON.stringify(formData.preferences));
        // Thêm các tag mới vào database
        const newTags = formData.preferences.filter(tag => !availableTags.includes(tag));
        for (const tag of newTags) {
          await axios.post('http://localhost:5000/api/tags', { name: tag }, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } else if (formData.usertype === "restaurant") {
        data.append('foodTypes', JSON.stringify(formData.foodTypes));
        // Thêm các tag mới vào database
        const newTags = formData.foodTypes.filter(tag => !availableTags.includes(tag));
        for (const tag of newTags) {
          await axios.post('http://localhost:5000/api/tags', { name: tag }, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }

      await axios.put(`${USER_API_URL}/update-user`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Profile updated!');
    } catch (err) {
      alert('Update failed');
      console.log(err);
    }
  };

  return (
    <div className="edit-profile-page">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Change Profile Photo</label>
          <Button type="button" className="change-photo-btn" component="label" role={undefined} tabIndex={-1}>
            Change Profile Photo
            {/* {selectedFile && (
              <div>
                <img
                  alt="Preview"
                  width="200px"
                  height="200px"
                  src={formData?.avatar || URL.createObjectURL(selectedFile)}
                />
              </div>
            )} */}
            <div>
              <img
                alt="Preview"
                width="200px"
                height="200px"
                src={
                  selectedFile
                    ? URL.createObjectURL(selectedFile) // Local preview
                    : formData?.avatar || ""            // Cloudinary image
                }
              />
            </div>
            <br></br>
            <VisuallyHiddenInput
              type="file"
              onChange={(event) => {
                if (event.target.files.length > 0) {
                  setSelectedFile(event.target.files[0]);
                }
              }}
            />
          </Button>
          <br />
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
          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
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
        {formData.usertype === "normal" && (
          <div className="form-group">
            <label>Sở Thích Ăn Uống</label>
            <Autocomplete
              multiple
              options={availableTags}
              value={formData.preferences}
              onChange={handlePreferenceChange}
              freeSolo={true}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Chọn hoặc nhập sở thích"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
              sx={{ mb: 2 }}
            />
          </div>
        )}
        {formData.usertype === "restaurant" && (
          <div className="form-group">
            <label>Loại Món Ăn Nhà Hàng Cung Cấp</label>
            <Autocomplete
              multiple
              options={availableTags}
              value={formData.foodTypes}
              onChange={handleFoodTypesChange}
              freeSolo={true}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Chọn hoặc nhập loại món ăn"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
              sx={{ mb: 2 }}
            />
          </div>
        )}
        <button type="submit" className="submit-btn" style={{ width: "20%" }}>Submit</button>
      </form>
    </div>
  );
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

export default EditProfilePage;