import { db } from './firebase.js';
import { collection, getDocs } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.search = async function () {

    let gplid = document.getElementById("gplid").value.trim();
    let name = document.getElementById("name").value.trim().toLowerCase();
    let father = document.getElementById("father").value.trim().toLowerCase();

    let result = document.getElementById("result");
    result.innerHTML = "Searching...";

    let snap = await getDocs(collection(db, "registrations"));
    let found = false;

    snap.forEach(doc => {
        let d = doc.data();

        if (
            d.regId === gplid &&
            d.name === name &&
            d.father === father
        ) {
            found = true;

            result.innerHTML = `
                <h3>Details Found ✅</h3>
                <p><b>ID:</b> ${d.regId}</p>
                <p><b>Name:</b> ${d.name}</p>
                <p><b>Father:</b> ${d.father}</p>
                <p><b>DOB:</b> ${d.dob}</p>
                <p><b>Age:</b> ${d.age}</p>
                <p><b>Email:</b> ${d.email}</p>
                <p><b>Work:</b> ${d.work}</p>
                <p><b>Mobile:</b> ${d.mobile}</p>
                <p><b>Address:</b> ${d.address1}, ${d.address2}, ${d.address3}</p>
                <p><b>City:</b> ${d.city}</p>
                <p><b>Status:</b> ${d.status}</p>
            `;
        }
    });

    if (!found) {
        result.innerHTML = "❌ No record found";
    }
};
