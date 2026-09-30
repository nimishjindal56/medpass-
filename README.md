# OSHN – MedPass Frontend
## Smart India Hackathon 2026 | Problem Statement #26196 (Student Innovation – MedTech)

**MedPass** is a patient-controlled emergency health passport designed to make critical medical information instantly accessible during the golden hour of an emergency.

---

### 🚀 How to Run the Frontend Right Now

#### Option 1: Direct Instant Run (Zero Setup / No Node Required)
Since Python 3.13 is installed on your computer, you can run a local development server with a single command:

1. Open PowerShell / Command Prompt and navigate to this folder:
   ```powershell
   cd "c:\Users\nimish jindal\OneDrive\Desktop\medpass\frontend"
   ```
2. Start the local server:
   ```powershell
   python -m http.server 3000
   ```
3. Open your browser and go to:
   ```
   http://localhost:3000
   ```
*(Or simply double-click `index.html` in File Explorer!)*

---

#### Option 2: Run via Vite + React (When Node.js is installed)
If you install Node.js later or want to use standard Vite commands:
```powershell
npm install
npm run dev
```

---

### 🌟 Key Features Implemented (Matching SIH Slides)

1. **Patient Profile & Emergency Vitals Manager** (`Patient Portal`):
   - Confirmed Blood Group & Rh factor.
   - High-contrast allergy tag alerts (e.g., Penicillin Anaphylaxis risk).
   - Chronic illnesses & ongoing critical medications (Insulin, Beta blockers, Inhaler).
   - Organ donor registration flag.
   - Primary & Secondary In Case of Emergency (ICE) contacts with direct call actions.

2. **Patient-Controlled Privacy & Access Matrix**:
   - Granular privacy toggles:
     - Show Blood Group on public scan (ON/OFF).
     - Show Severe Allergies on scan (ON/OFF).
     - Show Phone numbers on scan (ON/OFF).
     - Require Healthcare Professional / Doctor Auth for Chronic Conditions.
     - Require Healthcare Professional / Doctor Auth for Medication list.
     - Auto-dispatch SMS alert to emergency contacts on every scan.

3. **Multi-Format Export Studio**:
   - **Emergency Lock-Screen Wallpaper**: Authentic smartphone lock-screen with clock, date, red emergency banner, blood group, emergency contact, and scannable QR code. Renders onto an HTML5 Canvas and downloads as a full-resolution PNG wallpaper!
   - **Physical Wallet ID Card**: ISO CR80 credit-card-sized layout (front & back) with print CSS formatting (`Ctrl + P` / 1-click Print).

4. **Doctor & Paramedic Emergency Scan View (`/emergency-scan`)**:
   - **Tier 1 (First-Aid Triage)**: Giant blood group badge, high-alert allergy tags, 1-tap dial buttons for emergency contacts.
   - **Tier 2 (Clinical Dossier)**: Locked by default. Healthcare professionals enter their Name, Hospital, and National Medical Commission (NMC) registration number to unlock full surgical history, active prescriptions, and discharge summaries.

5. **Real-Time Access Audit Trail & SMS Alert Simulator**:
   - Live notification banner simulates instant SMS sent to family: *"MedPass QR Code Scanned at Trauma Care Center"*.
   - Complete audit trail tracking timestamp, scanner identity, hospital location, and GPS coordinates.
   - **Token Revocation**: 1-click "Revoke & Generate New QR" to invalidate lost physical cards or lock-screens.

6. **ABDM / ABHA Integration Hub**:
   - Demonstrates compliance with the Ayushman Bharat Digital Mission (ABDM) and National Health Authority (NHA) EHR guidelines.
   - Showcases break-glass emergency consent policies for unconscious patients.
