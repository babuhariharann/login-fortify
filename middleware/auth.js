import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.JWT_SECRET;

export const auth = async (req, res, next) => {
  try {
    // access authorize header to validate request
    const token = req.headers.authorization.split(" ")[1];

    const decodedToken = await jwt.verify(token, secretKey);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: "Authentication failed" });
  }
};

export const localVariables = (req, res, next) => {
  req.app.locals = {
    OTP: null,
    resetSession: false,
  };
  next();
};
