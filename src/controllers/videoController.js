import { fakeVideos } from "../data/videos";

let videos = [...fakeVideos];

export const trending = (req, res) => {
  res.render("home", { pageTitle: "Home", videos });
};
export const watch = (req, res) => {
  const { id } = req.params;
  const video = videos[id - 1];

  res.render("watch", { pageTitle: `Watching ${video.title}`, video });
};
export const getEdit = (req, res) => {
  const { id } = req.params;
  const video = videos[id - 1];
  res.render("edit", { pageTitle: `Editing ${video.title}`, video });
};
export const postEdit = (req, res) => {
  const { id } = req.params;
  const video = videos[id - 1];
  const { title } = req.body;
  video.title = title;
  res.redirect(`/videos/${id}`);
};
export const getUpload = (req, res) => {
  res.render("upload", { pageTitle: "Upload" });
};
export const postUpload = (req, res) => {
  const { title } = req.body;
  const newVideo = {
    title,
    createdAt: "2 minutes ago",
    rating: 0,
    comments: 0,
    views: 0,
    id: videos.length + 1,
  };
  videos.push(newVideo);
  res.redirect("/");
};
