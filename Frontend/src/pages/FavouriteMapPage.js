// import "./FavouriteMapPage.css";
// function FavouriteMapPage() {
//     return(
//         <div>
//             FavouriteMapPage
//         </div>
//     )
// }
// export default FavouriteMapPage

// import React, { useEffect, useState } from "react";
// import "./FavouriteMapPage.css";
// import "@goongmaps/goong-js/dist/goong-js.css";
// import "@goongmaps/goong-geocoder/dist/goong-geocoder.css";
// import goongjs from "@goongmaps/goong-js";

// const GOONG_MAPS_API_KEY = "oyPuAhIOG5pbK18KxlnjmLtHFTBkUB5gRluI8ieP";
// const SAVED_LOCATIONS = [
//     { name: "Quán Cafe A", lng: 106.7009, lat: 10.7769 },
//     { name: "Nhà hàng B", lng: 106.7039, lat: 10.7785 },
//     { name: "Tiệm bánh C", lng: 106.7090, lat: 10.7801 },
// ];

// function FavouriteMapPage() {
//     const [userLocation, setUserLocation] = useState({ lat: 10.7769, lng: 106.7009 });

//     useEffect(() => {
//         navigator.geolocation.getCurrentPosition(
//             (position) => {
//                 setUserLocation({
//                     lat: position.coords.latitude,
//                     lng: position.coords.longitude,
//                 });
//             },
//             (error) => console.error("Error fetching location: ", error),
//             { enableHighAccuracy: true }
//         );
//     }, []);

//     useEffect(() => {
//         goongjs.accessToken = GOONG_MAPS_API_KEY;
//         const map = new goongjs.Map({
//             container: "map",
//             style: "https://tiles.goong.io/assets/goong_map_web.json",
//             center: [106.7009, 10.7769], // Trung tâm bản đồ
//             zoom: 14,
//         });

//         // Thêm marker cho các địa điểm đã lưu
//         SAVED_LOCATIONS.forEach(location => {
//             new goongjs.Marker()
//                 .setLngLat([location.lng, location.lat])
//                 .setPopup(new goongjs.Popup().setText(location.name))
//                 .addTo(map);
//         });
//         new goongjs.Marker()
//             .setLngLat([userLocation.lng, userLocation.lat])
//             .addTo(map);
//         return () => map.remove(); // Cleanup khi unmount
//     }, []);

//     return (
//         <div className="map-container">
//             <h2>Favorite Locations</h2>
//             <div id="map" className="map-display"></div>
//         </div>
//     );
// }

// export default FavouriteMapPage;

import React, { useEffect, useState } from "react";
import "./FavouriteMapPage.css";
import "@goongmaps/goong-js/dist/goong-js.css";
import goongjs from "@goongmaps/goong-js";
import polyline from "@mapbox/polyline";

const GOONG_MAPS_API_KEY = "oyPuAhIOG5pbK18KxlnjmLtHFTBkUB5gRluI8ieP";
const GOONG_PLACES_API_KEY = "bI22G8oebQwHbOmJ6CGZLpBqhFWTow7pXwpyrOXT";
const SAVED_LOCATIONS = [
    { name: "Quán Cafe A", lng: 106.7009, lat: 10.7769 },
    { name: "Nhà hàng B", lng: 106.7039, lat: 10.7785 },
    { name: "Tiệm bánh C", lng: 106.7090, lat: 10.7801 },
];

