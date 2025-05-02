"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../components/nav/Nav";
import Profile from "../components/profile/Profile";
import UnitCard from "../components/unitCard/UnitCard";
import CreateUnit from "../components/createUnit/CreateUnit";

function UnitList() {
  const [isCreateUnitOpen, setIsCreateUnitOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [units, setUnits] = useState([]);
  const handleOpenCreateUnit = () => setIsCreateUnitOpen(true);
  const handleCloseCreateUnit = () => setIsCreateUnitOpen(false);
  const [newUnit, setNewUnit] = useState(null);

  const handleDeleteUnit = (unitId) => {
    setUnits((prevUnits) => prevUnits.filter((unit) => unit.id !== unitId));
  };

  const handleCreateUnit = (unit) => {
    setNewUnit(unit);
  };

  useEffect(() => {
    const storeToken = localStorage.getItem("authToken");
    setToken(storeToken);

    const params = new URLSearchParams(window.location.search);
    const courseId = params.get("courseId");
    if (!courseId) {
      throw new Error("Course ID is required in the URL parameters.");
    }

    const fetchUnit = async () => {
      try {
        const response = await axios.get(
          `/api/dashboard/units?courseId=${courseId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${storeToken}`,
            },
          }
        );
        setUnits(response.data.units);
      } catch (error) {
        console.error("Error fetching units", error);
      }
    };
    fetchUnit();
  }, []);

  useEffect(() => {
    // Only update units if newUnit exists
    if (!isCreateUnitOpen && newUnit ) {
      setUnits((prevUnits) => [newUnit, ...prevUnits]);
      setNewUnit(null);
    }
  }, [isCreateUnitOpen ,newUnit ]);

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
      <Profile />
      <header className="bg-blue-500 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Units</h1>
        <Nav />
      </header>
      <main className="flex-grow p-4 md:p-6 container mx-auto">
        <div className="w-full max-w-[1400px] mx-auto">
          {units.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {units.map((unit) => {
                return (
                  <UnitCard
                    key={unit.id}
                    unitId={unit.id}
                    unitCode={unit.code}
                    unitName={unit.name}
                    unitDescription={unit.description}
                    token={token}
                    onUnitDelete={handleDeleteUnit}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-black">No units in this course yet.</p>
          )}
        </div>
        {/* Add Unit Button */}
        <div className="mt-6 w-full max-w-[1400px] mx-auto">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
            onClick={handleOpenCreateUnit}
          >
            Add Unit
          </button>
        </div>
      </main>
      <footer className="bg-gray-200 text-center py-4">
        <p className="text-gray-600">© 2025 Dashboard. All rights reserved.</p>
      </footer>

      {/* Create Unit Modal */}
      <CreateUnit
        isOpen={isCreateUnitOpen}
        onClose={handleCloseCreateUnit}
        onUnitCreated={handleCreateUnit}
        token={token} // Pass the token fetched from local storage
      />
    </div>
  );
}

export default UnitList;