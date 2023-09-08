require("dotenv");
const { sequelize } = require("../models");
const jwt = require("jsonwebtoken");
const router = require("express").Router();

const dns = require("dns");

const fs = require("fs");
const path = require("path");
const multer = require("multer");

const { User, Product, Company, Auction, Product_Auction, Passcode, Merchant } =
  sequelize.models;
const adminController = require("../Controllers/adminController");

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

const uploadPdf = multer({ storage: multer.memoryStorage() });

async function savePdfFile(file) {
  const { originalname, buffer } = file;

  const filename = `ethCheretaPolicy_${originalname}`;
  const filepath = path.join(__dirname, "uploadPdf", filename);
  const filesize = buffer.length;

  // Save the file to disk
  fs.writeFileSync(filepath, buffer);

  // Save metadata to the database
  const pdfFile = await PdfFile.create({
    id: "",
    filename,
    filepath,
    filesize,
  });

  return pdfFile;
}

router.post(
  "/uploadPdf",
  checkInternetConnection,
  authCheck,
  uploadPdf.single("pdf"),
  adminController.uploadPdf
);
router.get(
  "/pdfs/latest",

  adminController.getPdf
);
router.get(
  "/low/latest",

  adminController.getLow
);
router.post(
  "/uploadLow",
  checkInternetConnection,
  authCheck,
  uploadPdf.single("pdf"),
  adminController.uploadLow
);

module.exports = router;
