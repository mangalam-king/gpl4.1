import { db } from './firebase.js'; 
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getFirestore, collection as getCol, addDoc as addDoc2, getDocs as getDocs2, doc as doc2, updateDoc as updateDoc2, deleteDoc as deleteDoc2 } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

// Initialize New Firebase App for Updates
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

window.login = async function () {
    let inputPass = document.getElementById("pass").value;
    if (inputPass !== PASS) {
        alert("Wrong password");
        return;
    }
    document.getElementById("dashboard").style.display = "block";
    loadData();
    loadUpdates();
};

// Load Updates
async function loadUpdates() {
    let list = document.getElementById("updates-admin-list");
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
