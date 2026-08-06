/* ===========================================
   ABA TERMINAL v1.0
   scanner.js
=========================================== */

let htmlScanner = null;

let modalitaScanner = "prodotto";

document.getElementById("btnScanner").addEventListener("click", function () {

    modalitaScanner = "prodotto";

    avviaScanner();

});

document.getElementById("btnScannerMatricola").addEventListener("click", function () {

    modalitaScanner = "matricola";

    avviaScanner();

});


function avviaScanner() {

    document.getElementById("reader").style.display = "block";

    if (htmlScanner != null) {

        htmlScanner.clear();

    }

    htmlScanner = new Html5Qrcode("reader");

    htmlScanner.start(

        {
            facingMode: "environment"
        },

        {
            fps: 10,
            qrbox: 250
        },

        codiceLetto

    );

}


function codiceLetto(codice) {

    htmlScanner.stop().then(function () {

        document.getElementById("reader").style.display = "none";

    });

    if (modalitaScanner == "prodotto") {

        document.getElementById("barcode").value = codice;

    } else {

        document.getElementById("matricola").value = codice;

    }

}