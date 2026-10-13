import mapboxgl from "mapbox-gl";

/**
 * Thapar Institute of Engineering & Technology (TIET) Reference Coordinates
 */
export const THAPAR_CAMPUS_CENTER = [76.3647, 30.352];
export const THAPAR_MAIN_GATE = [76.3619, 30.3559];
export const THAPAR_PG_HOSTEL = [76.3715, 30.3578];
export const THAPAR_HOSTEL_K = [76.3705, 30.3575];

/**
 * Predefined campus routes between popular landmarks
 */
export const predefinedCampusRoutes = [
  {
    id: "gate-to-library",
    name: "Main Gate to Central Library",
    from: "Main Gate",
    to: "Thapar Central Library",
    startCoordinates: [76.3619, 30.3559],
    destinationCoordinates: [76.369948, 30.354418],
    description: "Primary pathway from Gate 1 to Central Library through academic quad.",
  },
  {
    id: "library-to-cblock",
    name: "Central Library to C-Block",
    from: "Thapar Central Library",
    to: "C-Block",
    startCoordinates: [76.369948, 30.354418],
    destinationCoordinates: [76.371183, 30.353548],
    description: "Walkway connecting the Central Library and C-Block classrooms.",
  },
  {
    id: "admin-to-csed",
    name: "Administrative Block to Computer Science",
    from: "Administrative Block",
    to: "Computer Science & Engineering",
    startCoordinates: [76.3655, 30.353],
    destinationCoordinates: [76.3647, 30.352],
    description: "Short path connecting Administrative block to CSE department.",
  },
];

// Track active route markers so we can clear them when routes change
const activeMarkers = {
  start: null,
  destination: null,
};

/**
 * Extract [longitude, latitude] coordinates from various input formats
 * Supports:
 * - Array: [lng, lat]
 * - Object with coordinates array: { coordinates: [lng, lat] }
 * - Object with lng/lat: { lng, lat } or { longitude, latitude }
 */
export function resolveCoordinates(input) {
  if (!input) return null;

  if (Array.isArray(input) && input.length >= 2) {
    return [Number(input[0]), Number(input[1])];
  }

  if (Array.isArray(input.coordinates) && input.coordinates.length >= 2) {
    return [Number(input.coordinates[0]), Number(input.coordinates[1])];
  }

  if (input.lng !== undefined && input.lat !== undefined) {
    return [Number(input.lng), Number(input.lat)];
  }

  if (input.longitude !== undefined && input.latitude !== undefined) {
    return [Number(input.longitude), Number(input.latitude)];
  }

  return null;
}

/**
 * Calculate straight-line distance in meters using Haversine formula
 */
export function calculateDistance(coord1, coord2) {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371e3; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Format distance into human-readable string (m or km)
 */
export function formatDistance(meters) {
  if (meters === undefined || meters === null || isNaN(meters)) return "0 m";
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Format duration in seconds into human-readable string (e.g. "4 mins", "1 hr 12 mins")
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "1 min";
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""}`;

  const hrs = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hrs} hr${hrs > 1 ? "s" : ""}${remainingMins > 0 ? ` ${remainingMins} min` : ""}`;
}

/**
 * Accurately get user's current GPS location via the Browser Geolocation API.
 * Uses high-accuracy hardware mode and samples readings until accuracy <= targetAccuracy (or best available within timeout).
 * Can either fall back to the campus entrance or reject on geolocation failure.
 *
 * @param {Object} options
 * @param {number} [options.targetAccuracy=20] - Acceptable accuracy in meters
 * @param {number} [options.timeout=10000] - Max wait time in ms
 * @param {Array<number>} [options.fallbackCoordinates=THAPAR_MAIN_GATE]
 * @param {boolean} [options.allowFallback=true] - Use fallback coordinates on geolocation failure
 * @param {number} [options.maxAcceptedAccuracy=100] - Maximum accepted accuracy when fallback is disabled
 * @returns {Promise<{ coordinates: [number, number], isFallback: boolean, accuracy?: number, error?: string }>}
 */
