// Récupère la taille depuis le query paramètre "size"
function getListSize() {
    const params = new URLSearchParams(window.location.search);
    const size = parseInt(params.get("size"), 5);
    return isNaN(size) ? 5 : size; // Par défaut 5
}

const donators = [];

function addDonator(name, amount) {
    donators.unshift({ name, amount });
    donators.splice(getListSize()); // Garde seulement les x derniers
    renderDonatorList();
    // Après le rendu, applique l'animation à tous les donateurs
    const ul = document.getElementById("donator-list");
    if (!ul) return;
    const lis = Array.from(ul.children);
    if (lis.length === 0) return;
    const lastLi = lis[lis.length - 1];
    const moveHeight = lastLi.offsetHeight;
    lis.forEach((li) => {
        li.classList.add("goal-attained-animate");
        li.style.setProperty("--goal-move", `${moveHeight}px`);
    });
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

// Ajoute ce bloc pour écouter les donations via l'événement "donationEvent"
document.addEventListener("donationEvent", function (e) {
    const eventData = e.detail;
    if (Array.isArray(eventData.message)) {
        eventData.message.forEach((don) => {
            addDonator(don.name, parseFloat(don.amount));
        });
    }
});
