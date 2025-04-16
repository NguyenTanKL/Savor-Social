// // import React from "react";
// // import "./MapUser.css";
// // import GoongMapReact from "@goongmaps/goong-map-react";
// // const GOONG_MAPS_API_KEY = "oyPuAhIOG5pbK18KxlnjmLtHFTBkUB5gRluI8ieP";

// // <script src='https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js'></script>
// // <link href='https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css' rel='stylesheet' />

// // function MapUser() {
// //     return (
// //         <div className="map">
// //             <div className="map__title">
// //                 Map
// //             </div>
// //             <div className="map_background">
// //                 {/* <img src="https://www.creativecontrast.com/wp-content/uploads/2017/12/Google-Maps-1.jpg" alt="map"></img> 
// //                 <GoongMapReact
// //                     goongApiKey={GOONG_MAPS_API_KEY}
// //                     defaultCenter={{ lat: 10.7769, lng: 106.7009 }} // Toạ độ Hồ Chí Minh
// //                     defaultZoom={12}
// //                 /> */}

// //                 <div id='map' style='width: 400px; height: 300px;'></div>
// //                 <script>
// //                     goongjs.accessToken = 'your maptiles key here';
// //                     var map = new goongjs.Map({
// //                         container: 'map',
// //                     style: 'https://tiles.goong.io/assets/goong_map_web.json', // stylesheet location
// //                     center: [105.83991, 21.02800], // starting position [lng, lat]
// //                     zoom: 9 // starting zoom
// // });
// //                 </script>

// //                 <button className="map__button">Go to map</button>
// //             </div>
// //         </div>
// //     )
// // }
// // export default MapUser;
// import React, { useEffect, useState } from "react";
// import "./MapUser.css";
// import "@goongmaps/goong-js/dist/goong-js.css"; // Import CSS của Goong
// import goongjs from "@goongmaps/goong-js";

// const GOONG_MAPS_API_KEY = "oyPuAhIOG5pbK18KxlnjmLtHFTBkUB5gRluI8ieP";

// function MapUser({ selectedPostId, posts }) {
//     // useEffect(() => {
//     //     // Khởi tạo bản đồ GoongJS
//     //     goongjs.accessToken = GOONG_MAPS_API_KEY;
//     //     const map = new goongjs.Map({
//     //         container: "map", // ID của div chứa map
//     //         style: "https://tiles.goong.io/assets/goong_map_web.json", // Kiểu bản đồ
//     //         center: [], // Tọa độ Hồ Chí Minh
//     //         zoom: 14,
//     //     });

//     //     // Cleanup khi component unmount
//     //     return () => map.remove();
//     // }, [selectedPostId]);

//     const [coordinates, setCoordinates] = useState(null);
//     const [userLocation, setUserLocation] = useState(null);
//     useEffect(() => {
//         if (!selectedPostId) return;

//         // Tìm bài post từ danh sách các bài posts
//         const selectedPost = posts.find(post => post._id === selectedPostId);

//         if (selectedPost?.location?.coordinates) {
//             // Lấy tọa độ từ bài viết
//             const { lat, lng } = selectedPost.location.coordinates;
//             setCoordinates({ lat, lng });
//         }
//     }, [selectedPostId, posts]);
//     useEffect(() => {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     setUserLocation({
//                         lat: position.coords.latitude,
//                         lng: position.coords.longitude,
//                     });
//                 },
//                 (error) => console.error('Error getting location', error)
//             );
//         }
//     }, []);


//     useEffect(() => {
//         if (!coordinates || !userLocation) return;

//         goongjs.accessToken = GOONG_MAPS_API_KEY;
//         const map = new goongjs.Map({
//             container: "map", // ID của div chứa map
//             style: "https://tiles.goong.io/assets/goong_map_web.json", // Kiểu bản đồ
//             center: [coordinates.lng, coordinates.lat], // Tọa độ Hồ Chí Minh
//             zoom: 14,
//         });

//         // Thêm marker cho bài viết
//         new goongjs.Marker()
//             .setLngLat([coordinates.lng, coordinates.lat])
//             .addTo(map);

//         // Thêm marker cho vị trí hiện tại của người dùng
//         if (userLocation) {
//             new goongjs.Marker({ color: 'red' })
//                 .setLngLat([userLocation.lng, userLocation.lat])
//                 .addTo(map);
//         }

