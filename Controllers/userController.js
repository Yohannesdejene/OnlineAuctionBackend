require("dotenv");
const { sequelize } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { Op } = require("sequelize");

const { User, Product, Company, Auction, Product_Auction, Passcode, Merchant } =
  sequelize.models;

exports.profile = async (req, res) => {
  const { firstName, lastName, email } = req.body;
  if (!firstName || !lastName || !email) {
    console.log("no ful, data");
    return res.status("303").send("No full data");
  }
  if (
    firstName === undefined ||
    lastName === undefined ||
    email === undefined
  ) {
    console.log("no ful, data");
    return res.status("303").send("No full data");
  }
  let user = await User.findOne({
    where: {
      [Op.or]: [{ email: email }],
    },
  });
  let company = await Company.findOne({
    where: {
      [Op.or]: [{ email: email }],
    },
  });

  if (user || company) {
    return res.status(409).send("Email address is already registered");
  } else {
    const userId = req.user.id;

    try {
      const user = await User.findOne({
        where: {
          id: userId,
        },
      });
      if (!user) {
        res.status(404).send("User not found");
        return;
      }

      if (user) {
        const userEmail = user.email;
        const company = await Company.findOne({
          where: {
            email: userEmail,
          },
        });
        if (company) {
          await Company.update(
            {
              email: req.body.email,
            },
            { where: { email: user.email } }
          );
          await User.update(
            {
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              email: req.body.email,
            },
            { where: { id: user.id } }
          );
        } else {
          await User.update(
            {
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              email: req.body.email,
            },
            { where: { id: user.id } }
          );
        }

        // Create a new object with the extracted properties
        const { id, email, firstName, lastName, userType } = user;
        const userData = { id, email, firstName, lastName, userType };

        return res.status(200).json({ userData });
      } else {
        return res.status(404).send("User not found");
      }
      // Authentication successful, do something with the user
    } catch (error) {
      return res.status(500).json({ message: "failed to get profile ", error });
      // Authentication failed, handle the error
    }
  }
};
exports.getAllUnApprovedMerchant = async (req, res) => {
  // const userId = req.user.id;
  const { page } = req.query;
  const pageSize = 10;
  const offset = (page - 1) * pageSize;
  // if (req.user.userType == 1) {
  try {
    // Authentication successful, do something with the user
    const count = await Merchant.count({
      where: { Approved: "false" },
    });

    const merchants = await Merchant.findAll({
      where: { Approved: "false" },
      offset,
      limit: pageSize,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ merchants, count });
  } catch (error) {
    return res.status(500).json({ message: "failed to  upprove", error });
  }
};
exports.getAllCompanies = async (req, res) => {
  // const userId = req.user.id;
  const { page } = req.query;
  const pageSize = 10;
  const offset = (page - 1) * pageSize;
  // if (req.user.userType == 1) {
  try {
    // Authentication successful, do something with the user
    const count = await Company.count({});

    const company = await Company.findAll({
      offset,
      limit: pageSize,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ company, count });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "failed to getAllCompanies ", error });
    // Authentication failed, handle the error
  }
  // } else {
  //   res.status(403).send("Not authorized");
  // }
};
exports.approveMerchantDetail = async (req, res) => {
  const userId = req.user.id;
  const { merchantId } = req.params;
  if (req.user.userType == 1) {
    try {
      // Authentication successful, do something with the user
      const merchants = await Merchant.findOne({
        where: {
          Approved: "false",
          id: {
            [Op.eq]: merchantId,
          },
        },
      });

      return res.status(200).json({ merchants });
    } catch (error) {
      return res.status(500).json({ message: "failed to get detail ", error });
      // Authentication failed, handle the error
    }
  } else {
    res.status(403).send("Not authorized");
  }
};
exports.approveMerchant = async (req, res) => {
  const userId = req.user.id;
  const { merchantId } = req.params;
  console.log("approveMerchant", merchantId);
  if (req.user.userType == 1) {
    try {
      // Authentication successful, do something with the user
      const merchant = await Merchant.findOne({
        where: { id: merchantId },
      });
      if (merchant) {
        const approve = await Merchant.update(
          {
            Approved: "true",
          },
          { where: { id: merchantId } }
        );
      } else {
        return res.status(404).send("errro");
      }

      return res.status(201).send("Updated");
    } catch (error) {
      return res.status(500).json({ message: "failed to approve ", error });
      // Authentication failed, handle the error
    }
  } else {
    res.status(403).send("Not authorized");
  }
};
exports.changePassword = async (req, res) => {
  const newPassword = req.body.newPassword;
  try {
    const userId = req.user.id;
    // Perform further actions based on the decoded JWT

    console.log("checking");
    const user = await User.findOne({ where: { id: userId } });
    if (user) {
      const saltRounds = 10;

      // Hash the password
      // const plainPassword = "myPassword123";
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(newPassword, salt);

      // const saltRounds = 10;
      // const salt = bcrypt.genSaltSync(saltRounds);
      // const codeString = newPassword.toString();
      // const hashedCode = await bcrypt.hashSync(codeString, salt);

      User.update({ password: hashedPassword }, { where: { id: user.id } })
        .then((data) => {
          console.log("datat", data);

          const { id, email, firstName, lastName, userType } = user;

          // Create a new object with the extracted properties
          const userData = { id, email, firstName, lastName, userType };

          return res.status(200).json({ userData });
        })
        .catch((err) => {
          console.log("Error something", err);
          return res
            .status(404)
            .json({ message: "failed to set password", errr });
        });
    } else {
      return res.status(409).send("un known error");
    }

    // Check if any matching record is found
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ message: "failed to set password", error });
  }
};
