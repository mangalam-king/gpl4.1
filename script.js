import { db } from './firebase.js';
import { 
  collection, addDoc, getDocs, query, where,
  doc, getDoc, updateDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Auto age calculation
document.getElementById("dob").addEventListener("change", function () {
    let dob = new Date(this.value);
    let today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    let m = today.getMonth() - dob.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    document.getElementById("age").value = age;
});

// Submit form
document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        let name = document.getElementById("name").value.trim().toLowerCase();
        let father = document.getElementById("father").value.trim().toLowerCase();
        let dob = document.getElementById("dob").value;
        let mobile = document.getElementById("mobile").value;

        // Duplicate mobile check
        const q = query(collection(db, "registrations"), where("mobile", "==", mobile));
        const snap = await getDocs(q);

        if (!snap.empty) {
            alert("❌ Already registered with this mobile");
            return;
        }
// Counter logic (CORRECT)
const counterRef = doc(db, "counters", "gpl");
const counterSnap = await getDoc(counterRef);

let newId = 1;

if (!counterSnap.exists()) {
    // First entry
    await setDoc(counterRef, { current: 1 });
} else {
    let current = Number(counterSnap.data().current); // 🔥 force number
    newId = current + 1;

    await updateDoc(counterRef, {
        current: newId
    });
}

// Format ID properly
let regId = "GPL" + String(newId).padStart(3, '0');

        // Save data
        await addDoc(collection(db, "registrations"), {
            regId,
            name,
            father,
            dob,
            age: document.getElementById("age").value,
            email: document.getElementById("email").value,
            mobile,
            address1: document.getElementById("addr1").value,
            address2: document.getElementById("addr2").value,
            address3: document.getElementById("addr3").value,
            city: document.getElementById("city").value,
            work: document.getElementById("work").value,
            status: "pending"
        });

        // Send a notification email through Formspree without leaving the website.
        // The Formspree form can be configured to deliver this notification to your email.
        const formspreeData = new FormData();
        formspreeData.append("subject", `New GPL 4.1 Registration - ${regId}`);
        formspreeData.append("Registration ID", regId);
        formspreeData.append("Full Name", name);
        formspreeData.append("Father Name", father);
        formspreeData.append("Date of Birth", dob);
        formspreeData.append("Age", document.getElementById("age").value);
        formspreeData.append("Work", document.getElementById("work").value);
        formspreeData.append("Email", document.getElementById("email").value);
        formspreeData.append("Mobile Number", mobile);
        formspreeData.append("Address Line 1", document.getElementById("addr1").value);
        formspreeData.append("Address Line 2", document.getElementById("addr2").value);
        formspreeData.append("Address Line 3", document.getElementById("addr3").value);
        formspreeData.append("City", document.getElementById("city").value);

        try {
            const mailResponse = await fetch("https://formspree.io/f/moeadvvn", {
                method: "POST",
                body: formspreeData,
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!mailResponse.ok) {
                console.warn("Registration was saved, but the Formspree email notification failed.");
            }
        } catch (mailErr) {
            console.warn("Registration was saved, but the Formspree email notification could not be sent.", mailErr);
        }

        alert("✅ Registered! Your ID: " + regId);
        document.getElementById("form").reset();

    } catch (err) {
        console.error(err);
        alert("Error: " + err.message);
    }
});
