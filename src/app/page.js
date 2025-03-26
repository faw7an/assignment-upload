import Image from "next/image";
export default function Home() {
  return (
    <div>
      <main>
        <div className="flex flex-col items-center justify-center h-screen space-y-6">
          {/* Header */}
          <h1 className="text-5xl font-bold">Welcome to MMARAU Rep-Students portal</h1>
          
          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Register now
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Log In
            </button>
          </div>
        </div>
      </main>
      <footer></footer>
    </div>
  );
}