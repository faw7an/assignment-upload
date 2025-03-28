import Nav from "../components/nav/Nav";
import Profile from "../components/profile/Profile";
import Assignment from "../components/task/Task";

export default function assignment() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
    <Profile />
      <header className="bg-blue-500 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <Nav />
      </header>
      <main className="flex-grow p-6">
        <Assignment unit="COM-1200" description={"This is some content for Unit."}/>
        
        </main>
    </div>
  );
}
