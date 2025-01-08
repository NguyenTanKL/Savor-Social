import React from "react";
import "./MapUser.css";
function MapUser(){
    return(
        <div className="map">
            <div className="map__title">
                    Map
            </div>
            <div className="map_background">
                <img src="https://www.creativecontrast.com/wp-content/uploads/2017/12/Google-Maps-1.jpg" alt="map"></img>
                <button className="map__button">Go to map</button>
            </div>
        </div>
    )
}
export default MapUser;