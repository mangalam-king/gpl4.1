import { db } from './firebase.js'; 
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

function esc(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.downloadPlayerPDF = async function () {
    const card = document.querySelector("#result .player-card");
    if (!card) {
        alert("Please view a player card first.");
        return;
    }

    try {
        const canvas = await html2canvas(card, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff"
        });

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 12;
        const maxWidth = pageWidth - margin * 2;
        const maxHeight = pageHeight - margin * 2;
        const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
        const imgWidth = canvas.width * ratio;
        const imgHeight = canvas.height * ratio;
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;

        pdf.addImage(canvas.toDataURL("image/png"), "PNG", x, y, imgWidth, imgHeight);
        const id = document.getElementById("gplid").value.trim() || "player";
        pdf.save(`GPL-4.1-Player-Card-${id}.pdf`);
    } catch (err) {
        console.error(err);
        alert("Unable to create PDF. Please try again.");
    }
};

window.search = async function () {
    let gplid = document.getElementById("gplid").value.trim();
    let name = document.getElementById("name").value.trim().toLowerCase();
    let father = document.getElementById("father").value.trim().toLowerCase();
    let result = document.getElementById("result");
    result.innerHTML = "Searching...";

    if (!gplid || !name || !father) {
        result.innerHTML = "Please enter GPL ID, Full Name and Father Name";
        return;
    }

    try {
        let snap = await getDocs(collection(db, "registrations"));
        let found = false;

        snap.forEach(docSnap => {
            let d = docSnap.data();

            if (
                d.regId === gplid &&
                String(d.name || "").toLowerCase() === name &&
                String(d.father || "").toLowerCase() === father
            ) {
                found = true;

                let status = String(d.status || "pending").toLowerCase();
                let statusClass =
                    status === "approved" ? "player-status-approved" :
                    status === "rejected" ? "player-status-rejected" :
                    "player-status-pending";

                result.innerHTML = `
                    <div class="player-card">
                        <div class="player-card-header">GPL 4.1 Player Card</div>
                        <div class="player-card-id">GPL ID: ${esc(d.regId)}</div>
                        <div class="player-card-body">
                            <div class="player-card-row">
                                <div class="player-card-label">Full Name</div>
                                <div class="player-card-value">${esc(d.name)}</div>
                            </div>
                            <div class="player-card-row">
                                <div class="player-card-label">Father Name</div>
                                <div class="player-card-value">${esc(d.father)}</div>
                            </div>
                            <div class="player-card-row">
                                <div class="player-card-label">Date of Birth</div>
                                <div class="player-card-value">${esc(d.dob)}</div>
                            </div>
                            <div class="player-card-row">
                                <div class="player-card-label">Age</div>
                                <div class="player-card-value">${esc(d.age)}</div>
                            </div>
                            <div class="player-card-row">
                                <div class="player-card-label">Work</div>
                                <div class="player-card-value">${esc(d.work)}</div>
                            </div>
                            <div class="player-card-row">
                                <div class="player-card-label">Email</div>
                                <div class="player-card-value">${esc(d.email)}</div>
                            </div>
                            <div class="player-card-row">
                                <div class="player-card-label">Mobile</div>
                                <div class="player-card-value">${esc(d.mobile)}</div>
                            </div>
                            <div class="player-card-row">
                                <div class="player-card-label">Address</div>
                                <div class="player-card-value">${esc([d.address1, d.address2, d.address3].filter(Boolean).join(", "))}</div>
                            </div>
                            <div class="player-card-row">
                                <div class="player-card-label">City</div>
                                <div class="player-card-value">${esc(d.city)}</div>
                            </div>
                            <div class="player-card-row">
                                <div class="player-card-label">Status</div>
                                <div class="player-card-value">
                                    <span class="player-status ${statusClass}">${esc(d.status || "pending")}</span>
                                </div>
                            </div>
                            <div class="player-card-row">
                                <div class="player-card-label">Assigned Team</div>
                                <div class="player-card-value"><b>${esc(d.team || "Not Assigned Yet")}</b></div>
                            </div>
                        </div>
                        <div style="padding:0 16px 16px;">
                            <button type="button" onclick="downloadPlayerPDF()" style="width:100%;">Download Player Card PDF</button>
                        </div>
                    </div>
                `;
            }
        });

        if (!found) {
            result.innerHTML = "No record found";
        }
    } catch (err) {
        console.error(err);
        result.innerHTML = "Error loading registration details";
    }
};
