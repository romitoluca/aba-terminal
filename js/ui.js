function mostraHome() {

    document.getElementById("app").innerHTML = `

        <header>

            <h1>${APP.nome}</h1>

            <p>Terminale portatile</p>

        </header>

        <main>

            <button id="btnNuovaSessione">

                Nuova Sessione

            </button>

            <button id="btnImpostazioni">

                Impostazioni

            </button>

        </main>

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

                APRI SCANNER

            </button>

            <br><br>

            <input
                type="text"
                id="barcode"
                placeholder="Barcode"
                readonly
                style="width:100%;padding:15px;font-size:18px;">

        </main>

    `;

    document
        .getElementById("btnScanner")
        .addEventListener("click", avviaScanner);

}