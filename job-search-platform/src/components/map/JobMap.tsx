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

  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({ map });
    }
    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow({
        maxWidth: 300,
      });
    }
  }, [map]);

  useEffect(() => {
    clusterer.current?.clearMarkers();
    clusterer.current?.addMarkers(Object.values(markers));
  }, [markers]);

  const setMarkerRef = useCallback((marker: Marker | null, key: string, job: Job) => {
    setMarkers(prev => {
      if (marker && prev[key]) return prev;
      if (!marker && !prev[key]) return prev;

      if (marker) {
        // Add click listener
        marker.addListener('click', () => {
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
            infoWindowRef.current.open(map, marker);
          }
        });
        return { ...prev, [key]: marker };
      } else {
        const newMarkers = { ...prev };
        delete newMarkers[key];
        return newMarkers;
      }
    });
  }, [map]); // Added map dependency for InfoWindow opening

  return (
    <>
      {jobs.map(job => (
        job.latitude && job.longitude ? (
          <AdvancedMarker
            key={job.id}
            position={{ lat: job.latitude, lng: job.longitude }}
            title={job.title}
            ref={(marker) => setMarkerRef(marker, job.id, job)}
          >
            <Pin background={getMarkerColor(job.compositeScore)} glyphColor={'#ffffff'} borderColor={'#1d4ed8'} />
          </AdvancedMarker>
        ) : null
      ))}
    </>
  );
}

// ... imports

interface JobMapProps {
  jobs: Job[];
  cities?: CityConfig[];
  showHeatmap?: boolean;
}

// ... existing code ...

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
        radius: 30,
        opacity: 0.7,
        gradient: [
          'rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)',
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
          'rgba(0, 0, 191, 1)',
          'rgba(0, 0, 159, 1)',
          'rgba(0, 0, 127, 1)',
          'rgba(63, 0, 91, 1)',
          'rgba(127, 0, 63, 1)',
          'rgba(191, 0, 31, 1)',
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

export function JobMap({ jobs, cities, showHeatmap = false }: JobMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('Google Maps API Key is missing');
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg text-red-500">
        Map cannot be loaded. Configuration error.
      </div>
    );
  }

  return (
    <div className="h-[400px] md:h-[600px] w-full rounded-lg overflow-hidden shadow-lg border border-gray-200 relative">
      <APIProvider apiKey={apiKey} libraries={['visualization']}>
        <Map
          defaultCenter={{ lat: 39.8283, lng: -98.5795 }} // Center of USA
          defaultZoom={4}
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "JOB_SEARCH_MAP"}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
          zoomControl={true}
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={true}
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
