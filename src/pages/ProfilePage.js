import React from "react";
import { useState, useEffect } from "react";
import "./ProfilePage.css";
import { Box } from "@mui/material";
import axios from "axios";
import Grid2 from "@mui/material/Grid2";
import HeaderProfile from "../components/HeaderProfile";
const userData = {
    name: 'Thái Tăng Huy',
    job: 'Food reviewer',
    followers: 1234,
    following: 567,
    posts: 9,
    socialLinks: [
        { platform: 'Facebook', url: 'https://facebook.com/username' },
        { platform: 'Twitter', url: 'https://twitter.com/username' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/username' }
    ]
};
const tabs  =  [
    { label: "Photos", value: "photos" },
    { label: "Map", value: "map" },
  ];
function ProfilePage() {
    const [type, setType] = useState('photos');
    const [data, setData] = useState([]);
    useEffect( () => {
      console.log(type)
        if(type ==="photos"){
          
        axios
            .get(`https://jsonplaceholder.typicode.com/${type}?_limit=9`)
            .then((response) => {
                setData(response.data)
            })
            .catch((error) => console.error("Error fetching photos:", error));}
        else {
            setData([]);
        }
        }, [type]);
    return(
        <div className="profilepage">
            <HeaderProfile user= {userData}/>
            <div style={{ marginBottom: "20px" }}>
                {tabs.map((tab) => (
                <button
                    key={tab.value}
                    style={{
                    marginRight: "10px",
                    padding: "10px 20px",
                    background: type === tab.value ? "#333" : "#f0f0f0",
                    color: type === tab.value ? "#fff" : "#000",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                    }}
                    onClick={() => setType(tab.value)}
                >
                    {tab.label}
                </button>
                ))}
            </div>
            <div>
        {type === "photos" ? (
          
          <Grid2  container spacing={{xs:0.5, md:0.5}} direction="row" sx={{justifyContent:"center", alignItems:"center"}} >
            {data.map((item) => (
              <Grid2  size={{xs:4, md:4}} key={item.id} style={{ textAlign: "center" }}>
                
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    style={{width:"307.66px", 
                            height:"307.66px"
                    }}
                  />
            
              </Grid2>
            ))}
          </Grid2>
         
        ) : (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <h3>Map content goes here</h3>
          </div>
        )}
      </div>

        </div>
    )
}
export default ProfilePage