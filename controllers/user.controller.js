import pool from "../db/db.js";

export const userController = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const findUserQuery =
      "SELECT id, username, email, role FROM users WHERE id = ? LIMIT 1";
    const [existUser] = await connection.query(findUserQuery, [req.user.id]);
    const userData = existUser[0];

    return res.status(200).json({
      success: true,
      message: "fetched user successfully.",
      data: userData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong!",
      originalError: error.message,
    });
  } finally {
    await connection.release();
  }
};
