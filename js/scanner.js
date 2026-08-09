let scanner = null;
let scannerAttivo = false;
let modalitaScanner = "prodotto";

document.addEventListener("DOMContentLoaded", function () {

    const btnScanner = document.getElementById("btnScanner");
    const btnMatricola = document.getElementById("btnMatricola");

    if (btnScanner) {
        btnScanner.addEventListener("click", function () {

            if (scannerAttivo) {
                fermaScanner();
            } else {
                modalitaScanner = "prodotto";
                avviaScanner();
            }

        });
    }

    if (btnMatricola) {
        btnMatricola.addEventListener("click", function () {

            if (scannerAttivo) {
                fermaScanner();
            } else {
                modalitaScanner = "matricola";
                avviaScanner();
            }

        });
    }

});


async function avviaScanner() {

    const reader = document.getElementById("reader");

    const btnScanner =
        document.getElementById("btnScanner");

    const btnMatricola =
        document.getElementById("btnMatricola");


    if (typeof Html5Qrcode === "undefined") {

        alert(
            "Libreria scanner non disponibile.\n\n" +
            "Controlla la connessione Internet."
        );

        return;
    }


    reader.style.display = "block";
    reader.innerHTML = "";


    if (modalitaScanner === "matricola") {

        btnMatricola.textContent =
            "⏹ CHIUDI LETTURA MATRICOLA";

    } else {

        btnScanner.textContent =
            "⏹ CHIUDI SCANNER";

    }


    scanner = new Html5Qrcode("reader");

    scannerAttivo = true;


    try {

        const cameras =
            await Html5Qrcode.getCameras();


        if (!cameras || cameras.length === 0) {

            throw new Error(
                "Nessuna fotocamera disponibile."
            );

        }


        /*
        Cerchiamo preferibilmente
        la fotocamera posteriore.
        */

        let camera = cameras.find(function (c) {

            const nome =
                (c.label || "").toLowerCase();

            return (

                nome.includes("back") ||

                nome.includes("rear") ||

                nome.includes("environment") ||

                nome.includes("posteriore") ||

                nome.includes("post")

            );

        });


        /*
        Se non troviamo la posteriore,
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

                /*
                Nessun codice trovato.
                Non mostriamo errori.
                */

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


        btnScanner.textContent =
            "📷 SCANSIONA CODICE PRODOTTO";

        btnMatricola.textContent =
            "📷 LEGGI MATRICOLA";


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
    VIBRAZIONE
    */

    vibra();


    /*
    ==============================================
    LETTURA MATRICOLA
    ==============================================
    */

    if (modalitaScanner === "matricola") {

        const campoMatricola =
            document.getElementById("matricola");


        if (campoMatricola) {

            campoMatricola.value =
                testo.trim();

        }


        fermaScanner();

        return;
    }


    /*
    ==============================================
    LETTURA CODICE PRODOTTO / QR
    ==============================================
    */

    const dati =
        interpretaCodice(testo);


    const barcode =
        document.getElementById("barcode");

    const modello =
        document.getElementById("modello");

    const matricola =
        document.getElementById("matricola");


    /*
    CODICE PRODOTTO
    */

    if (barcode) {

        barcode.value =
            dati.barcode || "";

    }


    /*
    MODELLO
    */

    if (modello) {

        modello.value =
            dati.modello || "";

    }


    /*
    MATRICOLA
    */

    if (matricola) {

        matricola.value =
            dati.matricola || "";

    }


    /*
    Chiudiamo lo scanner.
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


    const contenuto =
        testo.trim();


    /*
    ==============================================
    TENTATIVO JSON
    ==============================================
    */

    try {

        const json =
            JSON.parse(contenuto);


        if (
            json &&
            json.macc
        ) {

            const macc =
                json.macc;


            risultato.tipo =
                "qr-json";


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
        Non è JSON perfettamente valido.
        Passiamo all'estrazione testuale.
        */

    }


    /*
    ==============================================
    ESTRAZIONE DIRETTA DAL TESTO
    ==============================================
    */

    const modelloQR =
        estraiCampo(
            contenuto,
            "mod"
        );


    const matricolaQR =
        estraiCampo(
            contenuto,
            "matr"
        );


    const codiceQR =
        estraiCampo(
            contenuto,
            "code"
        );


    if (

        modelloQR ||
        matricolaQR ||
        codiceQR

    ) {

        risultato.tipo =
            "qr-json";


        risultato.modello =
            modelloQR;


        risultato.matricola =
            matricolaQR;


        risultato.barcode =
            codiceQR;


        return risultato;

    }


    /*
    ==============================================
    NORMALE BARCODE
    ==============================================
    */

    risultato.tipo =
        "codice";


    risultato.barcode =
        contenuto;


    return risultato;

}


/*
==================================================
ESTRAZIONE CAMPO QR
==================================================
*/

function estraiCampo(testo, campo) {

    const regex =
        new RegExp(
            '"' +
            campo +
            '"\\s*:\\s*"([^"]*)"',
            "i"
        );


    const risultato =
        testo.match(regex);


    if (
        risultato &&
        risultato[1]
    ) {

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

            /*
            Vibrazione breve ma evidente.
            */

            navigator.vibrate([
                150,
                70,
                150
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
CHIUSURA SCANNER
==================================================
*/

function fermaScanner() {

    const reader =
        document.getElementById("reader");


    const btnScanner =
        document.getElementById("btnScanner");


    const btnMatricola =
        document.getElementById("btnMatricola");


    scannerAttivo = false;


    if (!scanner) {

        reader.innerHTML = "";

        reader.style.display =
            "none";


        btnScanner.textContent =
            "📷 SCANSIONA CODICE PRODOTTO";


        btnMatricola.textContent =
            "📷 LEGGI MATRICOLA";


        return;

    }


    const scannerDaFermare =
        scanner;


    scanner = null;


    scannerDaFermare
        .stop()

        .catch(function () {

            /*
            Fotocamera già chiusa.
            */

        })

        .finally(function () {


            scannerDaFermare
                .clear()

                .catch(function () {

                    /*
                    Reader già pulito.
                    */

                });


            reader.innerHTML = "";

            reader.style.display =
                "none";


            btnScanner.textContent =
                "📷 SCANSIONA CODICE PRODOTTO";


            btnMatricola.textContent =
                "📷 LEGGI MATRICOLA";


        });

}