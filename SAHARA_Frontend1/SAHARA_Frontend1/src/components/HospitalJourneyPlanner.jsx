import React, { useState } from 'react'
import { Search, Compass, AlertCircle, CheckCircle2, Navigation, Send, ArrowRight, ShieldCheck } from 'lucide-react'

export default function HospitalJourneyPlanner({ cases, updateCaseProgress }) {
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOncology, setFilterOncology] = useState(false)
  const [filterMitra, setFilterMitra] = useState(false)
  const [notifiedHospitals, setNotifiedHospitals] = useState({})

  const activeCase = cases.find(c => c.id === selectedCaseId)

  const hospitals = [
    {
      id: 'HOSP-01',
      name: 'Jaipur Oncology & Cancer Research Institute',
      city: 'Jaipur, Rajasthan',
      distance: '185 km',
      specialty: 'Oncology (Chemo, Radiation, Surgical)',
      ayushmanDesk: true,
      mitraName: 'Ayushman Mitra (Shri Manoj Sharma)',
      bedsAvailable: 14,
      opdSlots: 'Available (10:00 AM - 4:00 PM)'
    },
    {
      id: 'HOSP-02',
      name: 'Churu District Sub-Divisional Hospital',
      city: 'Churu, Rajasthan',
      distance: '12 km',
      specialty: 'General Medicine, Basic Diagnostics',
      ayushmanDesk: true,
      mitraName: 'Ayushman Mitra (Shri Rajesh Saini)',
      bedsAvailable: 8,
      opdSlots: 'OPD Busy'
    },
    {
      id: 'HOSP-03',
      name: 'Bikaner Comprehensive Medical College',
      city: 'Bikaner, Rajasthan',
      distance: '160 km',
      specialty: 'Cardiovascular, Orthopedics, General Surgery',
      ayushmanDesk: true,
      mitraName: 'Ayushman Mitra (Smt. Rekha Vyas)',
      bedsAvailable: 3,
      opdSlots: 'Available (9:00 AM - 2:00 PM)'
    },
    {
      id: 'HOSP-04',
      name: 'Sanjeevani Specialty Hospital',
      city: 'Jaipur, Rajasthan',
      distance: '190 km',
      specialty: 'Oncology & Cardiology',
      ayushmanDesk: false,
      mitraName: 'No active Ayushman desk',
      bedsAvailable: 0,
      opdSlots: 'No OPD Slots'
    }
  ]

  const handlePreNotify = (hospId) => {
    setNotifiedHospitals(prev => ({
      ...prev,
      [hospId]: true
    }))
    alert(`Pre-referral Notification transmitted to Ayushman Mitra desk at ${hospitals.find(h => h.id === hospId).name}. The patient's document checklist is pre-loaded on their screen for instant verification upon arrival.`);
    if (activeCase) {
      updateCaseProgress(activeCase.id, 'Routing')
    }
  }

  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesOncology = filterOncology ? h.specialty.includes('Oncology') : true
    const matchesMitra = filterMitra ? h.ayushmanDesk : true
    return matchesSearch && matchesOncology && matchesMitra
  })

  const getJourneyDetails = () => {
    if (!activeCase) return null

    const isJaipur = filteredHospitals[0]?.city.includes('Jaipur')
    if (isJaipur) {
      return {
        origin: activeCase.location,
        destination: "Jaipur, Rajasthan",
        distance: "185 km",
        duration: "3 hrs 45 mins (via State Bus)",
        route: "Churu -> Sikar -> Jaipur (National Highway 52)",
        fare: "₹240 (RSRTC Express Bus)",
        reimbursement: "Eligible (100% covered under PM-JAY travel allowance since distance > 50km for critical therapies)"
      }
    } else {
      return {
        origin: activeCase.location,
        destination: "Bikaner, Rajasthan",
        distance: "160 km",
        duration: "3 hrs 15 mins (via NW Train)",
        route: "Churu Jn -> Bikaner Jn (Express Train)",
        fare: "₹120 (Sleeper Class)",
        reimbursement: "Eligible (100% reimbursement via Chiranjeevi travel coupon)"
      }
    }
  }

  const journey = getJourneyDetails()

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto py-4 flex flex-col gap-6">

      <div className="border-b border-brand-plum/10 pb-4">
        <h3 className="text-2xl font-black text-brand-plum">Hospital Finder & Journey Planner</h3>
        <p className="text-sm text-brand-plum/60 mt-1">Route cases to oncology specialties with active Ayushman Mitra desks and claim travel reimbursement.</p>
      </div>

      <div className="glass-card rounded-2xl p-5 border border-white/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Compass className="w-6 h-6 text-brand-blue" />
          <div>
            <h4 className="font-bold text-brand-plum text-sm">Select Active Patient Case</h4>
            <p className="text-[10px] text-brand-plum/50">Load diagnostic filters based on patient case file</p>
          </div>
        </div>

        <select
          value={selectedCaseId}
          onChange={(e) => setSelectedCaseId(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-brand-plum/10 bg-white/60 text-xs font-semibold text-brand-plum focus:outline-none focus:ring-1 focus:ring-brand-plum w-full sm:w-auto"
        >
          <option value="" disabled>Choose Patient...</option>
          {cases.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.id} - {c.disease})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-card rounded-3xl p-6 border border-white/40 flex flex-col gap-4 shadow-lg">
            <h4 className="font-bold text-brand-plum text-sm">Hospital Availability Search</h4>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-plum/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by hospital name or city..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-plum/10 bg-white/50 text-xs focus:outline-none focus:ring-1 focus:ring-brand-plum"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] font-bold text-brand-plum">
                  <input
                    type="checkbox"
                    checked={filterOncology}
                    onChange={(e) => setFilterOncology(e.target.checked)}
                    className="rounded border-brand-plum/10 text-brand-plum focus:ring-0 w-3.5 h-3.5"
                  />
                  Oncology Specialty
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] font-bold text-brand-plum">
                  <input
                    type="checkbox"
                    checked={filterMitra}
                    onChange={(e) => setFilterMitra(e.target.checked)}
                    className="rounded border-brand-plum/10 text-brand-plum focus:ring-0 w-3.5 h-3.5"
                  />
                  Ayushman Mitra Desk
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {filteredHospitals.map(h => (
                <div key={h.id} className="p-4 rounded-2xl bg-white/40 border border-brand-plum/5 hover:border-brand-plum/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-brand-plum text-sm">{h.name}</h5>
                      <span className="text-[10px] text-brand-plum/50 font-semibold">• {h.city}</span>
                    </div>
                    <p className="text-xs text-brand-plum/70 font-medium mt-1">Specialty: {h.specialty}</p>

                    <div className="flex flex-wrap gap-2.5 mt-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-bold ${h.ayushmanDesk ? 'bg-emerald-500/10 text-emerald-600' : 'bg-brand-rose/10 text-brand-rose'
                        }`}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {h.mitraName}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-bold bg-brand-blue/10 text-brand-blue">
                        Beds: {h.bedsAvailable} Slots
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-bold bg-brand-light-pink/40 text-brand-plum/70">
                        {h.opdSlots}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col justify-end items-end gap-2 shrink-0">
                    <span className="text-xs text-brand-plum/60 font-bold sm:mb-2">{h.distance} Away</span>
                    <button
                      onClick={() => handlePreNotify(h.id)}
                      disabled={notifiedHospitals[h.id]}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${notifiedHospitals[h.id]
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-brand-plum hover:bg-brand-rose text-brand-cream'
                        }`}
                    >
                      {notifiedHospitals[h.id] ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Pre-Notified
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Pre-Notify Desk
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-card rounded-3xl p-6 border border-white/40 flex flex-col gap-4 shadow-lg">
            <h4 className="font-bold text-brand-plum text-sm border-b border-brand-plum/10 pb-3 mb-1 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-brand-plum" />
              Journey Route & Reimbursement
            </h4>

            {activeCase && journey ? (
              <div className="flex flex-col gap-4">

                <div className="p-4 bg-white/40 border border-brand-plum/10 rounded-2xl">
                  <span className="text-[9px] uppercase font-bold text-brand-plum/40">Travel Route Path</span>
                  <div className="flex items-center gap-2 mt-1.5 font-bold text-brand-plum text-xs">
                    <span>{journey.origin.split(' ')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-rose" />
                    <span>{journey.destination.split(',')[0]}</span>
                  </div>
                  <p className="text-[10px] text-brand-plum/60 mt-1 font-medium">Route: {journey.route}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/40 border border-brand-plum/10 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-brand-plum/40">Duration</span>
                    <p className="text-xs font-semibold text-brand-plum mt-1">{journey.duration}</p>
                  </div>
                  <div className="p-3 bg-white/40 border border-brand-plum/10 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-brand-plum/40">Est. Cost</span>
                    <p className="text-xs font-semibold text-brand-plum mt-1">{journey.fare}</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-brand-plum text-xs">Reimbursement Verified</h5>
                    <p className="text-[10px] text-brand-plum/70 mt-1 leading-relaxed">
                      {journey.reimbursement}
                    </p>
                    <p className="text-[9px] text-brand-blue font-bold uppercase tracking-wider mt-2">
                      ✔ Voucher pre-auth triggered via ASHA Desk
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-brand-plum/50 flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 text-brand-plum/30" />
                <p className="text-xs">No active patient case loaded. Select a patient case from the dropdown above to load route logistics.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
