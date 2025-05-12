import React, { useEffect, useState } from "react";
import "./MapUser.css";
import "@goongmaps/goong-js/dist/goong-js.css";
import goongjs from "@goongmaps/goong-js";

const GOONG_MAPS_API_KEY = "oyPuAhIOG5pbK18KxlnjmLtHFTBkUB5gRluI8ieP";
const GOONG_PLACES_API_KEY = "bI22G8oebQwHbOmJ6CGZLpBqhFWTow7pXwpyrOXT";

function MapUser({ selectedPostId, posts, directionsData }) {
  const [coordinates, setCoordinates] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  console.log("MapUser received directionsData:",selectedPostId,posts, directionsData);

  // Kiểm tra phần tử DOM
  useEffect(() => {
    const mapElement = document.getElementById('map');
    console.log("Map element:", mapElement);
    console.log("Map element dimensions:", mapElement?.offsetWidth, mapElement?.offsetHeight);
  }, []);

  // Lấy tọa độ từ bài post được chọn
  useEffect(() => {
    if (!selectedPostId) return;

    const selectedPost = posts.find(post => post._id === selectedPostId);
    console.log("Selected post:", selectedPost);

    if (selectedPost?.location?.coordinates) {
      const { lat, lng } = selectedPost.location.coordinates;
      setCoordinates({ lat, lng });
    } else {
      console.log("Selected post does not have coordinates.");
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

  // Khởi tạo bản đồ và vẽ tuyến đường
  useEffect(() => {
    if (!coordinates || !userLocation) return;

    console.log("Initializing map with coordinates:", coordinates, "and userLocation:", userLocation);

    goongjs.accessToken = GOONG_MAPS_API_KEY;

    const map = new goongjs.Map({
      container: "map",
      style: `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAPS_API_KEY}`, // Thêm api_key vào URL
      center: [coordinates.lng, coordinates.lat],
      zoom: 12,
    });

    setMapInstance(map);

    map.on('load', () => {
      console.log("Map loaded successfully");
      console.log("Adding marker for post at:", [coordinates.lng, coordinates.lat]);
      new goongjs.Marker().setLngLat([coordinates.lng, coordinates.lat]).addTo(map);
      console.log("Adding marker for user at:", [userLocation.lng, userLocation.lat]);
      new goongjs.Marker({ color: 'red' }).setLngLat([userLocation.lng, userLocation.lat]).addTo(map);

      if (directionsData) {
        console.log("Fetching route with directionsData:", directionsData);
        fetchRoute(map, userLocation, directionsData);
      }
    });

    map.on('error', (e) => {
      console.error("Map error:", e);
      alert("Failed to load map. Please check API key and style URL.");
    });

    return () => {
      if (map) map.remove();
    };
  }, [coordinates, userLocation, directionsData]);

  const fetchRoute = async (map, start, end) => {
    try {
      console.log("Fetching route from:", start, "to:", end);
      const response = await fetch(
        `https://rsapi.goong.io/Direction?origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&vehicle=car&api_key=${GOONG_PLACES_API_KEY}`
      );

      console.log("Route API response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Route API response data:", data);

      if (data && data.routes) {
        const route = data.routes[0];
        const routeCoordinates = route.legs[0].steps.map(step => [step.start_location.lng, step.start_location.lat]);
        console.log("Route coordinates:", routeCoordinates);

        if (map.getLayer('route')) {
          map.removeLayer('route');
        }
        if (map.getSource('route')) {
          map.removeSource('route');
        }

        map.addSource('route', {
          type: 'geojson',
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: routeCoordinates,
            },
          }
        });

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

        const bounds = new goongjs.LngLatBounds();
        routeCoordinates.forEach(coord => bounds.extend(coord));
        map.fitBounds(bounds, { padding: 50 });
      } else {
        console.log("No routes found in response");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const handleGoTo = () => {
    console.log("Mapuser:", selectedPostId, posts, directionsData);
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