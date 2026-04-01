import { db } from './firebase.js';
import { 
  collection, getDocs, updateDoc, doc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const PASS = "gpladmin123";

window.login = async function () {

    if (document.getElementById("pass").value !== PASS) {
        alert("Wrong password");
        return;
    }

    document.getElementById("dashboard").style.display = "block";

    let list = document.getElementById("list");
    list.innerHTML = "";

    let total = 0, approved = 0, pending = 0, rejected = 0;

    let snap = await getDocs(collection(db, "registrations"));

    snap.forEach(docSnap => {
        let d = docSnap.data();
        total++;

        if (d.status === "approved") approved++;
        else if (d.status === "rejected") rejected++;
        else pending++;

        let div = document.createElement("div");
        div.style.border = "1px solid #333";
        div.style.margin = "10px";
        div.style.padding = "10px";
        div.style.background = "#f9f9f9";

        div.innerHTML = `
            <b>${d.regId}</b> - ${d.name}<br>
            Father: ${d.father}<br>
            Mobile: ${d.mobile}<br>
            Status: <b>${d.status}</b><br><br>

            <button onclick="approve('${docSnap.id}')">Approve</button>
            <button onclick="reject('${docSnap.id}')">Reject</button>
            <button onclick="deleteData('${docSnap.id}')">Delete</button>
        `;

        list.appendChild(div);
    });

    document.getElementById("total").innerText = total;
    document.getElementById("approved").innerText = approved;
    document.getElementById("pending").innerText = pending;
    document.getElementById("rejected").innerText = rejected;
};

// ✅ Approve
window.approve = async function (id) {
    await updateDoc(doc(db, "registrations", id), {
        status: "approved"
    });
    alert("Approved");
    location.reload();
};

// ❌ Reject
window.reject = async function (id) {
    await updateDoc(doc(db, "registrations", id), {
        status: "rejected"
    });
    alert("Rejected");
    location.reload();
};

// 🗑️ Delete
window.deleteData = async function (id) {
    let confirmDelete = confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "registrations", id));
    alert("Deleted successfully");
    location.reload();
};
