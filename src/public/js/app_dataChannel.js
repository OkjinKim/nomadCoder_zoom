const socket = io();

const welcome = document.getElementById("welcome");
const call = document.getElementById("call");

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;

call.hidden = true;

welcomeForm = welcome.querySelector("form");

async function initCall() {
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

welcomeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input_roomName = welcome.querySelector("#inp_roomName");
    const input_nickName = welcome.querySelector("#inp_nickName");
    await initCall();
    socket.emit("join_room", {
        room: input_roomName,
        nickName: input_nickName
    } );
    roomName = input_roomName;
    input_roomName.value = "";
    input_nickName.value = "";
});

socket.on("welcome", async () => {
    myDataChannel = myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message", console.log)
    console.log("made data channel");
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
    myPeerConnection.addEventListener("datachannel", (e) => {
        myDataChannel = e.channel;
        myDataChannel.addEventListener("message", console.log);
    });
    console.log("received offer");
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
});

socket.on("answer", (answer) => {
    myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
    myPeerConnection.addICECandidate(ice);
});

// RTC Code
function makeConnection() {
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun.l.google.com:19302",
                    "stun1.l.google.com:19302",
                    "stun2.l.google.com:19302",
                    "stun3.l.google.com:19302",
                    "stun4.l.google.com:19302",
                ]
            }
        ]
    });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addStream", handleAddStream);
    myStream.getTracks().forEach((track) => {
        myPeerConnection.addTrack(track, myStream);
    })
}

function handleIce(data) {
    socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
    const peersStream = document.getElementById('peersStream');
    peersStream.srcObject = data.stream;
}

async function getMedia(deviceId) {
    const initialConstrains = {
        audio: true,
        video: {
            facingMode: { exact: "environment" }
        }
    }

    const cameraConstrains = {
        audio: true,
        deviceId: {
            exact: deviceId
        }
    }
    
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId? cameraConstrains : initialConstrains
        );

        myFace.srcObject = myStream;

        if(!deviceId){
            await getCameras();
        }        
    } catch (e) {
        console.log(e);
    }
}

async function getCameras() {
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(divice => divice.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.innerText = camera.label;
            option.value = camera.deviceId;
            if(currentCamera.label === camera.label){
                option.selected = true;
            }
            cameraSelect.append(option);
        });
    }catch(e){
        console.log(e);
    }
}

async function handleCameraChange() {
    await getMedia(cameraSelect.value);
    if(myPeerConnection){
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection.getSenders().find( (sender) => {
            sender.track.kind === "video"
            videoSender.replaceTrack(videoTrack);
        })
    }
}

muteBtn.addEventListener("click", () => {
    myStream.getAudioTracks().forEach( track => {
        track.enabled = !track.enabled;
    });
    if(!muted){
        muteBtn.innerText = "Unmute"
        muted = true; 
    } else {
        muteBtn.innerText = "Mute"
        muted = false;
    }
});

cameraBtn.addEventListener("click", () => {
    myStream.getVideoTracks().forEach( track => {
        track.enabled = !track.enabled;
    });

    if(cameraOff){
        cameraBtn.innerText = "Turn Camera Off"
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On"
        cameraOff = true;
    }
});

cameraSelect.addEventListener("input", handleCameraChange())
