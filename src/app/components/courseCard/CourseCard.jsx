"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Change from next/router to next/navigation

export default function Course({ courseId, courseCode, courseTitle, description, onCourseDeleted }) {
  const [token, setToken] = useState(null);
  const router = useRouter();

  const handleCourseClick = () => {
    router.push(`/unitList?courseId=${courseId}`);
  };

  useEffect(() => {
    const storeToken = localStorage.getItem("authToken");
    setToken(storeToken);
  }, []);

  const deleteCourse = async () => {
    if (!token) {
      console.error("No token found. Cannot delete course.");
      return;
    }

    try {
      await axios.delete(`/api/dashboard/courses/${courseId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Course deleted successfully");

      // Notify parent component to remove the course from the list
      if (onCourseDeleted) {
        onCourseDeleted(courseId);
      }
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  return (
    <div className="max-w-[450px] bg-white shadow-md rounded-lg p-4 mb-4">
      <h3 className="text-lg font-bold text-gray-400">{courseCode}</h3>
      <h2 className="text-xl font-bold text-blue-400">{courseTitle}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex gap-3">
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleCourseClick}
        >
          View Details
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={deleteCourse}
        >
          Delete Course
        </button>
      </div>
    </div>
  );
}