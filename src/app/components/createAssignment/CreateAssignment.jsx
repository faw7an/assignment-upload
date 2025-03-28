"use client";
import React, { useState } from "react";
import Modal from "../modal/Modal";

function CreateAssignment({ isOpen, onClose, token }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    unitId: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Prepare the request body
    const requestBody = {
      title: formData.title,
      description: formData.description,
      unitId: formData.unitId,
      dueDate: formData.dueDate,
    };

    try {
      const response = await fetch("/api/dashboard/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkNWU2ZWVjOC0wYzAxLTExZjAtYWNmNi04NjNmOTY1MDQ3NGYiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NDMxOTAzNjksImV4cCI6MTc0MzE5Mzk2OX0.NkFPItci7NtRrx6UM36L0IKAqI7BXoUG_4Lwt1lEfbo`, // Use the token passed as a prop
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess("Assignment created successfully!");
        setError(null);
        console.log("Assignment created successfully:", data);
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          unitId: "",
        });
        

        setTimeout(() => {
          onClose(); 
          setSuccess(null);
        }, 1200); 
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create assignment.");
        setSuccess(null);
        console.error("Failed to create assignment:", errorData);
      }
    } catch (error) {
      setError("An error occurred while creating the assignment.");
      setSuccess(null);
      console.error("Error creating assignment:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4 text-gray-700">
        Create New Assignment
      </h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <form onSubmit={handleFormSubmit}>
        {/* Unit ID */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Unit ID
          </label>
          <input
            type="number"
            name="unitId"
            value={formData.unitId}
            onChange={handleInputChange}
            className="w-full text-gray-700 border border-gray-300 rounded px-3 py-2"
            placeholder="Enter Unit ID"
            required
          />
        </div>
        {/* Title */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full text-gray-700 border border-gray-300 rounded px-3 py-2"
            placeholder="Enter Assignment Title"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full text-gray-700 border border-gray-300 rounded px-3 py-2"
            placeholder="Enter Assignment Description"
            rows="4"
            required
          ></textarea>
        </div>

        {/* Due Date */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Due Date
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            className="w-full text-gray-600 border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            onClick={onClose} // Close the modal
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Assignment
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateAssignment;
