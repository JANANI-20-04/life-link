/* =========================================================
   LIFELINK DASHBOARD — APP STATE
   ========================================================= */

const state = {
    activeEmergencies: 12,
    availableDonors: 1248,
    suitableDonors: 18,
    notified: 6,
    accepted: 2,
    progress: 70,
};

/* Section names shown for sidebar items that don't have a
   built-out view yet — keeps navigation honest instead of dead. */
const VIEW_LABELS = {
    "emergency-requests": "Emergency Requests",
    "donors": "Donors",
    "blood-banks": "Blood Banks",
    "hospitals": "Hospitals",
    "smart-matching": "Smart Matching",
    "analytics": "Analytics",
    "donation-camps": "Donation Camps",
    "rewards": "Rewards",
    "feedback": "Feedback",
    "settings": "Settings",
};

/* =========================================================
   TOAST NOTIFICATIONS (replaces alert() for quick feedback)
   ========================================================= */

function toast(message, type = "success", duration = 3200) {
    let wrap = document.getElementById("toastWrap");
    if (!wrap) {
        wrap = document.createElement("div");
        wrap.id = "toastWrap";
        wrap.className = "toast-wrap";
        document.body.appendChild(wrap);
    }
    const el = document.createElement("div");
    el.className = "toast " + type;
    el.textContent = message;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), duration);
}

/* =========================================================
   STAT CARD RENDERING
   ========================================================= */

function renderStats() {
    setText("statActiveEmergencies", state.activeEmergencies);
    setText("statAvailableDonors", state.availableDonors.toLocaleString());
    setText("miniSuitable", state.suitableDonors);
    setText("miniNotified", state.notified);
    setText("miniAccepted", state.accepted);

    const bar = document.getElementById("progressBar");
    const label = document.getElementById("progressPercent");
    if (bar) bar.style.width = state.progress + "%";
    if (label) label.textContent = state.progress + "%";

    pulse("statActiveEmergenciesCard");
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function pulse(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add("pulse");
    setTimeout(() => el.classList.remove("pulse"), 700);
}

/* =========================================================
   EMERGENCY MODAL
   ========================================================= */

function openModal() {
    const modal = document.getElementById("emergencyModal");
    modal.classList.add("open");
    document.getElementById("hospital").focus();
    document.addEventListener("keydown", handleEscKey);
}

function closeModal() {
    const modal = document.getElementById("emergencyModal");
    modal.classList.remove("open");
    clearValidationError("hospitalGroup");
    document.removeEventListener("keydown", handleEscKey);
}

function handleEscKey(e) {
    if (e.key === "Escape") closeModal();
}

function showValidationError(groupId, message) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.classList.add("invalid");
    const errEl = group.querySelector(".error-text");
    if (errEl) errEl.textContent = message;
}

function clearValidationError(groupId) {
    const group = document.getElementById(groupId);
    if (group) group.classList.remove("invalid");
}

function createEmergency() {
    const blood = document.getElementById("bloodGroup").value;
    const units = document.getElementById("units").value;
    const hospital = document.getElementById("hospital").value.trim();
    const urgency = document.getElementById("urgency").value;

    if (!hospital) {
        showValidationError("hospitalGroup", "Please enter the hospital name.");
        document.getElementById("hospital").focus();
        return;
    }
    clearValidationError("hospitalGroup");

    // Reflect the new request directly in the Emergency Command Center
    setText("requestBloodType", blood);
    setText("requestUnits", units + (units === "1" ? " Unit Required" : " Units Required"));
    setText("requestHospitalName", "🏥 " + hospital);
    setText("requestId", "Request #LL" + Math.floor(1000 + Math.random() * 9000));
    setText("requestAge", "Just now");

    const criticalBadge = document.getElementById("criticalBadge");
    if (criticalBadge) criticalBadge.textContent = urgency.toUpperCase();

    // Update live state
    state.activeEmergencies += 1;
    state.suitableDonors = 12 + Math.floor(Math.random() * 15);
    state.notified = 0;
    state.accepted = 0;
    state.progress = 5;
    renderStats();

    toast("🚨 Emergency activated for " + blood + " at " + hospital + ".", "success");
    closeModal();
}

/* =========================================================
   DONOR NOTIFY (per-row, updates that row instead of just alerting)
   ========================================================= */

function notifyDonor(button, donorLabel) {
    if (button.classList.contains("notified")) return;

    button.textContent = "Notified ✓";
    button.classList.add("notified");
    button.disabled = true;

    state.notified += 1;
    renderStats();

    toast("🔔 Emergency notification sent to " + donorLabel + ".", "success");
}

/* =========================================================
   SIDEBAR NAVIGATION
   Dashboard renders the full view already in the HTML.
   Every other item switches to a clearly-labeled placeholder
   instead of doing nothing, and is keyboard operable.
   ========================================================= */

function initSidebar() {
    const items = document.querySelectorAll(".nav-item");
    items.forEach((item) => {
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");

        item.addEventListener("click", () => selectNavItem(item));
        item.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectNavItem(item);
            }
        });
    });
}

function selectNavItem(item) {
    document.querySelectorAll(".nav-item").forEach((i) => i.classList.remove("active"));
    item.classList.add("active");

    const view = item.dataset.view;
    const dashboardView = document.getElementById("dashboardView");
    const placeholder = document.getElementById("placeholderView");

    if (view === "dashboard") {
        dashboardView.style.display = "";
        placeholder.style.display = "none";
        return;
    }

    dashboardView.style.display = "none";
    placeholder.style.display = "";
    placeholder.innerHTML =
        '<strong>' + (VIEW_LABELS[view] || "This section") + '</strong>' +
        "This view is planned for a future version of LifeLink and isn't built yet in this prototype.";
}

/* =========================================================
   NOTIFICATIONS BELL
   ========================================================= */

function showNotifications() {
    const bell = document.getElementById("notificationBell");
    if (bell) bell.classList.remove("has-unread");

    toast("2 donors accepted request #LL1024", "success");
    toast("O− blood stock is low", "warning", 4000);
    toast("New emergency request received", "success");
}

/* =========================================================
   LANGUAGE SWITCH
   ========================================================= */

function initLanguageSwitch() {
    const select = document.getElementById("language");
    if (!select) return;

    select.addEventListener("change", function () {
        if (this.value === "தமிழ்") {
            toast("தமிழ் மொழி ஆதரவு விரைவில் கிடைக்கும்.", "warning");
        } else if (this.value === "हिन्दी") {
            toast("हिंदी भाषा समर्थन जल्द उपलब्ध होगा।", "warning");
        }
    });
}

/* =========================================================
   MODAL: close when clicking the dark overlay
   ========================================================= */

function initModalOverlayClose() {
    const modal = document.getElementById("emergencyModal");
    if (!modal) return;
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
}

/* =========================================================
   INIT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initSidebar();
    initLanguageSwitch();
    initModalOverlayClose();
    renderStats();
});
