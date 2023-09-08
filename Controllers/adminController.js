require("dotenv");
const { sequelize } = require("../models");

const fs = require("fs");
const path = require("path");
const multer = require("multer");

const {
  User,
  Product,
  Company,
  Auction,
  PdfFile,
  PdfLow,
  Product_Auction,
  Passcode,
  Merchant,
} = sequelize.models;

async function savePdfFile(file) {
  const { originalname, buffer } = file;

  const filename = `ethCheretaPolicy_${originalname}`;
  const filepath = path.join(__dirname, "../", "uploadPdf", filename);
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

async function saveLowFile(file) {
  const { originalname, buffer } = file;

  const filename = `ethCheretaPolicy_${originalname}`;
  const filepath = path.join(__dirname, "../", "uploadLow", filename);
  const filesize = buffer.length;

  // Save the file to disk
  fs.writeFileSync(filepath, buffer);

  // Save metadata to the database
  const pdfFile = await PdfLow.create({
    id: "",
    filename,
    filepath,
    filesize,
  });

  return pdfFile;
}

exports.uploadPdf = async (req, res) => {
  const file = req.file;
  if (!file || !file.buffer) {
    return res.status(400).json({ error: "No PDF file provided" });
  }

  try {
    const pdfFile = await savePdfFile(file);
    return res.json({ id: pdfFile.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to save PDF file" });
  }
};
exports.getPdf = async (req, res) => {
  const pdfFile = await PdfFile.findOne({
    order: [["createdAt", "DESC"]],
  });

  if (!pdfFile) {
    return res.status(404).json({ error: "PDF file not found" });
  }

  const filepath = pdfFile.filepath;
  const filestream = fs.createReadStream(filepath);
  res.setHeader("Content-Type", "application/pdf");
  filestream.pipe(res);
};
exports.uploadLow = async (req, res) => {
  const file = req.file;
  if (!file || !file.buffer) {
    return res.status(400).json({ error: "No PDF file provided" });
  }

  try {
    const pdfFile = await saveLowFile(file);
    return res.json({ id: pdfFile.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to save PDF file" });
  }
};
exports.getLow = async (req, res) => {
  const pdfFile = await PdfFile.findOne({
    order: [["createdAt", "DESC"]],
  });

  if (!pdfFile) {
    return res.status(404).json({ error: "PDF file not found" });
  }

  const filepath = pdfFile.filepath;
  const filestream = fs.createReadStream(filepath);
  res.setHeader("Content-Type", "application/pdf");
  filestream.pipe(res);
};
