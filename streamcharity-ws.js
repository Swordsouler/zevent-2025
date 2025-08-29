// streamcharity-listen.js

// 1. Charger Socket.IO
const script = document.createElement("script");
script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.3/socket.io.js";
document.head.appendChild(script);

script.onload = async function () {
    // 2. Récupérer le socket token
    /*const ACCESS_TOKEN =
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbiI6IkE3ODRCNjY2QUMzODVGNzcyMkFCIiwicmVhZF9vbmx5Ijp0cnVlLCJwcmV2ZW50X21hc3RlciI6dHJ1ZSwidHdpdGNoX2lkIjoiMTA3OTY4ODUzIn0.zQnUrmfeAm21VuhW3xXWoCLGijAaKtWbb5J9LtlOvsY"; // Remplace par ton token
    const response = await fetch(
        "https://streamlabs.com/api/v2.0/socket/token",
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                accept: "application/json",
            },
        }
    );
    const data = await response.json();*/
    const socketToken =
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbiI6IkE3ODRCNjY2QUMzODVGNzcyMkFCIiwicmVhZF9vbmx5Ijp0cnVlLCJwcmV2ZW50X21hc3RlciI6dHJ1ZSwidHdpdGNoX2lkIjoiMTA3OTY4ODUzIn0.zQnUrmfeAm21VuhW3xXWoCLGijAaKtWbb5J9LtlOvsY";

    // 3. Connexion au WebSocket Streamlabs
    const streamlabs = io(
        `https://sockets.streamlabs.com?token=${socketToken}`,
        { transports: ["websocket"] }
    );

    // 4. Écoute des événements
    streamlabs.on("event", (eventData) => {
        if (!eventData.for && eventData.type === "donation") {
            // Gérer les donations
            console.log("Donation:", eventData.message);
        }
        /*if (eventData.for === "twitch_account") {
            switch (eventData.type) {
                case "follow":
                    console.log("Follow:", eventData.message);
                    break;
                case "subscription":
                    console.log("Subscription:", eventData.message);
                    break;
                default:
                    console.log("Autre événement Twitch:", eventData.message);
            }
        }*/
    });
};
