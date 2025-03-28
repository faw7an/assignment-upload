import React from "react";
import Link from "next/link";

function DeployedAssignment({ unit, description }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 z-0">
      {/* Unit 1 */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold">{unit}</h2>
        <p className="text-gray-600">{description}</p>
        <Link href={"/upload"}>
          <button className="rounded bg-blue-600 p-1 m-2">
            Monitor submissions
          </button>
        </Link>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold">{unit}</h2>
        <p className="text-gray-600">{description}</p>
        <Link href={"/upload"}>
          <button className="rounded bg-blue-600 p-1 m-2">
            Monitor submissions
          </button>
        </Link>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold">{unit}</h2>
        <p className="text-gray-600">{description}</p>
        <Link href={"/upload"}>
          <button className="rounded bg-blue-600 p-1 m-2">
            Monitor submissions
          </button>
        </Link>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold">{unit}</h2>
        <p className="text-gray-600">{description}</p>
        <Link href={"/upload"}>
          <button className="rounded bg-blue-600 p-1 m-2">
            Monitor submissions
          </button>
        </Link>
      </div>
    </div>
  );
}

export default DeployedAssignment;
