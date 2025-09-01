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

    function getVariant() {
        const params = new URLSearchParams(window.location.search);
        return params.get("variant") === "1" ? 1 : 0;
    }

    function getPercentDonationBar(value, goals) {
        if (getVariant() === 1 && goals && goals.length > 0) {
            // Calcul identique à donation-goal-tree.js
            let attainedCount = goals.findIndex((g) => value < g.valeur);
            if (attainedCount === -1) attainedCount = goals.length;

            let percent = 100;
            if (attainedCount < goals.length && attainedCount > 0) {
                const prevValue = goals[attainedCount - 1].valeur;
                const nextValue = goals[attainedCount].valeur;
                percent = ((value - prevValue) / (nextValue - prevValue)) * 100;
                percent = Math.max(0, Math.min(100, percent));
            } else if (attainedCount === 0) {
                // Avant le premier palier
                const nextValue = goals[0].valeur;
                percent = (value / nextValue) * 100;
                percent = Math.max(0, Math.min(100, percent));
            }
            return percent;
        } else {
            // Ancien calcul
            const nextGoalValue = getNextGoalValue(value);
            return Math.min(100, Math.max(0, (value / nextGoalValue) * 100));
        }
    }

    function updateDonationBar() {
        if (!window.donationGoals) {
            console.log("[updateFill] Pas de goalsList ou donationGoals");
            return;
        }
        const value = window.currentDonationValue || 0;
        const goals = window.donationGoals;
        const percent = getPercentDonationBar(value, goals);

        document.getElementById("donation-bar-fill").style.width =
            percent * 2 + "%";
        document.getElementById("donation-bar-current").textContent =
            Math.floor(value).toLocaleString("fr-FR") + " €";
        const nextGoalValue = getNextGoalValue(value);
        document.getElementById("donation-bar-goal").textContent =
            nextGoalValue.toLocaleString("fr-FR") + " €";

        // Positionne le séparateur
        const separator = document.getElementById("donation-bar-separator");
        const barBg = document.querySelector(".donation-bar-bg");
        if (separator && barBg) {
            const barWidth = barBg.offsetWidth;
            const x = (percent / 100) * barWidth - separator.offsetWidth / 2;
            separator.style.left = `${x}px`;
        }
    }

    setTimeout(updateDonationBar, 500);

    document.addEventListener("streamerInfoReady", updateDonationBar);
    document.addEventListener("donationEvent", updateDonationBar);
});
