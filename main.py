
# pyrefly: ignore [missing-import]
from flask import Flask, jsonify, request
from flask_cors import CORS
import datetime
import json
import os
import base64

# pyrefly: ignore [missing-import]
from PIL import Image

# pyrefly: ignore [missing-import]
from flask import request, jsonify

# pyrefly: ignore [missing-import]
from gtts import gTTS

# pyrefly: ignore [missing-import]
from groq import Groq

# pyrefly: ignore [missing-import]
import google.generativeai as genai

# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GROQ_API_KEY or not GEMINI_API_KEY:
    print("⚠️ WARNING: API keys are missing from the .env file!")

groq_client = Groq(api_key=GROQ_API_KEY)
genai.configure(api_key=GEMINI_API_KEY)
print("Here are the models you can use:")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)
gemini_model = genai.GenerativeModel('gemini-2.5-flash')

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/api/asha/dashboard', methods=['GET'])
def get_asha_dashboard():
    """Returns active cases and alerts for the ASHA worker."""
    real_data = healthcare_df.to_dict(orient='records')
    return jsonify({
        "asha_name": "Meena Kumari",
        "village": "Rampur",
        "patients": real_data
    })

@app.route('/api/escalate/<patient_id>', methods=['POST'])
def escalate_case(patient_id):
    """Triggers the 48-Hour human volunteer escalation loop."""
    return jsonify({
        "status": "Escalated",
        "message": f"Volunteer team notified for patient {patient_id}."
    })
@app.route('/api/analyze_patient/<patient_id>', methods=['GET'])
def get_patient_analysis(patient_id):
    """Fetches a real patient from the Kaggle dataset and runs the Scheme Engine."""
    if healthcare_df is None:
        return jsonify({"error": "Database not loaded"}), 500

    patient_records = healthcare_df[healthcare_df['patient_id'] == patient_id]

    if patient_records.empty:
        return jsonify({"error": "Patient not found"}), 404

    record = patient_records.iloc[0].to_dict()

    scheme_analysis = analyze_scheme_gaps(record)

    return jsonify({
        "patient_id": patient_id,
        "state": record['state'],
        "financials": {
            "total_cost": float(record['total_cost_inr']),
            "govt_subsidy": float(record['govt_subsidy_inr']),
            "out_of_pocket": float(record['out_of_pocket_inr'])
        },
        "scheme_navigation": scheme_analysis
    })
@app.route('/api/web-chat', methods=['POST'])
def web_chat_reply():
    """Receives messages from the React WhatsApp Simulator."""
    data = request.json
    incoming_msg = data.get('message', '').lower()

    if 'cancer' in incoming_msg or 'dar' in incoming_msg or 'scared' in incoming_msg:
        reply = "Please do not worry, you are not alone. SAHARA is here to help you step-by-step. I will check your PM-JAY eligibility now.\n\nCould you please click the 📎 icon and upload a photo of the doctor's prescription?"

    elif 'prescription' in incoming_msg or 'voice note' in incoming_msg:
        reply = "Thank you. I have extracted the details: 'Oncology Referral'. \n\nGood news: Your Chiranjeevi scheme covers this. I am routing your file to the ASHA worker dashboard for hospital assignment."

    else:
        reply = "Welcome to SAHARA. How can I assist you with your health relief schemes today?"

    return jsonify({"reply": reply})

import pandas as pd
import math

def load_healthcare_data():
    """Loads CSVs and merges them into a single dataframe for the Rules Engine."""
    try:
        patients = pd.read_csv('patients.csv')
        admissions = pd.read_csv('admissions.csv')
        billing = pd.read_csv('billing.csv')

        df = pd.merge(admissions, patients, on='patient_id', how='inner')
        df = pd.merge(df, billing, on='admission_id', how='inner')
        return df
    except Exception as e:
        print(f"Error loading datasets: {e}")
        return None

healthcare_df = load_healthcare_data()

