# 🌿 MediKiosk -- Smart Patient Case-Taking Platform
### Ministry of Ayush • Smart India Hackathon (SIH) • ABDM NRCES FHIR R4 Integrated

MediKiosk is an AI-powered OPD clinical case-taking and intake kiosk software designed for public hospitals and Ayush healthcare facilities. It automates patient registration with **Sequential Auto-Token Generation**, conducts a structured **9-Stage Clinical & Dashavidha Pariksha Intake Interview**, digitizes prior physical lab reports/prescriptions via vision OCR, and immediately transmits a structured draft to the **Physician & Staff Console** (`/doctor`).

---

## 🏛️ System Architecture

```
                 ┌──────────────────────────────────────────────┐
                 │       PATIENT-FACING OPD KIOSK               │
                 │      http://localhost:5173                   │
                 │  - Auto-Token Registration & ABHA ID         │
                 │  - 9-Stage SOCRATES & Ayush Interview        │
                 │  - Document / Prescription Scanner           │
                 │  - Patient Waiting Confirmation (No Admin)   │
                 └──────────────────────┬───────────────────────┘
                                        │
                                        ▼ (REST API)
                 ┌──────────────────────────────────────────────┐
                 │        FASTAPI BACKEND ENGINE                │
                 │       http://localhost:8000                  │
                 │  - Thread-Safe Sequential Token Manager      │
                 │  - OpenRouter Claude 3.5 Sonnet Integration  │
                 │  - 9-Stage Clinical Progression Tracker      │
                 │  - Red-Flag Triage Engine                    │
                 │  - ABDM NRCES FHIR R4 Bundle Generator       │
                 └──────────────────────┬───────────────────────┘
                                        │
                                        ▼ (EHR Transmission)
                 ┌──────────────────────────────────────────────┐
                 │     PHYSICIAN & STAFF CONSOLE (ADMIN)        │
                 │      http://localhost:5173/doctor            │
                 │  - Live OPD Queue & Category Filter Pills    │
                 │  - + Book Walk-in with Auto-Tokens           │
                 │  - Disease-Aware Claude Diagnostic Chatbot   │
                 │  - Dashavidha Pariksha & Lab Investigations  │
                 │  - ⬇️ Download ABDM FHIR R4 Bundle (.json)   │
                 └──────────────────────────────────────────────┘
```

---

## 📋 System Prerequisites

