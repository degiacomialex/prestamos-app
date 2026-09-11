const SUPABASE_URL = 'https://dmkirvahriirlxazslhh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_QhbOUmQYAEpbh0diwxS2zQ_rBV1Jlus';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const plans = [
 {monto:300000,op:[{c:1,v:420000},{c:2,v:270000},{c:4,v:195000}]},
 {monto:400000,op:[{c:1,v:560000},{c:2,v:360000},{c:4,v:280000}]},
 {monto:500000,op:[{c:1,v:700000},{c:2,v:450000},{c:4,v:350000}]},
 {monto:1000000,op:[{c:2,v:900000},{c:3,v:735000},{c:4,v:650000}]}
];
const money = n => new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(n);
let loans = [];
let slide = 0;

const amount = document.querySelector("#amount"), installments = document.querySelector("#installments");
plans.forEach(p=>{let o=document.createElement("option");o.value=p.monto;o.textContent=money(p.monto);amount.appendChild(o)});

function fillInstallments(){let p=plans.find(x=>x.monto==amount.value);installments.innerHTML="";p.op.forEach(x=>{let o=document.createElement("option");o.value=x.c;o.textContent=`${x.c} ${x.c===1?"pago":"cuotas"} de ${money(x.v)}`;installments.appendChild(o)});simulate()}
function selected(){let p=plans.find(x=>x.monto==amount.value);return [p,p.op.find(x=>x.c==installments.value)]}
function simulate(){let [p,o]=selected();let total=o.v*o.c;document.querySelector("#simulation").innerHTML=`<b>${money(p.monto)}</b><br>${o.c} ${o.c===1?"pago":"cuotas"} de <b>${money(o.v)}</b><br>Total a devolver: <b>${money(total)}</b><br><small>La simulación no implica aprobación automática.</small>`}
amount.onchange=fillInstallments;installments.onchange=simulate;fillInstallments();

function showSlide(){let p=plans[slide];document.querySelector("#heroPlan").innerHTML=`<div class="plan"><strong>${money(p.monto)}</strong>${p.op.map(x=>`<p>✓ ${x.c} ${x.c===1?"pago":"meses"} de <b>${money(x.v)}</b></p>`).join("")}</div>`;document.querySelector("#dots").innerHTML=plans.map((_,i)=>`<span class="dot ${i===slide?"active":""}"></span>`).join("")}
document.querySelector("#prev").onclick=()=>{slide=(slide+plans.length-1)%plans.length;showSlide()};document.querySelector("#next").onclick=()=>{slide=(slide+1)%plans.length;showSlide()};showSlide();

document.querySelector("#requestBtn").onclick=()=>{document.querySelector("#solicitud").classList.remove("hidden");location.hash="solicitud"};

// Guardar en Supabase
document.querySelector("#requestForm").onsubmit = async (e) => {
  e.preventDefault();
  let [p, o] = selected();

  const { data, error } = await _supabase.from('loans').insert([{
    name: document.querySelector("#name").value,
    dni: document.querySelector("#dni").value,
    phone: document.querySelector("#phone").value,
    email: document.querySelector("#email").value,
    address: document.querySelector("#address").value,
    monto: p.monto,
    cuotas: o.c,
    cuota: o.v,
    total: o.c * o.v,
    next_date: addDays(new Date(), 30),
    status: "Pendiente de aprobación",
    paid: 0,
    interest_extension: 0
  }]);

  if (error) {
    alert("Error al guardar: " + error.message);
  } else {
    document.querySelector("#requestMsg").classList.remove("hidden");
    document.querySelector("#requestMsg").textContent = "¡Solicitud guardada en Supabase con éxito!";
    document.querySelector("#requestForm").reset();
    loadLoansFromSupabase();
  }
};

function addDays(d,n){let x=new Date(d);x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)}
function fmt(s){return new Date(s+"T12:00:00").toLocaleDateString("es-AR")}

