import { db } from './firebase.js'; 
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
                <h3>Details Found</h3>
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
                <p><b>Assigned Team:</b> <span style="color:#1b5e20; font-weight:bold;">${d.team || "Not Assigned Yet"}</span></p>
            `;
        }
    });
    
    if (!found) {
        result.innerHTML = "No record found";
    }
};
// Variable to keep track of the currently viewed user
let activeUser = null;

function loadUserProfile(userId) {
  // Fetch user record from Firebase
  firebase.database().ref('users/' + userId).once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        activeUser = snapshot.val();

        // Populate the card structure with specific user details
        document.getElementById('idCard').innerHTML = `
          <div style="text-align: center;">
            <h3>Identity Card</h3>
            <p><strong>Name:</strong> ${activeUser.name}</p>
            <p><strong>ID:</strong> ${userId}</p>
            <p><strong>Phone:</strong> ${activeUser.phone}</p>
            <p><strong>Email:</strong> ${activeUser.email || 'N/A'}</p>
          </div>
        `;

        // Make the card and download button visible
        document.getElementById('idCardWrapper').style.display = 'block';
      } else {
        alert("User record not found.");
      }
    })
    .catch((error) => {
      console.error("Error loading user profile:", error);
    });
}
