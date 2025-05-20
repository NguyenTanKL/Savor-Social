import React, { useEffect, useState, useRef } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import axios from "axios";
import debounce from "lodash.debounce";

const API_KEY = "YOUR_GOONG_API_KEY_HERE";

const fetchSuggestions = async (text, type, parentCode = "") => {
  const urlMap = {
    province: `https://rsapi.goong.io/Place/AutoComplete?api_key=${API_KEY}&input=${text}`,
    district: `https://rsapi.goong.io/Place/AutoCompleteDistrict?api_key=${API_KEY}&province_code=${parentCode}&input=${text}`,
    ward: `https://rsapi.goong.io/Place/AutoCompleteWard?api_key=${API_KEY}&district_code=${parentCode}&input=${text}`,
  };
  const res = await axios.get(urlMap[type]);
  return res.data.predictions || [];
};

export default function LocationSelector({ onChange }) {
  const [provinceInput, setProvinceInput] = useState("");
  const [districtInput, setDistrictInput] = useState("");
  const [wardInput, setWardInput] = useState("");

  const [provinceOptions, setProvinceOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);

  const [province, setProvince] = useState(null);
  const [district, setDistrict] = useState(null);
  const [ward, setWard] = useState(null);

  const [loading, setLoading] = useState({
    province: false,
    district: false,
    ward: false,
  });

  const cache = useRef({
    province: new Map(),
    district: new Map(),
    ward: new Map(),
  });

  // --- Debounced Fetchers ---
  const debouncedFetch = useRef({
    province: debounce(async (value) => {
      if (cache.current.province.has(value)) {
        setProvinceOptions(cache.current.province.get(value));
        setLoading((prev) => ({ ...prev, province: false }));
        return;
      }
      const result = await fetchSuggestions(value, "province");
      cache.current.province.set(value, result);
      setProvinceOptions(result);
      setLoading((prev) => ({ ...prev, province: false }));
    }, 500),
    district: debounce(async (value, parentCode) => {
      const key = `${parentCode}_${value}`;
      if (cache.current.district.has(key)) {
        setDistrictOptions(cache.current.district.get(key));
        setLoading((prev) => ({ ...prev, district: false }));
        return;
      }
      const result = await fetchSuggestions(value, "district", parentCode);
      cache.current.district.set(key, result);
      setDistrictOptions(result);
      setLoading((prev) => ({ ...prev, district: false }));
    }, 500),
    ward: debounce(async (value, parentCode) => {
      const key = `${parentCode}_${value}`;
      if (cache.current.ward.has(key)) {
        setWardOptions(cache.current.ward.get(key));
        setLoading((prev) => ({ ...prev, ward: false }));
        return;
      }
      const result = await fetchSuggestions(value, "ward", parentCode);
      cache.current.ward.set(key, result);
      setWardOptions(result);
      setLoading((prev) => ({ ...prev, ward: false }));
    }, 500),
  });

  // Province
  useEffect(() => {
    if (provinceInput) {
      setLoading((prev) => ({ ...prev, province: true }));
      debouncedFetch.current.province(provinceInput);
    }
  }, [provinceInput]);

  // District
  useEffect(() => {
    if (districtInput && province?.description) {
      setLoading((prev) => ({ ...prev, district: true }));
      debouncedFetch.current.district(districtInput, province.description);
    }
  }, [districtInput, province]);

  // Ward
  useEffect(() => {
    if (wardInput && district?.description) {
      setLoading((prev) => ({ ...prev, ward: true }));
      debouncedFetch.current.ward(wardInput, district.description);
    }
  }, [wardInput, district]);

  // Reset logic
  useEffect(() => {
    setDistrict(null);
    setDistrictOptions([]);
    setWard(null);
    setWardOptions([]);
  }, [province]);

  useEffect(() => {
    setWard(null);
    setWardOptions([]);
  }, [district]);

  // Callback to parent
  useEffect(() => {
    onChange?.({ province, district, ward });
  }, [province, district, ward]);

  return (
    <>
      <Autocomplete
        value={province}
        onChange={(e, newVal) => setProvince(newVal)}
        inputValue={provinceInput}
        onInputChange={(e, val) => setProvinceInput(val)}
        options={provinceOptions}
        getOptionLabel={(opt) => opt.description || ""}
        loading={loading.province}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tỉnh/Thành phố"
            InputProps={{
              ...params.InputProps,
              endAdornment: loading.province ? (
                <CircularProgress size={20} />
              ) : null,
            }}
          />
        )}
      />

      <Autocomplete
        disabled={!province}
        value={district}
        onChange={(e, newVal) => setDistrict(newVal)}
        inputValue={districtInput}
        onInputChange={(e, val) => setDistrictInput(val)}
        options={districtOptions}
        getOptionLabel={(opt) => opt.description || ""}
        loading={loading.district}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Quận/Huyện"
            InputProps={{
              ...params.InputProps,
              endAdornment: loading.district ? (
                <CircularProgress size={20} />
              ) : null,
            }}
          />
        )}
      />

      <Autocomplete
        disabled={!district}
        value={ward}
        onChange={(e, newVal) => setWard(newVal)}
        inputValue={wardInput}
        onInputChange={(e, val) => setWardInput(val)}
        options={wardOptions}
        getOptionLabel={(opt) => opt.description || ""}
        loading={loading.ward}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Phường/Xã"
            InputProps={{
              ...params.InputProps,
              endAdornment: loading.ward ? (
                <CircularProgress size={20} />
              ) : null,
            }}
          />
        )}
      />
    </>
  );
}
