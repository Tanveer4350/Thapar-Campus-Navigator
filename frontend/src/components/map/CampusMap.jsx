import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  showRouteFromCurrentLocation,
  clearRouteFromMap,
  THAPAR_MAIN_GATE,
  THAPAR_PG_HOSTEL,
} from "../../data/routes";

const DEFAULT_MAPBOX_STYLE = "mapbox://styles/sinher/cmsiupar300si01sffmuuanh0";

export default function CampusMap({ selectedLocation }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const selectedMarker = useRef(null);

  // Active Mapbox token from environment or localStorage
  const activeToken =
    localStorage.getItem("MAPBOX_TOKEN") ||
    import.meta.env.VITE_MAPBOX_TOKEN ||
    "";

  // Navigation & Origin state
  const [startPointType, setStartPointType] = useState("gps"); // "gps" | "gate"
  const [routeInfo, setRouteInfo] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // Add 3D building extrusions on Mapbox vector styles
  const add3DBuildingExtrusions = useCallback((mapInstance) => {
    if (!mapInstance || !mapInstance.isStyleLoaded()) return;
    if (mapInstance.getLayer("3d-buildings")) return;

    try {
      const layers = mapInstance.getStyle().layers || [];
      const labelLayerId = layers.find(
        (layer) => layer.type === "symbol" && layer.layout && layer.layout["text-field"]
      )?.id;

      if (mapInstance.getSource("composite")) {
        mapInstance.addLayer(
          {
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 14,
            paint: {
              "fill-extrusion-color": [
                "interpolate",
                ["linear"],
                ["get", "height"],
                0,
                "#dbeafe",
                15,
                "#93c5fd",
                30,
                "#3b82f6",
              ],
              "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],
                14,
                0,
                14.05,
                ["get", "height"],
              ],
              "fill-extrusion-base": [
                "interpolate",
                ["linear"],
                ["zoom"],
                14,
                0,
                14.05,
                ["get", "min_height"],
              ],
              "fill-extrusion-opacity": 0.85,
            },
          },
          labelLayerId
        );
      }
    } catch (err) {
      console.warn("Could not add 3D buildings layer:", err);
    }
  }, []);

  // Initialize Mapbox map
  const initMap = useCallback(() => {
    if (!mapContainer.current) return;

    if (map.current) {
      clearRouteFromMap(map.current);
      if (selectedMarker.current) {
        selectedMarker.current.remove();
        selectedMarker.current = null;
      }
      map.current.remove();
      map.current = null;
    }

    if (activeToken) {
      mapboxgl.accessToken = activeToken;
    }

    try {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: DEFAULT_MAPBOX_STYLE,
        center: [76.3647, 30.352],
        zoom: 16,
        pitch: 55,
        bearing: -20,
        antialias: true,
      });

      // Navigation controls (zoom / rotate)
      newMap.addControl(new mapboxgl.NavigationControl(), "top-right");

      // High-accuracy Geolocation control with heading & accuracy circle
      newMap.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          },
          trackUserLocation: true,
          showUserHeading: true,
          showAccuracyCircle: true,
        }),
        "top-right"
      );

      newMap.on("style.load", () => {
        add3DBuildingExtrusions(newMap);
        newMap.resize();
      });

      map.current = newMap;
    } catch (err) {
      console.error("Failed to construct map:", err);
    }
  }, [activeToken, add3DBuildingExtrusions]);

  // Mount map on initial render
  useEffect(() => {
    initMap();

    return () => {
      if (map.current) {
        clearRouteFromMap(map.current);
        map.current.remove();
        map.current = null;
      }
    };
  }, [initMap]);

  // Handle selected location changes
  useEffect(() => {
    if (!selectedLocation || !map.current) return;

    const coordinates = selectedLocation.coordinates;

    clearRouteFromMap(map.current);
    setRouteInfo(null);
    setShowSteps(false);
    setRouteError(null);

    map.current.flyTo({
      center: coordinates,
      zoom: 17.5,
      pitch: 60,
      duration: 1600,
      essential: true,
    });

    if (selectedMarker.current) {
      selectedMarker.current.remove();
    }

    selectedMarker.current = new mapboxgl.Marker({ color: "#2563eb" })
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<strong>${selectedLocation.name}</strong><br/><span style="color:#666; font-size:12px;">${
            selectedLocation.category || "Campus Location"
          }</span>`
        )
      )
      .addTo(map.current);
  }, [selectedLocation]);

  // Request high-accuracy route to selected destination
  const handleGetRoute = async () => {
    if (!selectedLocation || !map.current) return;

    setLoadingRoute(true);
    setRouteError(null);

    try {
      if (selectedMarker.current) {
        selectedMarker.current.remove();
      }

      const options = {
        targetAccuracy: 20,
        timeout: 10000,
        onStartDragEnd: async (newCoords) => {
          try {
            const updatedResult = await showRouteFromCurrentLocation(
              map.current,
              selectedLocation,
              {
                startLocation: newCoords,
                fitBounds: false,
                onStartDragEnd: options.onStartDragEnd,
              }
            );
            setRouteInfo(updatedResult);
          } catch (e) {
            console.error("Recalculation error on drag:", e);
          }
        },
      };

      if (startPointType === "gate") {
        options.startLocation = THAPAR_MAIN_GATE;
      } else if (startPointType === "pg-hostel") {
        options.startLocation = THAPAR_PG_HOSTEL;
      }

      const result = await showRouteFromCurrentLocation(
        map.current,
        selectedLocation,
        options
      );

      setRouteInfo(result);
    } catch (err) {
      console.error("Navigation error:", err);
      setRouteError(err.message || "Failed to calculate route.");
    } finally {
      setLoadingRoute(false);
    }
  };

  // Clear active route from map
  const handleClearRoute = () => {
    if (map.current) {
      clearRouteFromMap(map.current);
    }
    setRouteInfo(null);
    setShowSteps(false);
    setRouteError(null);

    if (selectedLocation && map.current) {
      selectedMarker.current = new mapboxgl.Marker({ color: "#2563eb" })
        .setLngLat(selectedLocation.coordinates)
        .addTo(map.current);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Mapbox Canvas Container */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* Floating Destination & Navigation Card */}
      {selectedLocation && (
        <div className="absolute bottom-6 left-6 z-20 max-w-sm w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-4 transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-semibold tracking-wider text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full">
                {selectedLocation.category || selectedLocation.type || "Campus Location"}
              </span>
              <h3 className="font-bold text-gray-900 text-base mt-1 leading-snug">
                {selectedLocation.name}
              </h3>
              {selectedLocation.description && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {selectedLocation.description}
                </p>
              )}
            </div>
          </div>

          {/* Navigation Action Area */}
          {!routeInfo ? (
            <div className="mt-3.5 space-y-2.5">
              {/* Origin Selection: GPS vs PG Hostel vs Main Gate */}
              <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setStartPointType("gps")}
                  className={`flex-1 py-1.5 px-1.5 rounded-lg font-medium transition cursor-pointer flex items-center justify-center gap-1 ${
                    startPointType === "gps"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Use Browser GPS Location"
                >
                  <span>📍</span>
                  <span>My GPS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStartPointType("pg-hostel")}
                  className={`flex-1 py-1.5 px-1.5 rounded-lg font-medium transition cursor-pointer flex items-center justify-center gap-1 ${
                    startPointType === "pg-hostel"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Start directly from PG Hostel"
                >
                  <span>🏠</span>
                  <span>PG Hostel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStartPointType("gate")}
                  className={`flex-1 py-1.5 px-1.5 rounded-lg font-medium transition cursor-pointer flex items-center justify-center gap-1 ${
                    startPointType === "gate"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Start from Campus Main Entrance"
                >
                  <span>🚪</span>
                  <span>Main Gate</span>
                </button>
              </div>

              <button
                onClick={handleGetRoute}
                disabled={loadingRoute}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-medium text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {loadingRoute ? (
                  <>
                    <span className="animate-spin text-base">🔄</span>
                    <span>Acquiring Accurate GPS...</span>
                  </>
                ) : (
                  <>
                    <span className="text-base">🧭</span>
                    <span>Show Route to Destination</span>
                  </>
                )}
              </button>

              {routeError && (
                <p className="text-xs text-red-500 mt-1 bg-red-50 p-2 rounded-lg">
                  {routeError}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-3.5 pt-3 border-t border-gray-100">
              {/* Route Summary */}
              <div className="flex items-center justify-between bg-blue-50/70 px-3 py-2 rounded-xl">
                <div className="flex items-center gap-1.5 text-blue-700 font-semibold text-sm">
                  <span>🚶</span>
                  <span>{routeInfo.formattedDistance}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 font-medium text-sm">
                  <span>⏱️</span>
                  <span>{routeInfo.formattedDuration}</span>
                </div>
              </div>

              {/* Accuracy or Fallback Indicator */}
              {routeInfo.accuracy ? (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  <span>✓</span>
                  <span>High-accuracy GPS fix (±{routeInfo.accuracy} m)</span>
                </div>
              ) : routeInfo.userLocationFallback ? (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                  <span>📍</span>
                  <span>Using campus entrance as start point</span>
                </div>
              ) : null}

              {/* Action buttons */}
              <div className="mt-2.5 flex items-center gap-2">
                {routeInfo.steps && routeInfo.steps.length > 0 && (
                  <button
                    onClick={() => setShowSteps(!showSteps)}
                    className="flex-1 text-xs py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition text-center cursor-pointer"
                  >
                    {showSteps ? "Hide Steps" : `View Directions (${routeInfo.steps.length})`}
                  </button>
                )}

                <button
                  onClick={handleClearRoute}
                  className="text-xs py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition cursor-pointer"
                >
                  Clear Route
                </button>
              </div>

              {/* Turn-by-turn Step List */}
              {showSteps && routeInfo.steps && routeInfo.steps.length > 0 && (
                <div className="mt-2.5 max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs text-gray-600 border-t border-gray-100 pt-2">
                  {routeInfo.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 bg-gray-50/70 p-2 rounded-lg"
                    >
                      <span className="font-bold text-blue-600 text-xs min-w-[16px]">
                        {idx + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-800 leading-tight">
                          {step.instruction}
                        </p>
                        {step.distance > 0 && (
                          <span className="text-[10px] text-gray-400">
                            {Math.round(step.distance)} m
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}