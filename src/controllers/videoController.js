import Video, { formatHashtags } from "../models/Video.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";

export const home = async (req, res) => {
  const { category } = req.query;
  try {
    let videos;
    if (category) {
      videos = await Video.find({
        category,
      })
        .sort({ createdAt: "desc" })
        .populate({ path: "owner" });
    } else {
      videos = await Video.find({})
        .sort({ createdAt: "desc" })
        .populate({ path: "owner" });
    }

    return res.render("home", { pageTitle: "Home", videos });
  } catch (error) {
    console.log(error);
    return res.status(500).send("server-error");
  }
};
export const watch = async (req, res) => {
  const { user } = req.session;
  const { id } = req.params;
  const video = await Video.findById(id)
    .populate("owner")
    .populate({ path: "comments", populate: { path: "owner" } });
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  // isFav 추가
  const isFav = String(
    video.meta.favs.some((fav) => String(fav._id) === user._id)
  );
  return res.render("watch", {
    pageTitle: video.title,
    video,
    isFav,
  });
};
export const getEdit = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id },
    },
  } = req;

  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Not authorized");
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Editing ${video.title}`, video });
};
export const postEdit = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id },
    },
    body: { title, description, hashtags, category },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: formatHashtags(hashtags),
    category,
  });
  return res.redirect(`/videos/${id}`);
};
export const getUpload = (req, res) => {
  res.render("upload", { pageTitle: "Upload" });
};
export const postUpload = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { title, description, hashtags, category },
    files: { video, thumb },
  } = req;

  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: video[0].location,
      thumbnailUrl: thumb[0].location,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
      category,
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};
export const deleteVideo = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id },
    },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  if (keyword) {
    //search
    const videos = await Video.find({
      title: {
        $regex: new RegExp(`${keyword}`, "i"),
      },
    }).populate("owner");
    return res.render("search", { pageTitle: "Search", videos });
  }
  return res.render("search", { pageTitle: "Search", videos: [] });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  if (req.session.user) {
    const { _id } = req.session.user;
    const user = await User.findById(_id);
    user.history.push(video._id);
    await user.save();
  }
  await video.save();
  return res.sendStatus(200);
};

export const writeComment = async (req, res) => {
  const {
    body: { comment },
    params: { id },
    session: {
      user: { _id, email },
    },
  } = req;

  const video = await Video.findById(id);
  if (!video) {
    res.sendStatus(404);
  }
  const dbComment = await Comment.create({
    text: comment,
    owner: _id,
    video: id,
  });
  video.comments.push(dbComment._id);
  video.save();
  res.status(201).json({ newCommentId: dbComment._id, writerEmail: email });
};

export const deleteComment = async (req, res) => {
  const { id, commentId } = req.params;
  const userId = req.session.user._id;
  const comment = await Comment.findById(commentId)
    .populate("owner")
    .populate("video");
  if (comment.owner._id.toString() !== userId) {
    return res.status(404).json({ ok: false, message: "Authorization error" });
  }
  await Comment.findByIdAndDelete(commentId);

  res.status(201).json({ ok: true, message: "Delete Success" });
};

export const addFavorite = async (req, res) => {
  try {
    const {
      params: { id },
    } = req;
    const userId = req.session.user._id;
    const user = await User.findById(userId).populate("favs");

    const video = await Video.findById(id).populate({
      path: "meta",
      populate: { path: "favs" },
    });

    if (user.favs.some((fav) => fav.equals(video._id))) {
      // 기존 유저 favs에 video._id가 있다면 삭제해주긔
      user.favs = user.favs.filter((fav) => !fav.equals(video._id));
      user.save();
      // video도 마찬가지
      video.meta.favs = video.meta.favs.filter((fav) => !fav.equals(user._id));
      video.save();
      return res.status(201).json({ ok: true, result: "removed" });
    } else {
      // 기존 favs에 없다면 추가해주기.
      user.favs.push(video._id);
      user.save();
      //혹시모르니 Video는 한번 삭제하고 추가하긔
      video.meta.favs = video.meta.favs.filter((fav) => !fav.equals(user._id));
      video.meta.favs.push(user._id);
      video.save();
      return res.status(201).json({ ok: true, result: "added" });
    }
  } catch (error) {
    console.log("favError", error);
    return res.status(404).josn({ ok: false, result: "error" });
  }
};
