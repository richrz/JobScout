'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { Marker } from '@googlemaps/markerclusterer';
import { Job } from '@prisma/client';

export interface CityConfig {
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in miles
}

interface JobMapProps {
  jobs: Job[];
  cities?: CityConfig[];
  showHeatmap?: boolean;
}

function MockMap({ jobs }: { jobs: Job[] }) {
  // Simple US-centric projection
  // US Bounds: Lat 24-50, Lng -125 to -66
  const getPos = (lat: number, lng: number) => {
    const y = (50 - lat) / (50 - 24) * 100;
    const x = (lng - -125) / (-66 - -125) * 100;
    return { top: `${y}%`, left: `${x}%` };
  };

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-xl overflow-hidden border border-white/10 shadow-inner">
      {/* Grid overlay for sci-fi look */}
      <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
      }}>
      </div>

      <div className="absolute inset-0 flex items-center justify-center text-slate-800 font-bold text-4xl select-none pointer-events-none">
        GEO-DATA PREVIEW
      </div>
      
      {jobs.map(job => {
        if (!job.latitude || !job.longitude) return null;
        const style = getPos(job.latitude, job.longitude);
        if (parseFloat(style.top) < 0 || parseFloat(style.top) > 100) return null; // Out of bounds
        if (parseFloat(style.left) < 0 || parseFloat(style.left) > 100) return null;

        const score = job.compositeScore || 0;
        const color = score > 0.7 ? 'bg-emerald-500' : score > 0.4 ? 'bg-amber-500' : 'bg-rose-500';
        const shadow = score > 0.7 ? 'shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'shadow-none';

        return (
          <div
            key={job.id}
            className={`absolute w-2 h-2 ${color} rounded-full ${shadow} hover:scale-150 transition-all cursor-pointer z-10`}
            style={style}
            title={`${job.title} - ${job.company}`}
            onClick={() => alert(`Job: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}`)}
          >
             <div className={`absolute inset-0 ${color} animate-ping opacity-50 rounded-full`}></div>
          </div>
        );
      })}
      <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur border border-white/10 px-3 py-1 text-xs text-slate-400 rounded-full">
        Interactive Map Disabled (Mock Mode)
      </div>
    </div>
  );
}

function getMarkerColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return '#3b82f6'; // Blue (default)
  if (score >= 0.7) return '#22c55e'; // Green
  if (score >= 0.4) return '#eab308'; // Yellow
  return '#ef4444'; // Red
}

function CityCircles({ cities }: { cities: CityConfig[] }) {
  const map = useMap();
  const circlesRef = useRef<google.maps.Circle[]>([]);

  useEffect(() => {
    if (!map || !cities) return;

    // Clear existing circles
    circlesRef.current.forEach(circle => circle.setMap(null));
    circlesRef.current = [];

    cities.forEach(city => {
      const circle = new google.maps.Circle({
        strokeColor: '#3b82f6',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        map,
        center: { lat: city.latitude, lng: city.longitude },
        radius: city.radius * 1609.34, // Convert miles to meters
      });
      circlesRef.current.push(circle);
    });

    return () => {
      circlesRef.current.forEach(circle => circle.setMap(null));
    };
  }, [map, cities]);

  return null;
}

