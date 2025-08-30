// Charge PapaParse dynamiquement si besoin
if (typeof Papa === "undefined") {
    const papaScript = document.createElement("script");
    papaScript.src =
        "https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js";
    document.head.appendChild(papaScript);
    papaScript.onload = loadStreamerInfo;
} else {
    loadStreamerInfo();
}

function loadStreamerInfo() {
    fetch("streamer.csv")
        .then((response) => response.text())
        .then((csvText) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: function (results) {
                    // Prend le premier streamer du CSV
                    const info = results.data[0];
                    window.streamerInfo = {
                        username: info.username,
                        socketToken: info.streamlabsSocketToken,
                    };
                    // Déclenche un événement pour signaler que c'est prêt
                    document.dispatchEvent(
                        new CustomEvent("streamerInfoReady")
                    );
                },
            });
        });
}
