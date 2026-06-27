import React, { useState } from 'react'
import { ShieldAlert, CheckCircle, FileText, Phone, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react'

export default function VolunteerEscalation({ cases, resolveEscalation }) {
  const [localCases, setLocalCases] = useState(cases)
  const [selectedCaseId, setSelectedCaseId] = useState(cases.find(c => c.escalated)?.id || '')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [authorizationCode, setAuthorizationCode] = useState('')

  const activeCase = localCases.find(c => c.id === selectedCaseId)
  const escalatedCases = localCases.filter(c => c.escalated || c.triageProgress === 'Turned Away')

  const handleResolve = (e) => {
    e.preventDefault()
    if (!selectedCaseId) {
      alert("Please select an escalated case to resolve.")
      return
    }
    if (!resolutionNotes || !authorizationCode) {
      alert("Please complete the resolution notes and BDO authorization code to simulate escalation clearance.")
      return
    }

    setLocalCases(prev =>
      prev.map(c => (c.id === selectedCaseId ? { ...c, escalated: false, triageProgress: 'Routing', incomeCertificateStatus: 'Valid (Volunteer Verified)' } : c))
    )

    resolveEscalation(selectedCaseId)

    alert(`Escalation resolved for case ${selectedCaseId}. The Ayushman Mitra has been issued the authorization code ${authorizationCode}. Patient notified via SMS.`);

    setResolutionNotes('')
    setAuthorizationCode('')
    setSelectedCaseId('')
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto py-4 flex flex-col gap-6">

      <div className="border-b border-brand-plum/10 pb-4">
        <h3 className="text-2xl font-black text-brand-plum">Volunteer Escalation Desk</h3>
        <p className="text-sm text-brand-plum/60 mt-1">Manual intervention console for BPL patients turned away at hospital counters (48-hour follow-up loop).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-card rounded-3xl p-6 border border-white/40 flex flex-col gap-4 shadow-lg">
            <h4 className="font-bold text-brand-plum text-sm border-b border-brand-plum/10 pb-3">
              Escalation Queue ({escalatedCases.length})
            </h4>

            {escalatedCases.length > 0 ? (
              <div className="flex flex-col gap-3">
                {escalatedCases.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2 ${
                      selectedCaseId === c.id
                        ? 'border-brand-rose bg-brand-rose/10 shadow-md'
                        : 'border-brand-plum/5 bg-white/40 hover:bg-white/60'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-brand-plum text-xs">{c.name}</span>
                      <span className="px-2 py-0.5 rounded bg-brand-rose text-white text-[9px] font-bold uppercase tracking-wider">
                        {c.triageProgress}
                      </span>
                    </div>
                    <p className="text-[10px] text-brand-plum/70">Matched: {c.schemeMatched}</p>
                    <p className="text-[9px] text-brand-rose font-bold">Issue: {c.incomeCertificateStatus}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-brand-plum/50 flex flex-col items-center gap-2">
                <CheckCircle className="w-8 h-8 text-emerald-600/80" />
                <p className="text-xs">No active escalations. All patients admitted successfully.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          {activeCase ? (
            <div className="glass-card rounded-3xl p-6 border border-white/40 flex flex-col gap-5 shadow-lg">
              <div className="border-b border-brand-plum/10 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand-rose uppercase tracking-wider">Active Escalation Case</span>
                  <h4 className="font-bold text-brand-plum text-base">{activeCase.name} ({activeCase.id})</h4>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${activeCase.phone}`} className="p-2 rounded-xl bg-white/60 hover:bg-brand-rose/25 text-brand-plum border border-brand-plum/5 transition-colors">
                    <Phone className="w-4 h-4" />
                  </a>
                  <a href={`sms:${activeCase.phone}`} className="p-2 rounded-xl bg-white/60 hover:bg-brand-rose/25 text-brand-plum border border-brand-plum/5 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-brand-plum/40 uppercase">Location</span>
                  <p className="font-semibold text-brand-plum mt-1">{activeCase.location}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brand-plum/40 uppercase">Diagnosis / Specialty</span>
                  <p className="font-semibold text-brand-plum mt-1">{activeCase.disease}</p>
                </div>
              </div>

              <div className="p-4 bg-brand-rose/10 border-l-4 border-brand-rose rounded-r-2xl flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-brand-rose shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-brand-plum text-xs">Escalation Trigger: turned away at counter</h5>
                  <p className="text-[10px] text-brand-plum/80 mt-1 leading-relaxed">
                    Patient was turned away due to expired income certificate ({activeCase.incomeCertificateStatus}). The ASHA worker verified the patient is below poverty line. Manual volunteer verification required.
                  </p>
                </div>
              </div>

              <form onSubmit={handleResolve} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-plum/50 mb-1.5">
                      BDO Authorization Code
                    </label>
                    <input
                      type="text"
                      value={authorizationCode}
                      onChange={(e) => setAuthorizationCode(e.target.value)}
                      placeholder="Enter authorization code"
                      className="w-full px-4 py-3 rounded-xl border border-brand-plum/10 bg-white/50 text-xs focus:outline-none focus:ring-1 focus:ring-brand-plum"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-plum/50 mb-1.5">
                      Target Ayushman Mitra Desk
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Jaipur Oncology Mitra Desk"
                      className="w-full px-4 py-3 rounded-xl border border-brand-plum/10 bg-brand-plum/5 text-xs text-brand-plum/70 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-plum/50 mb-1.5">
                    Resolution Notes (Sent to Ayushman Mitra & ASHA)
                  </label>
                  <textarea
                    rows="3"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe how the document status was resolved..."
                    className="w-full px-4 py-3 rounded-xl border border-brand-plum/10 bg-white/50 text-xs focus:outline-none focus:ring-1 focus:ring-brand-plum resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="py-3 rounded-xl font-bold bg-brand-plum hover:bg-brand-rose text-brand-cream text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <RefreshCw className="w-4 h-4" />
                  Resolve Escalation & Authorize Admission
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-12 text-center border border-white/40 flex flex-col items-center justify-center h-full">
              <AlertCircle className="w-12 h-12 text-brand-plum/30 mb-3" />
              <h5 className="font-bold text-brand-plum text-sm">Select an Escalated Case</h5>
              <p className="text-xs text-brand-plum/50 max-w-sm mt-1 mx-auto">
                No escalated case selected. Choose a patient case from the left panel queue to review document authorization controls.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
