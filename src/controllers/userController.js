import User from "../models/User.js";
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
    body: { name, email, username, location },
    file,
  } = req;
  // validation Challenge!
  // 나중에 꼭 합시다.
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      email,
      username,
      location,
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
    return res.status(404).render("404", { pageTitle: "User not found!" });
  }

  res.render("users/profile", { pageTitle: `${user.name}`, user });
};
export const getSignup = (req, res) => {
  res.render("signup", { pageTitle: "Sign Up" });
};
export const postSignup = async (req, res) => {
  const pageTitle = "SignUP";
  const {
    body: { email, username, password, password2, name, location },
  } = req;
  if (password !== password2) {
    console.log("re-password doesn't match");
    return res.status(400).render("signup", {
      pageTitle,
      errorMessage: "Password confirmation does not match",
    });
  }
  const usernameEmailExists = await User.exists({
    $or: [{ username }, { email }],
  });
  if (usernameEmailExists) {
    console.log("Email exists");
    return res.status(400).locationrender("signup", {
      pageTitle,
      errorMessage: "This username / email is already taken",
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
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
    body: { username, password },
  } = req;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Username or Password is wrong!(for dev : username)",
    });
  }
  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Username or Password is wrong!(for dev : password)",
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
    if (!user) {
      user = await User.create({
        name: userData.name ? userData.name : userData.login,
        avatarUrl: userData.avatar_url,
        username: userData.login,
        email: emailObj.email,
        location: userData.location,
        socialOnly: true,
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

export const testUserMaker = async (req, res) => {
  const rdnb = Math.floor(Math.random() * 99) + 10;
  const user = await User.create({
    email: `ffen${rdnb}@ffen.com`,
    username: `ffen${rdnb}`,
    name: "ffen",
    location: "asd",
    socialType: ["he", "ahe", "sad"],
  });
  console.log(user);
  res.end();
};
