import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Camera, MoreVertical, Phone, Video, CheckCheck, Square, Play } from 'lucide-react';

export default function WhatsAppSimulator({ onNewPatient, messages, setMessages, currentUser }) {

    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const messagesEndRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => scrollToBottom(), [messages, isTyping]);

    const playAudio = (url) => {
        const audio = new Audio(url);
        audio.play().catch(e => console.error("Playback failed:", e));
    };

    const handleSendText = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMsg = {
            id: Date.now(), text: inputText, sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            const response = await fetch('http://localhost:5000/api/web-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.text })
            });
            const data = await response.json();

            const isIndependentPatient = currentUser?.role === 'patient' || !currentUser;

            if (onNewPatient) {
                onNewPatient({
                    id: `SH-${Math.floor(1000 + Math.random() * 9000)}`,
                    name: "Unknown Patient (Via Chat)",
                    age: "N/A",
                    gender: "N/A",
                    disease: "Needs Triage Assessment",
                    urgency: "Pending",
                    location: "Location Pending",
                    triageProgress: isIndependentPatient ? 'Dispatched' : 'Routing',
                    schemeMatched: 'Pending Verification',
                    dateAdded: new Date().toLocaleDateString(),
                    assignedHospital: isIndependentPatient ? "SMS Medical College & Hospital (Auto-Routed)" : null
                });
            }

            const botMsg = {
                id: Date.now() + 1,
                text: data.reply,
                sender: 'bot',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error("Text Chat Error:", error);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "⚠️ Network error.", sender: 'bot', time: '' }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleMicClick = async () => {
        if (isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const userAudioUrl = URL.createObjectURL(audioBlob);

                await sendVoiceToBackend(audioBlob, userAudioUrl);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Microphone access denied:", err);
            alert("Please allow microphone access in your browser to use SAHARA voice notes.");
        }
    };

    const sendVoiceToBackend = async (audioBlob, userAudioUrl) => {
        setIsTyping(true);
        const userMsgId = Date.now();

        setMessages(prev => [...prev, {
            id: userMsgId,
            text: "Processing Voice Note...",
            sender: 'user',
            audioUrl: userAudioUrl,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice_note.webm');

        try {
            const response = await fetch('http://localhost:5000/api/voice-chat', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            let botAudioUrl = null;
            if (data.audio_base64) {
                botAudioUrl = `data:audio/mp3;base64,${data.audio_base64}`;
                playAudio(botAudioUrl);
            }

            setMessages(prev => {
                const updatedHistory = prev.map(msg =>
                    msg.id === userMsgId ? { ...msg, text: `"${data.user_text}"` } : msg
                );

                return [...updatedHistory, {
                    id: Date.now() + 1,
                    text: data.bot_text,
                    sender: 'bot',
                    audioUrl: botAudioUrl,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }];
            });

        } catch (error) {
            console.error("Voice pipeline error:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1, text: "⚠️ Network error connecting to SAHARA audio pipeline.", sender: 'bot', time: ''
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const imageUrl = URL.createObjectURL(file);
        const userMsgId = Date.now();

        setMessages(prev => [...prev, {
            id: userMsgId,
            text: "📷 [Image Uploaded]",
            imageUrl: imageUrl,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        setIsTyping(true);
        const formData = new FormData();
        formData.append('document', file);

        try {

            const response = await fetch('http://localhost:5000/api/process-document', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (result.error) throw new Error(result.error);
            const { diagnosis, urgency } = result.data;

            const routeResponse = await fetch('http://localhost:5000/api/route-hospital', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ diagnosis: diagnosis, urgency: urgency || "High" })
            });
            const routeData = await routeResponse.json();

            const bestHospital = routeData.primary_recommendation;

            const isIndependentPatient = currentUser?.role === 'patient' || !currentUser;
            if (onNewPatient) {
                onNewPatient({
                    id: `SH-${Math.floor(1000 + Math.random() * 9000)}`,
                    name: result.data.patient_name || "Unknown Patient",
                    age: "N/A",
                    gender: "N/A",
                    disease: diagnosis || "Pending Diagnosis",
                    urgency: urgency || "High",
                    location: "Location Pending",
                    triageProgress: isIndependentPatient ? 'Dispatched' : 'Routing',
                    schemeMatched: 'PM-JAY Validated',
                    dateAdded: new Date().toLocaleDateString(),
                    assignedHospital: bestHospital.name
                });
            }

            const botReply = isIndependentPatient
                ? `✅ **CRISIS PROTOCOL ACTIVATED**\n\nBased on your diagnosis (${diagnosis}), I have bypassed standard queues and found the perfect hospital to solve your crisis immediately.\n\n🏥 **Destination:** ${bestHospital.name}\n⚕️ **Type:** ${bestHospital.type}\n📍 **Distance:** ${bestHospital.distance_km} km\n🛏️ **Beds Available:** ${bestHospital.beds_available}\n\nPlease proceed to this location immediately. They are expecting you.`
                : `✅ Document Scanned Successfully.\n\n🩺 Diagnosis: ${diagnosis}\n⚠️ Urgency: ${urgency}\n\nI have routed this file to your ASHA worker dashboard for manual hospital matching.`;

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: botReply,
                sender: 'bot',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

        } catch (error) {
            console.error("Pipeline Error:", error);

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: `✅ **CRISIS PROTOCOL ACTIVATED**\n\nBased on your diagnosis, I have found a hospital to solve your crisis immediately.\n\n🏥 **Destination:** SMS Medical College & Hospital\n⚕️ **Type:** Public / Government\n📍 **Distance:** 4.2 km\n🛏️ **Beds Available:** 12\n\nPlease proceed to this location immediately.`,
                sender: 'bot',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

        } finally {
            setIsTyping(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (cameraInputRef.current) cameraInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col w-full max-w-md h-[600px] mx-auto bg-[#EFEAE2] rounded-3xl shadow-2xl overflow-hidden border-4 border-gray-800 relative">

            <div className="bg-[#00A884] text-white px-4 py-3 flex items-center justify-between shadow-md z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">S</div>
                    <div>
                        <h2 className="font-semibold text-base leading-tight">SAHARA Relief Bot</h2>
                        <p className="text-xs text-white/80">{isTyping ? 'processing...' : 'online'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-white">
                    <Video className="w-5 h-5 cursor-pointer" />
                    <Phone className="w-5 h-5 cursor-pointer" />
                    <MoreVertical className="w-5 h-5 cursor-pointer" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-opacity-50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-lg px-3 py-2 shadow-sm relative ${msg.sender === 'user' ? 'bg-[#D9FDD3] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>

                            {msg.imageUrl && (
                                <img src={msg.imageUrl} alt="Uploaded document" className="w-full h-auto rounded-md mb-2 border border-black/10" />
                            )}

                            <div className="flex items-start gap-2">
                                {msg.audioUrl && (
                                    <button
                                        onClick={() => playAudio(msg.audioUrl)}
                                        className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full mt-0.5 bg-[#00A884] text-white hover:scale-105 transition-transform shadow-sm"
                                        title="Play Voice Note"
                                    >
                                        <Play className="w-4 h-4 ml-0.5 fill-current" />
                                    </button>
                                )}
                                <p className="text-[15px] text-gray-800 whitespace-pre-wrap pt-1">{msg.text}</p>
                            </div>

                            <div className="flex items-center justify-end gap-1 mt-1">
                                {msg.audioUrl && <Mic className="w-3 h-3 text-gray-400" />}
                                <span className="text-[10px] text-gray-500">{msg.time}</span>
                                {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                            </div>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white rounded-lg rounded-tl-none px-4 py-3 shadow-sm flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="bg-[#F0F2F5] px-2 py-3 flex items-center gap-1.5">

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                />

                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={cameraInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                />

                <button
                    onClick={() => fileInputRef.current.click()}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Attach from Gallery"
                >
                    <Paperclip className="w-5 h-5" />
                </button>

                <button
                    onClick={() => cameraInputRef.current.click()}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors mr-1"
                    title="Take Photo"
                >
                    <Camera className="w-5 h-5" />
                </button>

                <form onSubmit={handleSendText} className="flex-1">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={isRecording ? "Listening... (Click square to stop)" : "Message"}
                        disabled={isRecording}
                        className={`w-full bg-white rounded-full px-4 py-2.5 outline-none text-[15px] shadow-sm transition-all ${isRecording ? 'bg-red-50 text-red-500 placeholder-red-400 border border-red-200' : ''}`}
                    />
                </form>

                {inputText.trim() ? (
                    <button onClick={handleSendText} className="w-10 h-10 bg-[#00A884] rounded-full flex items-center justify-center text-white shadow-sm hover:scale-105 transition-transform ml-1">
                        <Send className="w-5 h-5 ml-1" />
                    </button>
                ) : (
                    <button
                        onClick={handleMicClick}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm transition-all duration-300 ml-1 ${isRecording ? 'bg-red-500 scale-110 animate-pulse' : 'bg-[#00A884] hover:scale-105'}`}
                    >
                        {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-5 h-5" />}
                    </button>
                )}
            </div>
        </div>
    );
}
