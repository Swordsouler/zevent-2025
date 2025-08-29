// Charger PapaParse dynamiquement
const papaScript = document.createElement("script");
papaScript.src =
    "https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js";
document.head.appendChild(papaScript);

// Charger SheetJS dynamiquement pour Excel
const sheetScript = document.createElement("script");
sheetScript.src =
    "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
document.head.appendChild(sheetScript);

// Liste des donation goals intégrée directement dans le code
const donationGoals = [
    { valeur: 1000, text: "Objectif 1 : Débloquer un défi spécial" },
    { valeur: 5000, text: "Objectif 2 : Live cuisine" },
    { valeur: 10000, text: "Objectif 3 : Cosplay en direct" },
    { valeur: 20000, text: "Objectif 4 : Invité surprise" },
];

document.addEventListener("DOMContentLoaded", function () {
    displayDonationGoals(donationGoals);
});

function displayDonationGoals(goals) {
    const listElement = document.getElementById("donation-goals-list");
    listElement.innerHTML = "";
    goals.forEach((goal) => {
        if (!goal.valeur || !goal.text) return;
        const li = document.createElement("li");
        li.innerHTML = `<span class='donation-euro'>${goal.valeur}€</span> <span class='donation-text'>${goal.text}</span>`;
        listElement.appendChild(li);
    });
}
