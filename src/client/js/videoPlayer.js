const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
const heartBtn = document.querySelector(".video__data__section .fa-heart");
const videoSection = document.querySelector(".video__data__section");

const isLoggedIn = videoSection.dataset.islog;

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;
let isPlaying = false;
let initialFav = videoContainer.dataset.isfav;

const handlePlayClick = (e) => {
  if (video.paused) {
    video.play();
    isPlaying = true;
  } else {
    video.pause();
    isPlaying = false;
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMuteClick = (e) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  volumeValue = value;
  video.volume = value;
};

const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substring(14, 19);

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};
const handleTimeUpdate = () => {
  currenTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};
const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
  video.pause();
};
const handleTimelineChangeEnd = () => {
  console.log("done");
  if (isPlaying) {
    video.play();
  }
};
const handleFullscreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
  }
};

const hideControls = () => videoControls.classList.remove("showing");
const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};
const handleMouseLeave = () => {
  controlsTimeout = setTimeout(hideControls, 3000);
};
const handleVideoClick = (e) => {
  handlePlayClick();
};

const handleKeydown = (e) => {
  if (e.key === " " && e.target === document.body) {
    // e.target === document.body ??? ???????????? ???????????? textarea??? ??????????????? ???????????? bubbling??? ?????? ??? ??????.
    e.preventDefault();
    handlePlayClick();
  }
};
const handleEnded = (e) => {
  const { videoid } = videoContainer.dataset;
  fetch(`/api/videos/${videoid}/view`, {
    method: "POST",
  });

  playBtnIcon.classList = "fas fa-play";
};

const handleHeartBtn = async () => {
  const { videoid } = videoContainer.dataset;
  const response = await fetch(`/api/videos/${videoid}/fav`, {
    method: "POST",
  });
  const result = await response.json();
  console.log(result);
  if (initialFav === "false") {
    heartBtn.style.color = "red";
    initialFav = "true";
  } else if (initialFav === "true") {
    heartBtn.style.color = "#adadad";
    initialFav = "false";
  }
};

video.readyState
  ? handleLoadedMetadata()
  : video.addEventListener("loadedmetadata", handleLoadedMetadata);

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("click", handleVideoClick);
video.addEventListener("ended", handleEnded);

videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
timeline.addEventListener("input", handleTimelineChange);
timeline.addEventListener("change", handleTimelineChangeEnd);
fullScreenBtn.addEventListener("click", handleFullscreen);
document.addEventListener("keypress", handleKeydown);

if (isLoggedIn === "true") {
  heartBtn.addEventListener("click", handleHeartBtn);
}
