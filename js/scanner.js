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

        /*
        Recuperiamo le fotocamere disponibili.
        */

        const cameras = await Html5Qrcode.getCameras();


        if (!cameras || cameras.length === 0) {

            throw new Error(
                "Nessuna fotocamera disponibile."
            );
        }


        /*
        Cerchiamo preferibilmente la fotocamera posteriore.
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
        Se non viene identificata la posteriore,
        usiamo la prima disponibile.
        */

        if (!camera) {
            camera = cameras[0];
        }


        console.log("Fotocamera utilizzata:", camera);


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


        /*
        Avvio tramite ID della fotocamera.
        Questo evita completamente il problema
        "facingMode".
        */

        await scanner.start(

            camera.id,

            config,

            function (testo) {

                acquisizioneRiuscita(testo);

            },

            function () {

                // Nessun codice trovato.
                // Non mostriamo errori continui.

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
    Vibrazione.
    */

    vibra();


    /*
    Interpretiamo il contenuto.
    */

    const dati = interpretaCodice(testo);


    /*
    BARCODE / CODICE PRODOTTO
    */

    document.getElementById("barcode").value =
        dati.barcode || "";


    /*
    MODELLO
    */

    document.getElementById("modello").value =
        dati.modello || "";


    /*
    MATRICOLA
    */

    document.getElementById("matricola").value =
        dati.matricola || "";


    /*
    Chiudiamo automaticamente la fotocamera
    dopo una lettura valida.
    */

    fermaScanner();


    /*
    Se abbiamo letto un QR JSON,
    mostriamo il riepilogo.
    */

    if (dati.tipo === "qr-json") {

        alert(

            "QR acquisito.\n\n" +

            "Modello: " +
            (dati.modello || "-") +

            "\n" +

            "Matricola: " +
            (dati.matricola || "-") +

            "\n" +

            "Codice prodotto: " +
            (dati.barcode || "-")

        );

    }

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


    let json;


    /*
    Se non è JSON, è semplicemente
    un normale barcode.
    */

    try {

        json = JSON.parse(testo);

    } catch (errore) {

        return risultato;

    }


    /*
    È un QR contenente JSON.
    */

    risultato.tipo = "qr-json";


    const macc =
        json && json.macc
            ? json.macc
            : {};


    /*
    MODELLO
    */

    risultato.modello = primoValore([

        macc.mod,

        json.mod,

        macc.model,

        json.model

    ]);


    /*
    MATRICOLA
    */

    risultato.matricola = primoValore([

        macc.matr,

        json.matr,

        macc.serial,

        json.serial

    ]);


    /*
    CODICE PRODOTTO
    */

    risultato.barcode = primoValore([

        macc.code,

        json.code,

        macc.productCode,

        json.productCode

    ]);


    /*
    Alcuni QR possono contenere
    ulteriori dati dentro "crt".
    */

    if (!risultato.barcode && macc.crt) {

        risultato.barcode = primoValore([

            macc.crt.code,

            macc.crt.cod,

            macc.crt.productCode,

            macc.crt.cusdis,

            macc.crt.opedis

        ]);

    }


    /*
    Se non abbiamo trovato un campo
    riconoscibile, conserviamo tutto
    il contenuto del QR.
    */

    if (!risultato.barcode) {

        risultato.barcode =
            testo.trim();

    }


    return risultato;

}


/*
==================================================
TROVA PRIMO VALORE VALIDO
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

        if ("vibrate" in navigator) {

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

        btn.textContent = "📷 SCANSIONA";

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