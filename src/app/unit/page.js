"use client";
import Nav from "../components/nav/Nav";
import Profile from "../components/profile/Profile";
import DeployedAssignment from "../components/deployedAssign/DeployedAssignment";


export default function UnitPage() {
  
  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
    <Profile />
    <header className="bg-blue-500 text-white py-4 px-6">
      <h1 className="text-2xl font-bold mb-4">Assignments for Unit -unit-code</h1>
      <Nav />
    </header>
    <main className="flex-grow p-6">
    <DeployedAssignment unit="COM-1200" description={"This is some content for Unit."} />
     </main>
    </div>
  );
}