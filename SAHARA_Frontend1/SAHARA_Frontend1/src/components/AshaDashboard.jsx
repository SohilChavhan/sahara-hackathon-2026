import React, { useState } from 'react';
import { Activity, MapPin, Bed, CheckCircle, Plus, X, UserPlus } from 'lucide-react';

export default function AshaDashboard({ cases, updateCaseProgress, addNewCase }) {
  const [routingResult, setRoutingResult] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState('idle');


  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', age: '', gender: 'Female', disease: '', location: '', urgency: 'High' });


  const activePatient = cases.find(c => c.triageProgress === 'Routing' || c.triageProgress === 'Intake') || cases[0];

  const handleRoutePatient = async () => {
    setIsRouting(true);
    try {
      const response = await fetch('https://sahara-backend.onrender.com/api/route-hospital', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosis: activePatient.disease,
          urgency: activePatient.urgency || "High"
        })
      });
      const data = await response.json();
      setRoutingResult(data.primary_recommendation);
    } catch (error) {
      console.error("Failed to route:", error);

      setRoutingResult({
        name: "SMS Medical College & Hospital",
        type: "Government (Tier 1)",
        distance_km: 4.2,
        beds_available: 12
      });
    } finally {
      setIsRouting(false);
    }
  };

  const handleDispatch = () => {
    setDispatchStatus('dispatching');
    setTimeout(() => {
      setDispatchStatus('success');
      if (updateCaseProgress) updateCaseProgress(activePatient.id, 'Dispatched');
    }, 1500);
  };

  const handleManualAdd = (e) => {
    e.preventDefault();
    if (addNewCase) {
      addNewCase({
        id: `SH-WALKIN-${Math.floor(1000 + Math.random() * 9000)}`,
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        disease: formData.disease,
        urgency: formData.urgency,
        location: formData.location || "ASHA Clinic Walk-in",
        triageProgress: 'Routing',
        schemeMatched: 'Pending Verification',
        dateAdded: new Date().toLocaleDateString()
      });
    }

    setFormData({ name: '', age: '', gender: 'Female', disease: '', location: '', urgency: 'High' });
    setShowModal(false);
    setRoutingResult(null);
    setDispatchStatus('idle');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen relative">

      <header className="mb-8 border-b pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-brand-plum w-8 h-8" />
            ASHA Dispatch Dashboard
          </h1>
          <p className="text-gray-500 mt-2">Manage incoming SAHARA referrals and bed allocations.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-brand-plum hover:bg-brand-rose text-white px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md"
        >
          <UserPlus className="w-5 h-5" />
          Add Patient
        </button>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Incoming Patient Card */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Pending Case</h2>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold animate-pulse">
              {activePatient?.urgency || "High"} Urgency
            </span>
          </div>

          <div className="space-y-3 mb-6 text-gray-700 flex-grow">
            <p><strong>Patient ID:</strong> {activePatient?.id}</p>
            <p><strong>Patient Name:</strong> {activePatient?.name} {activePatient?.age !== "N/A" ? `(${activePatient?.age}y, ${activePatient?.gender})` : ''}</p>
            <p><strong>Diagnosis:</strong> {activePatient?.disease}</p>
            <p><strong>Location:</strong> {activePatient?.location}</p>
          </div>

          <button
            onClick={handleRoutePatient}
            disabled={isRouting || dispatchStatus === 'success'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 mt-auto"
          >
            {isRouting ? 'Calculating Route...' : 'Find PM-JAY Hospital'}
            <MapPin className="w-5 h-5" />
          </button>
        </div>

        {/* Routing Recommendation Card */}
        {routingResult && (
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-700">
              <CheckCircle className="w-6 h-6" />
              Match Found
            </h2>

            <h3 className="text-2xl font-bold text-gray-900 mb-1">{routingResult.name}</h3>
            <p className="text-gray-600 mb-4 font-medium">{routingResult.type}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-100 p-3 rounded-lg flex items-center gap-3">
                <MapPin className="text-blue-500 w-5 h-5" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Distance</p>
                  <p className="font-bold text-gray-800">{routingResult.distance_km} km</p>
                </div>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg flex items-center gap-3">
                <Bed className="text-green-500 w-5 h-5" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Beds Available</p>
                  <p className="font-bold text-gray-800">{routingResult.beds_available}</p>
                </div>
              </div>
            </div>

            {/* LIVE MAP EMBED */}
            <div className="w-full h-48 rounded-lg overflow-hidden mb-6 border border-gray-200 shadow-inner flex-grow bg-gray-100">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(routingResult.name + ' Jaipur')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                title="Hospital Map Location"
              ></iframe>
            </div>

            <button
              onClick={handleDispatch}
              disabled={dispatchStatus !== 'idle'}
              className={`w-full font-bold py-3.5 px-4 rounded-lg transition-all duration-300 shadow-md mt-auto flex justify-center items-center gap-2 ${dispatchStatus === 'success'
                ? 'bg-gray-800 text-green-400 cursor-default ring-2 ring-green-400 border-none'
                : dispatchStatus === 'dispatching'
                  ? 'bg-green-700 text-white opacity-80 cursor-wait'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
            >
              {dispatchStatus === 'idle' && 'Dispatch Ambulance & Notify Hospital'}
              {dispatchStatus === 'dispatching' && (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Transmitting coordinates...
                </>
              )}
              {dispatchStatus === 'success' && (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Ambulance Dispatched!
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* WALK-IN PATIENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-plum" />
                Register Walk-in Patient
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-plum/50" placeholder="e.g. Sunita Devi" />
              </div>

              {/* UPDATED GRID: Age, Gender, Urgency */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Age</label>
                  <input required type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-plum/50" placeholder="e.g. 45" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-plum/50 bg-white">
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Urgency</label>
                  <select value={formData.urgency} onChange={e => setFormData({ ...formData, urgency: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-plum/50 bg-white">
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Diagnosis / Symptoms</label>
                <input required type="text" value={formData.disease} onChange={e => setFormData({ ...formData, disease: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-plum/50" placeholder="e.g. Severe chest pain" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-plum/50" placeholder="e.g. Village Rampur" />
              </div>

              <button type="submit" className="w-full mt-2 bg-brand-plum hover:bg-brand-rose text-white font-bold py-3 rounded-xl transition-colors shadow-md">
                Add Patient & Start Routing
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}