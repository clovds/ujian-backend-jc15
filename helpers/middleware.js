const query = require("../database");
const jwt = require("jsonwebtoken");

const checkRegister = (req, res, next) => {
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
  const { username, email, password } = req.body;

  if (req.method !== "OPTIONS") {
    if (username.length >= 6) {
      if (email.match(emailRegex)) {
        if (password.match(passwordRegex)) {
          return next();
        } else {
          return res.status(500).send({
            message:
              "password must have 6 or more characters and contain 1 number and 1 special character",
            status: "password not valid",
          });
        }
      } else {
        return res.status(500).send({
          message: "email format is not valid",
          status: "email is not valid",
        });
      }
    } else {
      return res.status(500).send({
        message: "username must have 6 or more characters",
        status: "username not valid",
      });
    }
  }
};

const checkLogin = async (req, res, next) => {
  try {
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const { user, password } = req.body;
    let sql = "";
    if (user.match(emailRegex)) {
      sql = `SELECT * FROM users WHERE email = '${user}' AND password = '${password}'`;
    } else {
      sql = `SELECT * FROM users WHERE username = '${user}' AND password = '${password}'`;
    }
    const select = await query(sql);
    if (select[0]) {
      if (select[0].status === 1) {
        req.user = select[0];
        return next();
      } else if (select[0].status === 2) {
        return res.status(500).send({
          message: "Your account is deactive, and can't login",
          status: "account deactive",
        });
      } else if (select[0].status) {
        return res.status(500).send({
          message: "Your account is closed, and can't login anymore",
          status: "closed",
        });
      }
    } else {
      return res.status(500).send({
        message: "user (username/email) or password is wrong",
        status: "login error",
      });
    }
  } catch (err) {
    console.log(err);
    return status(500).send(err);
  }
};

const checkBodyToken = (req, res, next) => {
  jwt.verify(req.body.token, "kuncirahasia", (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Invalid token",
        status: "Unauthorized",
      });
    }
    req.user = decoded;
    next();
  });
};

const checkAdmin = (req, res, next) => {
  try {
    jwt.verify(req.body.token, "kuncirahasia", (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: err.message,
          status: "Unauthorized",
        });
      }
      if (decoded.role === 1) {
        return next();
      } else {
        return res.status(401).send({
          message: `Only admin who can access this route`,
          status: "Unauthorized",
        });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

module.exports = {
  checkRegister,
  checkLogin,
  checkBodyToken,
  checkAdmin,
};
