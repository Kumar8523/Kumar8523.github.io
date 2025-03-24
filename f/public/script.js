const socket = io();
const roomIdInput = document.getElementById("roomId");
const joinRoomBtn = document.getElementById("joinRoom");
const talkBtn = document.getElementById("talkBtn");
const statusText = document.getElementById("status");
const participantsList = document.getElementById("participants");

let localStream;
let peers = {};

// Join room
joinRoomBtn.addEventListener("click", async () => {
    const roomId = roomIdInput.value.trim();
    if (!roomId) return alert("Enter a Room ID");

    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    socket.emit("join-room", roomId, socket.id);

    talkBtn.style.display = "block";
    statusText.textContent = "Connected to Room " + roomId;
});

// Handle new users
socket.on("user-connected", (userId) => {
    console.log("New user connected:", userId);
    addUser(userId);
});

// Remove disconnected users
socket.on("user-disconnected", (userId) => {
    console.log("User disconnected:", userId);
    removeUser(userId);
});

// Add a new user to the participant list
function addUser(userId) {
    const li = document.createElement("li");
    li.id = userId;
    li.textContent = "User " + userId;
    participantsList.appendChild(li);
}

// Remove user from participant list
function removeUser(userId) {
    const userElement = document.getElementById(userId);
    if (userElement) userElement.remove();
}

// Push-to-Talk functionality
talkBtn.addEventListener("mousedown", () => {
    console.log("Talking...");
    talkBtn.textContent = "Talking...";
});

talkBtn.addEventListener("mouseup", () => {
    console.log("Stopped talking");
    talkBtn.textContent = "Hold to Talk";
});
