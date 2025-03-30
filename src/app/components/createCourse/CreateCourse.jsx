"use client";
import React, { useState } from "react";
import Modal from "../modal/Modal";
import axios from "axios";

function CreateCourse({ isOpen, onClose, token, onCourseCreated }) {
  const [formData, setFormData] = useState({
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

    // Prepare request body
    const requestBody = {
      code: formData.code,
      name: formData.name,
      description: formData.description,
    };

    try {
      const response = await axios.post("/api/dashboard/courses", requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess("Course created successfully");
      setError(null);
      console.log("Course created successfully");

      // Notify parent component about the new course
      if (onCourseCreated) {
        onCourseCreated(response.data.course); // Assuming the API returns the created course
      }

      // Reset form data
      setFormData({
        code: "",
        name: "",
        description: "",
      });

      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1200);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "Failed to create course");
        console.log("Failed to create course");
      } else {
        setError("An error occurred while creating the course");
        console.error("Error creating course");
      }
      setSuccess(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4 text-gray-700">Create New Course</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <form onSubmit={handleFormSubmit}>
        {/* Code */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Code</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            className="w-full text-gray-700 border border-gray-300 rounded px-3 py-2"
            placeholder="Enter Course Code"
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
            placeholder="Enter Course Name"
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
            placeholder="Enter Course Description"
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
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Course
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateCourse;