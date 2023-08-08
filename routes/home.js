import fs from "fs";
import path from "path";

import express from "express";

import User from "../models/user.js";
import {
  createDirectory,
  getUploadDirectory,
  getUploadPath,
} from "../utils.js";

const router = express.Router();

router.get("/", async (req, res) => {
  createDirectory(getUploadDirectory(req.session.username));

  try {
    const user = await User.findOne({ username: req.session.username });
    if (!user) {
      res.redirect("/login");
      return;
    }
    const files = [...user.files];

    const usage = files.reduce((accumulator, file) => {
      return accumulator + file.size;
    }, 0);

    const usageInMegabytes = Math.round(usage / 1_000_000);

    return res.render("home.html", { files: files, usage: usageInMegabytes });
  } catch (error) {
    req.flash("info", "Login failed. Please try again.");
    return res.redirect("login");
  }
});

router.post("/upload", async (req, res) => {
  if (!req.files) {
    return res.status(400).send("No files were uploaded");
  }

  const file = req.files.file;
  const uploadPath = getUploadPath(req.session.username, file.name);

  try {
    const user = await User.findOne({ username: req.session.username });
    if (user.files.some((f) => f.name === file.name)) {
      req.flash("info", "Cannot upload file with existing filename.");
      return res.redirect("/home");
    }
  } catch {}

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

router.post("/download", async (req, res) => {
  const file = req.body.file;
  res.download(getUploadPath(req.session.username, file));
});

router.post("/copy", async (req, res) => {
  const file = req.body.file;

  let currentFilename = path.parse(file).name;
  let filename = currentFilename + ".copy" + path.extname(file);

  const src = getUploadPath(req.session.username, file);
  const dest = getUploadPath(req.session.username, filename);

  try {
    const user = await User.findOne({ username: req.session.username });
    if (user.files.some((f) => f.name === filename)) {
      req.flash("info", `Copy of ${currentFilename} already exists.`);
      return res.redirect("/home");
    }
  } catch {}

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

  req.flash("info", `Created a copy of ${file}`);
  res.redirect("/home");
});

router.post("/remove", async (req, res) => {
  const file = req.body.file;

  fs.unlink(getUploadPath(req.session.username, file), (err) => {
    if (err) throw err;
  });

  await User.findOne({ username: req.session.username }).then((user) => {
    user.files = user.files.filter((e) => e.name !== file);
    user.save();
  });

  req.flash("info", `Removed ${file}`);
  res.redirect("/home");
});

export default router;
