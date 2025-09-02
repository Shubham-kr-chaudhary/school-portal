export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-6">School Portal</h1>
      <div className="space-x-6">
        <a href="/addSchool" className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
          ➕ Add School
        </a>
        <a href="/showSchools" className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700">
          📋 Show Schools
        </a>
      </div>
    </div>
  );
}
