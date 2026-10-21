import mapboxgl from "mapbox-gl";

/**
 * Create a custom DOM element for a campus building marker
 */
export function createBuildingMarkerElement(building, onClick) {
  const container = document.createElement("div");
  container.className = "campus-building-marker group cursor-pointer select-none transition-transform duration-200 hover:scale-110";
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.gap = "6px";
  container.style.padding = "4px 8px 4px 6px";
  container.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
  container.style.backdropFilter = "blur(6px)";
  container.style.borderRadius = "9999px";
  container.style.border = `1.5px solid ${building.color || "#3b82f6"}`;
  container.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
  container.style.fontSize = "12px";
  container.style.fontWeight = "600";
  container.style.color = "#1f2937";
  container.style.whiteSpace = "nowrap";

  // Icon circle
  const iconSpan = document.createElement("span");
  iconSpan.style.width = "20px";
  iconSpan.style.height = "20px";
  iconSpan.style.borderRadius = "9999px";
  iconSpan.style.backgroundColor = `${building.color || "#3b82f6"}20`;
  iconSpan.style.display = "flex";
  iconSpan.style.alignItems = "center";
  iconSpan.style.justifyContent = "center";
  iconSpan.style.fontSize = "12px";
  iconSpan.innerText = building.icon || "📍";

  // Label
  const labelSpan = document.createElement("span");
  labelSpan.innerText = building.code || building.name;
  labelSpan.style.letterSpacing = "0.02em";

  container.appendChild(iconSpan);
  container.appendChild(labelSpan);

  if (onClick) {
    container.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick(building);
    });
  }

  return container;
}

/**
 * Add interactive markers for all campus buildings onto the Mapbox map
 *
 * @param {mapboxgl.Map} map
 * @param {Array<Object>} buildings
 * @param {Function} onSelect
 * @returns {Array<mapboxgl.Marker>} Array of markers created
 */
export function addCampusBuildingMarkers(map, buildings = [], onSelect) {
  if (!map || !buildings.length) return [];

  const markers = [];

  buildings.forEach((b) => {
    if (!b.coordinates || b.coordinates.length < 2) return;

    const el = createBuildingMarkerElement(b, onSelect);

    const popupHtml = `
      <div style="font-family: inherit; padding: 2px;">
        <div style="display:flex; align-items:center; gap:6px; margin-bottom: 4px;">
          <span style="font-size: 16px;">${b.icon || "📍"}</span>
          <strong style="font-size: 13px; color: #111827;">${b.name}</strong>
        </div>
        <p style="font-size: 11px; color: #6b7280; margin: 0 0 6px 0;">${b.category} • ${b.description || ""}</p>
        <button id="nav-btn-${b.id}" style="width: 100%; background: #2563eb; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
          🧭 Select & Get Route
        </button>
      </div>
    `;

    const popup = new mapboxgl.Popup({
      offset: 16,
      closeButton: false,
      maxWidth: "240px",
    }).setHTML(popupHtml);

    popup.on("open", () => {
      const btn = document.getElementById(`nav-btn-${b.id}`);
      if (btn && onSelect) {
        btn.addEventListener("click", () => {
          onSelect(b);
          popup.remove();
        });
      }
    });

    const marker = new mapboxgl.Marker({
      element: el,
      anchor: "center",
    })
      .setLngLat(b.coordinates)
      .setPopup(popup)
      .addTo(map);

    markers.push(marker);
  });

  return markers;
}

const BuildingMarkerUtils = {
  createBuildingMarkerElement,
  addCampusBuildingMarkers,
};

export default BuildingMarkerUtils;
