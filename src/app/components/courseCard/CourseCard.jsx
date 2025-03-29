"use client";

export default function Course({ courseId, courseCode, courseTitle, description }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-xl font-bold text-gray-800">{courseTitle}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        View Details
      </button>
    </div>
  );
}