//         // Chỉ đường từ vị trí hiện tại đến bài post
//         if (userLocation && coordinates) {
//             const directions = new goongjs.Directions({
//                 accessToken: GOONG_MAPS_API_KEY
//             });

//             directions.setOrigin([userLocation.lng, userLocation.lat]);
//             directions.setDestination([coordinates.lng, coordinates.lat]);

//             map.addControl(directions, 'top-left');
//         }

//         // Cleanup khi component unmount
//         return () => map.remove();
//     }, [coordinates, userLocation]);
//     const handleGoTo = () => {
//         if (coordinates) {
//             // Chỉ đường đến vị trí bài post
//             const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
//             window.open(url, "_blank");
//         }
//     };
//     // return (
//     //     <div className="map">
//     //         <div className="map__title">Map</div>
//     //         <div className="map_background">
//     //             <div id="map"></div>
//     //             <button className="map__button">Go to</button>
//     //         </div>
//     //     </div>
//     // );
//     return (
//         <div className="map">
//           <div className="map__title">Map</div>
//           <div className="map_background">
//             <div id="map" style={{ width: '100%', height: '400px' }}></div>
//             <button className="map__button" onClick={handleGoTo}>
//               Go to
//             </button>
//           </div>
//         </div>
//       );
// }

// export default MapUser;

import React, { useEffect, useState } from "react";
import "./MapUser.css";
import "@goongmaps/goong-js/dist/goong-js.css"; // Import CSS của Goong
import goongjs from "@goongmaps/goong-js";

const GOONG_MAPS_API_KEY = "oyPuAhIOG5pbK18KxlnjmLtHFTBkUB5gRluI8ieP"; // Thay thế bằng khóa API của bạn

function MapUser({ selectedPostId, posts }) {
    const [coordinates, setCoordinates] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    // Lấy tọa độ từ bài post
    useEffect(() => {
        if (!selectedPostId) return;

        const selectedPost = posts.find(post => post._id === selectedPostId);

        if (selectedPost?.location?.coordinates) {
            const { lat, lng } = selectedPost.location.coordinates;
            setCoordinates({ lat, lng });
        }
    }, [selectedPostId, posts]);

    // Lấy vị trí hiện tại của người dùng
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => console.error('Error getting location', error)
            );
        }
    }, []);

    // Khởi tạo bản đồ GoongJS và chỉ đường
    useEffect(() => {
        if (!coordinates || !userLocation) return;

        goongjs.accessToken = GOONG_MAPS_API_KEY;

        const map = new goongjs.Map({
            container: "map",
            style: "https://tiles.goong.io/assets/goong_map_web.json",
            center: [coordinates.lng, coordinates.lat],
            zoom: 14,
        });

        // Thêm marker cho bài viết
        new goongjs.Marker().setLngLat([coordinates.lng, coordinates.lat]).addTo(map);

        // Thêm marker cho vị trí hiện tại của người dùng
        new goongjs.Marker({ color: 'red' }).setLngLat([userLocation.lng, userLocation.lat]).addTo(map);

        // Lấy dữ liệu chỉ đường từ Goong API
        const getDirections = async () => {
            const directionsUrl = `https://api.goong.io/directions?origin=${userLocation.lat},${userLocation.lng}&destination=${coordinates.lat},${coordinates.lng}&key=${GOONG_MAPS_API_KEY}`;
            const response = await fetch(directionsUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data && data.routes) {
                const route = data.routes[0]; // Lấy tuyến đường đầu tiên

                // Vẽ tuyến đường lên bản đồ
                const routeCoordinates = route.legs[0].steps.map(step => [step.start_location.lng, step.start_location.lat]);
                const line = new goongjs.GeoJSONSource({
                    data: {
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates: routeCoordinates,
                        },
                    },
                });

                map.addSource('route', line);
                map.addLayer({
                    id: 'route',
                    type: 'line',
                    source: 'route',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: {
                        'line-color': '#3887be',
                        'line-width': 5,
                    },
                });
            }
        };

        getDirections();

        return () => map.remove();
    }, [coordinates, userLocation]);

    const handleGoTo = () => {
        if (coordinates) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
            window.open(url, "_blank");
        }
    };

    return (
        <div className="map">
            <div className="map__title">Map</div>
            <div className="map_background">
                <div id="map" style={{ width: '100%', height: '400px' }}></div>
                <button className="map__button" onClick={handleGoTo}>Go to</button>
            </div>
        </div>
    );
}

export default MapUser;

