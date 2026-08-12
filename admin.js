import { db } from './firebase.js'; 
import { collection, getDocs, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getFirestore, collection as getCol, addDoc as addDoc2, getDocs as getDocs2, doc as doc2, updateDoc as updateDoc2, deleteDoc as deleteDoc2 } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

// Initialize Secondary Firebase App for Updates & Matches
const updateFirebaseConfig = {
    apiKey: "AIzaSyAQNpTgcKqYleL61DopRwz5LchN02jWQXI",
    authDomain: "update-7ac29.firebaseapp.com",
    projectId: "update-7ac29",
    storageBucket: "update-7ac29.firebasestorage.app",
    messagingSenderId: "806100858706",
    appId: "1:806100858706:web:b74e017b95ce223009ec8b"
};
const updateApp = initializeApp(updateFirebaseConfig, "updatesApp");
const updateDb = getFirestore(updateApp);

const PASS = "gpladmin123"; 

// Admin Login
window.login = async function () {
    let inputPass = document.getElementById("pass").value;
    if (inputPass !== PASS) {
        alert("Wrong password");
        return;
    }
    document.getElementById("dashboard").style.display = "block";
    await loadData();
    await loadMatches();
    await loadUpdates();
};

// Load All Registration Data
async function loadData() {
    let list = document.getElementById("list");
    list.innerHTML = "Loading registrations...";
    let total = 0, approved = 0, pending = 0, rejected = 0;
    try {
        let snap = await getDocs(collection(db, "registrations"));
        list.innerHTML = "";
        snap.forEach((docSnap) => {
            let d = docSnap.data();
            total++;
            if (d.status === "approved") approved++;
            else if (d.status === "rejected") rejected++;
            else pending++;
            
            let div = document.createElement("div");
            div.style.cssText = "border: 1px solid #ccc; margin: 10px; padding: 10px; background: #f9f9f9;";
            div.innerHTML = `
                <b>${d.regId}</b> - ${d.name}<br>
                Father: ${d.father}<br>
                Mobile: ${d.mobile}<br>
                Work: ${d.work}<br>
                Status: <b>${d.status}</b> | Team: <b style="color:#0056b3;">${d.team || "Unassigned"}</b><br><br>
                
                <label style="font-size:0.85rem; display:inline;">Assign Team: </label>
                <select id="team-select-${docSnap.id}" style="width: auto; padding: 4px; display: inline-block;">
                    <option value="">-- Select Team --</option>
                    <option value="Team A" ${d.team === 'Team A' ? 'selected' : ''}>Team A</option>
                    <option value="Team B" ${d.team === 'Team B' ? 'selected' : ''}>Team B</option>
                    <option value="Team C" ${d.team === 'Team C' ? 'selected' : ''}>Team C</option>
                    <option value="Team D" ${d.team === 'Team D' ? 'selected' : ''}>Team D</option>
                </select>
                <button class="btn" style="background:#003366; color:white; padding:5px 10px;" onclick="assignTeam('${docSnap.id}')">Save Team</button>
                <br><br>

                <button class="btn btn-approve" onclick="approve('${docSnap.id}')">Approve</button>
                <button class="btn btn-reject" onclick="reject('${docSnap.id}')">Reject</button>
                <button class="btn" style="background:#f0ad4e; color:white;" onclick="editRegistration('${docSnap.id}')">Edit</button>
                <button class="btn btn-delete" onclick="deleteData('${docSnap.id}')">Delete</button>
            `;
            list.appendChild(div);
        });

        document.getElementById("total").innerText = total;
        document.getElementById("approved").innerText = approved;
        document.getElementById("pending").innerText = pending;
        document.getElementById("rejected").innerText = rejected;
    } catch (err) {
        console.error(err);
        list.innerHTML = "Error loading registrations.";
    }
}



