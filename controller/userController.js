import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import otpGenerator from "otp-generator";

import UserModel from "../model/model.js";

dotenv.config();

const jsonSecret = process.env.JWT_SECRET;

/**middleware for verify user */

export const verifyUser = async (req, res, next) => {
  try {
    // get username

    const { username } = req.method == "GET" ? req.query : req.body;

    // check the username existence

    let existingUser = await UserModel.findOne({ username });

    if (!existingUser) {
      return res.status(404).send({ error: "Username not found" });
    }
    next();
  } catch (error) {
    res.status(404).send({ error: "Authentication Error" });
  }
};

/**POST request for register user  http: //localhost:8000/api/register */

// export const register = async (req, res) => {
//   try {
//     // destructure the data from req body

//     const { username, email, password, profile } = req.body;

//     // existUsername check

//     const existUsername = new Promise((resolve, reject) => {
//       UserModel.find({ username }, (err, user) => {
//         if (err) reject(new Error(err));
//         if (user) reject({ error: "Username already exists" });
//         resolve();
//       });
//     });

//     // exist email check

//     const existEmail = new Promise((resolve, reject) => {
//       UserModel.find({ email }, (err, user) => {
//         if (err) reject(new Error(err));
//         if (user) reject({ error: "Email already exists" });
//         resolve();
//       });
//     });

//     // Call all promise

//     Promise.all([existUsername, existEmail]).then(() => {
//       if (password) {
//         bcrypt
//           .hash(password, 10)
//           .then((hashPassword) => {
//             const user = new UserModel({
//               username,
//               email,
//               password: hashPassword,
//               profile: profile || "",
//             });
//             user
//               .save()
//               .then((result) =>
//                 res
//                   .status(200)
//                   .send({ msg: "User Register Successfully", result })
//               )
//               .catch((err) => res.status(200).send({ err }));
//           })
//           .catch((err) => {
//             return res.status(500).send({ error: "Error while password hash" });
//           });
//       }
//     });
//   } catch (err) {
//     return res.status(500).send(err);
//   }
// };

export const register = async (req, res) => {
  try {
    const { username, password, profile, email } = req.body;

    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) {
      return res.status(400).send({ error: "Username already exists" });
    }

    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      return res.status(400).send({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({
      username,
      password: hashedPassword,
      profile: profile || "",
      email,
    });

    const savedUser = await user.save();

    res.status(201).send({ msg: "Registered Successfully", user: savedUser });
  } catch (error) {
    res.status(500).send({ error });
  }
};

/**POST request authenticate user  http: //localhost:8000/api/register */

export const authenticate = async (req, res) => res.end();

/**POST request for login user  http: //localhost:8000/api/login */

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // find username in db
    const findUsername = await UserModel.findOne({ username });

    if (!findUsername) {
      return res.status(404).send({ error: "Username not found" });
    }

    // compare password with hashed password
    const comparePassword = await bcrypt.compare(
      password,
      findUsername.password
    );

    if (!comparePassword) {
      return res.status(404).send({ error: "Password does not match" });
    }

    // token generation (payload, secretkey, expires)
    const token = jwt.sign(
      {
        userId: findUsername._id,
        username: findUsername.username,
      },
      jsonSecret,
      { expiresIn: "24h" }
    );

    return res.status(200).send({
      msg: "Login successful",
      username: findUsername.username,
      token,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

/**GET request for getting user  http: //localhost:8000/api/user/hari123 */

export const getUser = async (req, res) => {
  const { username } = req.params;

  try {
    if (!username) {
      return res.status(501).send({
        error: "Invalid Username",
      });
    }

    // find user in db

    const findUser = await UserModel.findOne({ username });
    if (!findUser) {
      return res.status(404).send({ error: "Username not found" });
    }

    // remove password from findUser

    const { password, ...withoutPassword } = findUser.toObject();
    return res.status(200).send(withoutPassword);
  } catch (error) {
    return res.status(404).send({ error: "Cannot find User Data" });
  }
};

/**PUT request for update User  http: //localhost:8000/api/updateuser/ */

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.user;

    if (!userId) {
      return res.status(400).send({ error: "User ID not provided" });
    }

    const body = req.body;

    // Update user data in the database
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      body,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send({ error: "User not found" });
    }

    return res.status(200).send({ msg: "Record Updated", user: updatedUser });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

/**GET request for generate OTP http: //localhost:8000/api/generateOTP */

export async function generateOTP(req, res) {
  req.app.locals.OTP = await otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  res.status(200).send({ code: req.app.locals.OTP });
}

/**GET request for verify OTP http: //localhost:8000/api/verifyOTP */

export const verifyOTP = async (req, res) => {
  const { code } = req.query;
  console.log(code);
  console.log("req app locals otp", req.app.locals.OTP);
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null;
    req.app.locals.resetSession = true;
    return res.status(200).send({ msg: "Verify successfully" });
  }
  return res.status(400).send({ error: "Invalid OTP" });
};

/**GET request for createResetSession http: //localhost:8000/api/createResetSession*/

export const createResetSession = async (req, res) => {
  if (req.app.locals.resetSession) {
    return res.status(200).send({ flag: req.app.locals.resetSession });
  }
  return res.status(440).send({ error: "Session Expired" });
};

/**PUT request for reset password http: //localhost:8000/api/createResetSession*/

export async function resetPassword(req, res) {
  try {
    if (!req.app.locals.resetSession)
      return res.status(440).send({ error: "Session expired!" });

    const { username, password } = req.body;

    console.log(username, password);

    try {
      const user = await UserModel.findOne({ username });
      if (!user) {
        return res.status(404).send({ error: "Username not found" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await UserModel.updateOne(
        { username: user.username },
        { password: hashedPassword }
      );

      req.app.locals.resetSession = false; // Reset session
      return res.status(200).send({ msg: "Record updated successfully!" });
    } catch (error) {
      return res.status(500).send({ error: "Failed to update password" });
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
}
