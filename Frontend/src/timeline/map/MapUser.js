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

  // Lấy tọa độ từ bài post được chọn
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

  // Khởi tạo bản đồ
  useEffect(() => {
    if (!coordinates || !userLocation) return;

    goongjs.accessToken = GOONG_MAPS_API_KEY;

    const map = new goongjs.Map({
      container: "map",
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: [coordinates.lng, coordinates.lat],
      zoom: 12,
    });

    setMapInstance(map);

    map.on('load', () => {
      new goongjs.Marker().setLngLat([coordinates.lng, coordinates.lat]).addTo(map);
      new goongjs.Marker({ color: 'red' }).setLngLat([userLocation.lng, userLocation.lat]).addTo(map);
    });

    return () => {
      if (map) map.remove();
    };
  }, [coordinates, userLocation]);

  // Vẽ tuyến đường khi directionsData thay đổi
  useEffect(() => {
    if (!mapInstance || !userLocation || !directionsData) return;

    fetchRoute(mapInstance, userLocation, directionsData);
  }, [directionsData, mapInstance, userLocation]);

  const fetchRoute = async (map, start, end) => {
    try {
      const response = await fetch(
        `https://rsapi.goong.io/Direction?origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&vehicle=car&api_key=${GOONG_PLACES_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data && data.routes) {
        const route = data.routes[0];
        const routeCoordinates = route.legs[0].steps.map(step => [step.start_location.lng, step.start_location.lat]);

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

        // Center bản đồ vào tuyến đường
        const bounds = new goongjs.LngLatBounds();
        routeCoordinates.forEach(coord => bounds.extend(coord));
        map.fitBounds(bounds, { padding: 50 });
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

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