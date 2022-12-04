// import regeneratorRuntime from "regenerator-runtime";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const recorderDiv = document.querySelector(".recorder");
const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");
const retryBtn = document.getElementById("retryBtn");
const uploadInput = document.getElementById("uploadFile");
const uploadSubmit = document.getElementById("uploadSubmit");
const uploadThumb = document.getElementById("uploadThumbnail");
const uploadForm = document.getElementById("uploadForm");

// 자동 썸네일 기능이 작동하는 것을 보여주기 위해
// 썸네일 인풋을 살려두었습니다.

let stream;
let recorder;
let videoFile;
let timeoutId;
let countdown;

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
    "00:00:01",
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

  startBtn.innerText = "Done";
  startBtn.removeEventListener("click", handleDownload);
};

const handleStop = () => {
  startBtn.innerText = "Download Recording";
  startBtn.removeEventListener("click", handleStop);
  startBtn.addEventListener("click", handleDownload);
  clearInterval(countdown);
  clearTimeout(timeoutId);
  recorder.stop();
  const tracks = stream.getTracks();
  tracks.forEach((track) => {
    track.stop();
  });
  stream = null;
};

const handleStart = () => {
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => {
    videoFile = URL.createObjectURL(e.data);
    console.log("recording done!");
    console.log(e.data);
    video.loop = true;
    video.srcObject = null;
    video.src = videoFile;
    video.play();
  };
  let count = 5;
  countdown = setInterval(() => {
    if (count === 0) {
      clearInterval(countdown);
    }
    console.log("남은시간 : ", count);
    count = count - 1;
  }, 1000);
  timeoutId = setTimeout(() => {
    console.log("times up");
    handleStop();
  }, 6000);

  recorder.start();
};

const handleRetry = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: {
      width: { min: 1024, ideal: 1280, max: 1920 },
      height: { min: 576, ideal: 720, max: 1080 },
    },
  });
  startBtn.innerText = "Start Recording";
  startBtn.removeEventListener("click", handleDownload);
  startBtn.addEventListener("click", handleStart);
  startBtn.disabled = false;
  video.srcObject = stream;
  video.play();
};

const init = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: { min: 1024, ideal: 1280, max: 1920 },
        height: { min: 576, ideal: 720, max: 1080 },
      },
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

const handleInputChange = async (e) => {
  // 썸네일이 만들어지기 전까지 Submit button disable
  const thumbnailJpg = `thb${Date.now()}.jpg`;

  uploadSubmit.disabled = true;
  uploadSubmit.innerText = "Reading File...";
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
    "00:00:01",
    "-frames:v",
    "1",
    thumbnailJpg
  );
  let files = ffmpeg.FS("readdir", "/");
  console.log(files);
  const thumbFile = ffmpeg.FS("readFile", thumbnailJpg);
  const jpgBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });
  // const thumbUrl = URL.createObjectURL(jpgBlob);
  // downloadFile(thumbUrl, "tasdf.jpg");
  const container = new DataTransfer();
  const fileForAdd = new File([jpgBlob], thumbnailJpg, {
    type: "image/jpeg",
    lastModified: new Date().getTime(),
  });
  container.items.add(fileForAdd);
  uploadThumb.files = container.files;
  uploadSubmit.disabled = false;
  uploadSubmit.innerText = "Upload Video";
};

startBtn.addEventListener("click", handleStart);
retryBtn.addEventListener("click", handleRetry);

uploadInput.addEventListener("change", handleInputChange);

uploadForm.addEventListener("submit", (e) => {
  console.log(e);
  console.log(uploadForm);
  console.log(uploadInput.value);
  console.log(uploadThumb.value);
});
