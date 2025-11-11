// Configuration and constants for the Heerlen Interactive Map

import type { MapboxOptions } from 'mapbox-gl';

// Configuration object
export const CONFIG = {
  MAP: {
    center: [5.979642, 50.887634] as [number, number],
    zoom: 15.5,
    pitch: 45,
    bearing: -17.6,
    boundary: {
      center: [5.977105864037915, 50.88774161029858] as [number, number],
      radius: 0.6,
    },
  },
  MARKER_ZOOM: {
    min: 10,
    small: 14,
    medium: 16,
    large: 18,
  },
  ANIMATION: {
    speed: 0.8,
    duration: 2000,
  },
};

// Mapbox access token
export const MAPBOX_ACCESS_TOKEN: string =
  'pk.eyJ1IjoicHJvamVjdGhlZXJsZW4iLCJhIjoiY2x4eWVmcXBvMWozZTJpc2FqbWgzcnAyeCJ9.SVOVbBG6o1lHs6TwCudR9g';

// Map style
export const MAP_STYLE: string = 'mapbox://styles/projectheerlen/cm1t3u60e011d01peewgldm85';

// Local storage key
export const LOCAL_STORAGE_KEY: string = 'heerlenActiveFilters';

// Map options
export const MAP_OPTIONS: MapboxOptions = {
  container: 'map',
  style: MAP_STYLE,
  center: CONFIG.MAP.center,
  zoom: CONFIG.MAP.zoom,
  pitch: CONFIG.MAP.pitch,
  bearing: CONFIG.MAP.bearing,
  antialias: true,
  interactive: true,
  renderWorldCopies: false,
  preserveDrawingBuffer: false,
  maxParallelImageRequests: 16,
  fadeDuration: 0,
};
