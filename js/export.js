/* ===========================================
   ABA TERMINAL v1.0
   export.js
=========================================== */

function esportaCSV() {

    if (articoli.length === 0) {

        alert("Nessun articolo da esportare.");

        return;

    }

    let csv = "Barcode;Matricola;Quantita\r\n";

    articoli.forEach(function (articolo) {

        csv += articolo.barcode + ";";
        csv += articolo.matricola + ";";
        csv += articolo.quantita + "\r\n";

    });

    const blob = new Blob([csv], {

        type: "text/csv;charset=utf-8;"

    });

    const link = document.createElement("a");

    const data = new Date();

    const nomeFile =
        "Inventario_" +
        data.getFullYear() +
        ("0" + (data.getMonth() + 1)).slice(-2) +
        ("0" + data.getDate()).slice(-2) +
        "_" +
        ("0" + data.getHours()).slice(-2) +
        ("0" + data.getMinutes()).slice(-2) +
        ".csv";

    link.href = URL.createObjectURL(blob);

    link.download = nomeFile;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

}