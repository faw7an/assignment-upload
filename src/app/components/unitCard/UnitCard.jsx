"use client";
import { React, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

function UnitCard({
  unitId,
  unitCode,
  unitName,
  unitDescription,
  token,
  onUnitDelete,
}) {
  const router = useRouter();

  const handleUnitClick = () => {
    router.push(`/assignmentList?unitId=${unitId}`);
  };

  const deleteUnit = async () => {
    if (!token) {
      console.log("Failed to delete unit no token found.");
      return;
    }

    try {
      const response = await axios.delete(`/api/dashboard/units/${unitId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Unit deleted successfully");

      if (onUnitDelete) {
        onUnitDelete(unitId);
      }
    } catch (error) {
      console.error("Failed to delete unit,", error);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-[450px] bg-white shadow-md rounded-lg p-4 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-400">{unitCode}</h3>
        <p className="text-lg sm:text-xl font-bold text-blue-400">{unitName}</p>
        <p className="text-sm sm:text-base text-gray-600 mb-4 flex-grow">{unitDescription}</p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-auto">
          <button 
            className="w-full sm:w-auto bg-blue-500 text-white px-3 py-2 text-sm sm:text-base rounded hover:bg-blue-600 transition-colors"
            onClick={handleUnitClick}
          >
            View Unit
          </button>
          <button
            className="w-full sm:w-auto bg-red-600 text-white px-3 py-2 text-sm sm:text-base rounded hover:bg-red-700 transition-colors"
            onClick={deleteUnit}
          >
            Delete Unit
          </button>
        </div>
      </div>
    </div>
  );
}

export default UnitCard;
