const bcrypt = require("bcrypt");
const express = require("express");

const app = express();
const port = 3000;

app.use(express.json())

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});


const userRouter = require("./routes/users");

app.use("/users", userRouter);

app.listen(port);
