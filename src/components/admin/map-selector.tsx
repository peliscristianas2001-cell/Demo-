
"use client"

import { useRef, useEffect, useState } from 'react';
import L, { LatLng } from 'leaflet';
import type { GeoSettings } from '@/lib/types';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { MapPin } from 'lucide-react';

interface MapSelectorProps {
    settings: GeoSettings;
    onSettingsChange: (settings: GeoSettings) => void;
}

export function MapSelector({ settings, onSettingsChange }: MapSelectorProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const circleRef = useRef<L.Circle | null>(null);
    const [isMarking, setIsMarking] = useState(false);

    // Initialize map only once
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current, {
                zoomControl: true,
            }).setView([settings.latitude, settings.longitude], 6);
            mapRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 
    
    // Handle map click events
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const handleClick = (e: L.LeafletMouseEvent) => {
            if (!isMarking) return;
            onSettingsChange({
                ...settings,
                latitude: e.latlng.lat,
                longitude: e.latlng.lng,
            });
            setIsMarking(false); // Disable marking mode after a click
        };

        map.on('click', handleClick);

        return () => {
            map.off('click', handleClick);
        };
    }, [isMarking, onSettingsChange, settings]);

    // Update marker and circle when settings change
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const position = new LatLng(settings.latitude, settings.longitude);
        
        // Only pan if the center is significantly different
        if (!map.getCenter().equals(position, 0.001)) {
             map.panTo(position);
        }

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
    }, [settings]);


    const handleRadiusChange = (value: number[]) => {
        onSettingsChange({
            ...settings,
            radiusKm: value[0],
        });
    };

    return (
        <div className="space-y-4">
            <div ref={mapContainerRef} className={cn("h-96 w-full rounded-lg overflow-hidden border z-0", isMarking && "cursor-crosshair")} />
            <div className="flex items-center gap-4">
                 <Button onClick={() => setIsMarking(!isMarking)} variant={isMarking ? "destructive" : "outline"}>
                    <MapPin className="mr-2 h-4 w-4" />
                    {isMarking ? "Cancelar Marcado" : "Marcar Centro en el Mapa"}
                </Button>
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