def analyze_scheme_gaps(patient_record):
    """
    Deterministically evaluates a patient's financial risk based on government rules.
    """
    bpl_status = patient_record['bpl_card']
    state = patient_record['state']
    total_cost = float(patient_record['total_cost_inr'])
    out_of_pocket = float(patient_record['out_of_pocket_inr'])

    if bpl_status == True and out_of_pocket > 0:
        return {
            "status": "Scheme Gap Detected",
            "alert_level": "High",
            "message": f"Patient is BPL but faces ₹{out_of_pocket:,.2f} in out-of-pocket costs.",
            "recommended_actions": [
                "Draft PM-JAY Grievance Letter",
                "Apply for Chief Minister (CM) Relief Fund",
                "Match with Local Medical NGO"
            ]
        }

    elif state == "Rajasthan" and total_cost > 50000:
        return {
            "status": "Eligibility Check Required",
            "alert_level": "Medium",
            "message": f"High bill (₹{total_cost:,.2f}) detected in Rajasthan.",
            "recommended_actions": [
                "Verify Chiranjeevi Yojana Enrollment (Coverage up to 25 Lakhs)",
                "Check for Ayushman Mitra desk at hospital"
            ]
        }

    elif bpl_status == True and out_of_pocket == 0:
        return {
            "status": "Fully Covered",
            "alert_level": "Low",
            "message": "PM-JAY or State Scheme is covering 100% of costs.",
            "recommended_actions": ["Proceed with treatment schedule"]
        }

    else:
        return {
            "status": "Standard Processing",
            "alert_level": "Low",
            "message": f"Patient responsible for ₹{out_of_pocket:,.2f} via {patient_record.get('insurance_type', 'Private/Out-of-pocket')}.",
            "recommended_actions": ["Provide standard hospital transit routing"]
        }

