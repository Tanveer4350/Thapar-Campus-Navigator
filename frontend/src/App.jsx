import { useState } from "react";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import CampusMap from "./components/map/CampusMap";

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100">

      <Navbar
        onLocationSelect={setSelectedLocation}
      />

      <div className="flex h-[calc(100vh-64px)]">

        <Sidebar onLocationSelect={setSelectedLocation} />

        <main className="flex-1 relative h-full">
          <CampusMap
            selectedLocation={selectedLocation}
            onLocationSelect={setSelectedLocation}
          />
        </main>

      </div>

    </div>
  );
}

export default App;