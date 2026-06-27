import React, { useState, useRef } from 'react'
import { AlertCircle, CheckCircle2, FileText, Upload, Volume2, FileDown, Smile, AlertTriangle, ArrowRight, Eye } from 'lucide-react'

export default function PatientPortal({ addNewCase, setActiveTab }) {

  const [flowStep, setFlowStep] = useState('panic')
  const [panicLevel, setPanicLevel] = useState(null)

  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [selectedDocs, setSelectedDocs] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceTranscribed, setVoiceTranscribed] = useState('')
  const [voiceSentiment, setVoiceSentiment] = useState('')
  const [patientNameInput, setPatientNameInput] = useState('')
  const [patientAgeInput, setPatientAgeInput] = useState('')

  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const progressInterval = useRef(null)

  const [isPlayingTestimonial, setIsPlayingTestimonial] = useState(false)

  const samplePrescriptions = [
    {
      title: "Stage II Oncology Prescription (Ramesh Kumar)",
      name: "Ramesh Kumar",
      age: 48,
      gender: "Male",
      diagnosis: "Lung Cancer (Stage II, Squamous Cell)",
      hospType: "Oncology Department",
      incomeCertStatus: "Expiring (12 days)",
      matchedScheme: "PM-JAY (Ayushman Bharat)"
    },
    {
      title: "Cardiology Prescription (Ram Singh)",
      name: "Ram Singh",
      age: 61,
      gender: "Male",
      diagnosis: "Coronary Artery Blockage (90% stenosis)",
      hospType: "Cardiovascular Department",
      incomeCertStatus: "Expired",
      matchedScheme: "CM Relief Fund + NGO Aid"
    }
  ]

  const handlePanicClick = (level) => {
    setPanicLevel(level)
    setFlowStep('intake')
  }

  const startRecordingMock = () => {
    setIsRecording(true)
    setTimeout(() => {
      setIsRecording(false)
      setVoiceTranscribed("मुझे बहुत घबराहट हो रही है। डॉक्टर ने कैंसर बोला है, लेकिन पैसे नहीं हैं। क्या सरकार सच में हमारी मदद करेगी?")
      setVoiceSentiment("Anxious - adjusting system tone to High Empathy & High Reassurance")
    }, 4000)
  }

  const loadSamplePreset = (preset) => {
    setPatientNameInput(preset.name)
    setPatientAgeInput(preset.age)
    setSelectedPrescription(preset)
    setSelectedDocs({
      aadhaar: "Aadhaar Number: XXXX-XXXX-4921",
      ration: "BPL Ration Card ID: RC-991285",
      incomeCert: `Income Certificate (Annual: ₹48,000) - Status: ${preset.incomeCertStatus}`
    })
  }

  const runSimulationOCR = () => {
    if (!selectedPrescription) {
      alert("Please select a sample prescription or upload documents to simulate OCR.")
      return
    }
    setFlowStep('processing')
    setProgress(0)
    setProgressMessage("Initiating Empathy & Extraction Engine...")

    let currentProgress = 0
    progressInterval.current = setInterval(() => {
      currentProgress += 10
      setProgress(currentProgress)

      if (currentProgress === 30) {
        setProgressMessage("Running OCR text extraction on prescription and Aadhaar...")
      } else if (currentProgress === 60) {
        setProgressMessage("Transcribing local language voice note via Bhashini API...")
      } else if (currentProgress === 80) {
        setProgressMessage("Evaluating eligibility triage matrices (PM-JAY & Chiranjeevi)...")
      } else if (currentProgress >= 100) {
        clearInterval(progressInterval.current)

        const generatedId = `SH-${Math.floor(100 + Math.random() * 900)}`
        addNewCase({
          id: generatedId,
          name: patientNameInput || selectedPrescription.name,
          age: parseInt(patientAgeInput) || selectedPrescription.age,
          gender: selectedPrescription.gender,
          disease: selectedPrescription.diagnosis,
          location: "Churu District, Rajasthan",
          incomeCertificateStatus: selectedPrescription.incomeCertStatus,
          incomeExpiryDate: "2026-07-02",
          schemeMatched: selectedPrescription.matchedScheme,
          triageProgress: selectedPrescription.incomeCertStatus.includes("Expired") ? "Turned Away" : "Intake",
          documents: {
            aadhaar: true,
            ration: selectedPrescription.matchedScheme.includes("NGO") ? false : true,
            prescription: true,
            incomeCert: true
          },
          grievanceDrafted: selectedPrescription.incomeCertStatus.includes("Expired") || selectedPrescription.matchedScheme.includes("NGO"),
          escalated: selectedPrescription.incomeCertStatus.includes("Expired"),
          dateAdded: new Date().toISOString().split('T')[0],
          phone: "+91 99887 76655"
        })

        setFlowStep('results')
      }
    }, 450)
  }

  const downloadGrievancePDF = () => {
    alert("Drafting Grievance Letter: Pre-filled Hindi Grievance Form successfully generated and downloaded to your downloads folder.")
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-4">

      {flowStep === 'results' && (
        <button
          onClick={() => { setFlowStep('panic'); setPanicLevel(null); setSelectedPrescription(null); setSelectedDocs(null); }}
          className="mb-4 text-sm font-semibold text-brand-plum hover:text-brand-rose flex items-center gap-1"
        >
          ← Process Another Patient
        </button>
      )}

      {flowStep === 'panic' && (
        <div className="glass-card rounded-3xl p-8 shadow-xl text-center border border-white/40">
          <h3 className="text-2xl sm:text-3xl font-bold text-brand-plum mb-4">
            How are you feeling right now?
          </h3>
          <p className="text-brand-plum/70 mb-8 max-w-md mx-auto">
            SAHARA is here to guide you through medical documentation and expenses. Select a panic level to get started with instant reassurance.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <button
              onClick={() => handlePanicClick('severe')}
              className="p-6 rounded-2xl bg-brand-plum hover:bg-brand-black text-brand-cream transition-all duration-300 shadow-md flex flex-col items-center gap-2 group hover:-translate-y-1"
            >
              <span className="text-2xl">😟</span>
              <span className="font-bold text-base">I am Scared</span>
              <span className="text-xs text-brand-light-pink/80">Need instant reassurance & diagnostics guidance</span>
            </button>

            <button
              onClick={() => handlePanicClick('moderate')}
              className="p-6 rounded-2xl bg-brand-rose hover:bg-brand-plum text-brand-cream transition-all duration-300 shadow-md flex flex-col items-center gap-2 group hover:-translate-y-1"
            >
              <span className="text-2xl">📋</span>
              <span className="font-bold text-base">Check Documents</span>
              <span className="text-xs text-brand-cream/80">Check scheme eligibility or upload prescriptions</span>
            </button>

            <button
              onClick={() => handlePanicClick('mild')}
              className="p-6 rounded-2xl bg-brand-blue hover:bg-brand-plum text-brand-cream transition-all duration-300 shadow-md flex flex-col items-center gap-2 group hover:-translate-y-1"
            >
              <span className="text-2xl">🚌</span>
              <span className="font-bold text-base">Journey & Hospital</span>
              <span className="text-xs text-brand-cream/80">Plan routes, check travel funds and hospital active desks</span>
            </button>
          </div>
        </div>
      )}

      {flowStep === 'intake' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="glass-card rounded-2xl p-6 border border-white/40">
              <div className="flex items-start gap-3">
                <Smile className="w-8 h-8 text-brand-rose shrink-0" />
                <div>
                  <h4 className="font-bold text-brand-plum text-base">A Message for You:</h4>
                  <p className="text-sm text-brand-plum/80 leading-relaxed mt-2 italic">
                    {panicLevel === 'severe'
                      ? '"चिंता न करें, आप अकेले नहीं हैं। सहारा आपके साथ है। हम आपके इलाज के सारे सरकारी कागजात और पैसों का बंदोबस्त करने में आपकी पूरी मदद करेंगे।"'
                      : '"Welcome! Let us check your documents. We will make sure your treatment is covered smoothly without bureaucracy."'}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/40">
              <h4 className="font-bold text-brand-plum text-sm mb-3">Quick Demo Presets</h4>
              <p className="text-xs text-brand-plum/60 mb-4">Click to pre-fill simulated inputs for quick testing:</p>
              <div className="flex flex-col gap-2">
                {samplePrescriptions.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadSamplePreset(preset)}
                    className="w-full text-left p-3 rounded-xl text-xs font-semibold bg-white/60 hover:bg-brand-rose/25 text-brand-plum border border-brand-plum/5 transition-colors flex items-center justify-between"
                  >
                    <span>{preset.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/40 flex flex-col gap-6">
            <div className="border-b border-brand-plum/10 pb-4">
              <h3 className="text-xl font-bold text-brand-plum">Multimodal Intake</h3>
              <p className="text-sm text-brand-plum/60 mt-1">Provide your details to analyze scheme matchings.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-plum/50 mb-1.5">Patient Name</label>
                <input
                  type="text"
                  value={patientNameInput}
                  onChange={(e) => setPatientNameInput(e.target.value)}
                  placeholder="Enter patient name"
                  className="w-full px-4 py-3 rounded-xl border border-brand-plum/10 bg-white/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-plum"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-plum/50 mb-1.5">Patient Age</label>
                <input
                  type="number"
                  value={patientAgeInput}
                  onChange={(e) => setPatientAgeInput(e.target.value)}
                  placeholder="Enter patient age"
                  className="w-full px-4 py-3 rounded-xl border border-brand-plum/10 bg-white/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-plum"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-brand-plum/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center bg-white/30 hover:bg-white/40 transition-colors">
                <Upload className="w-8 h-8 text-brand-plum/50 mb-2" />
                <span className="text-xs font-bold text-brand-plum mb-1">Prescription Scan</span>
                <span className="text-[10px] text-brand-plum/50">Upload photo/PDF of prescription</span>
                {selectedPrescription && (
                  <div className="mt-3 flex items-center gap-1.5 bg-brand-plum/10 text-brand-plum px-2.5 py-1 rounded-full text-[10px] font-semibold">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Selected</span>
                  </div>
                )}
              </div>

              <div className="border-2 border-dashed border-brand-plum/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center bg-white/30 hover:bg-white/40 transition-colors">
                <Upload className="w-8 h-8 text-brand-plum/50 mb-2" />
                <span className="text-xs font-bold text-brand-plum mb-1">Aadhaar/Ration Card</span>
                <span className="text-[10px] text-brand-plum/50">Upload card credentials</span>
                {selectedDocs && (
                  <div className="mt-3 flex items-center gap-1.5 bg-brand-plum/10 text-brand-plum px-2.5 py-1 rounded-full text-[10px] font-semibold">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Selected</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/50 border border-brand-plum/5 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={startRecordingMock}
                className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all duration-300 ${
                  isRecording
                    ? 'bg-brand-rose text-white animate-pulse'
                    : 'bg-brand-plum hover:bg-brand-rose text-white'
                }`}
              >
                <Volume2 className="w-6 h-6" />
              </button>
              <div className="flex-1 w-full text-center sm:text-left">
                <h5 className="font-bold text-brand-plum text-xs">Record Hindi/Local Language Voice Note</h5>
                <p className="text-[10px] text-brand-plum/60 mt-1">
                  {isRecording
                    ? "Recording... Speak now. Click stop to transcribe."
                    : voiceTranscribed
                      ? "Transcription loaded successfully (simulated Bhashini)."
                      : "Tap microhone to simulate voice intake translation."}
                </p>
                {voiceTranscribed && (
                  <div className="mt-3 p-3 bg-brand-light-pink/40 border border-brand-rose/10 rounded-xl text-left">
                    <p className="text-xs font-medium text-brand-plum/90">{voiceTranscribed}</p>
                    <p className="text-[9px] text-brand-blue font-bold uppercase tracking-wider mt-1.5">{voiceSentiment}</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={runSimulationOCR}
              className="mt-4 py-4 rounded-xl font-bold bg-brand-plum hover:bg-brand-rose text-brand-cream transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              Analyze & Matched Scheme
            </button>
          </div>
        </div>
      )}

      {flowStep === 'processing' && (
        <div className="glass-card rounded-3xl p-12 text-center border border-white/40 flex flex-col items-center justify-center max-w-lg mx-auto">

          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-rose via-brand-peach to-brand-blue flex items-center justify-center animate-spin shadow-lg glow-rose mb-6">
            <Volume2 className="w-6 h-6 text-white" />
          </div>

          <h4 className="font-bold text-brand-plum text-lg mb-2">Analyzing Intake Materials</h4>
          <p className="text-xs text-brand-plum/60 mb-6">{progressMessage}</p>

          <div className="w-full bg-brand-plum/10 rounded-full h-2">
            <div
              className="bg-brand-rose h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-extrabold text-brand-plum mt-3">{progress}%</span>
        </div>
      )}

      {flowStep === 'results' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 flex flex-col gap-6">

            <div className="glass-card rounded-3xl p-6 border border-white/40">
              <div className="flex items-center gap-3 border-b border-brand-plum/10 pb-4 mb-4">
                <CheckCircle2 className="w-8 h-8 text-brand-blue" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-plum/40">Matched Healthcare Scheme</span>
                  <h3 className="text-2xl font-black text-brand-plum">
                    {selectedPrescription.matchedScheme}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-plum/40">Extracted Diagnosis</span>
                  <p className="text-sm font-semibold text-brand-plum mt-1">{selectedPrescription.diagnosis}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-plum/40">Treatment Specialty</span>
                  <p className="text-sm font-semibold text-brand-plum mt-1">{selectedPrescription.hospType}</p>
                </div>
              </div>

              {selectedPrescription.incomeCertStatus.includes("Expired") ? (
                <div className="p-4 bg-brand-plum/5 border-l-4 border-brand-plum rounded-r-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-brand-plum shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-brand-plum text-xs">Income Certificate Expired</h5>
                    <p className="text-xs text-brand-plum/70 mt-1 leading-relaxed">
                      Your income certificate expired on {selectedPrescription.incomeExpiryDate || '2026-05-10'}. Because this is expired, the Ayushman Bharat portal will turn your family away. We have drafted a Hindi grievance mitigation letter and flagged your case to the village ASHA worker for expedited renewal support.
                    </p>
                  </div>
                </div>
              ) : selectedPrescription.incomeCertStatus.includes("Expiring") ? (
                <div className="p-4 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-brand-plum text-xs">Income Certificate Expiring Soon</h5>
                    <p className="text-xs text-brand-plum/70 mt-1 leading-relaxed">
                      Your certificate expires in 12 days. Do not travel to the hospital without flagging this to your ASHA worker. Go to the ASHA Dashboard to trigger an expedited renewal request.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-brand-plum text-xs">Documents Verified Successfully</h5>
                    <p className="text-xs text-brand-plum/70 mt-1 leading-relaxed">
                      All criteria match. Proceed to Hospital Finder tab to select your oncology center and plan your bus journey travel reimbursement.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {(selectedPrescription.incomeCertStatus.includes("Expired") || selectedPrescription.matchedScheme.includes("NGO")) && (
              <div className="glass-card rounded-3xl p-6 border border-white/40">
                <div className="flex items-center justify-between border-b border-brand-plum/10 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-7 h-7 text-brand-plum" />
                    <div>
                      <h4 className="font-bold text-brand-plum text-sm">Grievance Recovery Letter (Hindi)</h4>
                      <p className="text-[10px] text-brand-plum/50">Auto-filled Hindi grievance letter drafted for Ayushman Mitra</p>
                    </div>
                  </div>
                  <button
                    onClick={downloadGrievancePDF}
                    className="p-2.5 rounded-full bg-brand-plum hover:bg-brand-rose text-white transition-colors"
                  >
                    <FileDown className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 bg-white/40 border border-brand-plum/10 rounded-2xl max-h-48 overflow-y-auto hide-scrollbar text-xs font-serif leading-relaxed text-brand-plum/80">
                  <p className="font-bold">सेवा में,</p>
                  <p className="pl-4">आयुष्मान मित्र डेस्क / स्थानीय नोडल अधिकारी,</p>
                  <p className="pl-4">चूरू जिला, राजस्थान।</p>
                  <p className="mt-4 font-bold">विषय: आय प्रमाण पत्र नवीनीकरण में देरी के कारण चिकित्सा उपचार की मंजूरी हेतु अनुरोध।</p>
                  <p className="mt-2">महोदय,</p>
                  <p className="pl-4">सविनय निवेदन है कि प्रार्थी <strong>{patientNameInput || selectedPrescription.name}</strong>, उम्र {patientAgeInput || selectedPrescription.age} वर्ष, बीपीएल राशन कार्ड धारक है। प्रार्थी को हाल ही में <strong>{selectedPrescription.diagnosis}</strong> की पुष्टि हुई है जिसके तुरंत उपचार की आवश्यकता है। सरकारी आय प्रमाण पत्र समाप्त होने के कारण पोर्टल पर मंजूरी लंबित है।</p>
                  <p className="pl-4 mt-2">अतः प्रार्थी के जीवन की रक्षा हेतु आयुष्मान भारत योजना के तहत उपचार की अस्थाई स्वीकृति प्रदान करने की कृपा करें।</p>
                  <p className="mt-4">भवदीय,</p>
                  <p className="pl-4"><strong>{patientNameInput || selectedPrescription.name}</strong></p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('hospital')}
                className="flex-1 py-4 rounded-xl font-bold bg-brand-plum hover:bg-brand-rose text-brand-cream transition-colors text-center text-sm shadow-md"
              >
                Find Hospital & Plan Journey
              </button>
              <button
                onClick={() => setActiveTab('asha')}
                className="flex-1 py-4 rounded-xl font-bold bg-white/60 hover:bg-white/80 text-brand-plum border border-brand-plum/15 transition-colors text-center text-sm shadow-md"
              >
                Go to ASHA Case Dashboard
              </button>
            </div>

          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">

            <div className="glass-card rounded-3xl p-6 border border-white/40">
              <h4 className="font-bold text-brand-plum text-sm border-b border-brand-plum/10 pb-3 mb-4">
                The "Plastic Folder" Checklist
              </h4>
              <p className="text-[10px] text-brand-plum/60 mb-4">Collect documents in this exact order to prevent counter overload:</p>

              <ul className="flex flex-col gap-4">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-blue text-white flex items-center justify-center text-[10px] font-bold">1</div>
                  <div>
                    <p className="text-xs font-bold text-brand-plum">Aadhaar Card (Original)</p>
                    <p className="text-[9px] text-brand-plum/50">Checked & Linked</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-blue text-white flex items-center justify-center text-[10px] font-bold">2</div>
                  <div>
                    <p className="text-xs font-bold text-brand-plum">BPL Ration Card</p>
                    <p className="text-[9px] text-brand-plum/50">Verification Completed</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-blue text-white flex items-center justify-center text-[10px] font-bold">3</div>
                  <div>
                    <p className="text-xs font-bold text-brand-plum">Oncology Referral Letter</p>
                    <p className="text-[9px] text-brand-plum/50">Deciphered via Medical OCR</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    selectedPrescription.incomeCertStatus.includes("Expired") ? 'bg-brand-rose text-white' : 'bg-brand-blue text-white'
                  }`}>4</div>
                  <div>
                    <p className="text-xs font-bold text-brand-plum">Income Certificate</p>
                    <p className={`text-[9px] font-bold ${
                      selectedPrescription.incomeCertStatus.includes("Expired") ? 'text-brand-rose' : 'text-brand-plum/50'
                    }`}>
                      {selectedPrescription.incomeCertStatus.includes("Expired") ? 'Expired - Renewal Needed' : 'Valid'}
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-white/40">
              <h4 className="font-bold text-brand-plum text-sm border-b border-brand-plum/10 pb-3 mb-4">
                Survivor Trust Signal
              </h4>
              <p className="text-[10px] text-brand-plum/60 mb-4">A reassuring voice note from a survivor in your district:</p>

              <div className="bg-brand-plum/5 rounded-2xl p-4 border border-brand-plum/10 flex flex-col items-center gap-3">

                <div className="w-14 h-14 rounded-full bg-brand-plum/10 border border-brand-plum/20 overflow-hidden flex items-center justify-center text-xl text-brand-plum font-bold shadow-inner">
                  👵
                </div>
                <div className="text-center">
                  <h5 className="font-bold text-brand-plum text-xs">Savitri Devi (58, Churu)</h5>
                  <p className="text-[10px] text-brand-plum/50">Cured of Lung Cancer (Matched PM-JAY in 2024)</p>
                </div>

                {isPlayingTestimonial ? (
                  <div className="flex gap-1 h-5 my-2 items-center">
                    <span className="w-1 h-4 bg-brand-rose rounded-full animate-pulse"></span>
                    <span className="w-1 h-5 bg-brand-rose rounded-full animate-pulse delay-75"></span>
                    <span className="w-1 h-3 bg-brand-rose rounded-full animate-pulse delay-150"></span>
                    <span className="w-1 h-5 bg-brand-rose rounded-full animate-pulse delay-200"></span>
                    <span className="w-1 h-2 bg-brand-rose rounded-full animate-pulse delay-75"></span>
                  </div>
                ) : (
                  <div className="w-full bg-brand-plum/10 h-1 my-4 rounded-full"></div>
                )}

                <button
                  onClick={() => setIsPlayingTestimonial(!isPlayingTestimonial)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-brand-plum hover:bg-brand-rose text-white transition-colors flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  {isPlayingTestimonial ? "Stop Listening" : "Play Voice Note (20s)"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
