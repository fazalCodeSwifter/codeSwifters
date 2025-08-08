import bcrypt from "bcrypt";
import pool from "../db/db.js";
import GenrateToken from "../utils/genrateTokens.utils.js";

export const registerController = async (req, res) => {
  const { username, email, password } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "all feilds are required!",
      });
    }

    const checkUserQuery = "SELECT id FROM users WHERE email = ? LIMIT 1";
    const [existingUser] = await connection.query(checkUserQuery, [email]);

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "this email already exist!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertUserQuery =
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    await connection.query(insertUserQuery, [
      username.trim(),
      email,
      hashedPassword,
    ]);

    connection.commit();
    return res.status(200).json({
      success: true,
      message: "user created successfully!",
    });
  } catch (error) {
    console.log(error);
    connection.rollback();
    return res.status(500).json({
      success: false,
      message: "something went wrong!",
    });
  } finally {
    await connection.release();
  }
};

export const loginController = async (req, res) => {
  const { email, password } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "all feilds are required!",
      });
    }

    const ifNotExistEmailQuery = "SELECT * FROM users WHERE email = ? LIMIT 1";
    const [emailExist] = await connection.query(ifNotExistEmailQuery, [email]);

    const user = emailExist[0];

    if (!emailExist.length > 0) {
      return res.status(400).json({
        success: false,
        message: "wrong email or password!",
      });
    }

    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      return res.status(400).json({
        success: false,
        message: "wrong email or password!",
      });
    }

    const accessToken = GenrateToken.accessToken({
      user_id: user.id,
    });

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    return res.status(200).json({
      success: true,
      message: "user logged in successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "something went wrong!",
    });
  } finally {
    await connection.release();
  }
};
