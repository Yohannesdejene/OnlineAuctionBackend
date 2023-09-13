require("dotenv");
const { sequelize } = require("../models");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const dns = require("dns");

const authCheck = async (req, res, next) => {
  console.log("cookies", req.cookies);
  console.log("headers", req.headers);

  console.log("checking data", req.cookies.u);
  if (req.cookies.u) {
    console.log("in the first check");
    const token = req.cookies.u;
    if (token == null) {
      return res.status(404).send("not logged in");
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      console.log("verifing");
      if (err) {
        console.log("Token error is ", err);
        return res.status(403).send("not logged in");
      } else {
        console.log("decoded toklen", user);
        req.user = user;
        console.log("req.user", req.user);
        next();
      }
    });
  } else if (req.headers.cookies) {
    console.log("in the second check");
    let contentincookie = req.headers.cookies;
    const token = contentincookie.slice(0);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        res.sendStatus(403);
      }
      console.log("the request user is ", user);
      req.user = user;
      next();
    });
  } else {
    console.log("no cookiesss");
    return res.status(404).send("no cookie");
  }
};
///get cookie called ot
const getUser = async (req, res, next) => {
  console.log("cookies", req.cookies);
  console.log("headers to check out", req.headers);

  console.log("checking data", req.cookies.ot);
  if (req.cookies.ot) {
    console.log("in the first check");
    const token = req.cookies.ot;
    if (token == null) {
      return res.status(403).send("not logged in");
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      console.log("verifing");
      if (err) {
        console.log("Token error is ", err);
        return res.status(403).send("not logged in");
      } else {
        console.log("decoded toklen", user);
        req.user = user;
        console.log("req.user", req.user);
        next();
      }
    });
  } else if (req.headers.cookies) {
    console.log("in the second check");
    let contentincookie = req.headers.cookies;
    const token = contentincookie.slice(0);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        res.sendStatus(403);
      }
      console.log("the request user is ", user);
      req.user = user;
      next();
    });
  } else {
    console.log("no cookie");
    return res.sendStatus(403);
  }
};

// Reusable function to send verification email
function checkInternetConnection(req, res, next) {
  dns.lookup("google.com", (err) => {
    if (err && err.code === "ENOTFOUND") {
      console.log("no internet");
      return res.status(400).send("No internet connection");
    }
    next();
  });
}

const authController = require("../Controllers/authController");

router.get(
  "/checkLogin",
  checkInternetConnection,
  authCheck,
  authController.checkLogin
);

router.post(
  "/registerCompany",
  checkInternetConnection,
  authCheck,
  authController.registerCompany
);

router.post(
  "/registerMerchant",
  checkInternetConnection,
  authCheck,
  authController.registerMerchant
);

router.post(
  "/registerAdmin",
  checkInternetConnection,
  authCheck,
  authController.registerAdmin
);

router.post(
  "/registerSales",
  checkInternetConnection,
  authController.registerSales
);

router.post(
  "/registerProcurment",
  checkInternetConnection,
  authCheck,
  authController.registerProcurment
);

router.post(
  "/registerAssistant",
  checkInternetConnection,
  authCheck,
  authController.registerAssistant
);

router.post(
  "/verifyOTP",
  checkInternetConnection,

  authController.verifyOTP
);

router.post(
  "/resend",
  //  checkInternetConnection,
  authController.resendOPT
);

router.post("/login", checkInternetConnection, authController.login);

router.post("/logout", authCheck, authController.logout);

router.post(
  "/setPassword",
  checkInternetConnection,
  getUser,
  authController.setPassword
);

module.exports = router;
