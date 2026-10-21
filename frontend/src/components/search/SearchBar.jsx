import { useState } from "react";
import { campusLocations } from "../../data/locations";
import { facultyMembers } from "../../data/faculty";

export default function SearchBar({ onLocationSelect, onFacultySelect }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredLocations = campusLocations.filter((location) =>
    location.name.toLowerCase().includes(normalizedQuery)
  );
  const filteredFaculty = facultyMembers
    .filter((member) =>
      [member.name, member.designation, member.email, member.office, member.floor]
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    )
    .slice(0, 6);

  const handleSelect = (location) => {
    onLocationSelect(location);
    setQuery("");
  };

  const handleFacultySelect = (faculty) => {
    onFacultySelect(faculty);
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
      {normalizedQuery && (
        <div className="absolute top-14 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">

          {filteredLocations.length > 0 || filteredFaculty.length > 0 ? (
            <>
              {filteredFaculty.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">
                    Faculty
                  </div>
                  {filteredFaculty.map((faculty) => (
                    <button
                      key={`faculty-${faculty.id}`}
                      type="button"
                      onClick={() => handleFacultySelect(faculty)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-blue-50"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700">
                        {faculty.name
                          .split(" ")
                          .filter((part) => !["Dr.", "Mr.", "Ms."].includes(part))
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-gray-800">
                          {faculty.name}
                        </span>
                        <span className="block truncate text-xs text-gray-500">
                          {faculty.designation} · Office {faculty.office}
                        </span>
                      </span>
                    </button>
                  ))}
                </>
              )}

              {filteredLocations.length > 0 && (
                <>
                  <div className="border-t border-gray-100 px-4 py-2 text-xs font-semibold text-gray-400 uppercase">
                    Campus locations
                  </div>
                  {filteredLocations.map((location) => (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => handleSelect(location)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50"
                    >
                      <span className="text-xl">
                        {location.type === "building"
                          ? "🏢"
                          : location.type === "department"
                          ? "🏫"
                          : "📍"}
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-gray-800">
                          {location.name}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {location.category}
                        </span>
                      </span>
                    </button>
                  ))}
                </>
              )}

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