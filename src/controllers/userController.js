import User from "../models/User";
import bcrypt from "bcrypt";

export const logout = (req, res) => {
  res.render("home");
};
export const edit = (req, res) => {
  res.render("home");
};
export const remove = (req, res) => {
  res.render("home");
};
export const see = (req, res) => {
  res.render("home");
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
    return res.status(400).render("signup", {
      pageTitle,
      errorMessage: "Password confirmation does not match",
    });
  }
  const usernameEmailExists = await User.exists({
    $or: [{ username }, { email }],
  });
  if (usernameEmailExists) {
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
  const user = await User.findOne({ username });
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
