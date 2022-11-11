const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");

let myStream;
let muted = false;
let cameraOff = false;

async function getMedia() {
    try {
        myStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            media: true,
        });
    } catch (e) {
        console.log(e);
    }
    myFace.srcObject = myStream;
}

getMedia();

muteBtn.addEventListener("click", () => {
    console.log(myStream.getAudioTracks())
    if(!muted){
        muteBtn.innerText = "Unmute"
        muted = true;
    } else {
        muteBtn.innerText = "Mute"
        muted = false;
    }
});

cameraBtn.addEventListener("click", () => {
    if(cameraOff){
        cameraBtn.innerText = "Turn Camera Off"
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On"
        cameraOff = true;
    }
});
