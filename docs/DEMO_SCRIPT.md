# CoalGov AI — 5-Minute Judge Walkthrough & Demo Script

> **Smart India Hackathon 2026** | Problem Statement: **SIH26024**  
> **Ministry of Coal / Coal India Limited (CIL)**

---

## 🎯 Demo Summary (What Judges Will Experience)

In 5 minutes, you will demonstrate a complete, closed-loop governance cycle:
**DATA COLLECTION → AI RISK & ANOMALY DETECTION → CAPA SLA ESCALATION → PDF REPORT GENERATION → CRYPTOGRAPHIC SHA-256 AUDIT VERIFICATION**

---

## ⏱️ Step-by-Step 5-Minute Demo Flow

### Step 1: Login & Persona Switcher (0:00 - 0:45)
1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. Click the **"Mine Manager"** quick demo login button.
3. Show the **Mine Dashboard**: Point out the **Statutory Compliance Rate (85.2%)**, **Active CAPAs**, **AI Risk Index**, and the interactive **GIS Leaflet Map** showing Gevra, Dipka, Jharia, Rajmahal, and other Coal India mines.
4. Point out the top header **"Demo Roles"** bar allowing instant persona switching between Field Inspector, Mine Manager, Corporate HQ, Regulator, and Admin.

---

### Step 2: Mobile Inspector PWA & Offline Field Sync (0:45 - 2:00)
1. In the top navigation bar or sidebar, click **"PWA Field Mode"** (or navigate to `/mobile`).
2. Point out the **PWA Header**: Show auto-captured **GPS coordinates** and the **Network Status Indicator** (Online / Offline).
3. **Simulate Offline Mode:** Turn off Wi-Fi or disconnect network in browser dev tools.
4. Fill in a field observation:
   - **Target Mine:** Gevra Mega Opencast Mine
   - **Category:** SAFETY
   - **Severity:** CRITICAL (24h SLA)
   - **Description:** "High-voltage 3.3kV trailing cable insulation damaged near pit excavation face B."
   - **Statutory Violation:** Enabled (Checked)
5. Click **"Save & Sync Observation"**.
6. Show the **Offline Badge**: Notice how the application saves the record immediately to **IndexedDB local storage** and displays `"🔴 Offline Mode: Observation saved locally in IndexedDB"`.
7. **Simulate Network Reconnection:** Re-enable network. The system automatically triggers idempotent bulk sync (`/api/inspections/observations/sync`), uploads the observation, and auto-generates a **CRITICAL CAPA** with a 24-hour SLA timer!

---

### Step 3: CAPA SLA Timers & Responsible Officer Resolution (2:00 - 3:00)
1. Navigate to **"CAPA Board & SLAs"** (`/capas`).
2. Filter by **"OPEN"** or **"ESCALATED"**.
3. Point out the auto-escalated CAPAs (e.g., Level 2 escalated to General Manager).
4. Click **"Submit Remediation Proof"** on the newly created CAPA:
   - **Proof Explanation:** "De-energized circuit, replaced trailing cable with DGMS approved armored sheath, insulation resistance test passed at 500MΩ."
   - Click **"Submit for Verification"**. Status updates to **RESOLVED**.
5. Switch to **Mine Manager** persona and click **"Verify & Close CAPA"**. Status updates to **VERIFIED**.

---

### Step 4: One-Click Statutory PDF Compliance Report (3:00 - 3:45)
1. On the Mine Dashboard, click **"Export Statutory Report (PDF)"**.
2. An official **Ministry of Coal Statutory Compliance PDF** opens in a new tab.
3. Show the judge:
   - Mine metadata (Rajmahal / Gevra, CIL Subsidiary, Mine Type)
   - Compliance percentage summary table
   - Active CAPA SLA table
   - Statutory seal & SHA-256 audit footnote

---

### Step 5: Cryptographic SHA-256 Ledger & Live Tamper Demo (3:45 - 5:00)
1. Navigate to **"Cryptographic Ledger"** (`/audit`).
2. Show the parent-child hash-chained audit log table where every action (`RECORD_OBSERVATION`, `AUTO_CREATE_CAPA`, `RESOLVE_CAPA`, `VERIFY_CAPA`) is cryptographically signed with SHA-256 hashes (`prev_hash` -> `current_hash`).
3. Click **"Verify Integrity"**: The system recomputes the entire blockchain hash chain and confirms:
   `✓ SHA-256 Cryptographic Chain Verified. All block hashes match.`
4. Click **"Simulate Tampering Demo"**:
   - The backend intentionally mutates a historical row payload to simulate malicious database tampering.
   - The UI immediately alerts in red:  
     `🚨 LEDGER TAMPERING DETECTED! 1 record(s) fail cryptographic hash verification.`
5. Explain to judges: *This guarantees tamper-evident compliance logs that prevent backdating or hiding safety violations.*

---

## 🏆 Demo Credentials Cheat-Sheet

| Role | Email | Password |
|---|---|---|
| Field Inspector | `inspector@coalgov.in` | `inspector123` |
| Mine Manager | `manager@coalgov.in` | `manager123` |
| Corporate HQ | `corporate@coalgov.in` | `corporate123` |
| Regulator / DGMS | `regulator@coalgov.in` | `regulator123` |
| System Admin | `admin@coalgov.in` | `admin123` |
