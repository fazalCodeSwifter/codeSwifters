import pool from "../db/db.js";

export const isAdmin = async (req, res, next) => {
  const connection = await pool.getConnection();
  const { role } = req.user;

  try {
    const getAdminQuery = "SELECT * FROM users WHERE role = ? LIMIT 1";
    const [isAdmin] = await connection.query(getAdminQuery, [role]);

    if (isAdmin[0].role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "only admin can access!",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong!",
      originalError: error.message,
    });
  } finally {
    connection.release();
  }
};
