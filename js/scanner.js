let scanner = null;
let scannerAttivo = false;

document.addEventListener("DOMContentLoaded", function () {

    const btn = document.getElementById("btnScanner");

    if (btn) {

        btn.addEventListener("click", function () {

            if (scannerAttivo) {
                fermaScanner();
            } else {
                avviaScanner();
            }

        });

    }

});


async function avviaScanner() {

    const reader = document.getElementById("reader");
    const btn = document.getElementById("btnScanner");

    if (typeof Html5Qrcode === "undefined") {

        alert(
            "Libreria scanner non disponibile.\n\n" +
            "Controlla la connessione Internet."
        );

        return;
    }


    reader.style.display = "block";
    reader.innerHTML = "";

    btn.textContent = "⏹ CHIUDI SCANNER";

    scanner = new Html5Qrcode("reader");
    scannerAttivo = true;


    try {

        const cameras = await Html5Qrcode.getCameras();


        if (!cameras || cameras.length === 0) {

            throw new Error(
                "Nessuna fotocamera disponibile."
            );

        }


        /*
        Cerchiamo la fotocamera posteriore.
        */

        let camera = cameras.find(function (c) {

            const nome = (c.label || "").toLowerCase();

            return (
                nome.includes("back") ||
                nome.includes("rear") ||
                nome.includes("environment") ||
                nome.includes("posteriore") ||
                nome.includes("post")
            );

        });


        /*
        Se non viene identificata,
        utilizziamo la prima disponibile.
        */

        if (!camera) {
            camera = cameras[0];
        }


        const config = {

            fps: 10,

            qrbox: {
                width: 280,
                height: 180
            },

            formatsToSupport: [

                Html5QrcodeSupportedFormats.QR_CODE,

                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,

                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.CODE_93,

                Html5QrcodeSupportedFormats.CODABAR,
                Html5QrcodeSupportedFormats.ITF,

                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E

            ]

        };


        await scanner.start(

            camera.id,

            config,

            function (testo) {

                acquisizioneRiuscita(testo);

            },

            function () {

                // Nessun codice trovato.

            }

        );


    } catch (errore) {

        console.error(
            "Errore apertura fotocamera:",
            errore
        );


        scannerAttivo = false;
        scanner = null;

        reader.innerHTML = "";
        reader.style.display = "none";

        btn.textContent = "📷 SCANSIONA";


        alert(
            "Impossibile aprire la fotocamera.\n\n" +
            String(errore)
        );

    }

}


/*
==================================================
CODICE ACQUISITO
==================================================
*/

function acquisizioneRiuscita(testo) {

    if (!scannerAttivo) {
        return;
    }


    /*
    Vibrazione alla lettura.
    */

    vibra();


    /*
    Interpretiamo il contenuto.
    */

    const dati = interpretaCodice(testo);


    /*
    CODICE PRODOTTO
    */

    const barcode =
        document.getElementById("barcode");

    if (barcode) {
        barcode.value = dati.barcode || "";
    }


    /*
    MODELLO
    */

    const modello =
        document.getElementById("modello");

    if (modello) {
        modello.value = dati.modello || "";
    }


    /*
    MATRICOLA
    */

    const matricola =
        document.getElementById("matricola");

    if (matricola) {
        matricola.value = dati.matricola || "";
    }


    /*
    Chiudiamo lo scanner dopo la lettura.
    */

    fermaScanner();

}


/*
==================================================
INTERPRETAZIONE BARCODE / QR
==================================================
*/

