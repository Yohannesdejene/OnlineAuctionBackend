require("dotenv");
const { sequelize } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { Op } = require("sequelize");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const { User, Product, Company, Auction, Product_Auction, Passcode } =
  sequelize.models;

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
    console.log("no cookiesss");
    return res.status(404).send("no cookie");
  }
};

/////reUsable email sender
function sendVerificationEmail(email, code) {
  var mailOptions = {
    from: "yohannesdejene23@gmail.com",
    to: email,
    subject: "User verification code",

    html: `
    <p>Verify your OTP with this <a href="https://ethchereta.com/otp" style="color: blue;">link</a>.</p>
    <p>Your OTP Verification code is ${code}. Use this password and verify your account.</p>
  `,
  };

  transporter
    .sendMail(mailOptions)
    .then((info) => {
      console.log("email sent", info);
    })
    .catch((error) => {
      console.log("Erro insending", error);
      return;
    });
}

exports.checkLogin = async (req, res) => {
  const userType = req.user.userType;
  const uid = req.user.id;
  try {
    User.findOne({ where: { id: uid } })
      .then((data) => {
        return res.json({ data });
      })
      .catch((err) => {
        return res.status(404).send("error");
      });
  } catch (error) {
    console.log("Err checking user");
    return res.status(500).json({ error: error.message });
  }
};
exports.registerCompany = async (req, res) => {
  const { companyName, email, firstName, lastName } = req.body;

  let branch;
  if (req.body.branch) {
    branch = req.body.branch;
  }

  if (req.user.userType == 1 || req.user.userType == 2) {
    try {
      const [existingUser, existingCompany] = await Promise.all([
        User.findOne({ where: { email } }),
        Company.findOne({ where: { email } }),
      ]);

      if (existingUser || existingCompany) {
        console.log("Email address is already registered");
        return res.status(409).send("Email address is already registered");
      }

      function generateOTP() {
        return crypto.randomInt(100000, 999999);
      }

      let code = generateOTP();

      const company = await Company.create({
        id: "",
        email: email,
        companyName: companyName,
        branch: branch,
        // Other company properties...
      });

      const createrId = req.user.id;
      const companyId = company.id;

      await User.create({
        id: "",
        email: email,
        firstName: firstName,
        lastName: lastName,
        userType: 3,
        CompanyId: companyId,
        managerId: createrId,
        // Other user properties...
      });

      try {
        console.log("in the try");
        await sendVerificationEmail(email, code);
      } catch (err) {
        console.error("Error sending verification email:", err);
        return res.status(500).send("Error sending verification email");
      }

      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const codeString = code.toString();
      const hashedCode = await bcrypt.hashSync(codeString, salt);

      await Passcode.create({
        id: "",
        email: email,
        otp: hashedCode,
      });

      return res
        .status(200)
        .send(
          "Successfully registered company and sent OTP to the company email"
        );
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).send("Error in database");
    }
  } else {
    return res.status(403).send("Unauthorized access");
  }
};
exports.registerMerchant = async (req, res) => {
  const { email, firstName, lastName, password } = req.body;

  let branch;
  if (req.body.branch) {
    branch = req.body.branch;
  }

  if (req.user.userType == 1 || req.user.userType == 2) {
    try {
      const [existingUser, existingCompany] = await Promise.all([
        User.findOne({ where: { email } }),
        Company.findOne({ where: { email } }),
      ]);

      if (existingUser || existingCompany) {
        console.log("Email address is already registered");
        return res.status(409).send("Email address is already registered");
      }

      function generateOTP() {
        return crypto.randomInt(100000, 999999);
      }

      let code = generateOTP();

      const createrId = req.user.id;

      await User.create({
        id: "",
        email: email,
        firstName: firstName,
        lastName: lastName,
        userType: 2,
        CompanyId: 1,
        managerId: createrId,
        // Other user properties...
      });

      try {
        console.log("in the try");
        await sendVerificationEmail(email, code);
      } catch (err) {
        console.error("Error sending verification email:", err);
        return res.status(500).send("Error sending verification email");
      }

      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const codeString = code.toString();
      const hashedCode = await bcrypt.hashSync(codeString, salt);
      console.log("hashed code", hashedCode);

      await Passcode.create({
        id: "",
        email: email,
        otp: hashedCode,
      });

      return res
        .status(200)
        .send(
          "Successfully registered merchant and sent OTP to the company email"
        );
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).send("Error in database");
    }
  } else {
    return res.status(403).send("Unauthorized access");
  }
};
exports.registerAdmin = async (req, res) => {
  const { email, firstName, lastName } = req.body;

  let branch;
  if (req.body.branch) {
    branch = req.body.branch;
  }

  if (req.user.userType == 1) {
    try {
      const [existingUser, existingCompany] = await Promise.all([
        User.findOne({ where: { email } }),
        Company.findOne({ where: { email } }),
      ]);

      if (existingUser || existingCompany) {
        console.log("Email address is already registered");
        return res.status(409).send("Email address is already registered");
      }

      function generateOTP() {
        return crypto.randomInt(100000, 999999);
      }

      let code = generateOTP();

      await User.create({
        id: "",
        email: email,
        firstName: firstName,
        lastName: lastName,
        userType: 1,
        // Other user properties...
      });

      try {
        console.log("in the try");
        await sendVerificationEmail(email, code);
      } catch (err) {
        console.error("Error sending verification email:", err);
        return res.status(500).send("Error sending verification email");
      }

      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const codeString = code.toString();
      const hashedCode = await bcrypt.hashSync(codeString, salt);
      console.log("hashed code", hashedCode);

      await Passcode.create({
        id: "",
        email: email,
        otp: hashedCode,
      });

      return res
        .status(200)
        .send("Successfully registered admin and sent OTP to the admin email");
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).send("Error in database");
    }
  } else {
    return res.status(403).send("Unauthorized access");
  }
};
exports.registerSales = async (req, res) => {
  const { email, firstName, lastName, password } = req.body;

  try {
    const [existingUser, existingCompany] = await Promise.all([
      User.findOne({ where: { email } }),
      Company.findOne({ where: { email } }),
    ]);

    if (existingUser || existingCompany) {
      console.log("Email address is already registered");
      return res.status(409).send("Email address is already registered");
    }

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = await bcrypt.hashSync(password, salt);

    await User.create({
      id: "",
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      userType: 2,
      // Other user properties...
    });

    console.log("registration user  success");

    return res.status(200).send("Registration successful");
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Error in database");
  }
};
exports.registerProcurment = async (req, res) => {
  const { email, firstName, lastName, branch } = req.body;

  try {
    if (!(req.user.userType === 1 || req.user.userType == 3)) {
      return res.status(403).send("Unauthorized access");
    }

    const [existingUser, existingCompany] = await Promise.all([
      User.findOne({ where: { email } }),
      Company.findOne({ where: { email } }),
    ]);

    if (existingUser || existingCompany) {
      console.log("Email address is already registered");
      return res.status(409).send("Email address is already registered");
    }

    function generateOTP() {
      return crypto.randomInt(100000, 999999);
    }

    const code = generateOTP();

    const creator = await User.findOne({ where: { id: req.user.id } });

    await User.create({
      id: "",
      email: email,
      firstName: firstName,
      lastName: lastName,
      userType: 4,
      CompanyId: creator.CompanyId,
      managerId: req.user.id,
      branch: branch,
      // Other user properties...
    });

    await sendVerificationEmail(email, code);

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedCode = await bcrypt.hashSync(code.toString(), salt);

    await Passcode.create({
      id: "",
      email: email,
      otp: hashedCode,
    });

    console.log(
      "Successfully registered procurement and sent OTP to the company email"
    );

    return res
      .status(200)
      .send(
        "Successfully registered procurement and sent OTP to the company email"
      );
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Error in database");
  }
};
exports.registerAssistant = async (req, res) => {
  console.log(" we got here");
  const { email, firstName, lastName } = req.body;

  let branch;
  if (req.body.branch) {
    branch = req.body.branch;
  }
  console.log("the user Type", req.user);
  if (req.user.userType == 1 || req.user.userType == 4) {
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
      console.log("email already exist");
      return res.status(409).send("Email address is already registered");
    } else {
      try {
        function generateOTP() {
          return crypto.randomInt(100000, 999999);
        }

        let code = generateOTP();

        // Register the email in the user table

        console.log("data for the req.user", req.user);
        const createrId = req.user.id;

        const creater = await User.findOne({ where: { id: createrId } });
        console.log("creater is the", creater);
        // Register the email in the company table
        User.create({
          id: "",
          email: email,
          firstName: firstName,
          lastName: lastName,
          userType: 5,
          CompanyId: creater.CompanyId,
          managerId: createrId,

          // Other company properties...
        })
          .then(async (data) => {
            try {
              console.log("in the try");
              sendVerificationEmail(email, code);
            } catch (err) {
              console.error("Error sending verification email:", err);
              return res.status(500).send("Error sending verification email");
            }
          })
          .then(async () => {
            // const saltRounds = 10;
            // const salt = bcrypt.genSaltSync(saltRounds);
            // const hashedCode = bcrypt.hashSync(code, salt);

            const saltRounds = 10;
            const salt = bcrypt.genSaltSync(saltRounds);
            const codeString = code.toString();
            const hashedCode = await bcrypt.hashSync(codeString, salt);
            console.log("hashed code", hashedCode);
            Passcode.create({
              id: "",
              email: email,
              otp: hashedCode,
            });
          })
          .then((data) => {
            return res
              .status(200)
              .send(
                "Successfully registere produrment and sent OTP to the company email"
              );
          })
          .catch((err) => {
            console.error("Error:", err);
            return res.status(500).send("Error in database");
          });
      } catch (err) {
        console.error("Email sending error", err);
        return res.status(400).send("Unknown email error");
      }
    }
  } else {
    return res.status(403).send("anutherizwed access");
  }
};
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const passcodes = await Passcode.findAll({
      where: { email },
    });

    if (passcodes.length === 0) {
      console.log("email not found");
      return res.status(400).send("Email not found");
    }

    let isMatch = false;
    for (const passcode of passcodes) {
      console.log("verifying");
      isMatch = await bcrypt.compare(otp, passcode.otp);

      if (isMatch) {
        break; // Exit the loop if the OTP is correct
      }
    }

    if (!isMatch) {
      console.log("otp not correct");
      return res.status(404).send("OTP not correct");
    }

    if (isMatch) {
      const user = await User.findOne({
        where: { email },
      });

      if (!user) {
        return res.status(400).send("user not found");
      }
      if (user) {
        console.log("we got it");
        const payload = { id: user.id };
        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1d",
        });
        console.log("token send to cookie", token);
        res.cookie("ot", token, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          maxAge: 86400000,
        });
        return res.status(200).json({ userType: user.userType });
      }
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
exports.resendOPT = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email: email } });
  if (!user) {
    return res.status(404).send("user not found");
  }
  if (user) {
    try {
      function generateOTP() {
        return crypto.randomInt(100000, 999999);
      }

      let code = generateOTP();

      console.log("in the try");
      sendVerificationEmail(email, code);
      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const codeString = code.toString();
      const hashedCode = await bcrypt.hashSync(codeString, salt);
      console.log("hashed code", hashedCode);
      Passcode.create({
        id: "",
        email: email,
        otp: hashedCode,
      });
      return res.status(200).send("Successfully sent OTP");
    } catch (err) {
      console.log("Error in sending email ");
      return res.status(404).send("error ", err);
    }
  } else {
    console.log("email not found");
    res.status(401).send("user not  found");
  }
};
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.log("email or password not found");
    return res.status(404).send("email not found ");
  }
  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    if (user) {
      const databasePass = user.password;
      const userType = user.userType;

      // isMatch = await bcrypt.compare(otp, passcode.otp);
      const compare = await bcrypt.compare(password, databasePass);
      if (compare) {
        console.log("data cookie sent", user.email, user.userType);
        const payload = { id: user.id, userType: user.userType };
        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "30d",
        });
        console.log("token send to cookie", token);
        res.cookie("u", token, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          maxAge: 2592000000,
        });
        console.log("logged in");
        const { id, email, firstName, lastName, userType } = user;

        // Create a new object with the extracted properties
        const userData = { id, email, firstName, lastName, userType };

        return res.status(200).json({ userData });
      } else {
        return res.status(401).send("password not correct");
      }
    } else {
      return res.status(404).send("User not found");
    }
    // Authentication successful, do something with the user
  } catch (error) {
    console.log(error);
    return res.status(404).send("Unknown error");
    // Authentication failed, handle the error
  }
};
exports.logout = async (req, res) => {
  console.log("you are logged out");
  try {
    // Clear the user's session cookie
    res.clearCookie("u");

    // Return a success response
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    // Return an error response
    return res.status(500).json({ message: "Failed to logout", error });
  }
};

exports.setPassword = async (req, res) => {
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

          const payload = { id: user.id, userType: user.userType };
          const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "30d",
          });
          console.log("token send to cookie", token);
          res.cookie("u", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 2592000000,
          });
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

          const payload = { id: user.id, userType: user.userType };
          const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "30d",
          });
          console.log("token send to cookie", token);
          res.cookie("u", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 2592000000,
          });
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
