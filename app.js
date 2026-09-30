/**
 * MedPass – Patient-Controlled Emergency Health Passport (OSHN)
 * Complete Front-end Controller & Reactive State System
 */

// Initial Patient State
let patientState = {
  id: "MP-2026-9821-DEL",
  name: "Rahul Sharma",
  age: 28,
  gender: "Male",
  bloodGroup: "O+",
  organDonor: "Yes",
  abhaId: "91-4567-8912-3456",
  abhaAddress: "rahul.sharma@abdm",
  allergies: "Penicillin (Anaphylaxis risk), Sulfa Drugs, Peanuts",
  conditions: "Type 2 Diabetes Mellitus, Mild Asthma (Carries Inhaler)",
  medications: "Metformin 500mg (Daily), Salbutamol Inhaler (PRN), No Metal Implants",
  notes: "Patient carries emergency EpiPen in backpack. In case of respiratory distress, avoid high sedation.",
  emergencyContacts: [
    {
      name: "Priya Sharma",
      relation: "Spouse (Wife)",
      phone: "+91 98765 43210",
      primary: true
    },
    {
      name: "Dr. Arvind Verma",
      relation: "Family Physician",
      phone: "+91 91234 56789",
      primary: false
    }
  ],
  privacy: {
    showBloodGroup: true,
    showAllergies: true,
    showContacts: true,
    lockConditions: true,
    lockMeds: true,
    smsAlertOnScan: true
  },
  qrToken: "e7f9a2b4-5c1d-4e89-b123-medpass09821",
  doctorUnlocked: false,
  verifiedDoctor: null,
  currentTheme: "theme-dark"
};

// Initial Mock Audit Logs
let auditLogs = [
  {
    id: 1,
    time: "2026-09-28 14:15:32",
    relative: "2 days ago",
    role: "First Responder / Ambulance",
    scanner: "Apollo Ambulance Unit #04",
    location: "South Extension, New Delhi (GPS: 28.5684° N, 77.2211° E)",
    tier: "Tier 1: Vital First-Aid Access",
    smsSent: true
  },
  {
    id: 2,
    time: "2026-09-24 09:30:11",
    relative: "6 days ago",
    role: "Verified Healthcare Professional",
    scanner: "Dr. K. S. Reddy (NMC #64129) - Fortis Healthcare",
    location: "Vasant Kunj, New Delhi (GPS: 28.5292° N, 77.1517° E)",
    tier: "Tier 2: Full Clinical Dossier Unlocked",
    smsSent: true
  },
  {
    id: 3,
    time: "2026-09-12 18:40:05",
    relative: "18 days ago",
    role: "Public Scanner",
    scanner: "Lock-Screen Verification Scan",
    location: "Connaught Place, New Delhi",
    tier: "Tier 1: Vital First-Aid Access",
    smsSent: true
  }
];

let qrCodeLockscreen = null;
let qrCodeWallet = null;
let qrCodeHero = null;

// Initialization on Window Load
window.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Generate QR codes
  generateQRCodes();

  // Populate dynamic UI
  renderAllViews();

  // Update clock
  updateClock();
  setInterval(updateClock, 30000);
});

// Update Digital Clock in Phone Mockup
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const clockEl = document.getElementById('lockscreen-clock');
  if (clockEl) {
    clockEl.innerText = `${hours}:${minutes}`;
  }

  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const dateEl = document.getElementById('lockscreen-date');
  if (dateEl) {
    dateEl.innerText = now.toLocaleDateString('en-US', options);
  }
}

