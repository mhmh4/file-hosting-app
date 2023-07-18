const bcrypt = require("bcrypt");
const express = require("express");

const router = express.Router();

users = [{"name": "john"}]

router.get("/", (req, res) => {
  res.json(users)
});

router.get("/new", (req, res) => {
  res.send("users new")
});

router.post("/", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt)
    const user = {
      username: username,
      password: hashedPassword
    }
    users.push(user);
    res.status(201).send("ok");
  } catch {
    res.status(500);
  }
});

router.post("/login", async (req, res) => {
  const user = users.find(user => user.username === req.body.username)
  if (user == null) {
    return res.status(400).send("cannot find user");
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      res.send("success");
    } else {
      res.send("not allowed");
    }
  } catch  {
    res.status(500).send();
  }
  res.status();
});

router.route("/:id")
  .get((req, res) => {
    let id = req.params.id;
    res.send("get user with id " + id);
  })
  .post((req, res) => {
    let id = req.params.id;
    res.send("update user with id " + id);
  })
  .delete((req, res) => {
    let id = req.params.id;
    res.send("delete user with id " + id);
  });

router.param("id", (req, res, next, id) => {
  console.log(id);
  next();
})

module.exports = router;
