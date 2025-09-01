document.addEventListener("DOMContentLoaded", function () {
    // Valeur max de la barre (modifiable)
    const BAR_MAX = 100000;

    function getNextGoalValue(currentValue) {
        //console.log("Current Donation Value:", window.donationGoals);
        if (!window.donationGoals || !Array.isArray(window.donationGoals)) {
            return BAR_MAX;
        }
        const goals = window.donationGoals;
        let attainedCount = goals.findIndex((g) => currentValue < g.valeur);
        if (attainedCount === -1) attainedCount = goals.length;
        if (attainedCount < goals.length) {
            return goals[attainedCount].valeur;
        } else {
            // Tous les paliers sont atteints, retourne le dernier palier
            return goals[goals.length - 1].valeur;
        }
    }

    function updateDonationBar(value) {
        const nextGoalValue = getNextGoalValue(value);
        const percent = Math.min(
            100,
            Math.max(0, (value / nextGoalValue) * 100)
        );
        document.getElementById("donation-bar-fill").style.width =
            percent + "%";
        document.getElementById("donation-bar-current").textContent =
            Math.floor(value).toLocaleString("fr-FR") + " €";
        document.getElementById("donation-bar-goal").textContent =
            nextGoalValue.toLocaleString("fr-FR") + " €";
    }

    // Synchronise avec la variable globale
    function listenDonationValue() {
        let lastValue = window.currentDonationValue || 0;
        setInterval(() => {
            if (window.currentDonationValue !== lastValue) {
                lastValue = window.currentDonationValue;
                updateDonationBar(lastValue);
            }
        }, 200);
    }

    // Initialise la barre au chargement

    // Met à jour la barre à chaque événement de don
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
                    updateDonationBar(window.currentDonationValue);
                }
            });
        }
    });
    updateDonationBar(window.currentDonationValue || 0);
    listenDonationValue();
});
