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
    <div className="relative w-full h-full bg-[#112117] rounded-xl overflow-hidden border border-[#1c2e24] shadow-inner">
      {/* Grid overlay for cyber look */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(57, 224, 121, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(57, 224, 121, 0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}>
      </div>

      <div className="absolute inset-0 flex items-center justify-center text-[#1c2e24] font-bold text-4xl select-none pointer-events-none">
        GEO-DATA PREVIEW
      </div>

      {jobs.map(job => {
        if (!job.latitude || !job.longitude) return null;
        const style = getPos(job.latitude, job.longitude);
        if (parseFloat(style.top) < 0 || parseFloat(style.top) > 100) return null; // Out of bounds
        if (parseFloat(style.left) < 0 || parseFloat(style.left) > 100) return null;

        const score = job.compositeScore || 0;
        const color = score > 0.7 ? 'bg-[#39E079]' : score > 0.4 ? 'bg-[#6aab7d]' : 'bg-[#2d5a3f]';
        const shadow = score > 0.7 ? 'shadow-[0_0_12px_rgba(57,224,121,0.5)]' : 'shadow-none';

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
      <div className="absolute bottom-4 right-4 bg-[#112117]/90 backdrop-blur border border-[#39E079]/20 px-3 py-1 text-xs text-[#39E079] rounded-full">
        Interactive Map Disabled (Mock Mode)
      </div>
    </div>
  );
}

function getMarkerColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return '#39E079'; // Electric green (default)
  if (score >= 0.7) return '#39E079'; // Electric green (high)
  if (score >= 0.4) return '#6aab7d'; // Muted green (medium)
  return '#2d5a3f'; // Dark green (low)
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
        strokeColor: '#39E079',
        strokeOpacity: 0.7,
        strokeWeight: 2,
        fillColor: '#39E079',
        fillOpacity: 0.15,
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
            <div style="padding: 12px; background: #112117; border-radius: 12px; font-family: system-ui;">
            <h3 style="font-weight: 700; font-size: 16px; margin-bottom: 4px; color: #fff;">${job.title}</h3>
            <p style="font-size: 14px; font-weight: 600; color: #6aab7d; margin-bottom: 4px;">${job.company}</p>
            <p style="font-size: 13px; color: #5a7c65; margin-bottom: 8px;">${job.location}</p>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 12px; padding: 4px 10px; border-radius: 999px; background: rgba(57,224,121,0.15); color: #39E079; font-weight: 600;">
                Score: ${Math.round((job.compositeScore || 0) * 100)}%
                </span>
                ${job.salary ? `<span style="font-size: 12px; color: #39E079; font-weight: 500;">${job.salary}</span>` : ''}
            </div>
            <a href="/jobs/${job.id}" style="font-size: 13px; color: #39E079; text-decoration: underline;">View Details →</a>
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
            <Pin background={getMarkerColor(job.compositeScore)} glyphColor={'#112117'} borderColor={'#1c2e24'} />
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
        opacity: 0.85,
        gradient: [
          'rgba(17, 33, 23, 0)',       // Transparent dark base
          'rgba(28, 46, 36, 0.3)',     // Surface dark
          'rgba(45, 90, 63, 0.5)',     // Dark green
          'rgba(74, 140, 95, 0.6)',    // Muted green
          'rgba(106, 171, 125, 0.7)',  // Medium green
          'rgba(57, 224, 121, 0.85)',  // Electric green
          'rgba(57, 224, 121, 1)',     // Full electric green
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

// Premium Dark Map Theme - Slate/Blue with Teal Water + Green Accents
const mapStyles = [
  // Base geometry - deep charcoal/slate
  { elementType: "geometry", stylers: [{ color: "#0f1419" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f1419" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },

  // Administrative labels
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2937" }],
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca3af" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d1d5db" }],
  },
  {
    featureType: "administrative.province",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca3af" }],
  },

  // POI - muted
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7280" }],
  },
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#1a2f23" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#39E079" }],
  },

  // Roads - slate tones
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1f2937" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#111827" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7280" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#374151" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2937" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d1d5db" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#2a3441" }],
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#1a2129" }],
  },

  // Transit
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1f2937" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca3af" }],
  },

  // Water - vibrant teal/cyan for contrast
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#0c4a6e" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38bdf8" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#0c4a6e" }],
  },

  // Landscape - dark slate
  {
    featureType: "landscape",
    elementType: "geometry.fill",
    stylers: [{ color: "#111827" }],
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.fill",
    stylers: [{ color: "#0f1419" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry.fill",
    stylers: [{ color: "#111827" }],
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