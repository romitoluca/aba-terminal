/* ===========================================
   ABA TERMINAL v1.0
   scanner.js
=========================================== */

let scanner = null;
let modalitaScanner = "prodotto";

window.addEventListener("load", function () {

    document.getElementById("btnScanner")
        .addEventListener("click", function () {

            modalitaScanner = "prodotto";
            avviaScanner();

        });

    document.getElementById("btnScannerMatricola")
        .addEventListener("click", function () {

            modalitaScanner = "matricola";
            avviaScanner();

        });

});


function avviaScanner() {

    const reader = document.getElementById("reader");

    reader.style.display = "block";
    reader.innerHTML = "";

    scanner = new Html5Qrcode("reader");

    scanner.start(

        {
            facingMode: "environment"
        },

        {
            fps: 10,
            qrbox: {
                width: 250,
                height: 120
            }
        },

        function (decodedText) {

            scanner.stop().then(function () {

                reader.style.display = "none";
                reader.innerHTML = "";

            });

            if (modalitaScanner === "prodotto") {

                document.getElementById("barcode").value = decodedText;

            } else {

                document.getElementById("matricola").value = decodedText;

            }

        },

        function () {
            // Ignora gli errori di lettura
        }

    ).catch(function (err) {

        alert("Errore apertura fotocamera:\n" + err);

        reader.style.display = "none";

    });

}