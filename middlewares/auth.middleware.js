import jwt from "jsonwebtoken";
import pool from "../db/db.js";

export const isAuth = async (req, res, next) => {
  const connection = await pool.getConnection();
  const token = req.cookies["accessToken"];
  try {
    if (!token) {
      return res.status(422).json({
        success: false,
        message: "token is required!",
      });
    }

    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const ifUserExistQuery = "SELECT id, role FROM users WHERE id = ? LIMIT 1";
    const [existUser] = await connection.query(ifUserExistQuery, [
      decodeToken.user_id,
    ]);
    const userData = existUser[0];

    if (existUser.length === 0) {
      return res.status(422).json({
        success: false,
        message: "user not found!",
      });
    }

    req.user = userData;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token Expired!",
        originalError: error.message,
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({
        success: false,
        message: "Token: must be a valid Token!",
        originalError: error.message,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "something went wrong!",
        originalError: error.message,
      });
    }
  } finally {
    await connection.release();
  }
};
