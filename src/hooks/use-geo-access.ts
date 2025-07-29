
"use client"

import { useState, useEffect } from "react";
import type { GeoSettings, GeneralSettings } from "@/lib/types";

type GeoAccessStatus = "loading" | "allowed" | "denied";

// Haversine formula to calculate distance between two lat/lon points
const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const useGeoAccess = () => {
  const [status, setStatus] = useState<GeoAccessStatus>("loading");
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);
  
  useEffect(() => {
    const storedGeneralSettings = localStorage.getItem("ytl_general_settings");
    if (storedGeneralSettings) {
      setGeneralSettings(JSON.parse(storedGeneralSettings));
    }

    const storedGeoSettings = localStorage.getItem("ytl_geo_settings");
    if (!storedGeoSettings) {
      // If no settings are defined, everyone is allowed by default
      setStatus("allowed");
      return;
    }

    const geoSettings: GeoSettings = JSON.parse(storedGeoSettings);
    
    if (!geoSettings || !geoSettings.radiusKm || geoSettings.radiusKm <= 0) {
      setStatus("allowed");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        
        const distance = getDistanceInKm(
          userLat,
          userLon,
          geoSettings.latitude,
          geoSettings.longitude
        );

        if (distance <= geoSettings.radiusKm) {
          setStatus("allowed");
        } else {
          setStatus("denied");
        }
      },
      (error) => {
        // If user denies permission, they are considered "denied"
        console.warn("Error getting user location:", error.message);
        setStatus("denied");
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0,
      }
    );

  }, []);

  return { status, mainWhatsappNumber: generalSettings?.mainWhatsappNumber };
};
