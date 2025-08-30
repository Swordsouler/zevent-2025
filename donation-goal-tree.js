document.addEventListener("DOMContentLoaded", function () {
    const slider = document.getElementById("treeFillSlider");
    const fillImg = document.getElementById("treeFillImg");
    const fillValue = document.getElementById("treeFillValue");
    const treeImages = document.querySelector(".tree-images");

    function isReverse() {
        const params = new URLSearchParams(window.location.search);
        return params.get("reverse") === "true";
    }

    function updateRotation() {
        if (isReverse()) {
            treeImages.style.transform = "rotate(90deg)";
        } else {
            treeImages.style.transform = "rotate(-90deg)";
        }
        // Suppression de l'animation de rotation
        treeImages.style.transition = "";
    }

    function updateFill() {
        const percent = slider.value;
        const clip = `inset(0 ${100 - percent}% 0 0)`;
        fillImg.style.clipPath = clip;
        fillValue.textContent = percent + "%";
    }

    slider.addEventListener("input", updateFill);
    updateRotation();
    updateFill();
});
