// import regeneratorRuntime from "regenerator-runtime";

const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const handleDownload = () => {
  const a = document.createElement("a");
  a.href = videoFile;
  a.download = "MyRecording.webm"; // a tag의 download attribute가 있으면 다운로드로.
  document.body.appendChild(a);
  a.click();
};

const handleStop = () => {
  startBtn.innerText = "Download Recording";
  startBtn.removeEventListener("click", handleStop);
  startBtn.addEventListener("click", handleDownload);
  recorder.stop();
  const tracks = stream.getTracks();
  tracks.forEach((track) => {
    track.stop();
  });
  stream = null;
};

const handleStart = () => {
  console.log("record started");
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream);
  console.log("recorder1", recorder);
  recorder.ondataavailable = (e) => {
    videoFile = URL.createObjectURL(e.data);
    console.log("recording done!");
    console.log(e.data);
    video.loop = true;
    video.srcObject = null;
    video.src = videoFile;
    video.play();
  };
  recorder.start();
  console.log("recorder2", recorder);
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  video.srcObject = stream;
  video.play();
};
init();
startBtn.addEventListener("click", handleStart);
