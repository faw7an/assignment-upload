"use client"
import { useRef, useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setFile(event.dataTransfer.files[0]);
  };

  const removeUpload = (event)=>{
    setFile(null);
    if(fileInputRef.current){
      fileInputRef.current.value="";
    }
  };
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100"
    onDrop={handleDrop}
    onDragOver={handleDragOver}>
      <div
        className="w-full max-w-lg bg-white p-6 rounded shadow-md"
        
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Upload File</h2>
        <div className="border-2 border-dashed border-gray-300 p-6 rounded flex flex-col items-center justify-center space-y-4">
          <p className="text-gray-600">Drag and drop your file here</p>
          <p className="text-gray-500">or</p>
          <label
            htmlFor="file-upload"
            className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
          >
            Browse Files
          </label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </div>
        {file && (
          <div className="mt-4 text-center">
            <p className="text-gray-700">Selected File:</p>
            <p className="text-gray-900 font-medium">{file.name}</p>
          </div>
        )}
        <button className="px-4 py-2 bg-red-600 rounded m-2" onClick={removeUpload}>Remove upload</button>
        <button className="px-4 py-2 bg-blue-500 rounded m-2">Submit assignment</button>
      </div>
    </div>
  );
}