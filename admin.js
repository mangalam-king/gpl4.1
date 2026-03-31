import { db } from './firebase.js';
import { collection,getDocs,updateDoc,doc }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const pass="gpladmin123";

window.login=async()=>{
if(document.getElementById("pass").value!==pass){alert("wrong");return;}
let data=await getDocs(collection(db,"registrations"));
data.forEach(d=>{
let div=document.createElement("div");
div.innerHTML=d.data().name+" "+d.data().regId+
"<button onclick=\"approve('"+d.id+"')\">Approve</button>";
document.body.appendChild(div);
});
};

window.approve=async(id)=>{
await updateDoc(doc(db,"registrations",id),{status:"approved"});
alert("approved");
};
