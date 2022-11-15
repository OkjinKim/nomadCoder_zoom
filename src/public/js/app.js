const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;

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
getMedia();

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
