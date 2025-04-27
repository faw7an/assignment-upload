import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

function DeployedAssignment({ id, unit, title, description, dueDate, onAssignmentDeleted }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storeToken = localStorage.getItem("authToken");
    setToken(storeToken);
  }, []);

  const deleteAssignment = async () => {
    if (!token) {
      console.error("No token found. Cannot delete assignment.");
      return;
    }

    try {
      await axios.delete(`/api/dashboard/assignments/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Assignment deleted successfully");

      // Notify parent component to remove the assignment from the list
      if (onAssignmentDeleted) {
        onAssignmentDeleted(id);
      }
    } catch (error) {
      console.error("Failed to delete assignment:", error);
    }
  };

  return (  
    <div className="bg-white p-4 rounded shadow ">
      <h2 className="text-lg text-gray-500 font-bold">{title}</h2>
      <h3 className="text-md text-gray-600">{unit}</h3>
      <p className="text-gray-600">{description}</p>
      {dueDate && (
        <p className="text-sm text-gray-500">Due: {new Date(dueDate).toLocaleDateString()}</p>
      )}
      <div className="flex mt-3">
        <Link href={"#"}>
          <button className="rounded bg-blue-600 text-white px-3 py-1 mr-2">
            Monitor submissions
          </button>
        </Link>
        <button 
          className="rounded bg-red-600 text-white px-3 py-1"
          onClick={deleteAssignment}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default DeployedAssignment;