export function getUserLocation(options = {}) {
  const {
    targetAccuracy = 20,
    timeout = 10000,
    fallbackCoordinates = THAPAR_MAIN_GATE,
    allowFallback = true,
    maxAcceptedAccuracy = 100,
  } = options;

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      if (!allowFallback) {
        reject(new Error("Location is unavailable. Use a device/browser with location services enabled."));
        return;
      }
      console.warn("Geolocation is not supported by this browser. Using campus fallback.");
      return resolve({
        coordinates: fallbackCoordinates,
        isFallback: true,
        reason: "Geolocation unsupported",
      });
    }

    let bestPosition = null;
    let watchId = null;

    // Timeout safety timer: if target accuracy isn't reached, resolve with best fix obtained
    const timer = setTimeout(() => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (bestPosition) {
        const { longitude, latitude, accuracy } = bestPosition.coords;
        if (!allowFallback && accuracy > maxAcceptedAccuracy) {
          reject(
            new Error(
              `Your location is only accurate to about ${Math.round(accuracy)} m. Move outdoors and try again.`
            )
          );
          return;
        }
        resolve({
          coordinates: [longitude, latitude],
          isFallback: false,
          accuracy: Math.round(accuracy),
        });
      } else {
        if (!allowFallback) {
          reject(
            new Error(
              "Could not get your current location before the request timed out. Try again with location services enabled."
            )
          );
          return;
        }
        console.warn("Geolocation timed out before receiving a fix. Using campus fallback.");
        resolve({
          coordinates: fallbackCoordinates,
          isFallback: true,
          reason: "GPS timeout",
        });
      }
    }, timeout);

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { accuracy, longitude, latitude } = position.coords;

        if (!bestPosition || accuracy < bestPosition.coords.accuracy) {
          bestPosition = position;
        }

        // If current reading satisfies desired precision threshold (<= 20m), return immediately
        if (accuracy <= targetAccuracy) {
          clearTimeout(timer);
          navigator.geolocation.clearWatch(watchId);
          resolve({
            coordinates: [longitude, latitude],
            isFallback: false,
            accuracy: Math.round(accuracy),
          });
        }
      },
      (error) => {
        clearTimeout(timer);
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
        if (!allowFallback) {
          const message =
            error.code === 1
              ? "Location permission was denied. Allow location access for this site in your browser settings, then try again."
              : error.code === 2
                ? "Your current location is unavailable. Turn on device location services and try again."
                : "Could not get your current location in time. Try again with location services enabled.";
          reject(new Error(message));
          return;
        }
        console.warn(`Geolocation error (${error.code}: ${error.message}). Using campus fallback.`);
        resolve({
          coordinates: fallbackCoordinates,
          isFallback: true,
          error: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Fetch route directions between start and destination using Mapbox Directions API.
 * Falls back to an interpolated straight path if API is offline or token is not configured.
 *
 * @param {Array<number>} startCoords - [longitude, latitude]
 * @param {Array<number>} destinationCoords - [longitude, latitude]
 * @param {Object} [options]
 * @param {string} [options.profile="walking"] - "walking", "cycling", or "driving"
 * @param {string} [options.token] - Mapbox access token
 * @returns {Promise<Object>} Route data containing coordinates, distance, duration, and steps
 */
export async function fetchRoute(startCoords, destinationCoords, options = {}) {
  const {
    profile = "walking",
    token = mapboxgl.accessToken || import.meta.env.VITE_MAPBOX_TOKEN,
  } = options;

  const start = resolveCoordinates(startCoords);
  const end = resolveCoordinates(destinationCoords);

  if (!start || !end) {
    throw new Error("Invalid start or destination coordinates provided to fetchRoute.");
  }

  // Only attempt Mapbox Directions API if a valid public key (pk.*) is provided
  const isValidToken =
    Boolean(token) &&
    token.trim() !== "your_mapbox_access_token" &&
    token.startsWith("pk.");

  if (!isValidToken) {
    return generateFallbackRoute(start, end);
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&steps=true&overview=full&access_token=${token}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.routes || data.routes.length === 0) {
      throw new Error("No route found between selected points.");
    }

    const primaryRoute = data.routes[0];
    const steps = primaryRoute.legs?.flatMap((leg) => leg.steps || []) || [];

    return {
      coordinates: primaryRoute.geometry.coordinates,
      distance: primaryRoute.distance, // in meters
      duration: primaryRoute.duration, // in seconds
      steps: steps.map((s) => ({
        instruction: s.maneuver?.instruction || "Continue",
        distance: s.distance,
        duration: s.duration,
        location: s.maneuver?.location,
      })),
      isFallback: false,
      geojson: {
        type: "Feature",
        properties: {
          distance: primaryRoute.distance,
          duration: primaryRoute.duration,
        },
        geometry: primaryRoute.geometry,
      },
    };
  } catch (err) {
    console.warn("Failed to fetch Mapbox Directions route, using fallback direct route:", err);
    return generateFallbackRoute(start, end);
  }
}

/**
 * Generate fallback direct path between two coordinates with Haversine distance
 */
function generateFallbackRoute(start, end) {
  const distance = calculateDistance(start, end);
  // Average campus walking speed ~ 1.35 meters/second (~4.8 km/h)
  const duration = Math.round(distance / 1.35);

  const coordinates = [start, end];

  return {
    coordinates,
    distance,
    duration,
    steps: [
      {
        instruction: "Head towards destination along campus path",
        distance,
        duration,
      },
      {
        instruction: "You have arrived at your destination",
        distance: 0,
        duration: 0,
      },
    ],
    isFallback: true,
    geojson: {
      type: "Feature",
      properties: { distance, duration },
      geometry: {
        type: "LineString",
        coordinates,
      },
    },
  };
}

/**
 * Create a custom HTML element for user location marker (pulsing blue dot)
 */
function createUserLocationMarkerElement() {
  const el = document.createElement("div");
  el.className = "tiet-user-marker";
  el.style.width = "22px";
  el.style.height = "22px";
  el.style.position = "relative";
  el.style.cursor = "pointer";

  el.innerHTML = `
    <div style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(59, 130, 246, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
    <div style="position: absolute; inset: 0; border-radius: 9999px; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"></div>
  `;
  return el;
}

/**
 * Create a custom HTML element for destination marker (pin icon)
 */
function createDestinationMarkerElement() {
  const el = document.createElement("div");
  el.className = "tiet-dest-marker";
  el.style.cursor = "pointer";
  el.innerHTML = `
    <div style="background: #ef4444; color: white; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);">
      <span style="transform: rotate(45deg); font-size: 14px; font-weight: bold;">🏁</span>
    </div>
  `;
  return el;
}

/**
 * Draw/render the route line and markers onto the Mapbox map
 *
 * @param {mapboxgl.Map} map - Mapbox map instance
 * @param {Object} routeData - Route data containing coordinates or geojson
 * @param {Object} [options]
 * @param {string} [options.destinationName] - Destination label
 * @param {string} [options.lineColor="#2563eb"] - Route line color
 * @param {number} [options.lineWidth=5] - Route line width in px
 * @param {boolean} [options.fitBounds=true] - Whether to fit camera to route
 */
export function displayRouteOnMap(map, routeData, options = {}) {
  if (!map) return;

  const {
    destinationName = "Destination",
    lineColor = "#2563eb",
    lineWidth = 6,
    fitBounds = true,
  } = options;

  const coordinates = routeData.coordinates || routeData.geojson?.geometry?.coordinates;
  if (!coordinates || coordinates.length < 2) {
    console.error("Invalid route coordinates to display on map.");
    return;
  }

  const startCoord = coordinates[0];
  const endCoord = coordinates[coordinates.length - 1];

  const geojsonData =
    routeData.geojson || {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates,
      },
    };

  const SOURCE_ID = "campus-route-source";
  const CASING_LAYER_ID = "campus-route-casing";
  const LINE_LAYER_ID = "campus-route-line";

  // Function to add or update route layers
  const renderLayers = () => {
    if (!map.isStyleLoaded()) {
      map.once("style.load", renderLayers);
      return;
    }

    if (map.getSource(SOURCE_ID)) {
      map.getSource(SOURCE_ID).setData(geojsonData);
    } else {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: geojsonData,
      });

      // Background casing line for high contrast on 3D building maps
      map.addLayer({
        id: CASING_LAYER_ID,
        type: "line",
        source: SOURCE_ID,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#1e3a8a",
          "line-width": lineWidth + 3,
          "line-opacity": 0.5,
        },
      });

      // Main route line
      map.addLayer({
        id: LINE_LAYER_ID,
        type: "line",
        source: SOURCE_ID,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": lineColor,
          "line-width": lineWidth,
          "line-opacity": 0.95,
        },
      });
    }

    // Update Start Marker (User Location)
    if (activeMarkers.start) {
      activeMarkers.start.remove();
    }
    const startEl = createUserLocationMarkerElement();
    const accuracyHtml = options.accuracy
      ? `<br/><span style="color:#059669; font-size:11px; font-weight:500;">✓ Accurate GPS (±${options.accuracy}m)</span>`
      : "";

    activeMarkers.start = new mapboxgl.Marker({
      element: startEl,
      anchor: "center",
      draggable: true,
    })
      .setLngLat(startCoord)
      .setPopup(
        new mapboxgl.Popup({ offset: 15 }).setHTML(
          `<strong>📍 Starting Point</strong>${accuracyHtml}<br/><span style="color:#6b7280; font-size:10px;">(Drag pin to fine-tune your exact location)</span>`
        )
      )
      .addTo(map);

    if (options.onStartDragEnd) {
      activeMarkers.start.on("dragend", () => {
        const lngLat = activeMarkers.start.getLngLat();
        options.onStartDragEnd([lngLat.lng, lngLat.lat]);
      });
    }

    // Update Destination Marker
    if (activeMarkers.destination) {
      activeMarkers.destination.remove();
    }
    const destEl = createDestinationMarkerElement();
    activeMarkers.destination = new mapboxgl.Marker({
      element: destEl,
      anchor: "bottom",
    })
      .setLngLat(endCoord)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<strong>${destinationName}</strong><br/><span style="color:#666;">Destination</span>`
        )
      )
      .addTo(map);

    // Fit map bounds to encompass the entire route
    if (fitBounds) {
      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach((coord) => bounds.extend(coord));

      map.fitBounds(bounds, {
        padding: { top: 90, bottom: 90, left: 90, right: 90 },
        maxZoom: 17.5,
        duration: 1600,
        essential: true,
      });
    }
  };

  renderLayers();
}

/**
 * Remove route layers, sources, and navigation markers from map
 *
 * @param {mapboxgl.Map} map - Mapbox map instance
 */
export function clearRouteFromMap(map) {
  if (!map) return;

  const SOURCE_ID = "campus-route-source";
  const CASING_LAYER_ID = "campus-route-casing";
  const LINE_LAYER_ID = "campus-route-line";

  if (map.getLayer(LINE_LAYER_ID)) {
    map.removeLayer(LINE_LAYER_ID);
  }

  if (map.getLayer(CASING_LAYER_ID)) {
    map.removeLayer(CASING_LAYER_ID);
  }

  if (map.getSource(SOURCE_ID)) {
    map.removeSource(SOURCE_ID);
  }

  if (activeMarkers.start) {
    activeMarkers.start.remove();
    activeMarkers.start = null;
  }

  if (activeMarkers.destination) {
    activeMarkers.destination.remove();
    activeMarkers.destination = null;
  }
}

/**
 * Full workflow function:
 * 1. Takes user's current GPS location (with fallback if denied/unavailable).
 * 2. Resolves destination location coordinates.
 * 3. Calculates the route between user's location and destination.
 * 4. Displays and animates the route directly on the Mapbox map.
 * 5. Returns route navigation details (distance, duration, steps, coordinates).
 *
 * @param {mapboxgl.Map} map - Mapbox map instance
 * @param {Object|Array<number>} destination - Destination coordinates or location object
 * @param {Object} [options]
 * @param {string} [options.profile="walking"]
 * @param {boolean} [options.fitBounds=true]
 * @returns {Promise<Object>} Navigation result with distances, estimated time, and steps
 */
export async function showRouteFromCurrentLocation(map, destination, options = {}) {
  const destinationCoords = resolveCoordinates(destination);
  if (!destinationCoords) {
    throw new Error("Invalid destination coordinates specified.");
  }

  const destinationName =
    typeof destination === "object" && destination?.name
      ? destination.name
      : "Destination";

  // Step 1: Resolve starting coordinates (custom start location or high-accuracy GPS)
  let startCoords = null;
  let userLocationResult = { isFallback: false, accuracy: null };

  if (options.startLocation) {
    startCoords = resolveCoordinates(options.startLocation);
  }

  if (!startCoords) {
    userLocationResult = await getUserLocation({
      targetAccuracy: options.targetAccuracy || 20,
      timeout: options.timeout || 10000,
    });
    startCoords = userLocationResult.coordinates;
  }

  // Step 2: Fetch route directions from current location to destination
  const route = await fetchRoute(startCoords, destinationCoords, {
    profile: options.profile || "walking",
  });

  // Step 3: Draw and display the route on the map
  if (map) {
    displayRouteOnMap(map, route, {
      destinationName,
      accuracy: userLocationResult.accuracy,
      fitBounds: options.fitBounds !== false,
      lineColor: options.lineColor || "#2563eb",
      lineWidth: options.lineWidth || 6,
    });
  }

  // Step 4: Return full route metadata
  return {
    success: true,
    userLocation: startCoords,
    destinationLocation: destinationCoords,
    destinationName,
    distance: route.distance,
    formattedDistance: formatDistance(route.distance),
    duration: route.duration,
    formattedDuration: formatDuration(route.duration),
    steps: route.steps,
    accuracy: userLocationResult.accuracy,
    isFallback: route.isFallback || userLocationResult.isFallback,
    userLocationFallback: userLocationResult.isFallback,
    coordinates: route.coordinates,
    route,
  };
}

export default {
  THAPAR_CAMPUS_CENTER,
  THAPAR_MAIN_GATE,
  predefinedCampusRoutes,
  resolveCoordinates,
  calculateDistance,
  formatDistance,
  formatDuration,
  getUserLocation,
  fetchRoute,
  displayRouteOnMap,
  clearRouteFromMap,
  showRouteFromCurrentLocation,
};
