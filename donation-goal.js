// Suivi du dernier goal atteint pour les logs de changement d'objectif
let lastGoalIdx = null;
// Charger PapaParse dynamiquement
const papaScript = document.createElement("script");
papaScript.src =
    "https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js";
document.head.appendChild(papaScript);

// Charger les donation goals depuis le CSV avec fetch
function loadDonationGoalsFromCSV(csvPath) {
    fetch(csvPath)
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
                        .filter((goal) => goal.valeur && goal.text);
                    createDonationGoalsList(goals);
                    updateDonationGoalsOpacity(goals);
                },
            });
        });
}

document.addEventListener("DOMContentLoaded", function () {
    let donationGoals = [];
    papaScript.onload = function () {
        loadDonationGoalsFromCSV("donation-goals.csv");
    };
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

function createDonationGoalsList(goals, animateIdx = null) {
    const listElement = document.getElementById("donation-goals-list");
    listElement.innerHTML = "";

    if (!isZoomMode()) {
        // Mode normal : affiche tous les goals
        console.log(
            "[DONATION GOALS] Affichage de la liste complète des goals"
        );
        goals.forEach((goal, idx) => {
            if (!goal.valeur || !goal.text) return;
            const li = document.createElement("li");
            li.setAttribute("data-goal-index", idx);
            li.innerHTML = `<span class='donation-euro'>${goal.valeur}€</span> <span class='donation-text'>${goal.text}</span>`;
            listElement.appendChild(li);
        });
    } else {
        console.log("[DONATION GOALS] Affichage en mode zoom");
        // Mode zoom : affiche les goals atteints + le prochain à atteindre
        let nextGoalIdx = goals.findIndex(
            (g) => currentDonationValue < g.valeur
        );
        if (nextGoalIdx === -1) nextGoalIdx = goals.length; // tous atteints

        // On prépare la variable pour la hauteur du prochain goal
        let nextGoalHeight = 0;

        // On crée d'abord le prochain goal (pour mesurer sa hauteur)
        let nextGoalLi = null;
        if (nextGoalIdx < goals.length) {
            const goal = goals[nextGoalIdx];
            nextGoalLi = document.createElement("li");
            nextGoalLi.setAttribute("data-goal-index", nextGoalIdx);
            nextGoalLi.classList.add("goal-next");
            nextGoalLi.style.opacity = "0.5";
            nextGoalLi.innerHTML = `<span class='donation-euro'>${goal.valeur}€</span> <span class='donation-text'>${goal.text}</span>`;
            listElement.appendChild(nextGoalLi);
            nextGoalHeight = nextGoalLi.offsetHeight;
            listElement.removeChild(nextGoalLi); // On retire pour l'instant
        }

        // Affiche les goals atteints au-dessus
        for (let i = 0; i < nextGoalIdx; i++) {
            const goal = goals[i];
            const li = document.createElement("li");
            li.setAttribute("data-goal-index", i);
            li.classList.add("goal-attained");
            li.innerHTML = `<span class='donation-euro'>${goal.valeur}€</span> <span class='donation-text'>${goal.text}</span>`;
            // Anime uniquement les goals atteints si animateIdx est défini
            if (animateIdx !== null) {
                li.classList.add("goal-attained-animate");
                li.style.setProperty("--goal-move", `${nextGoalHeight}px`);
            }
            listElement.appendChild(li);
        }
        // Affiche le prochain goal à atteindre en bas
        if (nextGoalIdx < goals.length) {
            // On réutilise l'élément créé plus haut
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
    window.setDonationGoals(goals);
    window.donationGoals = goals;
}

function updateDonationGoalsOpacity(goals) {
    const listElement = document.getElementById("donation-goals-list");
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
