import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    apiVersion: "2022-11-30",
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});
const s3ImageUploader = multerS3({
  s3: s3,
  bucket: "pigstay",
  key: function (request, file, ab_callback) {
    const newFileName = Date.now() + file.originalname.slice(-4);
    const fullPath = "images/" + newFileName;
    ab_callback(null, fullPath);
  },
});

const s3VideoUploader = multerS3({
  s3: s3,
  bucket: "pigstay",
  key: function (request, file, ab_callback) {
    const newFileName = Date.now() + file.originalname.slice(-4);
    const fullPath = "videos/" + newFileName;
    ab_callback(null, fullPath);
  },
});
export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Tutube";
  res.locals.loggedInUser = req.session.user || {};
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/");
  }
};
export const avatarUpload = multer({
  dest: "uploads/avatars",
  limits: {
    fileSize: 3072000,
  },
  storage: s3ImageUploader,
});
export const videoUpload = multer({
  dest: "uploads/videos",
  limits: {
    fileSize: 102400000,
  },
  storage: s3VideoUploader,
});
