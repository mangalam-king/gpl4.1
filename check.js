import { db } from './firebase.js';
import { collection,getDocs }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.search=async()=>{
let id=document.getElementById("id").value;
let data=await getDocs(collection(db,"registrations"));
data.forEach(d=>{
if(d.data().regId===id){
document.getElementById("res").innerHTML=JSON.stringify(d.data());
}
});
};
