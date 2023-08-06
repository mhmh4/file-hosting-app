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
    if (!user) {
      req.flash("info", "Invalid username or password");
      res.redirect("/login");
      return;
    }

    if (req.body.password === user.password) {
      req.session.username = user.username;
    } else {
      req.flash("info", "Invalid username or password");
      res.redirect("/login");
      return;
    }
  } catch {
    req.flash("info", "Error: Login failed. Please try again.");
    res.redirect("/login");
    return;
  }

  res.redirect("/home");
  return;
});

router.get("/register", async (req, res) => {
  res.render("register.html");
});

router.post("/register", async (req, res) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      req.flash("info", "Username is already taken");
    } else {
      const newUser = new User({
        username: req.body.username,
        password: req.body.password,
      });
      await newUser.save();
      req.flash("info", "Account created. You may now sign in.");
      return res.redirect("/login");
    }
  } catch {
    req.flash("info", "Error: Registration failed. Please try again.");
  }
  res.redirect("/register");
});

router.post("/logout", (req, res) => {
  res.redirect("/login");
});

export default router;
