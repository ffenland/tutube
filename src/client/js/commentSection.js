const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtns = document.querySelectorAll(".deleteBtn");
const ul = document.querySelector(".video__comment__list");

const addComment = (string, id, email) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.className = "video__comment";
  newComment.dataset.id = id;
  const newComment_textDiv = document.createElement("div");
  newComment_textDiv.className = "video__comment__text";
  const newComment__icon = document.createElement("i");
  newComment__icon.className = "fas fa-comment";
  const newComment__writer = document.createElement("span");
  newComment__writer.className = "video__comment__text__writer";
  newComment__writer.innerText = email;
  const newComment__span = document.createElement("span");
  newComment__span.innerText = ` ${string}`;
  newComment_textDiv.appendChild(newComment__icon);
  newComment_textDiv.appendChild(newComment__writer);
  newComment_textDiv.appendChild(newComment__span);
  const newComment__deleteDiv = document.createElement("div");
  newComment__deleteDiv.className = "video__comment__delete";
  newComment__deleteDiv.addEventListener("click", handleDelete);
  const newComment__button = document.createElement("button");
  newComment__button.innerText = "X";
  newComment__button.className = "deleteBtn";
  newComment__deleteDiv.appendChild(newComment__button);
  newComment.appendChild(newComment_textDiv);
  newComment.appendChild(newComment__deleteDiv);
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
    const { newCommentId, writerEmail } = await response.json();
    addComment(comment, newCommentId, writerEmail);
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}
const handleDelete = async (e) => {
  const li = e.target.parentNode.parentNode;
  const commentId = li.dataset.id;
  const videoId = videoContainer.dataset.videoid;
  const response = await fetch(
    `/api/videos/${videoId}/commentdelete/${commentId}`,
    {
      method: "POST",
    }
  );
  if (response.status === 201) {
    li.remove();
  }
};
if (deleteBtns.length > 0) {
  deleteBtns.forEach((deleteBtn) =>
    deleteBtn.addEventListener("click", handleDelete)
  );
}
