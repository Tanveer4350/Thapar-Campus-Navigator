import { useState } from "react";
import { campusLocations } from "../../data/locations";

const buildingCategories = new Set(["Library", "Lecture Hall", "Auditorium", "Workshop"]);

export default function Sidebar({
  onLocationSelect,
  onFacultySelect,
  onHomeSelect,
  darkMode,
  onDarkModeChange,
}) {
  const [expandedSection, setExpandedSection] = useState(null);
  const [activeTab, setActiveTab] = useState("map");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const activeTabClass = "bg-blue-50 text-blue-600";
  const inactiveTabClass = "text-gray-600 hover:bg-gray-50";

  const renderSetting = (title, description, enabled, onChange) => (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={title}
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            enabled ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );

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

  const facilities = ["cafeteria", "sports-complex", "swimming-pool", "library", "medical-centre"]
    .map((id) => campusLocations.find((location) => location.id === id))
    .filter(Boolean);

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
              aria-current={activeTab === "map" ? "page" : undefined}
              onClick={() => {
                setActiveTab("map");
                setExpandedSection(null);
                onHomeSelect?.();
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                activeTab === "map" ? activeTabClass : inactiveTabClass
              }`}
            >
              <span className="text-lg">🗺️</span>
              Campus Map
            </button>

            <button
              type="button"
              aria-current={activeTab === "buildings" ? "page" : undefined}
              aria-expanded={expandedSection === "buildings"}
              onClick={() => {
                setActiveTab("buildings");
                setExpandedSection(expandedSection === "buildings" ? null : "buildings");
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm transition ${
                activeTab === "buildings" ? activeTabClass : inactiveTabClass
              }`}
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
              aria-current={activeTab === "departments" ? "page" : undefined}
              aria-expanded={expandedSection === "departments"}
              onClick={() => {
                setActiveTab("departments");
                setExpandedSection(expandedSection === "departments" ? null : "departments");
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm transition ${
                activeTab === "departments" ? activeTabClass : inactiveTabClass
              }`}
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
              aria-current={activeTab === "faculty" ? "page" : undefined}
              onClick={() => {
                setActiveTab("faculty");
                onFacultySelect?.();
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                activeTab === "faculty" ? activeTabClass : inactiveTabClass
              }`}
            >
              <span className="text-lg">👨‍🏫</span>
              Faculty
            </button>

            <button
              type="button"
              aria-current={activeTab === "facilities" ? "page" : undefined}
              aria-expanded={expandedSection === "facilities"}
              onClick={() => {
                setActiveTab("facilities");
                setExpandedSection(expandedSection === "facilities" ? null : "facilities");
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm transition ${
                activeTab === "facilities" ? activeTabClass : inactiveTabClass
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">📍</span>
                Facilities
              </span>
              <span aria-hidden="true">{expandedSection === "facilities" ? "⌄" : "›"}</span>
            </button>
            {expandedSection === "facilities" && renderLocationList(facilities)}
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
          onClick={() => setSettingsOpen(true)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
        >
          ⚙️
          Settings
        </button>
      </div>

      {settingsOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSettingsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 id="settings-title" className="text-lg font-semibold text-gray-900">
                  Settings
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Personalize your campus map.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                aria-label="Close settings"
                className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 divide-y divide-gray-100">
              {renderSetting("Dark mode", "Use a darker interface.", darkMode, onDarkModeChange)}
            </div>
          </section>
        </div>
      )}
    </aside>
  );
}
