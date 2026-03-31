import { db } from './firebase.js';
import { collection, getDocs, updateDoc, doc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const PASS = "gpladmin123";

window.login = async function () {

    if (document.getElementById("pass").value !== PASS) {
        alert("Wrong password");
        return;
    }

    document.getElementById("dashboard").style.display = "block";

    let list = document.getElementById("list");
    list.innerHTML = "";

    let total = 0, approved = 0, pending = 0;

    let snap = await getDocs(collection(db, "registrations"));

    snap.forEach(docSnap => {
        let d = docSnap.data();
        total++;

        if (d.status === "approved") approved++;
        else pending++;

        let div = document.createElement("div");
        div.style.border = "1px solid black";
        div.style.margin = "10px";
        div.style.padding = "10px";

        div.innerHTML = `
            <b>${d.regId}</b> - ${d.name}<br>
            Father: ${d.father}<br>
            Mobile: ${d.mobile}<br>
            Status: ${d.status}<br>
            <button onclick="approve('${docSnap.id}')">Approve</button>
        `;

        list.appendChild(div);
    });

    document.getElementById("total").innerText = total;
    document.getElementById("approved").innerText = approved;
    document.getElementById("pending").innerText = pending;
};

window.approve = async function (id) {
    await updateDoc(doc(db, "registrations", id), {
        status: "approved"
    });

    alert("Approved");
    location.reload();
};
