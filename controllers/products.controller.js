import pool from "../db/db.js";

export const geAlltProducts = async (req, res) => {
  const connection = await pool.getConnection();
  const { page = 0, limit = 0 } = req.query;

  try {
    let products;
    if (page || limit) {
      console.log("triger");

      const getAllProductsQuery = `SELECT * FROM products LIMIT ${limit} OFFSET ${page}`;
      const [existProduct] = await connection.query(getAllProductsQuery);
      products = existProduct;
    } else {
      const getAllProductsQuery = "SELECT * FROM products";
      const [existProduct] = await connection.query(getAllProductsQuery);
      products = existProduct;
    }

    return res.status(200).json({
      success: true,
      message: "fetched products successfully.",
      data: products,
    });
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

export const singleProduct = async (req, res) => {
  const connection = await pool.getConnection();
  const { id } = req.params;
  try {
    const getSingleProductQuery = `SELECT * FROM products WHERE id = ?`;
    const [existProduct] = await connection.query(getSingleProductQuery, [id]);
    if (existProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: "product not found!",
        data: existProduct,
      });
    }
    return res.status(200).json({
      success: true,
      message: "fetched product successfully.",
      data: existProduct,
    });
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

export const createProduct = async (req, res) => {
  const connection = await pool.getConnection();
  const { title, description, price, imageURL } = req.body;
  try {
    await connection.beginTransaction();
    if (!title || !description || !price || !imageURL) {
      return res.status(400).json({
        success: false,
        message: "all feilds are required!",
      });
    }
    if (typeof price !== "number") {
      return res.status(400).json({
        success: false,
        message: "price must be number only!",
      });
    }

    const createProductQuery =
      "INSERT INTO products (title, description, price, imageURL) VALUES (?, ?, ?, ?)";
    const [createdProduct] = await connection.query(createProductQuery, [
      title.trim(),
      description.trim(),
      Number(price),
      imageURL.trim(),
    ]);

    connection.commit();

    return res.status(200).json({
      success: true,
      message: "product create successfully.",
    });
  } catch (error) {
    connection.rollback();
    return res.status(500).json({
      success: false,
      message: "something went wrong!",
      originalError: error.message,
    });
  } finally {
    connection.release();
  }
};

export const updateProduct = async (req, res) => {
  const connection = await pool.getConnection();
  const { title, description, price, imageURL } = req.body;
  const { id } = req.params;
  try {
    await connection.beginTransaction();
    if (!title || !description || !price || !imageURL) {
      return res.status(400).json({
        success: false,
        message: "all feilds are required!",
      });
    }
    if (typeof price !== "number") {
      return res.status(400).json({
        success: false,
        message: "price must be number only!",
      });
    }

    const updateProductQuery =
      "UPDATE products SET title = ?, description = ?, price = ?, imageURL = ?   WHERE id = ?";
    const [updateProduct] = await connection.query(updateProductQuery, [
      title.trim(),
      description.trim(),
      Number(price),
      imageURL.trim(),
      Number(id),
    ]);

    if (updateProduct.affectedRows === 0) {
      return res.status(422).json({
        success: false,
        message: "product not fount!",
      });
    }

    connection.commit();

    return res.status(200).json({
      success: true,
      message: "product update successfully.",
    });
  } catch (error) {
    connection.rollback();
    return res.status(500).json({
      success: false,
      message: "something went wrong!",
      originalError: error.message,
    });
  } finally {
    connection.release();
  }
};

export const deleteProduct = async (req, res) => {
  const connection = await pool.getConnection();
  const { id } = req.params;
  try {
    await connection.beginTransaction();

    const deleteProductQuery = "DELETE FROM products WHERE id = ?";
    const [deleteProduct] = await connection.query(deleteProductQuery, [id]);

    if (deleteProduct.affectedRows === 0) {
      return res.status(422).json({
        success: false,
        message: "product not fount!",
      });
    }

    connection.commit();

    return res.status(200).json({
      success: true,
      message: "product create successfully.",
      data: deleteProduct,
    });
  } catch (error) {
    connection.rollback();
    return res.status(500).json({
      success: false,
      message: "something went wrong!",
      originalError: error.message,
    });
  } finally {
    connection.release();
  }
};
