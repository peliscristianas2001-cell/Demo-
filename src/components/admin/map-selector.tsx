
"use client"

import { useMemo, useRef, useEffect } from 'react';
import L, { LatLng } from 'leaflet';
import type { GeoSettings } from '@/lib/types';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';

// react-leaflet's MapContainer does not handle StrictMode's double-render well.
// This manual approach is more robust against "Map container is already initialized" errors.

interface MapSelectorProps {
    settings: GeoSettings;
    onSettingsChange: (settings: GeoSettings) => void;
}

export function MapSelector({ settings, onSettingsChange }: MapSelectorProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const circleRef = useRef<L.Circle | null>(null);

    const position = useMemo(() => new LatLng(settings.latitude, settings.longitude), [settings.latitude, settings.longitude]);

    useEffect(() => {
        // Initialize map only if it hasn't been initialized yet and the container is ready
        if (mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current).setView(position, 6);
            mapRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            map.on('click', (e) => {
                onSettingsChange({
                    ...settings,
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng,
                });
            });
        }
        
        // Cleanup function to remove map on component unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []); // Empty dependency array ensures this runs only once on mount and cleanup on unmount

    // Effect to update marker and circle when settings change
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        map.setView(position, map.getZoom());

        // Update Marker
        if (markerRef.current) {
            markerRef.current.setLatLng(position);
        } else {
            markerRef.current = L.marker(position).addTo(map);
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
            }).addTo(map);
        }
    }, [position, settings.radiusKm, settings]);


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
