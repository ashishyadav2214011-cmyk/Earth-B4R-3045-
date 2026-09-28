const levels=[
["THE REMAINING EARTH","Reach the human settlement.",100,"Find shelter. Your first priority is survival."],
["DEAD ZONE","Activate the old atmospheric-processing station.",100,"Oxygen is unstable. Scan for the station."],
["GREEN POCKET","Build a sustainable settlement.",100,"Water and vegetation make this region valuable."],
["VAGAS CONTROL ZONE","Investigate the Vagas network and escape.",100,"Stay alert. Detection confidence is rising."],
["NO-PLANT REGION","Establish artificial food production.",100,"Natural vegetation is absent. Build a grow chamber."],
["FLOODED EARTH","Recover technology from a submerged facility.",100,"Water level is high. Manage oxygen carefully."],
["RADIATION BELT","Recover the old energy facility.",100,"Radiation is dangerous. Keep exposure low."],
["DEAD CITY","Discover why the city disappeared.",100,"Automated systems are still active."],
["ORBIT","Establish the first orbital station.",100,"Earth is no longer the only frontier."],
["MOON","Create a permanent lunar colony.",100,"Low gravity and no breathable atmosphere."],
["MARS","Establish a major Mars colony.",100,"Mars demands long-term survival infrastructure."]
];

let state=JSON.parse(localStorage.getItem("earthfall_save")||"null")||{
 level:0, pos:12, health:100, water:80, oxygen:90, energy:100, radiation:0,
 inv:{Water:3,Food:3,O2:2,Energy:3,Metal:2,Seeds:1}, progress:0, built:0
};
const $=id=>document.getElementById(id);
function clamp(v,a=0,b=100){return Math.max(a,Math.min(b,v))}
function msg(t){$("toast").textContent=t}
function save(){localStorage.setItem("earthfall_save",JSON.stringify(state));msg("Game saved locally.");render()}
function render(){
 const L=levels[state.level];
 $("level").textContent=state.level;
 $("worldLabel").textContent=L[0];
 $("objective").textContent=L[1];
 $("aiText").textContent=L[3];
 $("player").style.left=state.pos+"%";
 $("progress").style.width=state.progress+"%";
 const vals=[["health",state.health],["water",state.water],["oxygen",state.oxygen],["energy",state.energy],["radiation",state.radiation]];
 vals.forEach(([n,v])=>{$(n+"Txt").textContent=Math.round(v);$(n+"Bar").style.width=clamp(v)+"%"});
 $("inventory").innerHTML=Object.entries(state.inv).map(([k,v])=>`<span style="display:inline-block;padding:5px 8px;margin:3px;background:#172a30;border-radius:8px;font-size:11px">${k}: ${v}</span>`).join("");
}
function move(d){
 state.pos=clamp(state.pos+d,4,94);
 state.water=clamp(state.water-.8); state.oxygen=clamp(state.oxygen-.45); state.energy=clamp(state.energy-.3);
 state.progress=clamp(state.progress+Math.abs(d)*.8);
 if(state.level>=5)state.radiation=clamp(state.radiation+(state.level>=6?.25:0));
 msg(d>0?"Moving toward objective…":"Moving back toward safer ground.");
 if(state.progress>=100)completeLevel(); else render();
}
function scan(){
 state.energy=clamp(state.energy-2);
 const discoveries=[
 "Settlement beacon detected.","Atmospheric station located.","Freshwater source detected.",
 "Vagas signal anomaly detected.","Artificial ecosystem materials detected.",
 "Submerged facility signal detected.","High-radiation energy signature detected.",
 "City network is still transmitting.","Orbital launch infrastructure detected.",
 "Lunar colony coordinates detected.","Mars colony construction window detected."
 ];
 msg("SCAN: "+discoveries[state.level]);
 state.progress=clamp(state.progress+8); render();
}
function action(){
 if(state.level===0){state.inv.Water++;state.progress+=20;msg("Emergency water cache recovered.");}
 else if(state.level===1){state.energy=clamp(state.energy-8);state.oxygen=clamp(state.oxygen+15);state.progress+=22;msg("Atmospheric station activated.");}
 else if(state.level===2){state.inv.Seeds++;state.progress+=20;msg("Settlement plot secured.");}
 else if(state.level===3){state.energy=clamp(state.energy-10);state.progress+=18;msg("Vagas network node copied.");}
 else if(state.level===4){state.inv.Food++;state.progress+=20;msg("Artificial food chamber started.");}
 else if(state.level===5){state.oxygen=clamp(state.oxygen-12);state.inv.Metal++;state.progress+=20;msg("Submerged technology recovered.");}
 else if(state.level===6){state.radiation=clamp(state.radiation+12);state.energy+=20;state.progress+=20;msg("Energy facility core recovered.");}
 else if(state.level===7){state.progress+=22;msg("Dead City archive partially decoded.");}
 else if(state.level===8){state.energy=clamp(state.energy-12);state.progress+=22;msg("Orbital station systems initialized.");}
 else if(state.level===9){state.oxygen=clamp(state.oxygen-8);state.inv.Metal++;state.progress+=22;msg("Lunar habitat module deployed.");}
 else {state.progress+=25;state.inv.Metal++;msg("Mars colony infrastructure deployed.");}
 if(state.progress>=100)completeLevel(); render();
}
function build(){
 const cost=state.inv.Metal||0;
 if(cost<1){msg("Need 1 Metal to build.");return}
 state.inv.Metal--; state.built++; state.energy=clamp(state.energy-5); state.progress=clamp(state.progress+15);
 msg("Structure built. Survival infrastructure upgraded."); render();
}
function completeLevel(){
 if(state.level<10){state.level++;state.progress=0;state.pos=12;state.health=clamp(state.health+12);state.water=clamp(state.water+10);state.oxygen=clamp(state.oxygen+15);state.energy=clamp(state.energy+15);msg("LEVEL COMPLETE → "+state.level);}
 else{state.progress=100;msg("LEVEL 10 COMPLETE — Mars civilization established.");}
}
$("left").onclick=()=>move(-7); $("right").onclick=()=>move(7); $("action").onclick=action; $("scan").onclick=scan; $("build").onclick=build; $("save").onclick=save;
$("reset").onclick=()=>{if(confirm("Reset local game progress?")){localStorage.removeItem("earthfall_save");location.reload()}};
window.addEventListener("keydown",e=>{if(e.target.tagName==="INPUT")return;if(e.key==="ArrowLeft")move(-7);if(e.key==="ArrowRight")move(7);if(e.key.toLowerCase()==="e")action();if(e.key.toLowerCase()==="q")scan()});
setInterval(()=>{if(state.level<10){state.water=clamp(state.water-.12);state.oxygen=clamp(state.oxygen-.08);state.energy=clamp(state.energy-.05);if(state.water<=0||state.oxygen<=0)state.health=clamp(state.health-.3);render()}},1000);
render();