document.addEventListener("DOMContentLoaded", function () {
    const fillImg = document.getElementById("treeFillImg");
    const treeImages = document.querySelector(".tree-images");
    const goalsList = document.getElementById("donation-goals-list");

    function isReverse() {
        const params = new URLSearchParams(window.location.search);
        return params.get("reverse") === "true";
    }

    function updateRotation() {
        if (isReverse()) {
            treeImages.style.transform = "rotate(-90deg)";
        } else {
            treeImages.style.transform = "rotate(90deg)";
        }
        treeImages.style.transition = "";
    }

    function getFillHeightPx() {
        if (!goalsList || !window.donationGoals) {
            console.log("[getFillHeightPx] Pas de goalsList ou donationGoals");
            return 0;
        }
        const value = window.currentDonationValue || 0;
        const goals = window.donationGoals;
        let attainedCount = goals.findIndex((g) => value < g.valeur);
        if (attainedCount === -1) attainedCount = goals.length;
        console.log(
            `[getFillHeightPx] value: ${value}, attainedCount: ${attainedCount}, goals:`,
            goals
        );

        // Hauteur cumulée des goals atteints
        let height = 0;
        Array.from(goalsList.children).forEach((li, idx) => {
            if (idx < attainedCount) {
                height += li.offsetHeight;
                console.log(
                    `[getFillHeightPx] Ajout li[${idx}] hauteur: ${li.offsetHeight}, total: ${height}`
                );
            }
        });

        // Progression vers le prochain goal
        if (attainedCount < goals.length && attainedCount >= 0) {
            const prevValue =
                attainedCount === 0 ? 0 : goals[attainedCount - 1].valeur;
            const nextValue = goals[attainedCount].valeur;
            const percentToNext = (value - prevValue) / (nextValue - prevValue);
            const nextLi = goalsList.children[attainedCount];
            console.log(
                `[getFillHeightPx] Progression vers goal[${attainedCount}]: prevValue=${prevValue}, nextValue=${nextValue}, percentToNext=${percentToNext}`
            );
            if (nextLi && percentToNext > 0) {
                const ajout =
                    nextLi.offsetHeight *
                    Math.min(1, Math.max(0, percentToNext));
                height += ajout;
                console.log(
                    `[getFillHeightPx] Ajout partiel li[${attainedCount}] hauteur: ${ajout}, total: ${height}`
                );
            }
        }
        // Ajout du padding de 100px
        height += 100;
        console.log(
            `[getFillHeightPx] Hauteur finale (avec padding): ${height}`
        );
        return height;
    }

    function updateFill() {
        if (!goalsList || !window.donationGoals) {
            console.log("[updateFill] Pas de goalsList ou donationGoals");
            return;
        }
        const value = window.currentDonationValue || 0;
        const goals = window.donationGoals;
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

        console.log(
            `[updateFill] value: ${value}, attainedCount: ${attainedCount}, percent: ${percent}`
        );
        fillImg.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    }

    // Met à jour à chaque changement de donation
    function listenDonationValue() {
        let lastValue = window.currentDonationValue;
        setInterval(() => {
            if (window.currentDonationValue !== lastValue) {
                lastValue = window.currentDonationValue;
                updateFill();
            }
        }, 200);
    }

    updateRotation();
    setTimeout(updateFill, 500); // Attend le rendu de la liste
    listenDonationValue();

    document.addEventListener("streamerInfoReady", () =>
        setTimeout(updateFill, 500)
    );
    document.addEventListener("donationEvent", () =>
        setTimeout(updateFill, 500)
    );
});
