const bcrypt = require("bcrypt");
const express = require("express");
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// this is a top-level await
(async () => {
    // open the database
    const db = await open({
      filename: './database.db',
      driver: sqlite3.Database
    })
})()

const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.json())



app.get("/", (req, res) => {
  res.render("index");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/home", (req, res) => {
  res.render("home");
});

app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  res.status(201).json([{username, password}]);
});


const userRouter = require("./routes/users");

app.use("/users", userRouter);

app.listen(port);
