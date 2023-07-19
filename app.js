const bcrypt = require("bcrypt");
const express = require("express");
const fileUpload = require("express-fileupload");

const User = require("./models/user");
const db = require("./db");

const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.get("/", (req, res) => {
  res.redirect("login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user == null) {
    res.send("invalid login");
  }

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      res.redirect("home");
    } else {
      res.send("invalid login");
    }
  } catch {
    res.status(500).send();
  }
});

app.get("/register", async (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    username: req.body.username,
    password: hashedPassword,
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

app.post("/upload", async (req, res) => {
  console.log(req.files);
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  let file = req.files.file;
  let uploadPath = __dirname + "/uploads/" + file.name;

  file.mv(uploadPath, (error) => {
    if (error) {
      return res.status(500).send("error");
    }
  });

  res.redirect("home");
});

app.post("/logout", (req, res) => {
  res.redirect("login");
});

app.listen(port);
