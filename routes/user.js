require("dotenv");
const { sequelize } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = require("express").Router();
var bodyParser = require("body-parser");
const cors = require("cors");
const dns = require("dns");
const { uid } = require("uid");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const user = require("../models/user");

const { User, Product, Company, Auction, Product_Auction, Passcode, Merchant } =
  sequelize.models;
const userController = require("../Controllers/userController");

var transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "cheretaeth@gmail.com",
    pass: "hjgvnegmacepntej",
  },
});

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
    console.log("no cookie");
    return res.status(404).send("no cookie");
  }
};

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

router.put(
  "/profile",
  checkInternetConnection,
  authCheck,
  userController.profile
);

router.get(
  "/approveMerchant",
  checkInternetConnection,
  authCheck,
  userController.getAllUnApprovedMerchant
);

router.get(
  "/allCompanies",
  checkInternetConnection,
  authCheck,
  userController.getAllCompanies
);

router.get(
  "/approveMerchant/detail/:merchantId",
  checkInternetConnection,
  authCheck,
  userController.approveMerchantDetail
);

router.put(
  "/approveMerchant/:merchantId",
  checkInternetConnection,
  authCheck,
  userController.approveMerchant
);

module.exports = router;
