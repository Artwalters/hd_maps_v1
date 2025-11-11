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
      introAnimation?: {
        enabled?: boolean;
        startCoords?: [number, number];
        endCoords?: [number, number];
        startZoom?: number;
        startPitch?: number;
        startBearing?: number;
        endZoom?: number;
        endPitch?: number;
        endBearing?: number;
        duration?: number;
        delay?: number;
      };
      zoomLimits?: {
        min?: number;
        max?: number;
      };
      teleport?: {
        enabled?: boolean;
        maxDistance?: number;
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

interface IntroAnimationConfig {
  enabled: boolean;
  startCoords: [number, number];
  endCoords: [number, number];
  startZoom: number;
  startPitch: number;
  startBearing: number;
  endZoom: number;
  endPitch: number;
  endBearing: number;
  duration: number;
  delay: number;
}

interface ZoomLimitsConfig {
  min: number;
  max: number;
}

interface TeleportConfig {
  enabled: boolean;
  maxDistance: number;
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
  INTRO_ANIMATION: {
    enabled: false,
    startCoords: [5.975338618538545, 50.89054201081809] as [number, number],
    endCoords: [5.977246733617121, 50.888996872875126] as [number, number],
    startZoom: 14,
    startPitch: 0,
    startBearing: 0,
    endZoom: 17,
    endPitch: 35,
    endBearing: 162.4,
    duration: 6000,
    delay: 3000,
  },
  ZOOM_LIMITS: {
    min: 10,
    max: 20,
  },
  TELEPORT: {
    enabled: false,
    maxDistance: 1,
  },
};

/**
 * Merge custom config from window.HEERLEN_MAP_CONFIG with defaults
 */
function getMergedConfig(): {
  MAP: MapConfig;
  MARKER_ZOOM: MarkerZoomConfig;
  ANIMATION: AnimationConfig;
  INTRO_ANIMATION: IntroAnimationConfig;
  ZOOM_LIMITS: ZoomLimitsConfig;
  TELEPORT: TeleportConfig;
} {
  const customConfig = window.HEERLEN_MAP_CONFIG;

  if (!customConfig) {
    console.log('📍 No custom config found, using defaults');
    return DEFAULT_CONFIG;
  }

  console.log('📍 Custom config found:', customConfig);

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
    INTRO_ANIMATION: {
      enabled: customConfig.introAnimation?.enabled ?? DEFAULT_CONFIG.INTRO_ANIMATION.enabled,
      startCoords: customConfig.introAnimation?.startCoords || DEFAULT_CONFIG.INTRO_ANIMATION.startCoords,
      endCoords: customConfig.introAnimation?.endCoords || DEFAULT_CONFIG.INTRO_ANIMATION.endCoords,
      startZoom: customConfig.introAnimation?.startZoom ?? DEFAULT_CONFIG.INTRO_ANIMATION.startZoom,
      startPitch: customConfig.introAnimation?.startPitch ?? DEFAULT_CONFIG.INTRO_ANIMATION.startPitch,
      startBearing: customConfig.introAnimation?.startBearing ?? DEFAULT_CONFIG.INTRO_ANIMATION.startBearing,
      endZoom: customConfig.introAnimation?.endZoom ?? DEFAULT_CONFIG.INTRO_ANIMATION.endZoom,
      endPitch: customConfig.introAnimation?.endPitch ?? DEFAULT_CONFIG.INTRO_ANIMATION.endPitch,
      endBearing: customConfig.introAnimation?.endBearing ?? DEFAULT_CONFIG.INTRO_ANIMATION.endBearing,
      duration: customConfig.introAnimation?.duration ?? DEFAULT_CONFIG.INTRO_ANIMATION.duration,
      delay: customConfig.introAnimation?.delay ?? DEFAULT_CONFIG.INTRO_ANIMATION.delay,
    },
    ZOOM_LIMITS: {
      min: customConfig.zoomLimits?.min ?? DEFAULT_CONFIG.ZOOM_LIMITS.min,
      max: customConfig.zoomLimits?.max ?? DEFAULT_CONFIG.ZOOM_LIMITS.max,
    },
    TELEPORT: {
      enabled: customConfig.teleport?.enabled ?? DEFAULT_CONFIG.TELEPORT.enabled,
      maxDistance: customConfig.teleport?.maxDistance ?? DEFAULT_CONFIG.TELEPORT.maxDistance,
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
  minZoom: CONFIG.ZOOM_LIMITS.min,
  maxZoom: CONFIG.ZOOM_LIMITS.max,
  antialias: true,
  interactive: true,
  renderWorldCopies: false,
  preserveDrawingBuffer: false,
  maxParallelImageRequests: 16,
  fadeDuration: 0,
};
