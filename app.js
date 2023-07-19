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

app.get("/register", async (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = await User.find({ username: username });
  console.log(user);
  if (user != []) {
    res.redirect("home");
  } else {
    res.redirect("login");
  }
});
app.get("/home", (req, res) => {
  res.render("home");
});

app.post("/register", async (req, res) => {
  // const username = req.body.username;
  // const password = req.body.password;
  // try {
  //   const salt = await bcrypt.genSalt();
  //   const hashedPassword = await bcrypt.hash(password, salt);
  //   await db.run(
  //     `INSERT INTO users (username, password) VALUES ("${username}", "${hashedPassword}")`,
  //   );
  // } catch {
  //   res.status(500);
  // }
  // res.status(201).json([{username, password}]);

  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  try {
    const newUser = await user.save();
  } catch {
    res.status(500);
  }

  res.redirect("login");
});

app.post("/upload", (req, res) => {
  res.redirect("home");
});

app.get("/logout", (req, res) => {
  res.redirect("login");
});

app.listen(port);
