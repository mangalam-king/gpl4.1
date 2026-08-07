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
                Note: ${d.result || 'None'}<br><br>
                <button class="btn" style="background:#0056b3; color:white;" onclick="editMatch('${docSnap.id}', '${escapeQuotes(d.team1)}', '${escapeQuotes(d.team2)}', '${escapeQuotes(d.score1)}', '${escapeQuotes(d.score2)}', '${escapeQuotes(d.time)}', '${d.status}', '${escapeQuotes(d.result)}')">Edit Match</button>
                <button class="btn btn-delete" onclick="deleteMatch('${docSnap.id}')">Delete</button>
            `;
            list.appendChild(div);
        });
    } catch(e) {
        console.error(e);
        list.innerHTML = "Error loading matches.";
    }
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

window.editMatch = function (id, team1, team2, score1, score2, time, status, result) {
    document.getElementById("match-id").value = id;
    document.getElementById("match-team1").value = team1;
    document.getElementById("match-team2").value = team2;
    document.getElementById("match-score1").value = score1;
    document.getElementById("match-score2").value = score2;
    document.getElementById("match-time").value = time;
    document.getElementById("match-status").value = status;
    document.getElementById("match-result-note").value = result;
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
