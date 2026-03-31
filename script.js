import { db } from './firebase.js';
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.getElementById("dob").addEventListener("change", function () {
let dob=new Date(this.value),today=new Date();
let age=today.getFullYear()-dob.getFullYear();
document.getElementById("age").value=age;
});

document.getElementById("form").addEventListener("submit", async(e)=>{
e.preventDefault();

let name=document.getElementById("name").value.toLowerCase();
let father=document.getElementById("father").value.toLowerCase();
let dob=document.getElementById("dob").value;
let mobile=document.getElementById("mobile").value;

const q=query(collection(db,"registrations"),where("mobile","==",mobile));
const snap=await getDocs(q);
if(!snap.empty){alert("Already registered");return;}

const counterRef=doc(db,"counters","gpl");
const counterSnap=await getDoc(counterRef);
let id=counterSnap.exists()?counterSnap.data().current:0;
id++;
await updateDoc(counterRef,{current:id});

let regId="GPL"+String(id).padStart(3,'0');

await addDoc(collection(db,"registrations"),{
regId,name,father,dob,mobile,status:"pending"
});

alert("Registered ID:"+regId);
});