// Generate QR Codes for all canvas targets
function generateQRCodes() {
  const emergencyUrl = `https://medpass.app/emergency/${patientState.qrToken}`;
  
  const containerLS = document.getElementById('qrcode-lockscreen');
  const containerWallet = document.getElementById('qrcode-wallet-card');
  const containerHero = document.getElementById('qrcode-hero');

  if (containerLS) {
    containerLS.innerHTML = '';
    qrCodeLockscreen = new QRCode(containerLS, {
      text: emergencyUrl,
      width: 128,
      height: 128,
      colorDark: "#0f172a",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  if (containerWallet) {
    containerWallet.innerHTML = '';
    qrCodeWallet = new QRCode(containerWallet, {
      text: emergencyUrl,
      width: 88,
      height: 88,
      colorDark: "#0f172a",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  if (containerHero) {
    containerHero.innerHTML = '';
    qrCodeHero = new QRCode(containerHero, {
      text: emergencyUrl,
      width: 112,
      height: 112,
      colorDark: "#0f172a",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  }
}

// Tab Switching Controller
function switchTab(tabId) {
  const tabs = [
    'landing', 
    'patient-portal', 
    'qr-generator', 
    'emergency-scan', 
    'audit-trail', 
    'doctor-portal', 
    'abha-hub', 
    'sih-presentation'
  ];
  
  tabs.forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    const navBtn = document.getElementById(`nav-${t}`);
    
    if (el) el.classList.add('hidden');
    if (navBtn) {
      navBtn.classList.remove('bg-slate-900', 'text-white', 'shadow-sm', 'bg-slate-800');
      if (t === 'emergency-scan') {
        // preserve emergency red styles
      } else if (t === 'abha-hub') {
        navBtn.classList.add('text-sky-700');
      } else if (t === 'sih-presentation') {
        navBtn.classList.add('text-amber-700');
      } else {
        navBtn.classList.add('text-slate-600');
      }
    }
  });

  const activeContent = document.getElementById(`tab-${tabId}`);
  const activeBtn = document.getElementById(`nav-${tabId}`);

  if (activeContent) activeContent.classList.remove('hidden');
  if (activeBtn) {
    activeBtn.classList.remove('text-slate-600', 'text-sky-700', 'text-amber-700');
    activeBtn.classList.add('bg-slate-900', 'text-white', 'shadow-sm');
  }

  // Scroll smoothly to top of page
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Refresh icons for dynamic DOM
  if (window.lucide) {
    lucide.createIcons();
  }

  // Trigger simulated scan event when user opens Emergency Scan tab
  if (tabId === 'emergency-scan') {
    handleEmergencyScanViewOpened();
  }
}

// Wallpaper Theme Switcher
function setWallpaperTheme(themeClass) {
  patientState.currentTheme = themeClass;
  const phone = document.getElementById('phone-preview-card');
  if (phone) {
    phone.classList.remove('theme-dark', 'theme-crimson', 'theme-midnight');
    phone.classList.add(themeClass);
  }
}

// When Emergency Scan is opened (simulating a paramedic scanning the QR code)
function handleEmergencyScanViewOpened() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Add new scan log
  const newLog = {
    id: Date.now(),
    time: now.toISOString().replace('T', ' ').substring(0, 19),
    relative: "Just now",
    role: "First Responder / QR Scanner",
    scanner: "Emergency Mobile Camera Scan (iOS / Android)",
    location: "Trauma Care Center, New Delhi (GPS: 28.5672° N, 77.2100° E)",
    tier: "Tier 1: Vital First-Aid Access",
    smsSent: patientState.privacy.smsAlertOnScan
  };

  auditLogs.unshift(newLog);
  renderAuditLogs();

  // Show Toast SMS Alert
  if (patientState.privacy.smsAlertOnScan) {
    triggerAlertToast(
      "MedPass QR Code Scanned!",
      `Emergency health passport for ${patientState.name} accessed. SMS dispatch to ${patientState.emergencyContacts[0].name} (${patientState.emergencyContacts[0].phone}).`,
      timeStr
    );
  }
}

// Update Profile State from Form
function updateProfileState() {
  patientState.bloodGroup = document.getElementById('profile-blood-group').value;
  patientState.age = document.getElementById('profile-age').value;
  patientState.gender = document.getElementById('profile-gender').value;
  patientState.organDonor = document.getElementById('profile-organ-donor').value;
  patientState.allergies = document.getElementById('profile-allergies').value;
  patientState.conditions = document.getElementById('profile-conditions').value;
  patientState.medications = document.getElementById('profile-meds').value;
  patientState.notes = document.getElementById('profile-notes').value;

  patientState.emergencyContacts[0].name = document.getElementById('contact1-name').value;
  patientState.emergencyContacts[0].relation = document.getElementById('contact1-rel').value;
  patientState.emergencyContacts[0].phone = document.getElementById('contact1-phone').value;

  patientState.emergencyContacts[1].name = document.getElementById('contact2-name').value;
  patientState.emergencyContacts[1].relation = document.getElementById('contact2-rel').value;
  patientState.emergencyContacts[1].phone = document.getElementById('contact2-phone').value;

  renderAllViews();
}

// Update Privacy Settings
function updatePrivacySettings() {
  patientState.privacy.showBloodGroup = document.getElementById('privacy-blood').checked;
  patientState.privacy.showAllergies = document.getElementById('privacy-allergies').checked;
  patientState.privacy.showContacts = document.getElementById('privacy-contacts').checked;
  patientState.privacy.lockConditions = document.getElementById('privacy-conditions-locked').checked;
  patientState.privacy.lockMeds = document.getElementById('privacy-meds-locked').checked;
  patientState.privacy.smsAlertOnScan = document.getElementById('privacy-sms-alert').checked;

  renderEmergencyScanView();
}

// Render All Subviews
function renderAllViews() {
  renderAllergyTags();
  renderLockscreenPreview();
  renderWalletCardPreview();
  renderEmergencyScanView();
  renderAuditLogs();
}

// Render Allergy Tags in Profile View
function renderAllergyTags() {
  const container = document.getElementById('allergy-tags-preview');
  if (!container) return;

  const items = patientState.allergies.split(',').map(s => s.trim()).filter(Boolean);
  container.innerHTML = items.map(allergy => {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
      <i data-lucide="alert-circle" class="w-3.5 h-3.5 text-rose-600"></i> ${allergy}
    </span>`;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// Render Phone Lockscreen Preview
function renderLockscreenPreview() {
  const bloodEl = document.getElementById('ls-blood');
  const nameEl = document.getElementById('ls-name');
  const allergiesEl = document.getElementById('ls-allergies');
  const iceEl = document.getElementById('ls-ice');

  if (bloodEl) bloodEl.innerText = patientState.bloodGroup;
  if (nameEl) nameEl.innerText = patientState.name;
  if (allergiesEl) {
    const primaryAllergy = patientState.allergies.split(',')[0] || "None Reported";
    allergiesEl.innerText = `Allergy: ${primaryAllergy}`;
  }
  if (iceEl) {
    const contact = patientState.emergencyContacts[0];
    iceEl.innerText = `ICE: ${contact.name} (${contact.phone})`;
  }
}

// Render Wallet Card Preview
function renderWalletCardPreview() {
  const bloodEl = document.getElementById('card-blood');
  const nameEl = document.getElementById('card-name');
  const abhaEl = document.getElementById('card-abha');
  const allergiesEl = document.getElementById('card-allergies-preview');
  const iceEl = document.getElementById('card-ice');

  if (bloodEl) bloodEl.innerText = patientState.bloodGroup;
  if (nameEl) nameEl.innerText = patientState.name;
  if (abhaEl) abhaEl.innerText = `ABHA: ${patientState.abhaAddress}`;
  if (allergiesEl) {
    const firstAllergy = patientState.allergies.split(',')[0] || "No Allergies";
    allergiesEl.innerText = `⚠️ Allergy: ${firstAllergy}`;
  }
  if (iceEl) {
    const c = patientState.emergencyContacts[0];
    iceEl.innerText = `${c.phone} (${c.name})`;
  }
}

// Render Emergency Scan View (Triage)
function renderEmergencyScanView() {
  // Blood group
  const bloodBadge = document.getElementById('scan-view-blood');
  if (bloodBadge) {
    bloodBadge.innerText = patientState.privacy.showBloodGroup ? patientState.bloodGroup : "RESTRICTED";
  }

  // Allergies
  const allergyList = document.getElementById('scan-view-allergies-list');
  if (allergyList) {
    if (patientState.privacy.showAllergies) {
      const list = patientState.allergies.split(',').map(s => s.trim()).filter(Boolean);
      allergyList.innerHTML = list.map(item => `
        <div class="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm">
          <div class="flex items-center gap-2">
            <i data-lucide="alert-octagon" class="w-5 h-5 text-rose-600 flex-shrink-0"></i>
            <span class="text-sm font-bold text-slate-900">${item}</span>
          </div>
          <span class="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200">CONTRAINDICATED</span>
        </div>
      `).join('');
    } else {
      allergyList.innerHTML = `<div class="p-3 text-xs text-slate-500 italic">Allergies hidden by patient privacy preference.</div>`;
    }
  }

  // Emergency Contacts
  const ice1Rel = document.getElementById('scan-view-ice1-rel');
  const ice1Name = document.getElementById('scan-view-ice1-name');
  const ice1Phone = document.getElementById('scan-view-ice1-phone');
  const ice2Rel = document.getElementById('scan-view-ice2-rel');
  const ice2Name = document.getElementById('scan-view-ice2-name');
  const ice2Phone = document.getElementById('scan-view-ice2-phone');

  if (ice1Rel) ice1Rel.innerText = `Primary ICE: ${patientState.emergencyContacts[0].relation}`;
  if (ice1Name) ice1Name.innerText = patientState.emergencyContacts[0].name;
  if (ice1Phone) ice1Phone.innerText = patientState.emergencyContacts[0].phone;
  if (ice2Rel) ice2Rel.innerText = patientState.emergencyContacts[1].relation;
  if (ice2Name) ice2Name.innerText = patientState.emergencyContacts[1].name;
  if (ice2Phone) ice2Phone.innerText = patientState.emergencyContacts[1].phone;

  // Tier 2 Clinical Lock Overlay
  const overlay = document.getElementById('tier2-locked-overlay');
  const docBadge = document.getElementById('doctor-verified-badge');
  const btnDoc = document.getElementById('btn-doctor-auth');

  if (patientState.doctorUnlocked) {
    if (overlay) overlay.classList.add('hidden');
    if (docBadge && patientState.verifiedDoctor) {
      docBadge.innerHTML = `<i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Verified by ${patientState.verifiedDoctor.name} (${patientState.verifiedDoctor.reg})`;
    }
    if (btnDoc) {
      btnDoc.innerHTML = `<i data-lucide="check-check" class="w-5 h-5 text-emerald-600"></i><span>Doctor Verified</span>`;
      btnDoc.classList.replace('bg-white', 'bg-emerald-50');
      btnDoc.classList.replace('text-rose-700', 'text-emerald-800');
    }
  } else {
    if (overlay) overlay.classList.remove('hidden');
  }

  // Populate Tier 2 text
  const condEl = document.getElementById('scan-view-conditions');
  const medsEl = document.getElementById('scan-view-meds');
  const notesEl = document.getElementById('scan-view-notes');

  if (condEl) condEl.innerText = patientState.conditions;
  if (medsEl) medsEl.innerText = patientState.medications;
  if (notesEl) notesEl.innerText = patientState.notes;

  if (window.lucide) lucide.createIcons();
}

// Render Audit Logs Timeline
function renderAuditLogs() {
  const container = document.getElementById('audit-logs-container');
  const totalScansEl = document.getElementById('stat-total-scans');
  const doctorScansEl = document.getElementById('stat-doctor-scans');
  const smsSentEl = document.getElementById('stat-sms-sent');
  const badgeEl = document.getElementById('audit-badge');

  if (totalScansEl) totalScansEl.innerText = auditLogs.length;
  if (doctorScansEl) {
    const docCount = auditLogs.filter(l => l.role.includes('Healthcare') || l.role.includes('Doctor')).length;
    doctorScansEl.innerText = docCount;
  }
  if (smsSentEl) {
    const smsCount = auditLogs.filter(l => l.smsSent).length;
    smsSentEl.innerText = smsCount;
  }
  if (badgeEl) badgeEl.innerText = auditLogs.length;

  if (!container) return;

  container.innerHTML = auditLogs.map(log => {
    const isDoc = log.role.includes('Healthcare') || log.role.includes('Doctor');
    const badgeColor = isDoc ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-rose-50 text-rose-700 border-rose-200';
    const iconName = isDoc ? 'stethoscope' : 'scan-line';

    return `
      <div class="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition">
        <div class="p-2.5 rounded-xl ${badgeColor} border flex-shrink-0 mt-0.5">
          <i data-lucide="${iconName}" class="w-5 h-5"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h4 class="text-sm font-bold text-slate-900 truncate">${log.scanner}</h4>
            <span class="text-xs text-slate-500 mono">${log.relative} (${log.time.split(' ')[1] || log.time})</span>
          </div>
          <p class="text-xs text-slate-600 mt-1 flex items-center gap-1.5 truncate">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400 flex-shrink-0"></i> ${log.location}
          </p>
          <div class="flex flex-wrap items-center gap-2 mt-2">
            <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-md ${badgeColor} border">${log.tier}</span>
            ${log.smsSent ? `
              <span class="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                <i data-lucide="check" class="w-3 h-3 text-emerald-600"></i> SMS Sent to ICE Kin
              </span>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// Doctor Authentication Modal Functions
function openDoctorAuthModal() {
  const modal = document.getElementById('doctor-auth-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeDoctorAuthModal() {
  const modal = document.getElementById('doctor-auth-modal');
  if (modal) modal.classList.add('hidden');
}

function verifyDoctorAndUnlock() {
  const name = document.getElementById('doc-auth-name').value || "Dr. Rajesh Verma";
  const reg = document.getElementById('doc-auth-reg').value || "NMC-2018-98421";
  const hospital = document.getElementById('doc-auth-hospital').value || "AIIMS Trauma Center";

  patientState.doctorUnlocked = true;
  patientState.verifiedDoctor = { name, reg, hospital };

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Add audit record for doctor unlock
  auditLogs.unshift({
    id: Date.now(),
    time: now.toISOString().replace('T', ' ').substring(0, 19),
    relative: "Just now",
    role: "Verified Healthcare Professional",
    scanner: `${name} (${reg}) - ${hospital}`,
    location: `${hospital}, Emergency Care`,
    tier: "Tier 2: Full Clinical Dossier Unlocked",
    smsSent: true
  });

  closeDoctorAuthModal();
  renderEmergencyScanView();
  renderAuditLogs();

  triggerAlertToast(
    "Tier 2 Clinical Access Granted",
    `Authorized by ${name} (${reg}). Full surgical & medication dossier unlocked for triage.`,
    timeStr
  );
}

// Toast Alert Manager
function triggerAlertToast(title, desc, timeStr) {
  const toast = document.getElementById('live-alert-toast');
  const titleEl = document.getElementById('toast-title');
  const descEl = document.getElementById('toast-desc');
  const timeEl = document.getElementById('toast-time');

  if (titleEl) titleEl.innerText = title;
  if (descEl) descEl.innerText = desc;
  if (timeEl) timeEl.innerText = timeStr;

  if (toast) {
    toast.classList.remove('hidden');
    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      dismissAlertToast();
    }, 8000);
  }
}

// Active Call Contact state
let activeCallContact = null;

// Initiate Emergency Call
function initiateEmergencyCall(contactIndex) {
  const contact = patientState.emergencyContacts[contactIndex] || patientState.emergencyContacts[0];
  activeCallContact = contact;

  const modal = document.getElementById('emergency-call-modal');
  const nameEl = document.getElementById('call-modal-name');
  const relEl = document.getElementById('call-modal-rel');
  const phoneEl = document.getElementById('call-modal-phone');
  const telLinkEl = document.getElementById('call-modal-tel-link');

  if (nameEl) nameEl.innerText = contact.name;
  if (relEl) relEl.innerText = `${contact.relation} (In Case of Emergency)`;
  if (phoneEl) phoneEl.innerText = contact.phone;

  const cleanNumber = contact.phone.replace(/[^0-9+]/g, '');
  if (telLinkEl) {
    telLinkEl.href = `tel:${cleanNumber}`;
  }

  if (modal) {
    modal.classList.remove('hidden');
  }

  // Refresh icons inside modal
  if (window.lucide) lucide.createIcons();

  // Play audio ringtone simulator
  playRingTone();

  // If on mobile browser, trigger native dialer directly
  if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    window.location.href = `tel:${cleanNumber}`;
  }

  // Log emergency contact dial action in audit trail
  const now = new Date();
  auditLogs.unshift({
    id: Date.now(),
    time: now.toISOString().replace('T', ' ').substring(0, 19),
    relative: "Just now",
    role: "Emergency Voice Call Initiated",
    scanner: `Dialing Kin: ${contact.name} (${contact.phone})`,
    location: "Trauma Emergency Triage Protocol",
    tier: "Voice SOS Dialer Triggered",
    smsSent: true
  });
  renderAuditLogs();

  triggerAlertToast(
    "Emergency Call Line Active",
    `Dialing ${contact.name} (${contact.phone}). Live audio ringtone synthesized.`,
    "Calling..."
  );
}

// Close Emergency Call Modal
function closeEmergencyCallModal() {
  const modal = document.getElementById('emergency-call-modal');
  if (modal) modal.classList.add('hidden');
}

// Handle direct dial triggered
function handleDirectDialTriggered() {
  if (activeCallContact) {
    const cleanNumber = activeCallContact.phone.replace(/[^0-9+]/g, '');
    window.location.href = `tel:${cleanNumber}`;
  }
}

// Copy phone number
function copyCurrentCallNumber() {
  if (activeCallContact) {
    navigator.clipboard.writeText(activeCallContact.phone).then(() => {
      triggerAlertToast(
        "Phone Number Copied",
        `Copied ${activeCallContact.phone} to clipboard.`,
        "Just now"
      );
    }).catch(() => {
      alert(`Contact Phone: ${activeCallContact.phone}`);
    });
  }
}

// Send WhatsApp Emergency SOS alert
function sendEmergencyWhatsAppAlert() {
  if (activeCallContact) {
    const cleanNumber = activeCallContact.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`🚨 CRITICAL EMERGENCY ALERT: I am responding to an emergency involving ${patientState.name}. Their MedPass Emergency Passport was accessed at an emergency triage center. Please contact or call back immediately!`);
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  }
}

// Web Audio API Ringtone Generator (Simulates authentic phone ring tone)
function playRingTone() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playToneBurst = (startTime) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = 440; // 440Hz + 480Hz US/India standard telephone ring
      osc2.frequency.value = 480;

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
      gain.gain.setValueAtTime(0.12, startTime + 1.8);
      gain.gain.linearRampToValueAtTime(0, startTime + 1.85);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + 1.9);
      osc2.stop(startTime + 1.9);
    };

    playToneBurst(ctx.currentTime + 0.1);
    playToneBurst(ctx.currentTime + 3.0);
  } catch (err) {
    console.log("AudioContext note:", err);
  }
}

function dismissAlertToast() {
  const toast = document.getElementById('live-alert-toast');
  if (toast) toast.classList.add('hidden');
}

// Profile Saved Notification
function saveProfileNotification() {
  triggerAlertToast(
    "Profile Synced Successfully",
    "Emergency health profile and privacy settings updated on local MedPass node.",
    "Just now"
  );
}

// Revoke & Regenerate QR Token
function regenerateQRToken() {
  const newToken = 'revoked-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();
  patientState.qrToken = newToken;
  generateQRCodes();

  auditLogs.unshift({
    id: Date.now(),
    time: new Date().toISOString().replace('T', ' ').substring(0, 19),
    relative: "Just now",
    role: "Patient Security Action",
    scanner: "MedPass Token Revocation Key",
    location: "Device IP: 103.212.14.82 (New Delhi)",
    tier: "Security Re-issue: Old QR Invalidated",
    smsSent: true
  });

  renderAuditLogs();

  triggerAlertToast(
    "QR Token Revoked & Re-issued",
    "All previous physical cards and lock-screen wallpapers are now invalidated. New secure token generated.",
    "Just now"
  );
}

// Clear Audit Logs (For demo testing)
function clearAuditLogs() {
  auditLogs = [];
  renderAuditLogs();
}

// Download Lockscreen Wallpaper as PNG (Canvas Renderer)
function downloadLockscreenImage() {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 2400; // Standard 9:20 Mobile Wallpaper
  const ctx = canvas.getContext('2d');

  // Background based on active theme
  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 2400);
  if (patientState.currentTheme === 'theme-crimson') {
    bgGrad.addColorStop(0, '#2a0b12');
    bgGrad.addColorStop(0.5, '#180d19');
    bgGrad.addColorStop(1, '#0a0e1a');
  } else if (patientState.currentTheme === 'theme-midnight') {
    bgGrad.addColorStop(0, '#031326');
    bgGrad.addColorStop(0.5, '#061e3d');
    bgGrad.addColorStop(1, '#040914');
  } else {
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.5, '#131b2e');
    bgGrad.addColorStop(1, '#0b1120');
  }

  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 2400);

  // Digital Clock
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 160px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${hours}:${minutes}`, 540, 480);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 48px "Plus Jakarta Sans", sans-serif';
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  ctx.fillText(now.toLocaleDateString('en-US', options), 540, 560);

  // Emergency Card Panel Background
  const cardX = 90;
  const cardY = 700;
  const cardW = 900;
  const cardH = 1200;
  const radius = 60;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 8;
  
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.fill();
  ctx.stroke();

  // Red Header Banner
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, 160, [radius, radius, 0, 0]);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 52px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('EMERGENCY MEDICAL PASSPORT', cardX + 60, cardY + 105);

  // Blood Group Badge
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('BLOOD GROUP:', cardX + 60, cardY + 260);

  ctx.fillStyle = '#ef4444';
  ctx.font = '900 70px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(patientState.bloodGroup, cardX + 380, cardY + 265);

  // Patient Name
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(patientState.name, cardX + 60, cardY + 340);

  // Allergies Alert
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  const firstAllergy = patientState.allergies.split(',')[0] || "None";
  ctx.fillText(`⚠️ ALLERGY: ${firstAllergy.toUpperCase()}`, cardX + 60, cardY + 410);

  // Emergency Contact
  const contact = patientState.emergencyContacts[0];
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 36px "JetBrains Mono", monospace';
  ctx.fillText(`ICE: ${contact.phone} (${contact.name})`, cardX + 60, cardY + 480);

  // QR Code from Lockscreen DOM
  const qrImg = document.querySelector('#qrcode-lockscreen img');
  if (qrImg && qrImg.src) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = qrImg.src;
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(315, cardY + 540, 450, 450, 30);
      ctx.fill();

      ctx.drawImage(img, 340, cardY + 565, 400, 400);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 32px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Scan with any smartphone camera for full profile', 540, cardY + 1070);

      ctx.fillStyle = '#64748b';
      ctx.font = '400 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('OSHN MedPass • SIH 2026', 540, cardY + 1130);

      // Trigger download
      const link = document.createElement('a');
      link.download = `MedPass-Lockscreen-${patientState.name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  } else {
    alert("Please wait a moment for the QR code to finish rendering.");
  }
}
