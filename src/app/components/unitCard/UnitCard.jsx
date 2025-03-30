"use client";
import { React, useState, useEffect } from "react";
import axios from "axios";

function UnitCard({
  unitId,
  unitCode,
  unitName,
  unitDescription,
  token,
  onUnitDelete,
}) {
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
    <div className="container grid grid-cols-1 md:grid-cols-3 gap-6 z-0">
      <div className="bg-white min-w-[400px] shadow-md rounded-lg p-6 mb-4">
        {/* <h3 className="text-lg font-bold text-gray-800">{courseTitle}</h3> */}

        <h3 className="text-lg font-bold text-gray-400">{unitCode}</h3>
        <p className="text-xl font-bold text-blue-400">{unitName}</p>
        <p className="text-gray-600 mb-4">{unitDescription}</p>
        <div>
          <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            View Unit
          </button>
          <button
            className="bg-red-600 mx-4 text-white px-4 py-2 rounded hover:bg-red-700"
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
