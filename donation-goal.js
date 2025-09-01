function getShowAmountZoom() {
    const params = new URLSearchParams(window.location.search);
    const showAmount = params.get("showAmount");
    return showAmount !== "false";
}
// Suivi du dernier goal atteint pour les logs de changement d'objectif
let lastGoalIdx = null;

// Charger les donation goals depuis le CSV avec fetch
function loadDonationGoalsFromCSV() {
    fetch("donation-goals.csv")
        .then((response) => response.text())
        .then((csvText) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: function (results) {
                    const goals = results.data
                        .map((row) => ({
                            valeur: parseInt(row.valeur, 10),
                            text: row.text,
                        }))
                        .filter(
                            (goal) => Number.isFinite(goal.valeur) && goal.text
                        );
                    createDonationGoalsList(goals);
                    updateDonationGoalsOpacity(goals);
                },
            });
        });
}

document.addEventListener("DOMContentLoaded", function () {
    let donationGoals = [];
    // Charge PapaParse dynamiquement si besoin
    if (typeof Papa === "undefined") {
        const papaScript = document.createElement("script");
        papaScript.src =
            "https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js";
        document.head.appendChild(papaScript);
        papaScript.onload = loadDonationGoalsFromCSV;
    } else {
        loadDonationGoalsFromCSV();
    }

    // Slider pour contrôler la valeur de donation
    const slider = document.getElementById("donation-slider");
    const valueSpan = document.getElementById("donation-value");
    if (slider && valueSpan) {
        slider.addEventListener("input", function () {
            currentDonationValue = parseInt(slider.value, 10);
            valueSpan.textContent = currentDonationValue + "€";
            if (donationGoals.length > 0) {
                updateDonationGoalsOpacity(donationGoals);
            }
        });
    }
    // Stocker les goals pour update
    window.setDonationGoals = function (goals) {
        donationGoals = goals;
    };

    // Ajout : gestion du point d'ancrage via query paramètre ou reverse
    const params = new URLSearchParams(window.location.search);
    let anchor = params.get("anchor");
    if (isReverseMode()) {
        anchor = anchor === "right" ? "left" : "right";
    }
    if (anchor === "right") {
        document.body.classList.add("anchor-right");
    } else {
        document.body.classList.add("anchor-left");
    }
    // Ajout : gestion du point d'ancrage vertical
    const verticalAnchor = getVerticalAnchor();
    if (verticalAnchor === "top") {
        document.body.classList.add("anchor-top");
    } else {
        document.body.classList.add("anchor-bottom");
    }
});

// Valeur actuelle des dons
let _currentDonationValue = 0;
Object.defineProperty(window, "currentDonationValue", {
    get() {
        return _currentDonationValue;
    },
    set(val) {
        _currentDonationValue = val;
        const valueSpan = document.getElementById("donation-value");
        if (valueSpan) {
            valueSpan.textContent = _currentDonationValue + "€";
        }
        if (window.setDonationGoals && window.donationGoals) {
            updateDonationGoalsOpacity(window.donationGoals);
        }
    },
});

// Initialiser la valeur de donation depuis l'API ZEvent
function fetchAndSetDonationValue() {
    if (!window.streamerInfo || !window.streamerInfo.username) return;
    fetch("https://api.zevent.fr/streamer/" + window.streamerInfo.username)
        .then((response) => response.json())
        .then((data) => {
            if (
                data &&
                data.donationAmount &&
                typeof data.donationAmount.number === "number"
            ) {
                console.log(
                    "Valeur actuelle des dons:",
                    data.donationAmount.number
                );
                window.currentDonationValue = data.donationAmount.number;
            }
        });
}

if (window.streamerInfo && window.streamerInfo.username) {
    fetchAndSetDonationValue();
} else {
    document.addEventListener("streamerInfoReady", fetchAndSetDonationValue);
}

function isZoomMode() {
    const zoom = new URLSearchParams(window.location.search).has("zoom");
    return zoom;
}

function isReverseMode() {
    const params = new URLSearchParams(window.location.search);
    return params.get("reverse") === "true";
}

function getMaxGoalsZoom() {
    const params = new URLSearchParams(window.location.search);
    const maxGoals = parseInt(params.get("max"), 10);
    return isNaN(maxGoals) ? null : maxGoals;
}

