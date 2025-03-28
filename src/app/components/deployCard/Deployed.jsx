import React from "react";

function AssignmentCard({
  unitCode,
  unitTitle,
  dueDate,
  courseTitle,
  fileName,
}) {
  return (
    <div className="container grid grid-cols-1 md:grid-cols-3 gap-6 z-0">
      <div className="bg-white shadow-md rounded-lg p-6 mb-4">
        <h3 className="text-lg font-bold text-gray-800">{courseTitle}</h3>
        <p className="text-gray-600">
          <span className="font-semibold">Unit Code:</span> {unitCode}
        </p>
        <p className="text-gray-600">
          <span className="font-semibold">Unit Title:</span> {unitTitle}
        </p>
        <p className="text-gray-600">
          <span className="font-semibold">Due Date:</span> {dueDate}
        </p>
        {fileName && (
          <p className="text-gray-600">
            <span className="font-semibold">Attached File:</span> {fileName}
          </p>
        )}
        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          View Assignment
        </button>
      </div>
    </div>
  );
}

export default AssignmentCard;
