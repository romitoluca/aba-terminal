let scanner=null;let scannerAttivo=false;

document.addEventListener("DOMContentLoaded",function(){
document.getElementById("btnScanner").addEventListener("click",function(){
if(scannerAttivo)fermaScanner();else avviaScanner();
});
});

function avviaScanner(){
const reader=document.getElementById("reader"),p=document.getElementById("btnScanner");
if(typeof Html5Qrcode==="undefined"){alert("Libreria scanner non disponibile. Controlla la connessione Internet.");return}
reader.style.display="block";reader.innerHTML="";p.textContent="⏹ CHIUDI SCANNER";
scanner=new Html5Qrcode("reader");scannerAttivo=true;
scanner.start({facingMode:{ideal:"environment"}},{
fps:10,qrbox:{width:280,height:180},
formatsToSupport:[
Html5QrcodeSupportedFormats.QR_CODE,Html5QrcodeSupportedFormats.EAN_13,
Html5QrcodeSupportedFormats.EAN_8,Html5QrcodeSupportedFormats.CODE_128,
Html5QrcodeSupportedFormats.CODE_39,Html5QrcodeSupportedFormats.CODE_93,
Html5QrcodeSupportedFormats.CODABAR,Html5QrcodeSupportedFormats.ITF,
Html5QrcodeSupportedFormats.UPC_A,Html5QrcodeSupportedFormats.UPC_E]
},function(t){acquisizioneRiuscita(t)},function(){}).catch(function(e){
scannerAttivo=false;reader.style.display="none";p.textContent="📷 SCANSIONA";
alert("Impossibile aprire la fotocamera.\n\n"+e);
});
}

function acquisizioneRiuscita(testo){
if(!scannerAttivo)return;
vibra();
const d=interpretaCodice(testo);
document.getElementById("barcode").value=d.barcode||"";
document.getElementById("modello").value=d.modello||"";
document.getElementById("matricola").value=d.matricola||"";
fermaScanner();
if(d.tipo==="qr-json")alert("QR acquisito.\n\nModello: "+(d.modello||"-")+"\nMatricola: "+(d.matricola||"-")+"\nCodice prodotto: "+(d.barcode||"-"));
}

function interpretaCodice(testo){
const r={tipo:"codice",barcode:testo.trim(),modello:"",matricola:""};let j;
try{j=JSON.parse(testo)}catch(e){return r}
r.tipo="qr-json";const m=j&&j.macc?j.macc:{};
r.modello=primoValore([m.mod,j.mod,m.model,j.model]);
r.matricola=primoValore([m.matr,j.matr,m.serial,j.serial]);
r.barcode=primoValore([m.code,j.code,m.productCode,j.productCode]);
if(!r.barcode&&m.crt)r.barcode=primoValore([m.crt.code,m.crt.cod,m.crt.productCode,m.crt.cusdis,m.crt.opedis]);
if(!r.barcode)r.barcode=testo.trim();
return r;
}
function primoValore(v){for(let i=0;i<v.length;i++)if(v[i]!==undefined&&v[i]!==null&&String(v[i]).trim()!=="")return String(v[i]).trim();return ""}
function vibra(){try{if("vibrate"in navigator)navigator.vibrate([120,60,120])}catch(e){}}
function fermaScanner(){
const r=document.getElementById("reader"),p=document.getElementById("btnScanner");
if(!scanner){scannerAttivo=false;r.style.display="none";p.textContent="📷 SCANSIONA";return}
scannerAttivo=false;
scanner.stop().catch(function(){}).finally(function(){
scanner.clear().catch(function(){});scanner=null;r.innerHTML="";r.style.display="none";p.textContent="📷 SCANSIONA";
});
}
