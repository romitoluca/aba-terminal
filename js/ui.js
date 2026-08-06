window.addEventListener("load", avviaApp);

function avviaApp() {
    mostraHome();
}

function nuovaSessione() {
    creaSessione();
    mostraSessione();
}

function mostraHome() {

    document.getElementById("app").innerHTML = `
        <header>
            <h1>${APP.nome}</h1>
            <p>Terminale portatile</p>
        </header>

        <main>

            <button id="btnNuovaSessione">
                🆕 Nuova Sessione
            </button>

            <button id="btnImpostazioni">
                ⚙️ Impostazioni
            </button>

        </main>

        <footer>
            Versione ${APP.versione}
        </footer>
    `;

    document
        .getElementById("btnNuovaSessione")
        .addEventListener("click", nuovaSessione);

}

function mostraSessione() {

    document.getElementById("app").innerHTML = `
        <header>
            <h1>ABA Terminal</h1>
        </header>

        <main>

            <div id="reader" style="width:100%;"></div>

            <br>

            <button id="btnScanner">
                📷 APRI SCANNER
            </button>

            <br><br>

            <label style="display:block;font-weight:bold;margin-bottom:5px;">
                Barcode
            </label>

            <input
                type="text"
                id="barcode"
                placeholder="Barcode"
                readonly
                style="width:100%;padding:15px;font-size:18px;box-sizing:border-box;">

            <br><br>

            <label style="display:block;font-weight:bold;margin-bottom:10px;">
                Quantità
            </label>

            <div style="
                display:flex;
                justify-content:center;
                align-items:center;
                gap:15px;">

                <button id="btnMeno"
                    style="width:60px;height:60px;font-size:28px;">
                    −
                </button>

                <input
                    type="text"
                    id="quantita"
                    value="1"
                    readonly
                    style="
                        width:70px;
                        text-align:center;
                        font-size:24px;
                        padding:10px;">

                <button id="btnPiu"
                    style="width:60px;height:60px;font-size:28px;">
                    +
                </button>

            </div>

        </main>

        <footer>
            Sessione attiva
        </footer>
    `;

    document
        .getElementById("btnScanner")
        .addEventListener("click", avviaScanner);

    document
        .getElementById("btnPiu")
        .addEventListener("click", aumentaQuantita);

    document
        .getElementById("btnMeno")
        .addEventListener("click", diminuisciQuantita);

}

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