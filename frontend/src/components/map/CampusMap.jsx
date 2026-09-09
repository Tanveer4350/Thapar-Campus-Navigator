import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function CampusMap({ selectedLocation }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  // Initialize Mapbox
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,

      // Your custom Mapbox Studio style
      style: "mapbox://styles/sinher/cmsiupar300si01sffmuuanh0",

      // Thapar campus
      center: [76.3647, 30.352],

      zoom: 16,

      // 3D perspective
      pitch: 60,
      bearing: -20,

      antialias: true,
    });

    // Navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      "top-right"
    );

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }

      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
    };
  }, []);

  // Handle selected location
  useEffect(() => {
    if (!selectedLocation || !map.current) return;

    const coordinates = selectedLocation.coordinates;

    // Move camera to selected location
    map.current.flyTo({
      center: coordinates,
      zoom: 18,
      pitch: 65,
      bearing: -20,
      duration: 1800,
      essential: true,
    });

    // Remove previous marker
    if (marker.current) {
      marker.current.remove();
    }

    // Create new marker
    marker.current = new mapboxgl.Marker({
      color: "#2563eb",
    })
      .setLngLat(coordinates)
      .addTo(map.current);
  }, [selectedLocation]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
}