function interpretaCodice(testo) {

    const risultato = {

        tipo: "codice",

        barcode: testo.trim(),

        modello: "",

        matricola: ""

    };


    const contenuto = testo.trim();


    /*
    ------------------------------------------------
    TENTATIVO 1
    JSON NORMALE
    ------------------------------------------------
    */

    try {

        const json = JSON.parse(contenuto);

        if (
            json &&
            json.macc
        ) {

            const macc = json.macc;


            risultato.tipo = "qr-json";


            /*
            MODELLO
            */

            risultato.modello =
                primoValore([

                    macc.mod,

                    json.mod,

                    macc.model,

                    json.model

                ]);


            /*
            MATRICOLA
            */

            risultato.matricola =
                primoValore([

                    macc.matr,

                    json.matr,

                    macc.serial,

                    json.serial

                ]);


            /*
            CODICE PRODOTTO
            */

            risultato.barcode =
                primoValore([

                    macc.code,

                    json.code,

                    macc.productCode,

                    json.productCode

                ]);


            /*
            Se il codice non è direttamente
            disponibile, controlliamo crt.
            */

            if (
                !risultato.barcode &&
                macc.crt
            ) {

                risultato.barcode =
                    primoValore([

                        macc.crt.code,

                        macc.crt.cod,

                        macc.crt.productCode

                    ]);

            }


            /*
            Se abbiamo trovato almeno un dato,
            consideriamo il QR correttamente letto.
            */

            if (
                risultato.modello ||
                risultato.matricola ||
                risultato.barcode
            ) {

                return risultato;

            }

        }

    } catch (errore) {

        /*
        Il contenuto non è JSON perfettamente valido.
        Passiamo al metodo di estrazione testuale.
        */

    }


    /*
    ------------------------------------------------
    TENTATIVO 2
    ESTRAZIONE DIRETTA DAL TESTO DEL QR
    ------------------------------------------------

    Questo è importante per il tuo QR.

    Cerchiamo direttamente:

    "mod":"RT-30"
    "matr":"3CEAM025150"
    "code":"9911041"
    ------------------------------------------------
    */


    const modelloQR =
        estraiCampo(contenuto, "mod");


    const matricolaQR =
        estraiCampo(contenuto, "matr");


    const codiceQR =
        estraiCampo(contenuto, "code");


    /*
    Se abbiamo trovato almeno uno dei
    campi tipici del QR della macchina,
    lo consideriamo un QR macchina.
    */

    if (
        modelloQR ||
        matricolaQR ||
        codiceQR
    ) {

        risultato.tipo = "qr-json";

        risultato.modello =
            modelloQR;

        risultato.matricola =
            matricolaQR;

        risultato.barcode =
            codiceQR;


        return risultato;

    }


    /*
    ------------------------------------------------
    NORMALE BARCODE
    ------------------------------------------------
    */

    risultato.tipo = "codice";

    risultato.barcode = contenuto;

    return risultato;

}


/*
==================================================
ESTRAI CAMPO DAL TESTO
==================================================
*/

function estraiCampo(testo, campo) {

    /*
    Cerca:

    "campo":"valore"

    oppure:

    "campo": "valore"
    */

    const regex =
        new RegExp(
            '"' +
            campo +
            '"\\s*:\\s*"([^"]*)"',
            "i"
        );


    const risultato =
        testo.match(regex);


    if (risultato && risultato[1]) {

        return risultato[1].trim();

    }


    return "";

}


/*
==================================================
PRIMO VALORE VALIDO
==================================================
*/

function primoValore(valori) {

    for (
        let i = 0;
        i < valori.length;
        i++
    ) {

        if (

            valori[i] !== undefined &&

            valori[i] !== null &&

            String(valori[i]).trim() !== ""

        ) {

            return String(
                valori[i]
            ).trim();

        }

    }


    return "";

}


/*
==================================================
VIBRAZIONE
==================================================
*/

function vibra() {

    try {

        if (
            "vibrate" in navigator
        ) {

            navigator.vibrate([
                120,
                60,
                120
            ]);

        }

    } catch (errore) {

        console.log(
            "Vibrazione non disponibile."
        );

    }

}


/*
==================================================
CHIUDI SCANNER
==================================================
*/

function fermaScanner() {

    const reader =
        document.getElementById("reader");

    const btn =
        document.getElementById("btnScanner");


    scannerAttivo = false;


    if (!scanner) {

        reader.innerHTML = "";

        reader.style.display = "none";

        btn.textContent =
            "📷 SCANSIONA";

        return;

    }


    const scannerDaFermare =
        scanner;


    scanner = null;


    scannerDaFermare
        .stop()

        .catch(function () {

            // Fotocamera già chiusa.

        })

        .finally(function () {


            scannerDaFermare
                .clear()

                .catch(function () {

                    // Reader già pulito.

                });


            reader.innerHTML = "";

            reader.style.display = "none";

            btn.textContent =
                "📷 SCANSIONA";

        });

}