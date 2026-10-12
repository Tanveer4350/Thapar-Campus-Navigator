import { campusLocations } from "../../data/locations";

export default function Sidebar({ onLocationSelect }) {
  const handleQuickSelect = (id) => {
    if (!onLocationSelect) return;
    const found = campusLocations.find((loc) => loc.id === id);
    if (found) {
      onLocationSelect(found);
    }
  };

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">

      {/* Explore */}
      <div className="p-5">

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Explore
        </p>

        <nav className="space-y-1">

          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium text-sm">
            <span className="text-lg">🗺️</span>
            Campus Map
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition">
            <span className="text-lg">🏢</span>
            Buildings
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition">
            <span className="text-lg">🏫</span>
            Departments
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition">
            <span className="text-lg">👨‍🏫</span>
            Faculty
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition">
            <span className="text-lg">📍</span>
            Facilities
          </button>

        </nav>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mx-5" />

      {/* Quick Access */}
      <div className="p-5">

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Quick Access
        </p>

        <div className="space-y-2">

          <button
            onClick={() => handleQuickSelect("library")}
            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition"
          >
            <p className="text-sm font-medium text-gray-700">
              📚 Library
            </p>
          </button>

          <button
            onClick={() => handleQuickSelect("cafeteria")}
            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition"
          >
            <p className="text-sm font-medium text-gray-700">
              🍴 Cafeteria
            </p>
          </button>

          <button
            onClick={() => handleQuickSelect("administrative-block")}
            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition"
          >
            <p className="text-sm font-medium text-gray-700">
              🏛️ Administrative Block
            </p>
          </button>

          <button
            onClick={() => handleQuickSelect("c-block")}
            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition"
          >
            <p className="text-sm font-medium text-gray-700">
              🏢 C-Block
            </p>
          </button>

          <button
            onClick={() => handleQuickSelect("medical-centre")}
            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition"
          >
            <p className="text-sm font-medium text-gray-700">
              🏥 Medical Centre
            </p>
          </button>
        </div>

      </div>

      {/* Bottom */}
      <div className="mt-auto p-5 border-t border-gray-100">

        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm">
          ⚙️
          Settings
        </button>

      </div>

    </aside>
  );
}