// Download all registrations as a PDF. This reads the same Firebase data
// already used by the admin panel and does not modify any registration.
window.downloadRegistrationsPDF = async function () {
    try {
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
            alert("PDF library could not be loaded. Please check your internet connection.");
            return;
        }

        const snap = await getDocs(collection(db, "registrations"));
        if (snap.empty) {
            alert("No registrations found.");
            return;
        }

        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const margin = 14;
        const pageWidth = 210;
        const pageHeight = 297;
        let y = 18;

        const safe = (value) => value === undefined || value === null || value === "" ? "-" : String(value);
        const addHeader = () => {
            pdf.setFontSize(18);
            pdf.setFont(undefined, "bold");
            pdf.text("GPL 4.1 - GULLY PREMIERE LEAGUE", margin, y);
            y += 8;
            pdf.setFontSize(11);
            pdf.setFont(undefined, "normal");
            pdf.text("Registration Report", margin, y);
            y += 8;
            pdf.line(margin, y, pageWidth - margin, y);
            y += 8;
        };

        addHeader();

        let number = 0;
        snap.forEach((docSnap) => {
            const d = docSnap.data();
            number++;

            // Keep each player together; start a fresh page when needed.
            if (y > pageHeight - 75) {
                pdf.addPage();
                y = 18;
                addHeader();
            }

            pdf.setFontSize(12);
            pdf.setFont(undefined, "bold");
            pdf.text(`${number}. ${safe(d.name)}`, margin, y);
            y += 7;
            pdf.setFontSize(9.5);
            pdf.setFont(undefined, "normal");

            const fields = [
                ["GPL ID", d.regId],
                ["Father", d.father],
                ["Mobile", d.mobile],
                ["Work", d.work],
                ["Status", d.status],
                ["Team", d.team || "Unassigned"],
                ["Email", d.email],
                ["Age", d.age],
                ["Class", d.class],
                ["School", d.school],
                ["Address", d.address],
                ["City", d.city],
                ["District", d.district],
                ["State", d.state],
                ["Pincode", d.pincode]
            ];

            for (const [label, value] of fields) {
                if (value === undefined || value === null || value === "") continue;
                const text = `${label}: ${safe(value)}`;
                const lines = pdf.splitTextToSize(text, pageWidth - margin * 2);
                pdf.text(lines, margin, y);
                y += 5 * lines.length;
            }

            y += 4;
            pdf.setDrawColor(190, 190, 190);
            pdf.line(margin, y, pageWidth - margin, y);
            y += 7;
        });

        pdf.save(`GPL-4.1-Registrations-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
        console.error(err);
        alert("Could not create PDF: " + err.message);
    }
};

window.editRegistration = async function (id) {
    try {
        const snap = await getDocs(collection(db, "registrations"));
        let found = null;
        snap.forEach(d => { if (d.id === id) found = { id: d.id, ...d.data() }; });
        if (!found) { alert("Registration not found."); return; }

        document.getElementById("edit-registration-id").value = found.id;
        document.getElementById("edit-regId").value = found.regId || "";
        document.getElementById("edit-name").value = found.name || "";
        document.getElementById("edit-father").value = found.father || "";
        document.getElementById("edit-dob").value = found.dob || "";
        document.getElementById("edit-age").value = found.age || "";
        document.getElementById("edit-mobile").value = found.mobile || "";
        document.getElementById("edit-email").value = found.email || "";
        document.getElementById("edit-work").value = found.work || "";
        document.getElementById("edit-city").value = found.city || "";
        document.getElementById("edit-address1").value = found.address1 || "";
        document.getElementById("edit-address2").value = found.address2 || "";
        document.getElementById("edit-address3").value = found.address3 || "";
        document.getElementById("edit-registration-modal").style.display = "block";
    } catch (err) {
        console.error(err);
        alert("Could not load registration: " + err.message);
    }
};

window.closeRegistrationEdit = function () {
    document.getElementById("edit-registration-modal").style.display = "none";
};

window.saveRegistrationEdit = async function () {
    const id = document.getElementById("edit-registration-id").value;
    if (!id) return;

    const mobile = document.getElementById("edit-mobile").value.trim();
    if (!mobile) { alert("Mobile number is required."); return; }

    try {
        // Prevent changing to a mobile number already used by another player.
        const snap = await getDocs(collection(db, "registrations"));
        let duplicate = false;
        snap.forEach(d => {
            if (d.id !== id && String(d.data().mobile || "") === mobile) duplicate = true;
        });
        if (duplicate) {
            alert("Another registration already uses this mobile number.");
            return;
        }

        const data = {
            name: document.getElementById("edit-name").value.trim().toLowerCase(),
            father: document.getElementById("edit-father").value.trim().toLowerCase(),
            dob: document.getElementById("edit-dob").value,
            age: document.getElementById("edit-age").value.trim(),
            email: document.getElementById("edit-email").value.trim(),
            mobile,
            address1: document.getElementById("edit-address1").value.trim(),
            address2: document.getElementById("edit-address2").value.trim(),
            address3: document.getElementById("edit-address3").value.trim(),
            city: document.getElementById("edit-city").value.trim(),
            work: document.getElementById("edit-work").value.trim()
        };

        await updateDoc(doc(db, "registrations", id), data);
        alert("Registration updated successfully.");
        closeRegistrationEdit();
        await loadData();
    } catch (err) {
        console.error(err);
        alert("Failed to update registration: " + err.message);
    }
};

window.approve = async function (id) {
    await updateDoc(doc(db, "registrations", id), { status: "approved" });
    alert("Approved");
    loadData();
};

window.reject = async function (id) {
    await updateDoc(doc(db, "registrations", id), { status: "rejected" });
    alert("Rejected");
    loadData();
};

window.deleteData = async function (id) {
    if (!confirm("Are you sure you want to delete?")) return;
    await deleteDoc(doc(db, "registrations", id));
    alert("Deleted");
    loadData();
};

window.assignTeam = async function (id) {
    let teamSelect = document.getElementById(`team-select-${id}`);
    let selectedTeam = teamSelect.value;
    if (!selectedTeam) {
        alert("Please select a valid team first.");
        return;
    }
    try {
        await updateDoc(doc(db, "registrations", id), { team: selectedTeam });
        alert(`Assigned to ${selectedTeam} successfully!`);
        loadData();
    } catch (err) {
        alert("Failed to update team: " + err.message);
    }
};

// --- Match Management ---

async function loadMatches() {
    let list = document.getElementById("matches-admin-list");
    if (!list) return;
    list.innerHTML = "Loading matches...";
    try {
        let snap = await getDocs2(getCol(updateDb, "matches"));
        list.innerHTML = "";
        if (snap.empty) {
            list.innerHTML = "<p>No matches scheduled yet.</p>";
            return;
        }
        snap.forEach((docSnap) => {
            let d = docSnap.data();
            let div = document.createElement("div");
            div.style.cssText = "border:1px solid #1b5e20; background:#fff; padding:10px; margin-top:8px; border-radius:4px;";
            div.innerHTML = `
                <b>${d.team1} vs ${d.team2}</b> [${d.status}]<br>
                Time: ${d.time || 'TBD'}<br>
                Scores: ${d.score1 || 'N/A'} - ${d.score2 || 'N/A'}<br>
                Note: ${d.result || 'None'}<br>
                ${d.live ? `<b>Live:</b> ${escapeHtml(d.live.striker || '—')} ${d.live.strikerRuns != null ? '('+d.live.strikerRuns+'/'+(d.live.strikerBalls||0)+')' : ''} | ${escapeHtml(d.live.nonstriker || '—')} ${d.live.nonstrikerRuns != null ? '('+d.live.nonstrikerRuns+'/'+(d.live.nonstrikerBalls||0)+')' : ''} | Bowler: ${escapeHtml(d.live.bowler || '—')} | Over: ${escapeHtml(d.live.over || '—')}` : ''}<br><br>
                <button class="btn" style="background:#0056b3; color:white;" onclick="editMatch('${docSnap.id}', '${escapeQuotes(d.team1)}', '${escapeQuotes(d.team2)}', '${escapeQuotes(d.score1)}', '${escapeQuotes(d.score2)}', '${escapeQuotes(d.time)}', '${d.status}', '${escapeQuotes(d.result)}', '${escapeQuotes(encodeURIComponent(JSON.stringify(d.live || {}))) }')">Edit Match</button>
                <button class="btn btn-delete" onclick="deleteMatch('${docSnap.id}')">Delete</button>
            `;
            list.appendChild(div);
        });
    } catch(e) {
        console.error(e);
        list.innerHTML = "Error loading matches.";
    }
}

function escapeHtml(v) { return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;'); }

function getLiveDetails() {
    const live = {
        striker: document.getElementById('live-striker').value.trim(),
        nonstriker: document.getElementById('live-nonstriker').value.trim(),
        bowler: document.getElementById('live-bowler').value.trim(),
        over: document.getElementById('live-over').value.trim(),
        strikerRuns: document.getElementById('live-striker-runs').value === '' ? null : Number(document.getElementById('live-striker-runs').value),
        strikerBalls: document.getElementById('live-striker-balls').value === '' ? null : Number(document.getElementById('live-striker-balls').value),
        nonstrikerRuns: document.getElementById('live-nonstriker-runs').value === '' ? null : Number(document.getElementById('live-nonstriker-runs').value),
        nonstrikerBalls: document.getElementById('live-nonstriker-balls').value === '' ? null : Number(document.getElementById('live-nonstriker-balls').value),
        bowlerOvers: document.getElementById('live-bowler-overs').value.trim(),
        bowlerRuns: document.getElementById('live-bowler-runs').value === '' ? null : Number(document.getElementById('live-bowler-runs').value),
        bowlerWickets: document.getElementById('live-bowler-wickets').value === '' ? null : Number(document.getElementById('live-bowler-wickets').value)
    };
    const hasAny = Object.values(live).some(v => v !== '' && v !== null);
    return hasAny ? live : null;
}

window.saveMatch = async function () {
    let id = document.getElementById("match-id").value;
    let team1 = document.getElementById("match-team1").value.trim();
    let team2 = document.getElementById("match-team2").value.trim();
    let score1 = document.getElementById("match-score1").value.trim();
    let score2 = document.getElementById("match-score2").value.trim();
    let time = document.getElementById("match-time").value.trim();
    let status = document.getElementById("match-status").value;
    let result = document.getElementById("match-result-note").value.trim();

    if (!team1 || !team2) {
        alert("Please enter both Team 1 and Team 2 names.");
        return;
    }

    let payload = { team1, team2, score1, score2, time, status, result, timestamp: Date.now() };
    const live = getLiveDetails();
    if (live) payload.live = live;

    if (id) {
        await updateDoc2(doc2(updateDb, "matches", id), payload);
        alert("Match details updated successfully!");
    } else {
        await addDoc2(getCol(updateDb, "matches"), payload);
        alert("Match scheduled successfully!");
    }

    resetMatchForm();
    loadMatches();
};

window.editMatch = function (id, team1, team2, score1, score2, time, status, result, liveJson) {
    document.getElementById("match-id").value = id;
    document.getElementById("match-team1").value = team1;
    document.getElementById("match-team2").value = team2;
    document.getElementById("match-score1").value = score1;
    document.getElementById("match-score2").value = score2;
    document.getElementById("match-time").value = time;
    document.getElementById("match-status").value = status;
    document.getElementById("match-result-note").value = result;
    let live = {}; try { live = JSON.parse(decodeURIComponent(liveJson || '')) || {}; } catch(e) {}
    document.getElementById('live-striker').value = live.striker || '';
    document.getElementById('live-nonstriker').value = live.nonstriker || '';
    document.getElementById('live-bowler').value = live.bowler || '';
    document.getElementById('live-over').value = live.over || '';
    document.getElementById('live-striker-runs').value = live.strikerRuns ?? '';
    document.getElementById('live-striker-balls').value = live.strikerBalls ?? '';
    document.getElementById('live-nonstriker-runs').value = live.nonstrikerRuns ?? '';
    document.getElementById('live-nonstriker-balls').value = live.nonstrikerBalls ?? '';
    document.getElementById('live-bowler-overs').value = live.bowlerOvers || '';
    document.getElementById('live-bowler-runs').value = live.bowlerRuns ?? '';
    document.getElementById('live-bowler-wickets').value = live.bowlerWickets ?? '';
    document.getElementById("match-btn").innerText = "Update Match";
    document.getElementById("match-cancel-btn").style.display = "inline-block";
};

window.resetMatchForm = function () {
    document.getElementById("match-id").value = "";
    document.getElementById("match-team1").value = "";
    document.getElementById("match-team2").value = "";
    document.getElementById("match-score1").value = "";
    document.getElementById("match-score2").value = "";
    document.getElementById("match-time").value = "";
    document.getElementById("match-status").value = "Upcoming";
    document.getElementById("match-result-note").value = "";
    ['live-striker','live-nonstriker','live-bowler','live-over','live-bowler-overs'].forEach(id => document.getElementById(id).value = '');
    ['live-striker-runs','live-striker-balls','live-nonstriker-runs','live-nonstriker-balls','live-bowler-runs','live-bowler-wickets'].forEach(id => document.getElementById(id).value = '');
    document.getElementById("match-btn").innerText = "Add Match";
    document.getElementById("match-cancel-btn").style.display = "none";
};

window.deleteMatch = async function (id) {
    if (!confirm("Delete this match entry?")) return;
    await deleteDoc2(doc2(updateDb, "matches", id));
    alert("Match deleted!");
    loadMatches();
};

// --- Home Page Updates Management ---

async function loadUpdates() {
    let list = document.getElementById("updates-admin-list");
    if (!list) return;
    list.innerHTML = "Loading updates...";
    try {
        let snap = await getDocs2(getCol(updateDb, "updates"));
        list.innerHTML = "";
        if (snap.empty) {
            list.innerHTML = "<p>No updates found.</p>";
            return;
        }
        snap.forEach((docSnap) => {
            let d = docSnap.data();
            let div = document.createElement("div");
            div.style.cssText = "border:1px solid #bbb; background:#fff; padding:10px; margin-top:8px; border-radius:4px;";
            div.innerHTML = `
                <b>${d.title}</b><br>${d.msg}<br><br>
                <button class="btn" style="background:#0056b3; color:white;" onclick="editUpdate('${docSnap.id}', '${escapeQuotes(d.title)}', '${escapeQuotes(d.msg)}')">Edit</button>
                <button class="btn btn-delete" onclick="deleteUpdate('${docSnap.id}')">Delete</button>
            `;
            list.appendChild(div);
        });
    } catch(e) {
        console.error(e);
        list.innerHTML = "Error loading updates.";
    }
}

function escapeQuotes(str) {
    return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

window.saveUpdate = async function () {
    let id = document.getElementById("update-id").value;
    let title = document.getElementById("update-title").value.trim();
    let msg = document.getElementById("update-msg").value.trim();

    if (!title || !msg) {
        alert("Please fill out both title and message");
        return;
    }

    if (id) {
        await updateDoc2(doc2(updateDb, "updates", id), { title, msg });
        alert("Update modified successfully!");
    } else {
        await addDoc2(getCol(updateDb, "updates"), { title, msg, timestamp: Date.now() });
        alert("Update added successfully!");
    }

    resetUpdateForm();
    loadUpdates();
};

window.editUpdate = function (id, title, msg) {
    document.getElementById("update-id").value = id;
    document.getElementById("update-title").value = title;
    document.getElementById("update-msg").value = msg;
    document.getElementById("update-btn").innerText = "Update Notification";
    document.getElementById("cancel-btn").style.display = "inline-block";
};

window.resetUpdateForm = function () {
    document.getElementById("update-id").value = "";
    document.getElementById("update-title").value = "";
    document.getElementById("update-msg").value = "";
    document.getElementById("update-btn").innerText = "Add Update";
    document.getElementById("cancel-btn").style.display = "none";
};

window.deleteUpdate = async function (id) {
    if (!confirm("Delete this update?")) return;
    await deleteDoc2(doc2(updateDb, "updates", id));
    alert("Update deleted!");
    loadUpdates();
};
