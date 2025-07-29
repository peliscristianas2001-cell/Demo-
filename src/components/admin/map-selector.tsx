
"use client"

import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import type { GeoSettings } from '@/lib/types';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';

interface MapSelectorProps {
    settings: GeoSettings;
    onSettingsChange: (settings: GeoSettings) => void;
}

function MapEvents({ onMapClick }: { onMapClick: (latlng: LatLng) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return null;
}

export function MapSelector({ settings, onSettingsChange }: MapSelectorProps) {
    const position = useMemo(() => new LatLng(settings.latitude, settings.longitude), [settings.latitude, settings.longitude]);

    const handleMapClick = (latlng: LatLng) => {
        onSettingsChange({
            ...settings,
            latitude: latlng.lat,
            longitude: latlng.lng,
        });
    };

    const handleRadiusChange = (value: number[]) => {
        onSettingsChange({
            ...settings,
            radiusKm: value[0],
        });
    };

    return (
        <div className="space-y-4">
            <div className="h-96 w-full rounded-lg overflow-hidden border">
                <MapContainer center={position} zoom={6} scrollWheelZoom={true} className="h-full w-full">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapEvents onMapClick={handleMapClick} />
                    <Marker position={position} />
                    <Circle center={position} radius={settings.radiusKm * 1000} pathOptions={{ color: 'hsl(var(--primary))', fillColor: 'hsl(var(--primary))' }}/>
                </MapContainer>
            </div>
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

    