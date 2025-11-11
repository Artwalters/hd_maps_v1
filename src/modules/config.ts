// Configuration and constants for the Heerlen Interactive Map

import type { MapboxOptions } from 'mapbox-gl';

// Global window interface for custom config
declare global {
  interface Window {
    HEERLEN_MAP_CONFIG?: {
      startPosition?: {
        center?: [number, number];
        zoom?: number;
        pitch?: number;
        bearing?: number;
      };
      boundary?: {
        center?: [number, number];
        radius?: number;
      };
      animation?: {
        speed?: number;
        duration?: number;
      };
    };
  }
}

interface MapConfig {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  boundary: {
    center: [number, number];
    radius: number;
  };
}

interface MarkerZoomConfig {
  min: number;
  small: number;
  medium: number;
  large: number;
}

interface AnimationConfig {
  speed: number;
  duration: number;
}

// Default configuration
const DEFAULT_CONFIG = {
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

/**
 * Merge custom config from window.HEERLEN_MAP_CONFIG with defaults
 */
function getMergedConfig(): {
  MAP: MapConfig;
  MARKER_ZOOM: MarkerZoomConfig;
  ANIMATION: AnimationConfig;
} {
  const customConfig = window.HEERLEN_MAP_CONFIG;

  if (!customConfig) {
    return DEFAULT_CONFIG;
  }

  return {
    MAP: {
      center: customConfig.startPosition?.center || DEFAULT_CONFIG.MAP.center,
      zoom: customConfig.startPosition?.zoom ?? DEFAULT_CONFIG.MAP.zoom,
      pitch: customConfig.startPosition?.pitch ?? DEFAULT_CONFIG.MAP.pitch,
      bearing: customConfig.startPosition?.bearing ?? DEFAULT_CONFIG.MAP.bearing,
      boundary: {
        center: customConfig.boundary?.center || DEFAULT_CONFIG.MAP.boundary.center,
        radius: customConfig.boundary?.radius ?? DEFAULT_CONFIG.MAP.boundary.radius,
      },
    },
    MARKER_ZOOM: DEFAULT_CONFIG.MARKER_ZOOM,
    ANIMATION: {
      speed: customConfig.animation?.speed ?? DEFAULT_CONFIG.ANIMATION.speed,
      duration: customConfig.animation?.duration ?? DEFAULT_CONFIG.ANIMATION.duration,
    },
  };
}

// Export merged config
export const CONFIG = getMergedConfig();

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
