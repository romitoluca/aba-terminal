function esportaCSV() {

    if (!window.articoli || articoli.length === 0) {
        alert("Non ci sono articoli da esportare.");
        return;
    }

    let righe = [];

    articoli.forEach(function (articolo) {

        const barcode = articolo.barcode || "";
        const modello = articolo.modello || "";
        const matricola = articolo.matricola || "";
        const quantita = articolo.quantita || 1;

        righe.push(
            barcode + ";" +
            modello + ";" +
            matricola + ";" +
            quantita
        );

    });

    /*
    IMPORTANTE:
    nessuna intestazione.
    Easyfatt deve ricevere direttamente
    le righe degli articoli.
    */

    const contenuto = righe.join("\r\n");

    const blob = new Blob(
        [contenuto],
        {
            type: "text/plain;charset=utf-8"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =
        "ABA_Terminal_" +
        new Date().toISOString()
            .slice(0, 10) +
        ".csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}


/*
Collega il pulsante ESPORTA CSV
*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const btn =
            document.getElementById("btnEsporta");

        if (btn) {

            btn.addEventListener(
                "click",
                esportaCSV
            );

        }

    }
);