function FavouriteMapPage() {
    const [userLocation, setUserLocation] = useState(null);
    const [map, setMap] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [startLocation, setStartLocation] = useState(null);
    const [destination, setDestination] = useState(null);
    const [route, setRoute] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => console.error("Lỗi khi lấy vị trí: ", error),
                { enableHighAccuracy: true }
            );
        }
    }, []);

    useEffect(() => {
        if (!userLocation) return;

        goongjs.accessToken = GOONG_MAPS_API_KEY;
        const newMap = new goongjs.Map({
            container: "map",
            style: "https://tiles.goong.io/assets/goong_map_web.json",
            center: [userLocation.lng, userLocation.lat], // Set vị trí hiện tại làm trung tâm
            zoom: 10,
        });

        // Thêm marker cho vị trí hiện tại (màu đỏ)
        new goongjs.Marker({ color: "red" })
            .setLngLat([userLocation.lng, userLocation.lat])
            .setPopup(new goongjs.Popup().setText("Vị trí của bạn"))
            .addTo(newMap);

        // Thêm marker cho các địa điểm yêu thích (màu xanh)
        SAVED_LOCATIONS.forEach(location => {
            new goongjs.Marker({ color: "blue" })
                .setLngLat([location.lng, location.lat])
                .setPopup(new goongjs.Popup().setText(location.name))
                .addTo(newMap);
        });

        setMap(newMap);

        return () => newMap.remove();
    }, [userLocation]);


    const fetchRoute = async (start, end) => {
        try {
            const response = await fetch(
                `https://rsapi.goong.io/Direction?origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&vehicle=car&api_key=${GOONG_PLACES_API_KEY}`
            );
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                setRoute(data.routes[0].overview_polyline.points);
            }
        } catch (error) {
            console.error("Lỗi lấy tuyến đường:", error);
        }
    };

    const handleMapClick = async (event) => {
        const { lng, lat } = event.lngLat;

        try {
            const response = await fetch(
                `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${GOONG_PLACES_API_KEY}`
            );
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const location = {
                    name: data.results[0].formatted_address,
                    lat,
                    lng,
                };
                setSelectedLocation(location);
                // setDestination(location);

                // if (userLocation) {
                //     await fetchRoute(userLocation, location);
                // }
            }
        } catch (error) {
            console.error("Lỗi lấy địa điểm:", error);
        }
    };
    const handleGoTo = async () => {
        if (userLocation && selectedLocation) {
            await fetchRoute(userLocation, selectedLocation);
        }
    };
    useEffect(() => {
        if (!map || !route) return;

        const decodedRoute = polyline.decode(route).map(([lat, lng]) => [lng, lat]);

        if (map.getSource("route")) {
            map.getSource("route").setData({
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        geometry: { type: "LineString", coordinates: decodedRoute },
                        properties: {},
                    },
                ],
            });
        } else {
            map.addSource("route", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [
                        {
                            type: "Feature",
                            geometry: { type: "LineString", coordinates: decodedRoute },
                            properties: {},
                        },
                    ],
                },
            });

            map.addLayer({
                id: "route",
                type: "line",
                source: "route",
                layout: { "line-join": "round", "line-cap": "round" },
                paint: { "line-color": "#007bff", "line-width": 5 },
            });
        }
    }, [route]);

    useEffect(() => {
        if (!map) return;
        map.on("click", handleMapClick);
        return () => map.off("click", handleMapClick);
    }, [map]);

    return (
        // <div className="map-container">
        //     <h2>Favourite Maps</h2>
        //     <div id="map" className="map-display"></div>
        //     {selectedLocation && (
        //         <div className="location-details">
        //             <h3>{selectedLocation.name}</h3>
        //             <p>Tọa độ: {selectedLocation.lat}, {selectedLocation.lng}</p>
        //             <button onClick={handleGoTo}>Go To</button>
        //             <button onClick={() => { setSelectedLocation(null); setRoute(null); }}>Đóng</button>
        //         </div>
        //     )}
        //     {route && (
        //         <div className="route-info">
        //         </div>
        //     )}
        // </div>
        <div className="map-container">
            <div className="hh2">
                <h2>Favourite Maps</h2>
            </div>

            <div className="map-container-2">
                <div className="locations-list">
                    <h2>Địa điểm đã lưu</h2>
                    <ul>
                        {SAVED_LOCATIONS.map((location, index) => (
                            <li
                                key={index}
                                // onClick={() => handleLocationClick(location)}
                                className={selectedLocation?.name === location.name ? "selected" : ""}
                            >
                                {location.name}
                            </li>
                        ))}
                    </ul>

                </div>
                <div id="map" className="map-display"></div>

            </div>
            <div className="detail">
                {selectedLocation && (
                    <div className="location-details">
                        <h3>{selectedLocation.name}</h3>
                        <button onClick={handleGoTo}>Go To</button>
                        <button onClick={() => { setSelectedLocation(null); setRoute(null); }}>Đóng</button>
                    </div>
                )}
                {route && (
                    <div className="route-info">
                    </div>
                )}
            </div>

        </div>
    );
}

export default FavouriteMapPage;



// import React, { useEffect, useState } from "react";
// // import GoongMapReact from "@goongmaps/goong-map-react";
// import "@goongmaps/goong-js/dist/goong-js.css";
// import goongjs from "@goongmaps/goong-js";

// const GOONG_MAPS_API_KEY = "oyPuAhIOG5pbK18KxlnjmLtHFTBkUB5gRluI8ieP";

// function FavouriteMapPage() {
//     const [userLocation, setUserLocation] = useState({ lat: 10.7769, lng: 106.7009 });

//     useEffect(() => {
//         navigator.geolocation.getCurrentPosition(
//             (position) => {
//                 setUserLocation({
//                     lat: position.coords.latitude,
//                     lng: position.coords.longitude,
//                 });
//             },
//             (error) => console.error("Error fetching location: ", error),
//             { enableHighAccuracy: true }
//         );
//     }, []);

//     useEffect(() => {
//         const map = new goongjs.Map({
//             container: "map",
//             style: "https://tiles.goong.io/assets/goong_map_web.json",
//             center: [userLocation.lng, userLocation.lat],
//             zoom: 14,
//         });

//         new goongjs.Marker()
//             .setLngLat([userLocation.lng, userLocation.lat])
//             .addTo(map);

//         return () => map.remove();
//     }, [userLocation]);

//     return (
//         <div className="map-container">
//             <h2>Favourite Map Page</h2>
//             <div className="map-wrapper" id="map"></div>
//         </div>
//     );
// }

// export default FavouriteMapPage;

