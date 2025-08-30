// Récupère la taille depuis le query paramètre "size"
function getListSize() {
    const params = new URLSearchParams(window.location.search);
    const size = parseInt(params.get("size"), 10);
    return isNaN(size) ? 10 : size; // Par défaut 10
}

const donators = [];

function addDonator(name, amount) {
    donators.unshift({ name, amount });
    donators.splice(getListSize()); // Garde seulement les x derniers
    renderDonatorList();
}

function renderDonatorList() {
    let ul = document.getElementById("donator-list");
    if (!ul) {
        ul = document.createElement("ul");
        ul.id = "donator-list";
        document.body.appendChild(ul);
    }
    ul.innerHTML = "";
    donators.forEach((don) => {
        const li = document.createElement("li");
        li.innerHTML = `<span class="donator-name">${don.name}</span> <span class="donator-amount">${don.amount}€</span>`;
        ul.appendChild(li);
    });
}

// Écoute les donations via Streamlabs
document.addEventListener("streamerInfoReady", function () {
    if (window.streamlabs) {
        window.streamlabs.on("event", (eventData) => {
            if (
                eventData.type === "donation" &&
                Array.isArray(eventData.message)
            ) {
                eventData.message.forEach((don) => {
                    addDonator(don.name, parseFloat(don.amount));
                });
            }
        });
    }
});

// Pour compatibilité avec streamcharity-ws.js qui crée le socket
document.addEventListener("DOMContentLoaded", function () {
    // Si des dons arrivent avant streamerInfoReady
    window.addDonator = addDonator;
});
