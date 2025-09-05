// streamcharity-listen.js

// 1. Charger Socket.IO
const script = document.createElement("script");
script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.3/socket.io.js";
document.head.appendChild(script);

script.onload = function () {
    function initStreamlabsSocket() {
        const socketToken = window.streamerInfo.socketToken;
        const streamlabs = io(
            `https://sockets.streamlabs.com?token=${socketToken}`,
            { transports: ["websocket"] }
        );
        window.streamlabs = streamlabs;

        streamlabs.on("connect", () => {
            console.log("Connecté au websocket Streamlabs !");
        });
        streamlabs.on("disconnect", () => {
            console.log("Déconnecté du websocket Streamlabs !");
        });

        if (streamlabs.connected) {
            console.log("La connexion websocket est active.");
        } else {
            console.log("La connexion websocket n'est pas active.");
        }

        streamlabs.on("event", (eventData) => {
            // print eventData as string
            if (eventData.type === "streamlabscharitydonation") {
                // Filtrer les dons de test
                const donsReels = eventData.message.filter(
                    (don) => !don.isTest
                );
                if (donsReels.length > 0) {
                    console.log("Donation:", donsReels);
                    // Ajout : transforme le format pour le système de dons
                    const dons = donsReels.map((don) => ({
                        name: don.from,
                        amount: parseFloat(don.amount),
                    }));
                    document.dispatchEvent(
                        new CustomEvent("donationEvent", {
                            detail: { message: dons },
                        })
                    );
                }
            }
            /*if (eventData.type === "donation") {
                console.log("Donation:", eventData.message);
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
            }*/
        });
    }

    if (window.streamerInfo) {
        initStreamlabsSocket();
    } else {
        document.addEventListener("streamerInfoReady", initStreamlabsSocket);
    }
};

script.onerror = function () {
    console.error("Échec du chargement de Socket.IO !");
};

// simulate receive 10 every 0.1 seconds, by a random name
/*setInterval(() => {
    const randomName = "User" + Math.floor(Math.random() * 1000);
    const event = new CustomEvent("donationEvent", {
        detail: {
            message: [{ amount: "10", name: randomName }],
        },
    });
    document.dispatchEvent(event);
}, 100);*/
