const plans=[
 {monto:300000,op:[{c:1,v:420000},{c:2,v:270000},{c:4,v:195000}]},
 {monto:400000,op:[{c:1,v:560000},{c:2,v:360000},{c:4,v:280000}]},
 {monto:500000,op:[{c:1,v:700000},{c:2,v:450000},{c:4,v:350000}]},
 {monto:1000000,op:[{c:2,v:900000},{c:3,v:735000},{c:4,v:650000}]}
];
const money=n=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(n);
let loans=JSON.parse(localStorage.getItem("pa_loans")||"[]");
let slide=0;

const amount=document.querySelector("#amount"), installments=document.querySelector("#installments");
plans.forEach(p=>{let o=document.createElement("option");o.value=p.monto;o.textContent=money(p.monto);amount.appendChild(o)});
function fillInstallments(){let p=plans.find(x=>x.monto==amount.value);installments.innerHTML="";p.op.forEach(x=>{let o=document.createElement("option");o.value=x.c;o.textContent=`${x.c} ${x.c===1?"pago":"cuotas"} de ${money(x.v)}`;installments.appendChild(o)});simulate()}
function selected(){let p=plans.find(x=>x.monto==amount.value);return [p,p.op.find(x=>x.c==installments.value)]}
function simulate(){let [p,o]=selected();let total=o.v*o.c;document.querySelector("#simulation").innerHTML=`<b>${money(p.monto)}</b><br>${o.c} ${o.c===1?"pago":"cuotas"} de <b>${money(o.v)}</b><br>Total a devolver: <b>${money(total)}</b><br><small>La simulación no implica aprobación automática.</small>`}
amount.onchange=fillInstallments;installments.onchange=simulate;fillInstallments();

function showSlide(){let p=plans[slide];document.querySelector("#heroPlan").innerHTML=`<div class="plan"><strong>${money(p.monto)}</strong>${p.op.map(x=>`<p>✓ ${x.c} ${x.c===1?"pago":"meses"} de <b>${money(x.v)}</b></p>`).join("")}</div>`;document.querySelector("#dots").innerHTML=plans.map((_,i)=>`<span class="dot ${i===slide?"active":""}"></span>`).join("")}
document.querySelector("#prev").onclick=()=>{slide=(slide+plans.length-1)%plans.length;showSlide()};document.querySelector("#next").onclick=()=>{slide=(slide+1)%plans.length;showSlide()};showSlide();

document.querySelector("#requestBtn").onclick=()=>{document.querySelector("#solicitud").classList.remove("hidden");location.hash="solicitud"};
document.querySelector("#requestForm").onsubmit=e=>{e.preventDefault();let [p,o]=selected();let loan={id:Date.now(),name:document.querySelector("#name").value,dni:document.querySelector("#dni").value,phone:document.querySelector("#phone").value,email:document.querySelector("#email").value,address:document.querySelector("#address").value,monto:p.monto,cuotas:o.c,cuota:o.v,total:o.c*o.v,nextDate:addDays(new Date(),30),status:"Pendiente de aprobación",paid:0,interestExtension:0,originalDate:null};loans.push(loan);save();document.querySelector("#requestMsg").classList.remove("hidden");document.querySelector("#requestMsg").textContent="Solicitud registrada en esta demo. En una versión real se enviaría al backend y se notificaría al prestamista por WhatsApp.";document.querySelector("#requestForm").reset();render()};

function addDays(d,n){let x=new Date(d);x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)}
function fmt(s){return new Date(s+"T12:00:00").toLocaleDateString("es-AR")}
function save(){localStorage.setItem("pa_loans",JSON.stringify(loans))}
function seed(){loans=[
{id:1,name:"Juan Pérez",dni:"30123456",phone:"",email:"",address:"",monto:500000,cuotas:4,cuota:350000,total:1400000,nextDate:addDays(new Date(),3),status:"Pendiente",paid:0,interestExtension:0},
{id:2,name:"María Gómez",dni:"28999888",phone:"",email:"",address:"",monto:300000,cuotas:2,cuota:270000,total:540000,nextDate:addDays(new Date(),-2),status:"Vencida",paid:0,interestExtension:0},
{id:3,name:"Pedro López",dni:"32111222",phone:"",email:"",address:"",monto:400000,cuotas:4,cuota:280000,total:1120000,nextDate:addDays(new Date(),12),status:"Pendiente",paid:0,interestExtension:0}];save();render()}
document.querySelector("#seedBtn").onclick=seed;

