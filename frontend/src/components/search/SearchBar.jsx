import { useState } from "react";
import { campusLocations } from "../../data/locations";

export default function SearchBar({ onLocationSelect }) {
  const [query, setQuery] = useState("");

  const filteredLocations = campusLocations.filter((location) =>
    location.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (location) => {
    onLocationSelect(location);
    setQuery("");
  };

  return (
    <div className="relative w-full max-w-xl">

      {/* Search Input */}
      <div className="flex items-center bg-gray-100 border border-gray-200 rounded-xl px-4 h-11 focus-within:bg-white focus-within:border-blue-500 transition">

        <span className="text-gray-400 text-lg mr-3">
          🔍
        </span>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search buildings, faculty, departments..."
          className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
        />

        <kbd className="hidden sm:block text-xs text-gray-400 bg-white border border-gray-200 rounded px-2 py-1">
          /
        </kbd>

      </div>

      {/* Results */}
      {query && (
        <div className="absolute top-14 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">

          {filteredLocations.length > 0 ? (
            <>
              <div className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase">
                Results
              </div>

              {filteredLocations.map((location) => (

                <button
                  key={location.id}
                  onClick={() => handleSelect(location)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition"
                >

                  <span className="text-xl">
                    {location.type === "building"
                      ? "🏢"
                      : location.type === "department"
                      ? "🏫"
                      : "📍"}
                  </span>

                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {location.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {location.category}
                    </p>
                  </div>

                </button>

              ))}

            </>
          ) : (

            <div className="px-4 py-6 text-center">

              <p className="text-sm font-medium text-gray-700">
                No results found
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Try searching for a building, department or facility
              </p>

            </div>

          )}

        </div>
      )}

    </div>
  );
}