// Leer desde Supabase
async function loadLoansFromSupabase() {
  let { data, error } = await _supabase.from('loans').select('*');
  if (!error && data) {
    loans = data.map(item => ({
      id: item.id,
      name: item.name,
      dni: item.dni,
      phone: item.phone,
      email: item.email,
      address: item.address,
      monto: Number(item.monto),
      cuotas: item.cuotas,
      cuota: Number(item.cuota),
      total: Number(item.total),
      nextDate: item.next_date,
      status: item.status,
      paid: Number(item.paid),
      interestExtension: Number(item.interest_extension),
      originalDate: item.original_date
    }));
    render();
  }
}

function render(){
 let capital=loans.reduce((a,l)=>a+l.monto,0), rec=loans.reduce((a,l)=>a+(l.total-l.paid),0), col=loans.reduce((a,l)=>a+l.paid,0), late=loans.filter(l=>new Date(l.nextDate)<new Date()&&l.status!=="Pagada").reduce((a,l)=>a+l.cuota,0);
 document.querySelector("#capital").textContent=money(capital);document.querySelector("#receivable").textContent=money(rec);document.querySelector("#collected").textContent=money(col);document.querySelector("#overdue").textContent=money(late);
 document.querySelector("#loansBody").innerHTML=loans.map(l=>`<tr><td><b>${l.name}</b><br><small>${l.dni}</small></td><td>${money(l.monto)}</td><td>${money(l.cuota)}</td><td>${fmt(l.nextDate)}</td><td><span class="status ${cls(l)}">${l.status}</span></td><td><button onclick="pay(${l.id})">Pago</button><button onclick="profile(${l.id})">Perfil</button></td></tr>`).join("")||`<tr><td colspan="6">No hay préstamos todavía.</td></tr>`;
 document.querySelector("#dueList").innerHTML=loans.slice().sort((a,b)=>a.nextDate.localeCompare(b.nextDate)).map(l=>`<div class="due"><b>${l.name}</b> · ${money(l.cuota)} · ${fmt(l.nextDate)}<br><span class="status ${cls(l)}">${l.status}</span></div>`).join("")||"Sin vencimientos.";
 let notes=[];loans.forEach(l=>{let d=(new Date(l.nextDate)-new Date())/86400000;if(l.status==="Pagada")return;if(d>=0&&d<=5)notes.push(`🔔 Recordatorio para ${l.name}: vence el ${fmt(l.nextDate)}.`);if(d<0)notes.push(`🚨 ${l.name}: cuota vencida.`);});document.querySelector("#notifications").innerHTML=notes.map(n=>`<div class="notif">${n}</div>`).join("")||"No hay alertas.";
}
function cls(l){if(l.status==="Pagada")return"paid";if(l.status==="Vencida")return"late";if(l.status==="Reprogramada")return"rescheduled";return"pending"}

window.pay=async id=>{
  let l=loans.find(x=>x.id===id);
  let newPaid = l.paid + l.cuota;
  let newStatus = newPaid >= l.total ? "Pagada" : "Pendiente";
  await _supabase.from('loans').update({ paid: newPaid, status: newStatus }).eq('id', id);
  loadLoansFromSupabase();
}

window.profile=id=>{
  let l=loans.find(x=>x.id===id);
  document.querySelector("#modalTitle").textContent=`Perfil · ${l.name}`;
  document.querySelector("#modalContent").innerHTML=`<p><b>DNI:</b> ${l.dni||"No informado"}</p><p><b>Domicilio:</b> ${l.address||"No informado"}</p><p><b>Teléfono:</b> ${l.phone||"No informado"}</p><p><b>Préstamo:</b> ${money(l.monto)}</p><p><b>Total:</b> ${money(l.total)}</p><p><b>Pagado:</b> ${money(l.paid)}</p><p><b>Estado:</b> ${l.status}</p>`;
  document.querySelector("#modal").classList.remove("hidden");
}

document.querySelector("#closeModal").onclick=()=>document.querySelector("#modal").classList.add("hidden");
loadLoansFromSupabase();
