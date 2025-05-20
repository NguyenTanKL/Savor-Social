import React, { useEffect, useState } from "react";
import "./FavouriteMapPage.css";
import "@goongmaps/goong-js/dist/goong-js.css";
import goongjs from "@goongmaps/goong-js";
import polyline from "@mapbox/polyline";
import axios from "axios";
import { BACKENDURL } from "../utils/const";
import { TextField, Autocomplete, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
const GOONG_MAPS_API_KEY = "oyPuAhIOG5pbK18KxlnjmLtHFTBkUB5gRluI8ieP";
const GOONG_PLACES_API_KEY = "bI22G8oebQwHbOmJ6CGZLpBqhFWTow7pXwpyrOXT";

function FavouriteMapPage() {
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [travelTime, setTravelTime] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [placeDetails, setPlaceDetails] = useState(null);
  const [travelTimeMarker, setTravelTimeMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Từ khóa tìm kiếm cho danh sách đã lưu
  const [filteredSavedLocations, setFilteredSavedLocations] = useState([]); // Danh sách đã lọc
  const [searchResults, setSearchResults] = useState([]); // Từ khóa tìm kiếm trên bản đồ
  const [searchMarker, setSearchMarker] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchSavedLocations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BACKENDURL}/api/posts/favourite-locations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSavedLocations(response.data);
        setFilteredSavedLocations(response.data); // Khởi tạo danh sách đã lọc
      } catch (error) {
        console.error('Error fetching saved locations:', error);
      }
    };
    fetchSavedLocations();
  }, []);

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
    if (!userLocation || !map) return;

    markers.forEach(marker => marker.remove());
    const newMarkers = [];

    const userMarker = new goongjs.Marker({ color: "red" })
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(new goongjs.Popup().setText("Vị trí của bạn"))
      .addTo(map);
    newMarkers.push(userMarker);

    filteredSavedLocations.forEach(location => { // Sử dụng danh sách đã lọc
      const marker = new goongjs.Marker({ color: "blue" })
        .setLngLat([location.lng, location.lat])
        .setPopup(new goongjs.Popup().setText(`${location.name}\n${location.address}`))
        .addTo(map);
      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  }, [userLocation, filteredSavedLocations, map]);

  useEffect(() => {
    if (!userLocation) return;

    goongjs.accessToken = GOONG_MAPS_API_KEY;
    const newMap = new goongjs.Map({
      container: "map",
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: [userLocation.lng, userLocation.lat],
      zoom: 10,
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
        const duration = data.routes[0].legs[0].duration.value;
        const distance = data.routes[0].legs[0].distance.value;
        console.log("Duration (seconds):", duration);
        console.log("Distance (meters):", distance);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        setTravelTime({ minutes, seconds });
      }
    } catch (error) {
      console.error("Lỗi lấy tuyến đường:", error);
    }
  };

  const fetchPlaceDetails = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${GOONG_PLACES_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const place = data.results[0];
        setPlaceDetails({
          name: place.name ,
          description: place.formatted_address,
          rating: place.rating || "Chưa có đánh giá",
        });
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin địa điểm:", error);
    }
  };

  const handleMapClick = async (event) => {
    const { lng, lat } = event.lngLat;
    fetchPlaceDetails(lat, lng);
    try {
      const response = await fetch(
        `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${GOONG_PLACES_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const location = {
          name: data.results[0].name,
          address: data.results[0].formatted_address,
          lat,
          lng,
        };
        console.log("location:",location);
        setSelectedLocation(location);
      }
    } catch (error) {
      console.error("Lỗi lấy địa điểm:", error);
    }
  };

  const handleLocationClick = (location) => {
    if (selectedLocation && selectedLocation.name === location.name) {
      handleClose();
    } else {
      console.log("Clicked location:", location);
      setSelectedLocation(location);
      setTravelTime(null);
      if (travelTimeMarker) {
        travelTimeMarker.remove();
        setTravelTimeMarker(null);
      }
      if (userLocation) {
        fetchRoute(userLocation, location);
        fetchPlaceDetails(location.lat, location.lng);
      }
    }
  };

  const handleClose = () => {
    setSelectedLocation(null);
    setRoute(null);
    setTravelTime(null);
    setPlaceDetails(null);
    if (travelTimeMarker) {
      travelTimeMarker.remove();
      setTravelTimeMarker(null);
    }
    if (searchMarker) {
      searchMarker.remove();
      setSearchMarker(null);
    }
  };

  const handleSearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://rsapi.goong.io/Place/AutoComplete?input=${encodeURIComponent(query)}&api_key=${GOONG_PLACES_API_KEY}`
      );
      const data = await response.json();
      if (data.predictions) {
        setSearchResults(data.predictions);
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm địa chỉ:", error);
    }
  };

  const handleSelectSearchResult = async (result) => {
    try {
      const response = await fetch(
        `https://rsapi.goong.io/Place/Detail?place_id=${result.place_id}&api_key=${GOONG_PLACES_API_KEY}`
      );
      const data = await response.json();

      if (data.result) {
        const { lat, lng } = data.result.geometry.location;
        const location = {
          name: result.description,
          address: result.description,
          lat,
          lng,
        };

        setSelectedLocation(location);
        fetchPlaceDetails(lat, lng);
        if (userLocation) {
          fetchRoute(userLocation, location);
        }

        if (searchMarker) {
          searchMarker.remove();
        }

        const newMarker = new goongjs.Marker({ color: "green" })
          .setLngLat([lng, lat])
          .setPopup(new goongjs.Popup().setText(result.description))
          .addTo(map);
        setSearchMarker(newMarker);

        map.flyTo({ center: [lng, lat], zoom: 14 });
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết địa điểm tìm kiếm:", error);
    }
  };

  // Lọc danh sách savedLocations dựa trên searchQuery
  useEffect(() => {
    if (!searchQuery) {
      setFilteredSavedLocations(savedLocations); // Nếu không có từ khóa, hiển thị toàn bộ
    } else {
      const filtered = savedLocations.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSavedLocations(filtered);
    }
  }, [searchQuery, savedLocations]);

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

    if (travelTimeMarker) {
      travelTimeMarker.remove();
      setTravelTimeMarker(null);
    }

    if (travelTime) {
      const travelTimeElement = document.createElement("div");
      travelTimeElement.className = "travel-time-overlay";
      travelTimeElement.innerHTML = `Ước tính thời gian: ${travelTime.minutes} phút ${travelTime.seconds} giây`;

      const newMarker = new goongjs.Marker({ element: travelTimeElement })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map);
      setTravelTimeMarker(newMarker);
    }
  }, [route, map, travelTime, userLocation]);

  useEffect(() => {
    if (!map) return;
    map.on("click", handleMapClick);
    return () => map.off("click", handleMapClick);
  }, [map]);
  const handleDetailPost = () => {
    navigate(`/post/${savedLocations.postId}`);
  }
  return (
    <div className="map-container">
      <div className="hh2">
        <h2>Favourite Maps</h2>
      </div>

      <Box sx={{ mb: 2, px: 2 }}>
        <Autocomplete
          freeSolo
          options={searchResults}
          getOptionLabel={(option) => option.description || ""}
          onInputChange={(event, value) => {
            setSearchQuery(value); // Cập nhật searchQuery cho tìm kiếm trên bản đồ
            handleSearch(value);
          }}
          onChange={(event, value) => {
            if (value) {
              handleSelectSearchResult(value);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tìm kiếm địa chỉ"
              variant="outlined"
              fullWidth
            />
          )}
        />
      </Box>

      <div className="map-container-2">
        <div className="locations-list">
          <h2>Địa điểm đã lưu</h2>
          <Box sx={{ mb: 2, px: 2 }}>
            <TextField
              label="Tìm kiếm địa điểm đã lưu"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} // Cập nhật searchQuery để lọc
            />
          </Box>
          <ul>
            {filteredSavedLocations.map((location, index) => (
              <li
                key={index}
                className={selectedLocation?.name === location.name ? "selected" : ""}
                onClick={() => handleLocationClick(location)}
              >
                <strong>{location.name}</strong>
                <br />
                
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
            {placeDetails && (
              <>
                <p>Mô tả: {placeDetails.description}</p>
                <p>Đánh giá: {placeDetails.rating}</p>
              </>
            )}
            {selectedLocation.postId && (
              <p>
                Bài post: <a href={`/post/${selectedLocation.postId}`} onClick={(e) => { e.preventDefault(); navigate(`/post/${selectedLocation.postId}`); }}>Xem bài post</a>
              </p>
            )}
            <button onClick={handleClose}>Đóng</button>
          </div>
        )}
        {route && <div className="route-info"></div>}
      </div>
    </div>
  );
}

export default FavouriteMapPage;