function createDonationGoalsList(goals, animateIdx = null) {
    const listElement = document.getElementById("donation-goals-list");
    if (!listElement) {
        window.setDonationGoals(goals);
        window.donationGoals = goals;
        return;
    }
    listElement.innerHTML = "";

    const displayGoals = goals;

    const showAmount = getShowAmountZoom();
    if (!isZoomMode()) {
        listElement.style.paddingTop = "100px";
        listElement.style.paddingBottom = "100px";
        // Mode normal : affiche tous les goals
        console.log(
            "[DONATION GOALS] Affichage de la liste complète des goals"
        );
        displayGoals.forEach((goal, idx) => {
            if (!Number.isFinite(goal.valeur) || !goal.text) return;
            const li = document.createElement("li");
            li.setAttribute("data-goal-index", idx);
            li.innerHTML = `${
                showAmount
                    ? `<span class='donation-euro'>${goal.valeur}€</span> `
                    : ""
            }<span class='donation-text'>${goal.text}</span>`;
            listElement.appendChild(li);
        });
    } else {
        listElement.style.paddingTop = "0";
        listElement.style.paddingBottom = "0";
        console.log("[DONATION GOALS] Affichage en mode zoom");
        // Mode zoom : affiche les goals atteints + le prochain à atteindre
        let nextGoalIdx = displayGoals.findIndex(
            (g) => currentDonationValue < g.valeur
        );
        if (nextGoalIdx === -1) nextGoalIdx = displayGoals.length; // tous atteints

        // On prépare la variable pour la hauteur du prochain goal
        let nextGoalHeight = 0;

        // On crée d'abord le prochain goal (pour mesurer sa hauteur)
        let nextGoalLi = null;
        if (nextGoalIdx < displayGoals.length) {
            const goal = displayGoals[nextGoalIdx];
            nextGoalLi = document.createElement("li");
            nextGoalLi.setAttribute("data-goal-index", nextGoalIdx);
            nextGoalLi.classList.add("goal-next");
            nextGoalLi.style.opacity = "0.5";
            nextGoalLi.innerHTML = `${
                showAmount
                    ? `<span class='donation-euro'>${goal.valeur}€</span> `
                    : ""
            }<span class='donation-text'>${goal.text}</span>`;
            listElement.appendChild(nextGoalLi);
            nextGoalHeight = nextGoalLi.offsetHeight;
            listElement.removeChild(nextGoalLi); // On retire pour l'instant
        }

        // Limite le nombre de goals affichés (maxGoals)
        let maxGoals = getMaxGoalsZoom();
        let startIdx = 0;
        if (maxGoals !== null) {
            startIdx = Math.max(0, nextGoalIdx - maxGoals);
        }

        // Affiche les goals atteints au-dessus
        for (let i = startIdx; i < nextGoalIdx; i++) {
            const goal = displayGoals[i];
            const li = document.createElement("li");
            li.setAttribute("data-goal-index", i);
            li.classList.add("goal-attained");
            if (showAmount === false) {
                li.classList.add("goal-center-text");
            }
            li.innerHTML = `${
                showAmount
                    ? `<span class='donation-euro'>${goal.valeur}€</span> `
                    : ""
            }<span class='donation-text'>${goal.text}</span>`;
            if (animateIdx !== null) {
                li.classList.add("goal-attained-animate");
                li.style.setProperty("--goal-move", `${nextGoalHeight}px`);
            }
            listElement.appendChild(li);
        }
        if (nextGoalIdx < displayGoals.length) {
            if (!showAmount) {
                nextGoalLi.classList.add("goal-center-text");
            }
            // Si maxGoals = 0, force l'opacité à 1
            let maxGoals = getMaxGoalsZoom();
            if (maxGoals === 0) {
                nextGoalLi.style.opacity = "1";
            }
            if (animateIdx !== null) {
                nextGoalLi.classList.add("goal-next-animate");
                nextGoalLi.style.setProperty(
                    "--goal-move",
                    `${nextGoalHeight}px`
                );
            }
            listElement.appendChild(nextGoalLi);
        }
    }
    window.setDonationGoals(displayGoals);
    window.donationGoals = displayGoals;
}

function updateDonationGoalsOpacity(goals) {
    const listElement = document.getElementById("donation-goals-list");
    if (!listElement) return; // Ajouté : évite l’erreur si l’élément n’existe pas
    let nextGoalIdx = goals.findIndex((g) => currentDonationValue < g.valeur);
    if (nextGoalIdx === -1) nextGoalIdx = goals.length;

    if (lastGoalIdx !== nextGoalIdx) {
        // Animation lors du passage au goal suivant
        if (isZoomMode() && nextGoalIdx > 0) {
            createDonationGoalsList(goals, nextGoalIdx);
            setTimeout(() => {
                createDonationGoalsList(goals);
                updateDonationGoalsOpacity(goals);
            }, 700);
        }
        lastGoalIdx = nextGoalIdx;
    }

    if (!isZoomMode()) {
        Array.from(listElement.children).forEach((li, idx) => {
            const goal = goals[idx];
            if (!goal) return;
            const opacity = currentDonationValue >= goal.valeur ? 1 : 0.5;
            li.style.opacity = opacity;
        });
    }
}

document.addEventListener("donationEvent", function (e) {
    const eventData = e.detail;
    if (Array.isArray(eventData.message)) {
        eventData.message.forEach((don) => {
            const montant = parseFloat(don.amount);
            if (!isNaN(montant)) {
                if (typeof window.currentDonationValue === "undefined") {
                    window.currentDonationValue = 0;
                }
                window.currentDonationValue += montant;
                const valueSpan = document.getElementById("donation-value");
                if (valueSpan) {
                    valueSpan.textContent = window.currentDonationValue + "€";
                }
                if (window.setDonationGoals) {
                    updateDonationGoalsOpacity(window.donationGoals || []);
                }
            }
        });
    }
});

function getVerticalAnchor() {
    const params = new URLSearchParams(window.location.search);
    const anchor = params.get("anchor");
    return anchor === "top" ? "top" : "bottom";
}
