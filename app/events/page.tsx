import { getEvents } from '../actions/events';

export default async function EventsPage() {
  const result = await getEvents();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Events</h1>

      {!result.success ? (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <p className="font-semibold">Error:</p>
          <p>{result.error}</p>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded">
          <p className="font-semibold mb-2">Events Data (JSON):</p>
          <pre className="overflow-auto text-sm">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
