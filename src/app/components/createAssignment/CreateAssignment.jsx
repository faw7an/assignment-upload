"use client";
import React from "react";
import Modal from "../modal/Modal";

function CreateAssignment({ isOpen, onClose }) {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Assignment created!");
    onClose(); // Close the modal after submission
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4 text-gray-700">
        Create New Assignment
      </h2>
      <form onSubmit={handleFormSubmit}>
        {/* Unit Code */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Unit Code
          </label>
          <input
            type="text"
            className="w-full text-gray-700 border border-gray-300 rounded px-3 py-2"
            placeholder="Enter Unit Code"
            required
          />
        </div>

        {/* Unit Title */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Unit Title
          </label>
          <input
            type="text"
            className="w-full border text-gray-700 border-gray-300 rounded px-3 py-2"
            placeholder="Enter Unit Title"
            required
          />
        </div>

        {/* Due Date */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Due Date
          </label>
          <input
            type="date"
            className="w-full text-gray-600 border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        {/* Course Title (Dropdown) */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Course Title
          </label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option className="text-gray-700" value="">
              Select Course
            </option>
            <option className="text-gray-700" value="Computer Science">
              Computer Science
            </option>
            <option className="text-gray-700" value="Information Technology">
              Information Technology
            </option>
            <option className="text-gray-700" value="Software Engineering">
              Software Engineering
            </option>
          </select>
        </div>

        {/* Attach Assignment File */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Attach Assignment File
          </label>
          <input
            type="file"
            className="w-full border border-gray-300 rounded px-3 py-2"
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