function JobMarkers({ jobs }: { jobs: Job[] }) {
  const map = useMap();
  const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
  const clusterer = useRef<MarkerClusterer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Initialize InfoWindow
  useEffect(() => {
    if (!map) return;
    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow({
        maxWidth: 300,
      });
    }
  }, [map]);

  // Simple InfoWindow logic
  const handleMarkerClick = useCallback((job: Job) => {
    if (infoWindowRef.current) {
      const content = `
            <div class="p-2">
            <h3 class="font-bold text-lg mb-1">${job.title}</h3>
            <p class="text-sm font-semibold text-gray-700 mb-1">${job.company}</p>
            <p class="text-sm text-gray-600 mb-2">${job.location}</p>
            <div class="flex items-center gap-2 mb-2">
                <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                Score: ${Math.round((job.compositeScore || 0) * 100)}%
                </span>
                ${job.salary ? `<span class="text-xs text-green-700 font-medium">${job.salary}</span>` : ''}
            </div>
            <a href="/jobs/${job.id}" class="text-sm text-blue-600 hover:text-blue-800 underline">View Details</a>
            </div>
        `;
      infoWindowRef.current.setContent(content);
      // Open at position since we don't have marker instance
      infoWindowRef.current.setPosition({ lat: job.latitude!, lng: job.longitude! });
      infoWindowRef.current.open(map);
    }
  }, [map]);

  const setMarkerRef = useCallback((marker: any, key: string, job: Job) => {
    // No-op ref for now
  }, []);

  return (
    <>
      {jobs.map(job => (
        job.latitude && job.longitude ? (
          <AdvancedMarker
            key={job.id}
            position={{ lat: job.latitude, lng: job.longitude }}
            title={job.title}
            onClick={() => handleMarkerClick(job)}
          >
            <Pin background={getMarkerColor(job.compositeScore)} glyphColor={'#ffffff'} borderColor={'#1d4ed8'} />
          </AdvancedMarker>
        ) : null
      ))}
    </>
  );
}

function JobHeatmap({ jobs }: { jobs: Job[] }) {
  const map = useMap();
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);

  useEffect(() => {
    if (!map) return;

    const points = jobs
      .filter(job => job.latitude && job.longitude)
      .map(job => ({
        location: new google.maps.LatLng(job.latitude!, job.longitude!),
        weight: job.compositeScore || 0.5
      }));

    if (!heatmapRef.current) {
      heatmapRef.current = new google.maps.visualization.HeatmapLayer({
        data: points,
        map: map,
        radius: 50,
        opacity: 0.8,
        gradient: [
          'rgba(0, 255, 0, 0)',
          'rgba(0, 255, 0, 0.5)',
          'rgba(128, 255, 0, 0.7)',
          'rgba(255, 255, 0, 0.8)',
          'rgba(255, 192, 0, 0.9)',
          'rgba(255, 128, 0, 0.9)',
          'rgba(255, 64, 0, 1)',
          'rgba(255, 0, 0, 1)'
        ]
      });
    } else {
      heatmapRef.current.setData(points);
      heatmapRef.current.setMap(map);
    }

    return () => {
      heatmapRef.current?.setMap(null);
    };
  }, [map, jobs]);

  return null;
}

// Dark Mode Map Styles
const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

export function JobMap({ jobs, cities, showHeatmap = false }: JobMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-[400px] md:h-[600px] w-full bg-slate-900 rounded-xl animate-pulse border border-white/5" />;
  }

  // Use Mock Map if no key or mock key
  if (!apiKey || apiKey.startsWith('mock-')) {
    return (
      <div className="h-[400px] md:h-[600px] w-full rounded-xl overflow-hidden shadow-2xl relative">
        <MockMap jobs={jobs} />
      </div>
    );
  }

  return (
    <div className="h-[400px] md:h-[600px] w-full rounded-xl overflow-hidden shadow-2xl border border-white/10 relative">
      <APIProvider apiKey={apiKey} libraries={['visualization']}>
        <Map
          defaultCenter={{ lat: 39.8283, lng: -98.5795 }} // Center of USA
          defaultZoom={4}
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "JOB_SEARCH_MAP"}
          styles={mapStyles}
          disableDefaultUI={false}
          zoomControl={true}
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={true}
          gestureHandling={'greedy'}
          className="w-full h-full"
        >
          {showHeatmap ? (
            <JobHeatmap jobs={jobs} />
          ) : (
            <JobMarkers jobs={jobs} />
          )}
          {cities && <CityCircles cities={cities} />}
        </Map>
      </APIProvider>
    </div>
  );
}