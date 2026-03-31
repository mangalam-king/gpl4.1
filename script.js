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

        // Counter logic (SAFE)
        const counterRef = doc(db, "counters", "gpl");
        const counterSnap = await getDoc(counterRef);

        let id = 0;

        if (!counterSnap.exists()) {
            id = 1;
            await setDoc(counterRef, { current: id });
        } else {
            id = counterSnap.data().current + 1;
            await updateDoc(counterRef, { current: id });
        }

        let regId = "GPL" + String(id).padStart(3, '0');

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

        alert("✅ Registered! Your ID: " + regId);
        document.getElementById("form").reset();

    } catch (err) {
        console.error(err);
        alert("Error: " + err.message);
    }
});
