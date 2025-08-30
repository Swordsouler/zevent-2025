// streamcharity-listen.js

// 1. Charger Socket.IO
const script = document.createElement("script");
script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.3/socket.io.js";
document.head.appendChild(script);

script.onload = function () {
    document.addEventListener("streamerInfoReady", function () {
        const socketToken = window.streamerInfo.socketToken;
        const streamlabs = io(
            `https://sockets.streamlabs.com?token=${socketToken}`,
            { transports: ["websocket"] }
        );

        // 4. Écoute des événements
        streamlabs.on("event", (eventData) => {
            if (/*!eventData.for && */ eventData.type === "donation") {
                // Gérer les donations
                console.log("Donation:", eventData.message);
                // Additionner le montant de la donation au total
                if (Array.isArray(eventData.message)) {
                    eventData.message.forEach((don) => {
                        const montant = parseFloat(don.amount);
                        if (!isNaN(montant)) {
                            // Conversion en euros si nécessaire, sinon garder la devise
                            currentDonationValue += montant;
                            // Mettre à jour l'affichage
                            const valueSpan =
                                document.getElementById("donation-value");
                            if (valueSpan) {
                                valueSpan.textContent =
                                    currentDonationValue + "€";
                            }
                            // Mettre à jour l'opacité des goals
                            if (window.setDonationGoals) {
                                updateDonationGoalsOpacity(
                                    window.donationGoals || []
                                );
                            }
                        }
                    });
                }
            }
            if (eventData.for === "twitch_account") {
                switch (eventData.type) {
                    case "follow":
                        console.log("Follow:", eventData.message);
                        break;
                    case "subscription":
                        console.log("Subscription:", eventData.message);
                        break;
                    default:
                        console.log(
                            "Autre événement Twitch:",
                            eventData.message
                        );
                }
            }
        });
    });
};
