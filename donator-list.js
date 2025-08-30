// Récupère la taille depuis le query paramètre "size"
function getListSize() {
    const params = new URLSearchParams(window.location.search);
    const size = parseInt(params.get("size"), 5);
    return isNaN(size) ? 5 : size; // Par défaut 5
}

// Ajout : récupère l'ancrage et l'affichage du montant
function getAnchor() {
    const params = new URLSearchParams(window.location.search);
    return params.get("anchor") === "right" ? "right" : "left";
}
function getShowAmount() {
    const params = new URLSearchParams(window.location.search);
    return params.get("showAmount") !== "false"; // true par défaut
}

const donators = [];

function addDonator(name, amount) {
    donators.push({ name, amount }); // Ajoute en bas
    donators.splice(0, donators.length - getListSize()); // Garde seulement les x derniers, retire en haut
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
    const anchor = getAnchor();
    const showAmount = getShowAmount();
    // Ajout : change la classe du body selon l'ancrage
    document.body.classList.remove("anchor-left", "anchor-right");
    document.body.classList.add(
        anchor === "right" ? "anchor-right" : "anchor-left"
    );
    donators.forEach((don) => {
        const li = document.createElement("li");
        if (anchor === "right") {
            // Pseudo à droite, montant à gauche
            li.innerHTML = `${
                showAmount
                    ? `<span class="donator-amount">${don.amount}€</span>`
                    : ""
            } <span class="donator-name">${don.name}</span>`;
        } else {
            // Pseudo à gauche, montant à droite
            li.innerHTML = `<span class="donator-name">${don.name}</span> ${
                showAmount
                    ? `<span class="donator-amount">${don.amount}€</span>`
                    : ""
            }`;
        }
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

// set interval simulate many donator (1 every 100ms)
/*setInterval(() => {
    const names = ["Alice", "Bob", "Charlie", "David", "Eve"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomAmount = (Math.random() * 100).toFixed(2);
    addDonator(randomName, randomAmount);
}, 10);*/
