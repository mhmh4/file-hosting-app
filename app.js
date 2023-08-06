import crypto from "crypto";
import fs from "fs";
import path from "path";

import express from "express";
import fileUpload from "express-fileupload";
import flash from "express-flash";
import session from "express-session";
import mongoose from "mongoose";
import nocache from "nocache";
import nunjucks from "nunjucks";

import User from "./models/user.js";
import { createDirectory, getUploadDirectory, getUploadPath } from "./utils.js";

const app = express();
const port = 3000;

mongoose.connect("mongodb://127.0.0.1:27017/fhsp");
nunjucks.configure("views", { express: app, watch: true });

app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(flash());
app.use(nocache());
app.use(
  session({
    secret: crypto.randomBytes(64).toString("hex"),
    resave: true,
    saveUninitialized: true,
  })
);

import authRoutes from "./routes/auth.js";
import settingsRoutes from "./routes/settings.js";

app.use("/", authRoutes);
app.use("/settings", settingsRoutes);

app.get("/home", async (req, res) => {
  createDirectory(getUploadDirectory(req.session.username));
  let user = await User.findOne({ username: req.session.username });
  if (!user) {
    res.redirect("/login");
    return;
  }
  let files = user.files || [];
  let storage = 0;
  for (const f of files) {
    storage += f.size;
  }
  storage /= 1_000_000;
  storage = Math.round(storage);
  res.render("home.html", { files: files, storage: storage });
});

app.post("/home/upload", async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  let file = req.files.file;
  let uploadPath = getUploadPath(req.session.username, file.name);

  file.mv(uploadPath, (error) => {
    if (error) {
      return res.status(500).send("error");
    }
  });

  await User.findOne({ username: req.session.username }).then((user) => {
    user.files.push({
      name: file.name,
      created_at: new Date().toUTCString(),
      size: file.size,
    });
    user.save();
  });

  req.flash("info", `Uploaded ${file.name}`);
  res.redirect("/home");
});

app.post("/home/download", async (req, res) => {
  let file = req.body.file;
  res.download(getUploadPath(req.session.username, file));
});

app.post("/home/copy", async (req, res) => {
  let file = req.body.file;

  let filename = path.parse(file).name;
  filename = filename + ".copy" + path.extname(file);

  const src = getUploadPath(req.session.username, file);
  const dest = getUploadPath(req.session.username, filename);

  fs.copyFile(src, dest, (err) => {
    if (err) {
      throw err;
    }
  });

  await User.findOne({ username: req.session.username }).then((user) => {
    const size = user.files.find((f) => {
      return f.name == file;
    }).size;

    user.files.push({
      name: filename,
      created_at: new Date().toUTCString(),
      size: size,
    });

    user.save();
  });

  req.flash("info", `Created copy of ${file}`);
  res.redirect("/home");
});

app.post("/home/remove", async (req, res) => {
  let file = req.body.file;

  fs.unlink(getUploadPath(req.session.username, file), (err) => {
    if (err) throw err;
  });

  await User.findOne({ username: req.session.username }).then((user) => {
    user.files = user.files.filter((e) => e.name !== file);
    user.save();
  });

  req.flash("info", `Deleted ${file}`);
  res.redirect("/home");
});

app.post("/logout", (req, res) => {
  res.redirect("/login");
});

app.listen(port, () => {
  console.log("Listening on port " + port);
});
