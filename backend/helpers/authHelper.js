const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.log(error);
  }
};

const comparePassword = async (password, hash) => {
  const isMatch = await bcrypt.compare(password, hash);
  return isMatch;
};

const generateTokenAndSetCookie = async (res, userId) => {
  const token = JWT.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "24h",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return token;
};

function getFormattedDateTime() {
  const now = new Date();

  // Options for formatting date and time
  const optionsDate = { year: "numeric", month: "2-digit", day: "2-digit" };
  const optionsTime = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };

  // Format date and time
  const date = now.toLocaleDateString("en-US", optionsDate);
  const time = now.toLocaleTimeString("en-US", optionsTime);

  return { date, time };
}

const { date, time } = getFormattedDateTime();

const crypto = require("crypto");

function generateRandomString(length) {
  return crypto
    .randomBytes(length)
    .toString("base64") // You can use 'hex', 'base64', etc.
    .slice(0, length); // Trim to the desired length
}

module.exports = {
  hashPassword,
  comparePassword,
  generateTokenAndSetCookie,
  getFormattedDateTime,
  generateRandomString,
};
