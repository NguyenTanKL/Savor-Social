
import React from "react";
import { Box, Typography, List, ListItem, ListItemText, Divider } from "@mui/material";
const places = [
    { id: 1, name: "BA GAC Vietnamese Grill & Beer Garden", address: "18 Lê Lai, P. Bến Thành, Q.1" },
    { id: 2, name: "Dookki Vincom Thủ Đức", address: "TTTM Vincom Thủ Đức, Tầng 4, 216 Võ Văn Ngân, Q. Thủ Đức" },
    { id: 3, name: "Quán Bụi Garden", address: "55 Đường Quang Huy, P. Thảo Điền, Q.2" },
  ];
function FavouriteMap() {
    const handleMapClick = () => {
        window.location.href = "/user-map"; // Dẫn tới map chi tiết
      };
    return(
        <div>
        <Box display="flex" height="100vh" width="100%">
            
      {/* Phần bên trái */}
      <Box width="33%" borderRight="1px solid #ddd" overflow="auto">
        <Typography variant="h6" sx={{ p: 2, borderBottom: "1px solid #ddd" }}>
          Your Favorite Places
        </Typography>
        <List>
          {places.map((place) => (
            <React.Fragment key={place.id}>
              <ListItem button onClick={() => alert(`Clicked on ${place.name}`)}>
                <ListItemText primary={place.name} secondary={place.address} />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Phần bên phải */}
      <Box width="67%" display="flex" alignItems="center" justifyContent="center" onClick={handleMapClick} sx={{ bgcolor: "#e3f2fd", cursor: "pointer" }}>
        <Typography variant="h5" color="textSecondary">
          Click to View Map
        </Typography>
      </Box>
    </Box>
    </div>
    )
}
export default FavouriteMap