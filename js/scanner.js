let scanner = null;

function avviaScanner() {

    if (scanner !== null) return;

    scanner = new Html5Qrcode("reader");

    scanner.start(

        { facingMode: "environment" },

        {
            fps: 10,
            qrbox: 250
        },

        codiceLetto

    );

}

function codiceLetto(codice) {

    document.getElementById("barcode").value = codice;

    scanner.stop();

    scanner = null;

}