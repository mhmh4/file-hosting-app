const fs = require("fs");

const bcrypt = require("bcrypt");
const nunjucks = require("nunjucks");
const express = require("express");
const fileUpload = require("express-fileupload");
const session = require("express-session");

const User = require("./models/user");
let db = require("./db");

const app = express();
const port = 3000;

nunjucks.configure("views", {
  express: app,
});

app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(
  session({
    secret: "secret key",
    resave: true,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.get("/", (req, res) => {
  res.redirect("login");
});

app.get("/login", (req, res) => {
  res.render("login.html");
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user == null) {
    res.send("invalid login");
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      req.session.userId = user._id;
      req.session.username = user.username;
      res.redirect("home");
    } else {
      res.send("invalid login");
    }
  } catch {
    res.status(500).send();
  }
});

app.get("/register", async (req, res) => {
  res.render("register.html");
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

const createDirectoryIfNotExists = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }
};

app.get("/home", async (req, res) => {
  createDirectoryIfNotExists(__dirname + "/uploads/" + req.session.username);
  let id = req.session.userId;
  let user = await User.findOne({ _id: id });
  if (!user) {
    res.redirect("login");
    return;
  }
  let files = user.files || [];
  res.render("home.html", { files: files });
});

app.post("/upload", async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  let file = req.files.file;
  let uploadPath =
    __dirname + "/uploads/" + req.session.username + "/" + file.name;

  file.mv(uploadPath, (error) => {
    if (error) {
      return res.status(500).send("error");
    }
  });

  await User.findOne({ _id: req.session.userId }).then((user) => {
    user.files.push(file.name);
    user.save();
  });

  res.redirect("home");
});

app.post("/download", async (req, res) => {
  let file = req.body.file;
  res.download(__dirname + "/uploads/" + req.session.username + "/" + file);
});

app.post("/remove", async (req, res) => {
  let file = req.body.file;

  fs.unlink(
    __dirname + "/uploads/" + req.session.username + "/" + file,
    (err) => {
      if (err) throw err;
    }
  );

  await User.findOne({ _id: req.session.userId }).then((user) => {
    user.files = user.files.filter((e) => e !== file);
    user.save();
  });

  res.redirect("home");
});

app.post("/logout", (req, res) => {
  res.redirect("login");
});

app.listen(port);
