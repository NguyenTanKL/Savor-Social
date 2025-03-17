// import React from "react";
// import "./MapUser.css";
// import GoongMapReact from "@goongmaps/goong-map-react";
// const GOONG_MAPS_API_KEY = "oyPuAhIOG5pbK18KxlnjmLtHFTBkUB5gRluI8ieP";

// <script src='https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js'></script>
// <link href='https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css' rel='stylesheet' />

// function MapUser() {
//     return (
//         <div className="map">
//             <div className="map__title">
//                 Map
//             </div>
//             <div className="map_background">
//                 {/* <img src="https://www.creativecontrast.com/wp-content/uploads/2017/12/Google-Maps-1.jpg" alt="map"></img> 
//                 <GoongMapReact
//                     goongApiKey={GOONG_MAPS_API_KEY}
//                     defaultCenter={{ lat: 10.7769, lng: 106.7009 }} // Toạ độ Hồ Chí Minh
//                     defaultZoom={12}
//                 /> */}

//                 <div id='map' style='width: 400px; height: 300px;'></div>
//                 <script>
//                     goongjs.accessToken = 'your maptiles key here';
//                     var map = new goongjs.Map({
//                         container: 'map',
//                     style: 'https://tiles.goong.io/assets/goong_map_web.json', // stylesheet location
//                     center: [105.83991, 21.02800], // starting position [lng, lat]
//                     zoom: 9 // starting zoom
// });
//                 </script>

//                 <button className="map__button">Go to map</button>
//             </div>
//         </div>
//     )
// }
// export default MapUser;
import React, { useEffect } from "react";
import "./MapUser.css";
import "@goongmaps/goong-js/dist/goong-js.css"; // Import CSS của Goong
import goongjs from "@goongmaps/goong-js";

const GOONG_MAPS_API_KEY = "oyPuAhIOG5pbK18KxlnjmLtHFTBkUB5gRluI8ieP";

function MapUser() {
    useEffect(() => {
        // Khởi tạo bản đồ GoongJS
        goongjs.accessToken = GOONG_MAPS_API_KEY;
        const map = new goongjs.Map({
            container: "map", // ID của div chứa map
            style: "https://tiles.goong.io/assets/goong_map_web.json", // Kiểu bản đồ
            center: [106.7009, 10.7769], // Tọa độ Hồ Chí Minh
            zoom: 14,
        });

        // Cleanup khi component unmount
        return () => map.remove();
    }, []);

    return (
        <div className="map">
            <div className="map__title">Map</div>
            <div className="map_background">
                <div id="map"></div>
                <button className="map__button">Go to</button>
            </div>
        </div>
    );
}

export default MapUser;
