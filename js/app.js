/* ===========================================
   ABA TERMINAL v1.0
=========================================== */

let articoli = [];

window.onload = function () {

    document.getElementById("btnPiu").addEventListener("click", aumentaQuantita);

    document.getElementById("btnMeno").addEventListener("click", diminuisciQuantita);

    document.getElementById("btnAggiungi").addEventListener("click", aggiungiArticolo);

    document.getElementById("btnEsporta").addEventListener("click", esportaCSV);

};

function aumentaQuantita() {

    let q = parseInt(document.getElementById("quantita").value);

    document.getElementById("quantita").value = q + 1;

}

function diminuisciQuantita() {

    let q = parseInt(document.getElementById("quantita").value);

    if (q > 1) {

        document.getElementById("quantita").value = q - 1;

    }

}

function aggiungiArticolo() {

    const barcode = document.getElementById("barcode").value.trim();

    const matricola = document.getElementById("matricola").value.trim();

    const quantita = parseInt(document.getElementById("quantita").value);

    if (barcode == "") {

        alert("Leggi prima il barcode.");

        return;

    }

    articoli.push({

        barcode: barcode,

        matricola: matricola,

        quantita: quantita

    });

    aggiornaLista();

    document.getElementById("barcode").value = "";

    document.getElementById("matricola").value = "";

    document.getElementById("quantita").value = 1;

}

function aggiornaLista() {

    const lista = document.getElementById("listaArticoli");

    lista.innerHTML = "";

    articoli.forEach(function (articolo, indice) {

        lista.innerHTML += `

            <div class="articolo">

                <div><b>Barcode:</b> ${articolo.barcode}</div>

                <div><b>Matricola:</b> ${articolo.matricola}</div>

                <div><b>Quantità:</b> ${articolo.quantita}</div>

                <button
                    class="btnElimina"
                    onclick="eliminaArticolo(${indice})">

                    Elimina

                </button>

            </div>

        `;

    });

}

function eliminaArticolo(indice) {

    articoli.splice(indice,1);

    aggiornaLista();

}