import Admin from "../models/Admin.model.js";
import Faculty from "../models/Faculty.model.js";
import Student from "../models/Student.model.js";
import jwt from "jsonwebtoken";
import { hashPassword } from "../config/bcrypt.js";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "1d",
  });
};

const isBcryptHash = (value) =>
  typeof value === "string" &&
  /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);

export const login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    let user;
    if (role === "admin") {
      user = await Admin.findOne({ email });
    } else if (role === "faculty") {
      user = await Faculty.findOne({ email });
    } else if (role === "student") {
      user = await Student.findOne({ email });
    } else {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    let isMatch = await user.comparePassword(password);

    // Backward compatibility for legacy seeded data where password was stored in plain text.
    // On first successful login, migrate it to a bcrypt hash.
    if (!isMatch && !isBcryptHash(user.password) && user.password === password) {
      user.password = await hashPassword(password);
      await user.save();
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = generateToken(user._id, role);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during login." });
  }
};

export const register = async (req, res) => {
  const { email, password, name, role, department, rollNumber } = req.body;
      console.log(req.body);


  try {
    if (role !== "faculty" && role !== "student") {
      return res.status(400).json({
        message: "Registration only allowed for faculty and student roles.",
      });
    }

    // Check if user already exists
    let existingUser;
    if (role === "faculty") {
      existingUser = await Faculty.findOne({ email });
    } else if (role === "student") {
      existingUser = await Student.findOne({
        $or: [{ email }, { rollNumber }],
      });
    }

    if (existingUser) {
      return res
        .status(400)
        .json({
          message: "User with this email or roll number already exists.",
        });
    }

    // Create new user based on role
    let newUser;
    if (role === "faculty") {
      newUser = await Faculty.create({
        email,
        password,
        name,
        department,
      });
    } else if (role === "student") {
      if (!rollNumber) {
        return res
          .status(400)
          .json({ message: "Roll number is required for students." });
      }
      newUser = await Student.create({
        email,
        password,
        name,
        rollNumber,
        department,
      });
    }

    const token = generateToken(newUser._id, role);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: role,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    // Handle MongoDB duplicate key error specifically
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Duplicate entry found in database." });
    }
    return res
      .status(500)
      .json({ message: "Internal server error during registration." });
  }
};
