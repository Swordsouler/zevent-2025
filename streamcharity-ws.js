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

        // Ajoute cette ligne pour exposer le socket globalement
        window.streamlabs = streamlabs;

        // 4. Écoute des événements
        streamlabs.on("event", (eventData) => {
            if (/*!eventData.for && */ eventData.type === "donation") {
                // Gérer les donations
                console.log("Donation:", eventData.message);
                // Dispatch l'événement vers donation-goal.js
                document.dispatchEvent(
                    new CustomEvent("donationEvent", { detail: eventData })
                );
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
