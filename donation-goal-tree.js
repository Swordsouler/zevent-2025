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
        if (!goalsList || !window.donationGoals) return 0;
        // Compte le nombre de goals atteints
        const value = window.currentDonationValue || 0;
        const attainedCount = window.donationGoals.filter(
            (g) => value >= g.valeur
        ).length;
        // Additionne la hauteur des li atteints
        let height = 0;
        Array.from(goalsList.children).forEach((li, idx) => {
            if (idx < attainedCount) {
                height += li.offsetHeight;
            }
        });
        return height;
    }

    function updateFill() {
        // Hauteur totale de la liste
        const listHeight = goalsList.offsetHeight;
        if (listHeight === 0) return;
        // Hauteur des goals atteints
        const fillHeight = getFillHeightPx();
        // Calcule le pourcentage de remplissage vertical
        const percent = Math.min(
            100,
            Math.round((fillHeight / listHeight) * 100)
        );
        // Remplit de bas en haut
        fillImg.style.clipPath = `inset(${100 - percent}% 0 0 0)`;
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
