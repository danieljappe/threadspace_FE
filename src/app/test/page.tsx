export default function TestPage() {
  return (
    <div className="min-h-screen bg-red-500 p-8">
      <h1 className="text-4xl font-bold text-white mb-4">
        Tailwind CSS Test
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="text-gray-800">
          If you can see this styled content, Tailwind CSS is working!
        </p>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
          Test Button
        </button>
      </div>
    </div>
  );
}
