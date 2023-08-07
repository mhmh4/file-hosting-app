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
  const user = await User.findOne({ username: req.session.username });
  if (!user) {
    res.redirect("/login");
    return;
  }
  const files = user.files || [];
  let storage = 0;
  for (const f of files) {
    storage += f.size;
  }
  storage /= 1_000_000;
  storage = Math.round(storage);
  res.render("home.html", { files: files, storage: storage });
});

router.post("/upload", async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const file = req.files.file;
  const uploadPath = getUploadPath(req.session.username, file.name);

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

router.post("/remove", async (req, res) => {
  const file = req.body.file;

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

export default router;
