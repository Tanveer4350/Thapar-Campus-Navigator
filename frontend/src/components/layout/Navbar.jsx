import SearchBar from "../search/SearchBar";

export default function Navbar({ onLocationSelect }) {
  return (
    <header className="h-16 w-full bg-white border-b border-gray-200 flex items-center px-5 z-50 relative">

      {/* Logo */}
      <div className="flex items-center gap-3 min-w-[250px]">

        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl">
          🧭
        </div>

        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">
            Thapar Wayfinder
          </h1>

          <p className="text-xs text-gray-500">
            Campus Navigation
          </p>
        </div>

      </div>

      {/* Search */}
      <div className="flex-1 flex justify-center">
        <SearchBar
          onLocationSelect={onLocationSelect}
        />
      </div>

      {/* Right Side */}
      <div className="min-w-[250px] flex justify-end items-center gap-3">

        <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition">
          Help
        </button>

        <button
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center"
          title="Menu"
        >
          ☰
        </button>

      </div>

    </header>
  );
}