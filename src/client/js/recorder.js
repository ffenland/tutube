// import regeneratorRuntime from "regenerator-runtime";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const recorderDiv = document.querySelector(".recorder");
const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");
const retryBtn = document.getElementById("retryBtn");
const uploadInput = document.getElementById("uploadFile");
const uploadSubmit = document.getElementById("uploadSubmit");
const uploadForm = document.getElementById("uploadForm");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName; // a tag의 download attribute가 있으면 다운로드로.
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  startBtn.removeEventListener("click", handleDownload);
  startBtn.innerText = "Transcoding...";
  startBtn.disabled = true;
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();
  // blob url에 fetch한다?
  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));
  // -i = input
  await ffmpeg.run("-i", files.input, "-r", "60", files.output);

  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:50",
    "-frames:v",
    "1",
    files.thumb
  );

  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumb);
  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const jpgBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });
  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(jpgBlob);

  downloadFile(mp4Url, "MyRecording.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  startBtn.disabled = false;
  startBtn.innerText = "Record Again";
  startBtn.addEventListener("click", handleStart);
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

const handleRetry = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  startBtn.innerText = "Start Recording";
  startBtn.removeEventListener("click", handleDownload);
  startBtn.addEventListener("click", handleStart);
  video.src = null;
};

const init = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    video.srcObject = stream;
    video.play();
  } catch (error) {
    const span = document.createElement("span");
    span.innerText = "You don't have any recording devices";
    span.className = "nodivice";
    recorderDiv.replaceChildren(span);
  }
};
init();

let thumbnailFile;
const handleInputChange = async (e) => {
  //썸네일이 만들어지기 전까지 Submit button disable
  uploadSubmit.disabled = true;
  const file = uploadInput.files[0];
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();
  // blob url에 fetch한다?
  ffmpeg.FS("writeFile", file.name, await fetchFile(file));
  // -i = input

  await ffmpeg.run(
    "-i",
    file.name,
    "-ss",
    "00:00:50",
    "-frames:v",
    "1",
    "thumbnail.jpg"
  );
  let files = ffmpeg.FS("readdir", "/");
  console.log(files);
  const thumbFile = ffmpeg.FS("readFile", "thumbnail.jpg");
  // const jpgBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });
  // const thumbUrl = URL.createObjectURL(jpgBlob);
  // console.log(thumbUrl);
  uploadSubmit.disabled = false;
};

const handleSubmit = (e) => {
  e.preventDefault();
  console.log(e);
};

startBtn.addEventListener("click", handleStart);
retryBtn.addEventListener("click", handleRetry);

uploadInput.addEventListener("change", handleInputChange);
uploadForm.addEventListener("submit", handleSubmit);
