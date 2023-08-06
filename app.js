import crypto from "crypto";

import express from "express";
import fileUpload from "express-fileupload";
import flash from "express-flash";
import session from "express-session";
import mongoose from "mongoose";
import nocache from "nocache";
import nunjucks from "nunjucks";

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
import homeRoutes from "./routes/home.js";
import settingsRoutes from "./routes/settings.js";

app.use("/", authRoutes);
app.use("/home", homeRoutes);
app.use("/settings", settingsRoutes);

app.post("/logout", (req, res) => {
  res.redirect("/login");
});

app.listen(port, () => {
  console.log("Listening on port " + port);
});
