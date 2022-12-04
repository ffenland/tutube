import User from "../models/User.js";
import Video from "../models/Video.js";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

export const logout = (req, res) => {
  req.session.destroy();

  return res.redirect("/");
};
export const getEdit = (req, res) => {
  res.render("edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email },
    file,
  } = req;

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.location : avatarUrl,
      name,
      email,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  res.redirect("/users/edit");
};
export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly) {
    return res.redirect("/users/edit");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id, password },
    },
    body: { old, new1, new2 },
  } = req;
  const ok = bcrypt.compareSync(old, password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect.",
    });
  }
  if (new1 !== new2) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "New Password does not match.",
    });
  }
  const user = await User.findById(_id);
  user.password = new1;
  // 위 상태로 멈추면 저장도 안되고 비번이 hash가 안됨.
  await user.save();
  req.flash("info", "Password updated!");
  // 다되면 강제로 로그아웃 시키기.. 세션도 파괴한다.
  req.session.destroy();
  return res.redirect("/login");
};
export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if (!user) {
    req.flash("error", "No users");
    return res.status(404).render("404", { pageTitle: "User not found!" });
  }

  res.render("users/profile", { pageTitle: `${user.name}`, user });
};
export const getSignup = (req, res) => {
  res.render("signup", { pageTitle: "Sign Up" });
};
export const postSignup = async (req, res) => {
  // email, password 로그인은 socialType = credential
  const pageTitle = "SignUP";
  const {
    body: { email, password, password2, name },
  } = req;
  if (password !== password2) {
    console.log("re-password doesn't match");
    return res.status(400).render("signup", {
      pageTitle,
      errorMessage: "Password confirmation does not match",
    });
  }
  const emailExists = await User.findOne({
    email,
  });
  if (emailExists) {
    console.log("Email exists");
    return res.status(400).render("signup", {
      pageTitle,
      errorMessage:
        emailExists.socialType === "credential"
          ? `This email is already taken`
          : `This email is for ${emailExists.socialType} Login`,
    });
  }
  try {
    await User.create({
      name,
      email,
      password,
      socialType: "credential",
    });
    return res.redirect("/login");
  } catch (error) {
    console.log("mongoDB error");
    console.log(error);
    return res.status(400).render("signup", {
      pageTitle: "Sign Up",
      errorMessage: error._message,
    });
  }
};
export const getLogin = (req, res) => {
  res.render("login", { pageTitle: "Login" });
};
export const postLogin = async (req, res) => {
  // check if exists
  // check password appropriate
  const {
    body: { email, password },
  } = req;
  const pageTitle = "Login";
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      // 보안을 위해 에러메세지는 모호하게.
      errorMessage: "Username or Password is wrong!",
    });
  }
  if (user.socialType !== "credential") {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: `Your account is ${user.socialType}`,
    });
  }
  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Username or Password is wrong!",
    });
  }
  // password 일치하면 세션에 정보를 넣자
  req.session.loggedIn = true;
  req.session.user = user;

  res.redirect("/");
};
export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CL_ID,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};
export const callbackGithubLogin = async (req, res) => {
  const GITHUB = "Github";
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CL_ID,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    // access api
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      // 써먹을만한 email이 없다 다시해라.
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (user.socialType !== GITHUB) {
      req.flash("error", `Your account is ${user.socialType}`);
      return res.redirect("/login");
    }
    if (!user) {
      user = await User.create({
        name: userData.name ? userData.name : userData.login,
        avatarUrl: userData.avatar_url,
        email: emailObj.email,
        socialType: GITHUB,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    // access_token 에러
    return res.redirect("/login");
  }
};

export const startKakaoLogin = (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/authorize";
  const config = {
    client_id: process.env.KAKAO_CL_ID,
    redirect_uri: process.env.KAKAO_REDIRECT_URI,
    response_type: "code",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  return res.redirect(finalUrl);
};

export const callbackKakaoLogin = async (req, res) => {
  const KAKAO = "Kakao";
  const baseUrl = "https://kauth.kakao.com/oauth/token";
  const config = {
    grant_type: "authorization_code",
    client_id: process.env.KAKAO_CL_ID,
    client_secret: process.env.KAKAO_SECRET,
    redirect_uri: process.env.KAKAO_REDIRECT_URI,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    // access api
    const { access_token } = tokenRequest;
    const apiUrl = "https://kapi.kakao.com/v2/user/me";
    const userData = await (
      await fetch(`${apiUrl}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();
    console.log(userData);
    if (
      !userData.kakao_account.email ||
      !userData.kakao_account.is_email_verified
    ) {
      req.flash("error", "Your Kakao account has no verified Email");
      return res.redirect("/login");
    }
    const {
      email,
      profile: { thumbnail_image_url, nickname },
    } = userData.kakao_account;
    let user = await User.findOne({ email });
    if (user.socialType !== KAKAO) {
      req.flash("error", `Your account is ${user.socialType}`);
      return res.redirect("/login");
    }
    if (!user) {
      user = await User.create({
        name: nickname,
        avatarUrl: thumbnail_image_url,
        email: email,
        socialType: KAKAO,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    // access_token 에러
    req.flash("error", "Kakao token error");
    return res.redirect("/login");
  }
};

export const startNaverLogin = (req, res) => {
  const baseUrl = "https://nid.naver.com/oauth2.0/authorize";
  const config = {
    client_id: process.env.NAVER_CL_ID,
    redirect_uri: process.env.NAVER_REDIRECT_URI,
    state: process.env.NAVER_STATE,
    response_type: "code",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  return res.redirect(finalUrl);
};

export const callbackNaverLogin = async (req, res) => {
  const NAVER = "Naver";
  if (req.query.state !== process.env.NAVER_STATE) {
    req.flash("error", "Unusual approach, 한번만 더 그럼 차단함.");

    return res.redirect("/login");
  }
  const baseUrl = "https://nid.naver.com/oauth2.0/token";
  const config = {
    grant_type: "authorization_code",
    client_id: process.env.NAVER_CL_ID,
    client_secret: process.env.NAVER_SECRET,
    redirect_uri: process.env.NAVER_REDIRECT_URI,
    code: req.query.code,
    state: req.query.state,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        "X-Naver-Client-Id": process.env.NAVER_CL_ID,
        "X-Naver-Client-Secret": process.env.NAVER_SECRET,
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    // access api
    const { access_token } = tokenRequest;
    const apiUrl = "https://openapi.naver.com/v1/nid/me";
    const userData = await (
      await fetch(`${apiUrl}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();

    if (userData.message !== "success") {
      req.flash("error", "Your Naver account login failed");
      return res.redirect("/login");
    }
    const { email, profile_image, name } = userData.response;
    let user = await User.findOne({ email });
    if (user.socialType !== NAVER) {
      req.flash("error", `Your account is ${user.socialType}`);
      return res.redirect("/login");
    }
    if (!user) {
      user = await User.create({
        name: name,
        avatarUrl: profile_image,
        email: email,
        socialType: NAVER,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    // access_token 에러
    req.flash("error", "Kakao token error");
    return res.redirect("/login");
  }
};

export const history = async (req, res) => {
  try {
    const { _id } = req.session.user;
    const user = await User.findById(_id).populate({ path: "history" });
    const videos = user.history;
    return res.render("record", { pageTitle: "History", videos });
  } catch (error) {
    console.log(error);
    return res.status(500).send("server-error");
  }
};

export const favorite = async (req, res) => {
  try {
    const { _id } = req.session.user;
    const user = await User.findById(_id).populate({ path: "favs" });
    const videos = user.favs;
    return res.render("record", { pageTitle: "Favorite", videos });
  } catch (error) {
    console.log(error);
    return res.status(500).send("server-error");
  }
};
