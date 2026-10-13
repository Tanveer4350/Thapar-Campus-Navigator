import { useState } from "react";
import { campusLocations } from "../../data/locations";

const buildingCategories = new Set(["Library", "Lecture Hall", "Auditorium", "Workshop"]);

export default function Sidebar({ onLocationSelect }) {
  const [expandedSection, setExpandedSection] = useState(null);

  const handleLocationSelect = (location) => {
    onLocationSelect?.(location);
  };

  const buildings = campusLocations
    .filter(
      (location) =>
        location.type === "building" ||
        location.type === "hostel" ||
        buildingCategories.has(location.category)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const departments = campusLocations
    .filter((location) => location.type === "department")
    .sort((a, b) => a.name.localeCompare(b.name));

  const quickAccess = ["library", "cafeteria", "administrative-block", "c-block", "medical-centre"];

  const renderLocationList = (locations) => (
    <div className="mt-1 ml-10 max-h-48 space-y-1 overflow-y-auto border-l border-gray-200 pl-2">
      {locations.map((location) => (
        <button
          key={location.id}
          type="button"
          onClick={() => handleLocationSelect(location)}
          className="w-full rounded-md px-2 py-2 text-left text-xs text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
        >
          <span className="mr-2">{location.icon || "📍"}</span>
          {location.name}
        </button>
      ))}
      {locations.length === 0 && (
        <p className="px-2 py-2 text-xs text-gray-400">No locations available.</p>
      )}
    </div>
  );

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Explore
          </p>

          <nav className="space-y-1">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg bg-blue-50 px-3 py-3 text-sm font-medium text-blue-600"
            >
              <span className="text-lg">🗺️</span>
              Campus Map
            </button>

            <button
              type="button"
              aria-expanded={expandedSection === "buildings"}
              onClick={() =>
                setExpandedSection(expandedSection === "buildings" ? null : "buildings")
              }
              className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">🏢</span>
                Buildings
              </span>
              <span aria-hidden="true">{expandedSection === "buildings" ? "⌄" : "›"}</span>
            </button>
            {expandedSection === "buildings" && renderLocationList(buildings)}

            <button
              type="button"
              aria-expanded={expandedSection === "departments"}
              onClick={() =>
                setExpandedSection(expandedSection === "departments" ? null : "departments")
              }
              className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">🏫</span>
                Departments
              </span>
              <span aria-hidden="true">{expandedSection === "departments" ? "⌄" : "›"}</span>
            </button>
            {expandedSection === "departments" && renderLocationList(departments)}

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              <span className="text-lg">👨‍🏫</span>
              Faculty
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              <span className="text-lg">📍</span>
              Facilities
            </button>
          </nav>
        </div>

        <div className="mx-5 border-t border-gray-100" />

        <div className="p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Quick Access
          </p>

          <div className="space-y-1">
            {quickAccess.map((id) => {
              const location = campusLocations.find((item) => item.id === id);
              if (!location) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleLocationSelect(location)}
                  className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  {location.icon} {location.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 p-5">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
        >
          ⚙️
          Settings
        </button>
      </div>
    </aside>
  );
}
