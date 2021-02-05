const router = require("express").Router();
const query = require("../database");
const {
  checkRegister,
  createJWTToken,
  checkLogin,
  checkBodyToken,
} = require("../helpers");

// Register
router.post("/register", checkRegister, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const uid = Date.now();
    const insert = await query(
      `INSERT INTO users (uid, username, email, password) VALUES (${uid}, '${username}', '${email}', '${password}')`
    );

    const select = await query(
      `SELECT id, uid, username, email, role FROM users WHERE id = ${insert.insertId}`
    );
    const token = createJWTToken({ uid: select[0].uid, role: select[0].role });
    const responseData = {
      id: select[0].id,
      uid: select[0].uid,
      username: select[0].username,
      email: select[0].email,
      token: token,
    };
    return res.status(200).send(responseData);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxNjEyNTEwMjc2NTM2Iiwicm9sZSI6MiwiaWF0IjoxNjEyNTEwMjc2LCJleHAiOjE2MTI1OTY2NzZ9.qc3Mh2tkOyScYdVX5b7jjVzukhLuesjIpBdF0EsqcVI

// Login
router.post("/login", checkLogin, async (req, res) => {
  try {
    const { uid } = req.user;
    const select = await query(`SELECT * FROM users WHERE uid = ${uid}`);

    const token = createJWTToken({ uid: select[0].uid, role: select[0].role });
    const responseData = {
      id: select[0].id,
      uid: select[0].uid,
      username: select[0].username,
      email: select[0].email,
      status: select[0].status,
      role: select[0].role,
      token,
    };
    return res.status(200).send(responseData);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxNjEyNTEwMjc2NTM2Iiwicm9sZSI6MiwiaWF0IjoxNjEyNTEyMjA5LCJleHAiOjE2MTI1OTg2MDl9.dLYcmasfEngz1O3LREhBnFyrcc6UwrTINJ-LvDfn8ds

// Deactive
router.patch("/deactive", checkBodyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const select = await query(`SELECT * FROM users WHERE uid = ${uid}`);
    const status = select[0].status;

    if (status === 3) {
      return res.status(500).send({
        message: "Your account is closed",
        status: "closed",
      });
    } else {
      await query(`UPDATE users SET status = 2 WHERE uid = ${uid}`);
      return res.status(200).send({
        uid,
        status: "deactive",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

// Activate
router.patch("/activate", checkBodyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const select = await query(`SELECT * FROM users WHERE uid = ${uid}`);
    const status = select[0].status;

    if (status === 1) {
      return res.status(500).send({
        message: "Your account is already active",
        status: "activated",
      });
    } else if (status === 2) {
      await query(`UPDATE users SET status = 1 WHERE uid = ${uid}`);
      return res.status(200).send({
        uid,
        status: "active",
      });
    } else if (status === 3) {
      return res.status(500).send({
        message: "Your account is closed, and can't be activate anymore",
        status: "closed",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

// Close
router.patch("/close", checkBodyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const select = await query(`SELECT * FROM users WHERE uid = ${uid}`);
    const status = select[0].status;

    if (status === 3) {
      return res.status(500).send({
        message: "Account is already closed",
        status: "closed",
      });
    } else {
      await query(`UPDATE users SET status = 3 WHERE uid = ${uid}`);
      return res.status(200).send({
        uid,
        status: "closed",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

module.exports = router;
