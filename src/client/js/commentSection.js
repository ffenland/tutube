const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const addComment = (string, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.className = "video__comment";
  newComment.dataset.id = id;
  const newComment__icon = document.createElement("i");
  newComment__icon.className = "fas fa-comment";
  const newComment__span = document.createElement("span");
  newComment__span.innerText = ` ${string}`;
  const newComment__span2 = document.createElement("span");
  newComment__span2.innerText = "❌";
  newComment.appendChild(newComment__icon);
  newComment.appendChild(newComment__span);
  newComment.appendChild(newComment__span2);
  videoComments.prepend(newComment);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const textarea = form.querySelector("textarea");
  const videoId = videoContainer.dataset.videoid;
  const comment = textarea.value;
  if (comment.trim() === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comment }),
  });
  textarea.value = "";

  // backend의 응답을 확인하고 움직이자.
  // window.location.reload()

  if (response.status === 201) {
    //createFakeComment
    const { newCommentId } = await response.json();
    addComment(comment, newCommentId);
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}
