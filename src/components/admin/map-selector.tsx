
"use client"

import { useRef, useEffect } from 'react';
import L, { LatLng } from 'leaflet';
import type { GeoSettings } from '@/lib/types';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';

// This manual approach is more robust against "Map container is already initialized" errors in React's StrictMode.

interface MapSelectorProps {
    settings: GeoSettings;
    onSettingsChange: (settings: GeoSettings) => void;
}

export function MapSelector({ settings, onSettingsChange }: MapSelectorProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const circleRef = useRef<L.Circle | null>(null);

    // Initialize map only once
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current).setView([settings.latitude, settings.longitude], 6);
            mapRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        }
        
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 
    
    // Handle map click events
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const handleClick = (e: L.LeafletMouseEvent) => {
            onSettingsChange({
                ...settings,
                latitude: e.latlng.lat,
                longitude: e.latlng.lng,
            });
        };

        map.on('click', handleClick);

        return () => {
            map.off('click', handleClick);
        };
    }, [onSettingsChange, settings]);

    // Update marker and circle when settings change
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const position = new LatLng(settings.latitude, settings.longitude);

        // Animate view change for smoother UX, but only if it's significantly different
        if (!map.getCenter().equals(position, 0.0001)) {
             map.setView(position, map.getZoom());
        }

        // Update Marker
        if (markerRef.current) {
            markerRef.current.setLatLng(position);
        } else {
            markerRef.current = L.marker(position, {
                 icon: new L.Icon({
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }).addTo(map);
        }

        // Update Circle
        if (circleRef.current) {
            circleRef.current.setLatLng(position);
            circleRef.current.setRadius(settings.radiusKm * 1000);
        } else {
            circleRef.current = L.circle(position, {
                radius: settings.radiusKm * 1000,
                color: 'hsl(var(--primary))',
                fillColor: 'hsl(var(--primary))',
                fillOpacity: 0.2
            }).addTo(map);
        }
    }, [settings.latitude, settings.longitude, settings.radiusKm]);


    const handleRadiusChange = (value: number[]) => {
        onSettingsChange({
            ...settings,
            radiusKm: value[0],
        });
    };

    return (
        <div className="space-y-4">
            <div ref={mapContainerRef} className="h-96 w-full rounded-lg overflow-hidden border z-0" />
            <div className="space-y-2">
                <Label htmlFor="radius-slider">Radio de Cobertura: {settings.radiusKm.toLocaleString()} km</Label>
                <Slider
                    id="radius-slider"
                    min={1}
                    max={500}
                    step={1}
                    value={[settings.radiusKm]}
                    onValueChange={handleRadiusChange}
                />
            </div>
        </div>
    );
}
