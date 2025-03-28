"use client";
import React, { useState } from "react";
import Modal from "../modal/Modal";

function CreateUnit({ isOpen, onClose, token }) {
  const [formData, setFormData] = useState({
    unitId: "",
    code: "",
    name: "",
    description: "",
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
      unitId: formData.unitId,
      code: formData.code,
      name: formData.name,
      description: formData.description,
    };

    try {
      const response = await fetch("/api/dashboard/units/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Use the token passed as a prop
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess("Unit created successfully!");
        setError(null);
        console.log("Unit created successfully:", data);
        setFormData({
          unitId: "",
          code: "",
          name: "",
          description: "",
        });

        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 1200);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create unit.");
        setSuccess(null);
        console.error("Failed to create unit:", errorData);
      }
    } catch (error) {
      setError("An error occurred while creating the unit.");
      setSuccess(null);
      console.error("Error creating unit:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4 text-gray-700">Create New Unit</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <form onSubmit={handleFormSubmit}>
        {/* Unit ID */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Unit ID</label>
          <input
            type="text"
            name="unitId"
            value={formData.unitId}
            onChange={handleInputChange}
            className="w-full text-gray-700 border border-gray-300 rounded px-3 py-2"
            placeholder="Enter Unit ID"
            required
          />
        </div>

        {/* Code */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Code</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            className="w-full text-gray-700 border border-gray-300 rounded px-3 py-2"
            placeholder="Enter Unit Code (e.g., CS101)"
            required
          />
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full text-gray-700 border border-gray-300 rounded px-3 py-2"
            placeholder="Enter Unit Name"
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
            placeholder="Enter Unit Description"
            rows="4"
            required
          ></textarea>
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
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Create Unit
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateUnit;