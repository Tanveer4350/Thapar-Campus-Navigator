import { useEffect, useState } from "react";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import CampusMap from "./components/map/CampusMap";
import FacultyDirectory from "./components/faculty/FacultyDirectory";

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [facultyDirectoryOpen, setFacultyDirectoryOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("campus-navigator.dark-mode") === "true"
  );

  useEffect(() => {
    localStorage.setItem("campus-navigator.dark-mode", String(darkMode));
  }, [darkMode]);

  const handleFacultySelect = (faculty = null) => {
    setSelectedFaculty(faculty);
    setFacultyDirectoryOpen(true);
  };

  const handleHomeSelect = () => {
    setFacultyDirectoryOpen(false);
    setSelectedFaculty(null);
    setSelectedLocation(null);
  };

  return (
    <div className={`h-screen w-screen overflow-hidden bg-gray-100${darkMode ? " dark-theme" : ""}`}>

      <Navbar
        onLocationSelect={setSelectedLocation}
        onFacultySelect={handleFacultySelect}
      />

      <div className="flex h-[calc(100vh-64px)]">

        <Sidebar
          onLocationSelect={setSelectedLocation}
          onFacultySelect={() => handleFacultySelect()}
          onHomeSelect={handleHomeSelect}
          darkMode={darkMode}
          onDarkModeChange={setDarkMode}
        />

        <main className="flex-1 relative h-full">
          <CampusMap
            selectedLocation={selectedLocation}
            onLocationSelect={setSelectedLocation}
          />
          {facultyDirectoryOpen && (
            <FacultyDirectory
              selectedFaculty={selectedFaculty}
              onClose={() => {
                setFacultyDirectoryOpen(false);
                setSelectedFaculty(null);
              }}
            />
          )}
        </main>

      </div>

    </div>
  );
}

export default App;