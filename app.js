const bcrypt = require("bcrypt");
const express = require("express");

const User = require("./models/user");
const db = require("./db");

const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.redirect("login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = await User.findOne({ username: username, password: password });
  if (user) {
    res.redirect("home");
  } else {
    res.status(401).redirect("login");
  }
});

app.get("/register", async (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  // try {
  //   const salt = await bcrypt.genSalt();
  //   const hashedPassword = await bcrypt.hash(password, salt);  // } catch {
  //   res.status(500);
  // }
  // res.status(201).json([{username, password}]);

  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  try {
    await user.save();
  } catch {
    res.status(500);
  }
  res.redirect("login");
});

app.get("/home", (req, res) => {
  res.render("home");
});

app.post("/upload", (req, res) => {
  res.redirect("home");
});

app.post("/logout", (req, res) => {
  res.redirect("login");
});

app.listen(port);