Before running the application manually, ensure you have:
1. **Python 3.10 to 3.12** installed: [Download Python](https://www.python.org/downloads/)
2. **Node.js 18+ and npm** installed: [Download Node.js](https://nodejs.org/)
3. **Chromium-based Browser** (Google Chrome, Microsoft Edge, or Brave) for Speech-to-Text microphone support.
4. *(Optional)* **Docker Desktop** if you prefer running via containers.

---

## 🚀 How to Run Manually (Step-by-Step)

To run the project manually, you will start the **Backend** and **Frontend** in two separate terminals.

---

### Step 1: Start the Backend (Terminal 1)

Open a terminal (PowerShell, Command Prompt, or Bash) in the project root directory (`medikiosk/`):

#### 1. Navigate to the backend folder:
```bash
cd backend
```

#### 2. Create and activate a Python virtual environment:

**On Windows (PowerShell):**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```
*(If PowerShell displays an execution policy error, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` and then run `.\.venv\Scripts\Activate.ps1`)*

**On Windows (Command Prompt):**
```cmd
python -m venv .venv
.\.venv\Scripts\activate.bat
```

**On macOS / Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

#### 3. Install required Python packages:
```bash
pip install -r requirements.txt
```

#### 4. Configure your `.env` file:
Ensure a file named `.env` exists inside the `backend/` directory with your OpenRouter API key:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

#### 5. Start the FastAPI backend server:
```bash
uvicorn main:app --reload --port 8000
```

You will see:
```text
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

---

### Step 2: Start the Frontend (Terminal 2)

Open a **second terminal** in the project root directory (`medikiosk/`):

#### 1. Navigate to the frontend folder:
```bash
cd frontend
```

#### 2. Install frontend dependencies:
```bash
npm install
```

#### 3. Start the Vite development server:
```bash
npm run dev
```

You will see:
```text
  VITE v5.4.21  ready in 350 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://<your-ip>:5173/
```

---

## 🌐 How to Access & Use the Application

Once both servers are running:

### 1. Patient OPD Intake Kiosk (Public Screen)
🔗 **URL**: [http://localhost:5173](http://localhost:5173)

- **Language Selection**: Toggle between **English** and **हिंदी** directly in the top bar.
- **Department Selection**: Choose **🌿 Ayurveda OPD**, **🩺 General Medicine**, or **⚕️ Integrated OPD**.
- **Sequential Token Generation**: Enter a name (or proceed as Guest) and click **Proceed**. The backend automatically assigns the next sequential token number (e.g. #1, #2, #3...).
- **ABHA ID Integration**: Enter an Ayushman Bharat Health Account ID or click **⚡ Generate Demo ABHA**.
- **9-Stage Conversational Interview**: The chatbot queries Chief Complaint, Site/Onset, Severity (1–10), Triggers, Agni (digestion), Koshtha (bowel), Sleep, and Medications.
- **Microphone Voice Input**: Speak your answers in Hindi or English using the **Tap to Speak** button.
- **Automatic Completion**: After 8–10 questions, the interview automatically completes and transitions to Document Scanning.
- **Document & Lab Scanner**: Upload photos of prescriptions or diagnostic reports with automatic abnormal value detection.
- **Patient Confirmation**: The final screen displays the patient's **Token #** with instructions to wait in the OPD hall. **No links or buttons leading to the doctor portal are exposed to patients.**

---

### 2. Physician & Staff Workstation (Admin Portal)
🔗 **URL**: [http://localhost:5173/doctor](http://localhost:5173/doctor)

- **Live OPD Patient Queue**:
  - Displays all registered patients ordered sequentially by **Token #**.
  - **Category Filter Pills**: Filter by `All`, `🌿 Ayush`, `🩺 General`, `⚕️ Integrated`, or `⚠️ Priority`.
  - Live search by patient name or token number.
  - Auto-refreshes every 6 seconds.
- **+ Book Walk-in Patient**:
  - Doctors or desk staff can click **+ Book** to register a walk-in patient with an auto-incremented token on the spot.
- **Clinical Review Tabs**:
  - **Tab 1: Clinical Case Summary**: Editable draft of Chief Complaint, HPI (SOCRATES), Allergies, and Family History.
  - **Tab 2: Disease-Aware Claude Chatbot**: Embedded diagnostic assistant that locks onto reported conditions (Diabetes, Hypertension, GERD, Osteoarthritis, etc.) and asks targeted clinical follow-ups.
  - **Tab 3: Ayush Dashavidha Pariksha**: Prakriti, Agni status, Dhatu Sara, Samhanana, and Ahara-Vihara assessment.
  - **Tab 4: Prior Documents & Labs**: Highlights abnormal laboratory values (e.g. elevated HbA1c, high SGOT/SGPT).
  - **Tab 5: ABDM FHIR R4 Bundle**: View the live NRCES-compliant FHIR R4 Document Bundle.
  - **"⬇️ Download FHIR Bundle (.json)"**: 1-click download of the complete FHIR JSON bundle.
- **Physician Approval & Print**:
  - Click **Approve & Save** to validate physician edits and save the final clinical sheet.
  - Click **Print Case Sheet** for a physical paper printout for the patient's OPD booklet.

---

### 3. Backend API Documentation & Health Checks
- **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **OpenAPI JSON Spec**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)
- **Live Health Status**: [http://localhost:8000/api/health](http://localhost:8000/api/health)
  ```json
  {
    "status": "ok",
    "active_sessions": 4,
    "openrouter_configured": true
  }
  ```

---

## 🐳 Alternative: Running with Docker (1-Command Startup)

If you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed, you can launch both frontend and backend with a single command:

```bash
docker compose up -d --build
```

- **Kiosk & Doctor Dashboard**: [http://localhost:5173](http://localhost:5173) or [http://localhost:80](http://localhost:80)
- **FastAPI Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

To view real-time logs:
```bash
docker compose logs -f
```

To stop containers:
```bash
docker compose down
```

For complete Docker architecture details, refer to [`DOCKER_INSTRUCTIONS.md`](DOCKER_INSTRUCTIONS.md).

---

## 🧪 Automated Testing Suite

To verify all system features end-to-end (Token Sequentiality, Live Queue, OpenRouter Claude 3.5 Sonnet targeting, and Frontend status), run:

```bash
python test_e2e.py
```

---

## 📄 License & Compliance
Built for the **Smart India Hackathon (SIH)** under the guidelines of the **Ministry of Ayush, Government of India**. Conforms to the **Ayushman Bharat Digital Mission (ABDM)** NRCES FHIR R4 profile specifications and **Digital Personal Data Protection (DPDP) Act 2023** privacy standards.
#   M e d i k i o s k  
 #   M e d i k i o s k  
 