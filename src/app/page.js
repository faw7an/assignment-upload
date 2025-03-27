import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="home">
      <main>
        <div className="flex flex-col items-center justify-center h-screen space-y-6">
          {/* Header */}
          <h1 className="text-5xl font-bold">Welcome to MMARAU Rep-Students portal</h1>
          
          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4">
          <Link href="/sign-up">   
          <button className="w-35 px-4 py-2 bg-green-500 text-white rounded hover:bg-white hover:text-black">
          Register now
            </button>
            </Link>
            <Link href="/log-in">
            <button className="w-35 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Log In
            </button>
            </Link>
          </div>
        </div>sus
      </main>
      <footer></footer>
    </div>
  );
}