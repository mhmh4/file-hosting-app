import express from "express";

import User from "../models/user.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.redirect("/login");
});

router.get("/login", (req, res) => {
  res.render("login.html");
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user || req.body.password !== user.password) {
      req.flash("info", "Invalid username or password");
      return res.redirect("/login");
    }
    req.session.username = user.username;
  } catch (error) {
    req.flash("info", "Error: login failed");
    return res.redirect("/login");
  }

  return res.redirect("/home");
});

router.get("/register", (req, res) => {
  res.render("register.html");
});

router.post("/register", async (req, res) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      req.flash("info", "Username is already taken");
      return res.redirect("/register");
    }
    await new User({
      username: req.body.username,
      password: req.body.password,
    }).save();

    req.flash("info", "Account created. You may now log in");
    return res.redirect("/login");
  } catch {
    req.flash("info", "Error: registration failed");
    return res.redirect("/register");
  }
});

router.post("/logout", (req, res) => {
  res.redirect("/login");
});

export default router;
