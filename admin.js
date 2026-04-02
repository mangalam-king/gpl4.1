import { db } from './firebase.js';
import { 
  collection, getDocs, updateDoc, doc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const PASS = "gpladmin123";

// 🔐 Login
window.login = async function () {

    let inputPass = document.getElementById("pass").value;

    if (inputPass !== PASS) {
        alert("Wrong password");
        return;
    }

    document.getElementById("dashboard").style.display = "block";

    loadData();
};

// 📊 Load All Data
async function loadData() {

    let list = document.getElementById("list");
    list.innerHTML = "";

    let total = 0, approved = 0, pending = 0, rejected = 0;

    let snap = await getDocs(collection(db, "registrations"));

    snap.forEach((docSnap) => {
        let d = docSnap.data();
        total++;

        if (d.status === "approved") approved++;
        else if (d.status === "rejected") rejected++;
        else pending++;

        let div = document.createElement("div");
        div.style.border = "1px solid #ccc";
        div.style.margin = "10px";
        div.style.padding = "10px";
        div.style.background = "#f9f9f9";

        div.innerHTML = `
            <b>${d.regId}</b> - ${d.name}<br>
            Father: ${d.father}<br>
            Mobile: ${d.mobile}<br>
            Status: <b>${d.status}</b><br><br>

            <button class="btn btn-approve" onclick="approve('${docSnap.id}')">Approve</button>
            <button class="btn btn-reject" onclick="reject('${docSnap.id}')">Reject</button>
            <button class="btn btn-delete" onclick="deleteData('${docSnap.id}')">Delete</button>
        `;

        list.appendChild(div);
    });

    // Update Stats
    document.getElementById("total").innerText = total;
    document.getElementById("approved").innerText = approved;
    document.getElementById("pending").innerText = pending;
    document.getElementById("rejected").innerText = rejected;
}

// ✅ Approve
window.approve = async function (id) {
    await updateDoc(doc(db, "registrations", id), {
        status: "approved"
    });
    alert("✅ Approved");
    loadData();
};

// ❌ Reject
window.reject = async function (id) {
    await updateDoc(doc(db, "registrations", id), {
        status: "rejected"
    });
    alert("❌ Rejected");
    loadData();
};

// 🗑️ Delete
window.deleteData = async function (id) {
    let confirmDelete = confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "registrations", id));
    alert("🗑️ Deleted");
    loadData();
};
