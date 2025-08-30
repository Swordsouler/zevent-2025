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
document.addEventListener("streamerInfoReady", function () {
    // Utilise window.streamerInfo.username
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
});

function createDonationGoalsList(goals) {
    const listElement = document.getElementById("donation-goals-list");
    listElement.innerHTML = "";
    goals.forEach((goal, idx) => {
        if (!goal.valeur || !goal.text) return;
        const li = document.createElement("li");
        li.setAttribute("data-goal-index", idx);
        li.innerHTML = `<span class='donation-euro'>${goal.valeur}€</span> <span class='donation-text'>${goal.text}</span>`;
        listElement.appendChild(li);
    });
    window.setDonationGoals(goals);
    window.donationGoals = goals; // <-- Ajout pour rendre la liste globale
}

function updateDonationGoalsOpacity(goals) {
    const listElement = document.getElementById("donation-goals-list");
    Array.from(listElement.children).forEach((li, idx) => {
        const goal = goals[idx];
        if (!goal) return;
        const opacity = currentDonationValue >= goal.valeur ? 1 : 0.5;
        li.style.opacity = opacity;
    });
}
