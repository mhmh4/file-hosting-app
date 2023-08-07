import fs from "fs";

import AdmZip from "adm-zip";
import express from "express";

import User from "../models/user.js";
import { getUploadDirectory } from "../utils.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("settings.html");
});

router.post("/export", async (req, res) => {
  const zip = new AdmZip();

  const directory = getUploadDirectory(req.session.username);
  fs.readdirSync(directory).forEach((f) => {
    zip.addLocalFile(`${directory}/${f}`);
  });

  const buf = zip.toBuffer();

  res.set({
    "Content-Type": "routerlication/zip",
    "Content-Disposition": "attachment; filename=fhsp_export.zip",
  });

  return res.send(buf);
});

router.post("/remove_all", async (req, res) => {
  const directory = getUploadDirectory(req.session.username);
  fs.readdirSync(directory).forEach((f) => fs.rmSync(`${directory}/${f}`));

  await User.findOne({ username: req.session.username }).then((user) => {
    user.files = [];
    user.save();
  });

  req.flash("info", "Removed all files.");
  res.redirect("/home");
});

router.post("/delete_account", async (req, res) => {
  try {
    await User.deleteOne({ username: req.session.username });
    fs.rm(
      getUploadDirectory(req.session.username),
      {
        recursive: true,
        force: true,
      },
      (err) => {}
    );
  } catch {}

  res.redirect("/login");
});

export default router;