function render(){
 let capital=loans.reduce((a,l)=>a+l.monto,0), rec=loans.reduce((a,l)=>a+(l.total-l.paid),0), col=loans.reduce((a,l)=>a+l.paid,0), late=loans.filter(l=>new Date(l.nextDate)<new Date()&&l.status!=="Pagada").reduce((a,l)=>a+l.cuota,0);
 document.querySelector("#capital").textContent=money(capital);document.querySelector("#receivable").textContent=money(rec);document.querySelector("#collected").textContent=money(col);document.querySelector("#overdue").textContent=money(late);
 document.querySelector("#loansBody").innerHTML=loans.map(l=>`<tr><td><b>${l.name}</b><br><small>${l.dni}</small></td><td>${money(l.monto)}</td><td>${money(l.cuota)}</td><td>${fmt(l.nextDate)}</td><td><span class="status ${cls(l)}">${l.status}</span></td><td><button onclick="pay(${l.id})">Pago</button><button onclick="extension(${l.id})">Prórroga</button><button onclick="profile(${l.id})">Perfil</button></td></tr>`).join("")||`<tr><td colspan="6">No hay préstamos todavía.</td></tr>`;
 document.querySelector("#dueList").innerHTML=loans.slice().sort((a,b)=>a.nextDate.localeCompare(b.nextDate)).map(l=>`<div class="due"><b>${l.name}</b> · ${money(l.cuota)} · ${fmt(l.nextDate)}<br><span class="status ${cls(l)}">${l.status}</span></div>`).join("")||"Sin vencimientos.";
 let notes=[];loans.forEach(l=>{let d=(new Date(l.nextDate)-new Date())/86400000;if(l.status==="Pagada")return;if(d>=0&&d<=5)notes.push(`🔔 Recordatorio para ${l.name}: vence el ${fmt(l.nextDate)}.`);if(d<0)notes.push(`🚨 ${l.name}: cuota vencida. Comunicar al prestamista.`)});document.querySelector("#notifications").innerHTML=notes.map(n=>`<div class="notif">${n}</div>`).join("")||"No hay alertas.";
}
function cls(l){if(l.status==="Pagada")return"paid";if(l.status==="Vencida")return"late";if(l.status==="Reprogramada")return"rescheduled";return"pending"}

window.pay=id=>{let l=loans.find(x=>x.id===id);l.paid+=l.cuota;l.status=l.paid>=l.total?"Pagada":"Pendiente";save();render();alert(`Pago registrado para ${l.name}. En producción se enviaría una confirmación al cliente y una notificación al prestamista.`)}
window.extension=id=>{let l=loans.find(x=>x.id===id);document.querySelector("#modalTitle").textContent=`Prórroga · ${l.name}`;document.querySelector("#modalContent").innerHTML=`<label>Nueva fecha</label><input id="newDate" type="date" value="${addDays(new Date(l.nextDate),7)}"><label>Interés/cargo adicional por la prórroga (%)</label><input id="extRate" type="number" min="0" step="0.01" value="0"><p id="extPreview"></p><button class="btn wide" id="saveExt">Guardar prórroga</button>`;document.querySelector("#modal").classList.remove("hidden");let preview=()=>{let r=Number(document.querySelector("#extRate").value)||0;document.querySelector("#extPreview").textContent=`Importe adicional calculado sobre la cuota: ${money(l.cuota*r/100)}. Revisar y documentar las condiciones antes de aplicarlo.`};document.querySelector("#extRate").oninput=preview;preview();document.querySelector("#saveExt").onclick=()=>{let r=Number(document.querySelector("#extRate").value)||0;l.originalDate=l.originalDate||l.nextDate;l.nextDate=document.querySelector("#newDate").value;l.interestExtension=r;l.status="Reprogramada";save();document.querySelector("#modal").classList.add("hidden");render();alert(`Prórroga registrada. En producción se notificaría al cliente y al prestamista.`)}}
window.profile=id=>{let l=loans.find(x=>x.id===id);document.querySelector("#modalTitle").textContent=`Perfil · ${l.name}`;document.querySelector("#modalContent").innerHTML=`<p><b>DNI:</b> ${l.dni||"No informado"}</p><p><b>Domicilio:</b> ${l.address||"No informado"}</p><p><b>Teléfono:</b> ${l.phone||"No informado"}</p><p><b>Préstamo:</b> ${money(l.monto)}</p><p><b>Total:</b> ${money(l.total)}</p><p><b>Pagado:</b> ${money(l.paid)}</p><p><b>Estado:</b> ${l.status}</p><p><b>Prórroga:</b> ${l.interestExtension?l.interestExtension+"%":"Sin cargo registrado"}</p><div class="notice">En producción, acá aparecería el historial completo y los documentos privados del cliente, con permisos de acceso.</div>`;document.querySelector("#modal").classList.remove("hidden")}
document.querySelector("#closeModal").onclick=()=>document.querySelector("#modal").classList.add("hidden");document.querySelector("#modal").onclick=e=>{if(e.target.id==="modal")e.currentTarget.classList.add("hidden")};
render();