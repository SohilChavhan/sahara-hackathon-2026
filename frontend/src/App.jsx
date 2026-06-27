import React, { useState, useEffect } from 'react';

const App = () => {
  const [view, setView] = useState('landing');
  const [ashaData, setAshaData] = useState(null);
  const [civilianData, setCivilianData] = useState(null);

  useEffect(() => {
    if (view === 'asha') {
      fetch('http://localhost:5000/api/asha/dashboard')
        .then(res => res.json())
        .then(data => setCases(data.patients));
    } else if (view === 'civilian') {
      fetch('http://localhost:5000/api/civilian/dashboard/P001')
        .then(res => res.json())
        .then(data => setCivilianData(data));
    }
  }, [view]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-blue-700 tracking-tight">SAHARA</h1>
        <p className="text-gray-500 mt-2">Scheme-Aware Health Access & Relief Assistant</p>

        <div className="mt-6 space-x-4">
          <button onClick={() => setView('asha')}
            className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">
            ASHA Dashboard
          </button>
          <button onClick={() => setView('civilian')}
            className="px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700">
            Civilian Portal
          </button>
        </div>
      </header>

      {view === 'asha' && ashaData && (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
          <h2 className="text-2xl font-semibold mb-4">Field Command Center: {ashaData.village}</h2>
          <p className="mb-6 text-gray-600">Logged in as: {ashaData.asha_name}</p>

          <div className="grid gap-4">
            {ashaData.patients.map(patient => (
              <div key={patient.id} className="border p-4 rounded bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{patient.name} <span
                    className="text-sm font-normal text-gray-500">({patient.id})</span></h3>
                  <p className="text-sm text-gray-700">Condition: {patient.condition}</p>
                  <p className="text-sm mt-1">
                    Status: <span className={`font-semibold ${patient.status === 'Action Required' ? 'text-red-500'
                      : 'text-green-500'}`}>{patient.status}</span>
                  </p>
                  {patient.missing_docs.length > 0 && (
                    <p className="text-sm text-red-600 mt-1">⚠️ Missing: {patient.missing_docs.join(', ')}</p>
                  )}
                </div>
                <div>
                  <button className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
                    Trigger Escalation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'civilian' && civilianData && (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Welcome, {civilianData.patient_name}</h2>
            <button
              className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
              <span>▶️ Listen to Instructions</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <h3 className="font-bold mb-3 text-yellow-800">Your "Plastic Folder"</h3>
              <ul className="space-y-2">
                {Object.entries(civilianData.plastic_folder).map(([doc, status]) => (
                  <li key={doc} className="flex justify-between text-sm bg-white p-2 rounded shadow-sm">
                    <span>{doc}</span>
                    <span className={status.includes('Verified') ? 'text-green-600 font-bold'
                      : 'text-red-600 font-bold'}>
                      {status.includes('Verified') ? '✓ Ready' : '✗ Needs Update'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h3 className="font-bold mb-3 text-blue-800">Hospital Journey</h3>
              <p className="text-sm mb-1"><strong>Destination:</strong> {civilianData.routing.hospital_name}</p>
              <p className="text-sm mb-1"><strong>Distance:</strong> {civilianData.routing.distance_km} km</p>
              <p className="text-sm mb-1"><strong>Ayushman Desk:</strong> {civilianData.routing.ayushman_desk_active ?
                '✅ Active & Alerted' : '❌ Inactive'}</p>
              <p className="text-sm font-semibold text-green-700 mt-2">💰 {civilianData.routing.travel_reimbursement}
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-100 rounded text-center border border-gray-200">
            <h3 className="text-sm font-bold text-gray-600 mb-2">Hear from a survivor in your district:</h3>
            <button className="px-6 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-900">
              ▶️ Play Survivor Message (20s)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
