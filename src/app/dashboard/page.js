export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-blue-500 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </header>
      <main className="flex-grow p-6">
        <h1 className="text-4xl text-gray-600 mb-3">Hello, John Doe</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Unit 1 */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold">Unit 1</h2>
            <p className="text-gray-600">This is some content for Unit 1.</p>
          </div>
          {/* Unit 2 */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold">Unit 2</h2>
            <p className="text-gray-600">This is some content for Unit 2.</p>
          </div>
          {/* Unit 3 */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold">Unit 3</h2>
            <p className="text-gray-600">This is some content for Unit 3.</p>
          </div>
        </div>
      </main>
      <footer className="bg-gray-200 text-center py-4">
        <p className="text-gray-600">© 2025 Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
}