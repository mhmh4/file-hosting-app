const bcrypt = require("bcrypt");
const express = require("express");
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

let db = null;
// this is a top-level await
(async () => {
    // open the database
    db = await open({
      filename: './database.db',
      driver: sqlite3.Database
    })
  return db;
})()

const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.json())



app.get("/", (req, res) => {
  res.redirect("login")
  // res.render("index");
});
app.get("/register", async (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {

  res.redirect("home");
});

app.get("/home", (req, res) => {
  res.render("home");
});

app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const result = await db.run(`INSERT INTO users (username, password) VALUES ("${username}", "${password}")`);
  // res.status(201).json([{username, password}]);
  res.render("login");
});

app.get("/logout", (req, res) => {
  res.redirect("login");
});

// const userRouter = require("./routes/users");

// app.use("/users", userRouter);

app.listen(port);