@app.route('/api/voice-chat', methods=['POST'])
def handle_voice_chat():
    """Receives user audio, processes it, and returns an audio response."""

    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    temp_input_path = "temp_user_audio.webm"
    audio_file.save(temp_input_path)

    try:

        with open(temp_input_path, "rb") as file:
            transcription = groq_client.audio.transcriptions.create(
              file=(temp_input_path, file.read()),
              model="whisper-large-v3",
              language="hi"
            )
        user_text = transcription.text
        print(f"👂 Heard: {user_text}")

        prompt = f"""
        You are SAHARA, a highly empathetic health relief AI for rural India.
        Respond to the user with pure reassurance before asking for documents.
        Keep the response to 2 short sentences.
        Reply in conversational Hindi (written in the Devanagari script).

        User said: {user_text}
        """
        response = gemini_model.generate_content(prompt)
        bot_reply_text = response.text.strip()
        print(f"🧠 Thought: {bot_reply_text}")

        tts = gTTS(text=bot_reply_text, lang='hi', slow=False)
        temp_output_path = "temp_bot_audio.mp3"
        tts.save(temp_output_path)

        with open(temp_output_path, "rb") as out_file:
            encoded_audio = base64.b64encode(out_file.read()).decode('utf-8')

        os.remove(temp_input_path)
        os.remove(temp_output_path)

        return jsonify({
            "status": "success",
            "user_text": user_text,
            "bot_text": bot_reply_text,
            "audio_base64": encoded_audio
        })

    except Exception as e:
        print(f"Error in voice pipeline: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/process-document', methods=['POST'])
def process_document():
    """Takes a medical document image, extracts text via OCR, and parses medical NLP."""
    # 2. ADD THIS PRE-FLIGHT CHECK
    if request.method == 'OPTIONS':
        return '', 200
    if 'document' not in request.files:
        return jsonify({"error": "No document provided"}), 400

    file = request.files['document']

    try:

        img = Image.open(file.stream)

        prompt = """
        You are SAHARA's Medical Extraction Engine.
        Read this handwritten prescription or medical document.
        Extract the key entities and return them strictly as a JSON object matching this exact format:
        {
            "patient_name": "Name or Unknown",
            "diagnosis": "The stated illness or reason for visit",
            "medications": ["List", "of", "drugs"],
            "urgency": "Low, Medium, or High based on diagnosis severity",
            "summary": "One sentence simple explanation for the patient"
        }
        Return ONLY valid JSON. Do not include markdown formatting like ```json.
        """

        response = gemini_model.generate_content([prompt, img])

        raw_text = response.text.replace("```json", "").replace("```", "").strip()
        extracted_data = json.loads(raw_text)

        print(f"📄 Extracted Medical Data: {extracted_data}")

        return jsonify({
            "status": "success",
            "data": extracted_data
        })

    except Exception as e:
        print(f"Error in OCR/NLP pipeline: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-grievance', methods=['POST'])
def generate_grievance():
    """Drafts a formal PM-JAY inclusion request letter in Hindi."""
    try:

        data = request.get_json() or {}
        patient_name = data.get('name', '[रोगी का नाम / Patient Name]')
        condition = data.get('condition', '[गंभीर बीमारी / Severe Condition]')

        prompt = f"""
        You are SAHARA, generating an official PM-JAY (Ayushman Bharat) grievance letter.
        The patient ({patient_name}) is suffering from {condition} and is extremely poor, but their name is missing from the SECC-2011/PM-JAY eligibility list.

        Draft a formal Hindi application addressed to the 'Ayushman Mitra' at the District Hospital.
        Request manual verification and urgent inclusion into the scheme for treatment.
        Use formal, respectful government Hindi (shuddh hindi).
        Include placeholders like [दिनांक / Date], [पता / Address], and [हस्ताक्षर / Signature].

        Return ONLY the raw text of the letter. Do not use markdown blocks.
        """

        response = gemini_model.generate_content(prompt)
        letter_text = response.text.strip()

        return jsonify({
            "status": "success",
            "letter": letter_text
        })

    except Exception as e:
        print(f"Error generating grievance: {e}")
        return jsonify({"error": str(e)}), 500

LOCAL_HOSPITALS = [
    {
        "id": "H001",
        "name": "SMS Medical College & Hospital",
        "type": "Government (Tier 1)",
        "specialties": ["cancer", "cardiology", "neurology", "severe", "oncology"],
        "beds_available": 12,
        "distance_km": 4.5,
        "pm_jay_empaneled": True
    },
    {
        "id": "H002",
        "name": "Jaipur District Hospital",
        "type": "Government (Tier 2)",
        "specialties": ["general", "fever", "orthopedic", "maternity"],
        "beds_available": 45,
        "distance_km": 1.2,
        "pm_jay_empaneled": True
    },
    {
        "id": "H003",
        "name": "Fortis Escorts Jaipur",
        "type": "Private (Empaneled)",
        "specialties": ["cardiology", "surgery", "cancer"],
        "beds_available": 3,
        "distance_km": 8.0,
        "pm_jay_empaneled": True
    }
]

@app.route('/api/route-hospital', methods=['POST', 'OPTIONS'])
def route_hospital():
    """Matches OCR diagnosis data to the best available PM-JAY hospital."""

    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json()
        diagnosis = data.get('diagnosis', '').lower()
        urgency = data.get('urgency', '').lower()

        matched_hospitals = []

        for hospital in LOCAL_HOSPITALS:

            has_specialty = any(spec in diagnosis for spec in hospital['specialties'])
            handles_urgency = "severe" in hospital['specialties'] if urgency == "high" else True

            if (has_specialty or handles_urgency) and hospital['beds_available'] > 0:
                matched_hospitals.append(hospital)

        matched_hospitals.sort(key=lambda x: x['distance_km'])

        if not matched_hospitals:
            matched_hospitals = [h for h in LOCAL_HOSPITALS if "general" in h['specialties']]

        return jsonify({
            "status": "success",
            "primary_recommendation": matched_hospitals[0],
            "alternatives": matched_hospitals[1:]
        })

    except Exception as e:
        print(f"Routing Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting SAHARA Backend Server on port 5000...")
    app.run(debug=True, port=5000)
