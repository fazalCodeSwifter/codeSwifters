import pool from "../db/db.js";

export const getAllOrders = async (req, res) => {
  const connection = await pool.getConnection();
  const { page = 0, limit = 0 } = req.query;
  try {
    let orders;
    if (page || limit) {
      const getAllOrdersQuery = `
        SELECT 
        orders.id AS orderID,
        users.id AS userID,
        users.username AS client_name,
        users.email AS email,
        products.title AS productName,
        products.price AS product_price,
        order_items.quantity AS quantity,
        (order_items.quantity * products.price) AS total_price
        FROM orders
        INNER JOIN users
            ON orders.user_id = users.id
        INNER JOIN order_items
            ON orders.id = order_items.order_id
        INNER JOIN products
            ON order_items.product_id = products.id
        LIMIT ? OFFSET ?
    `;
      const [getOrders] = await connection.query(getAllOrdersQuery, [
        +limit,
        +page,
      ]);
      orders = getOrders;
    } else {
      const getAllOrdersQuery = `
        SELECT 
        orders.id AS orderID,
        users.id AS userID,
        users.username AS client_name,
        users.email AS email,
        products.title AS productName,
        products.price AS product_price,
        order_items.quantity AS quantity,
        (order_items.quantity * products.price) AS total_price
        FROM orders
        INNER JOIN users
            ON orders.user_id = users.id
        INNER JOIN order_items
            ON orders.id = order_items.order_id
        INNER JOIN products
            ON order_items.product_id = products.id
    `;
      const [getOrders] = await connection.query(getAllOrdersQuery);
      orders = getOrders;
    }

    const groupOfOrders = {};
    for (let row of orders) {
      const {
        orderID,
        userID,
        client_name,
        email,
        productName,
        quantity,
        total_price,
        product_price,
      } = row;
      if (!groupOfOrders[orderID]) {
        groupOfOrders[orderID] = {
          orderID,
          userID,
          client_name,
          email,
          products: [],
        };
      }
      groupOfOrders[orderID].products.push({
        productName,
        quantity,
        total_price,
        product_price,
      });
    }

    const order = Object.values(groupOfOrders);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "orders not found!",
        data: order,
      });
    }

    return res.status(200).json({
      success: true,
      message: "fetched all orders successfully.",
      data: order,
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

export const getSingleOrder = async (req, res) => {
  const connection = await pool.getConnection();
  const { id } = req.params;
  try {
    const getSingleOrderQuery = `
        SELECT 
        orders.id AS orderID,
        users.id AS userID,
        users.username AS client_name,
        users.email AS email,
        products.title AS productName,
        products.price AS product_price,
        order_items.quantity AS quantity,
        (order_items.quantity * products.price) AS total_price
        FROM orders
        INNER JOIN users
            ON orders.user_id = users.id
        INNER JOIN order_items
            ON orders.id = order_items.order_id
        INNER JOIN products
            ON order_items.product_id = products.id
        WHERE orders.user_id = ?
    `;
    const [getOrders] = await connection.query(getSingleOrderQuery, [+id]);

    const groupOfOrders = {};
    for (let row of getOrders) {
      const {
        orderID,
        userID,
        client_name,
        email,
        productName,
        quantity,
        total_price,
        product_price,
      } = row;
      if (!groupOfOrders[orderID]) {
        groupOfOrders[orderID] = {
          orderID,
          userID,
          client_name,
          email,
          products: [],
        };
      }
      groupOfOrders[orderID].products.push({
        productName,
        quantity,
        total_price,
        product_price,
      });
    }

    const order = Object.values(groupOfOrders);

    if (getOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "orders not found!",
        data: getOrders,
      });
    }

    return res.status(200).json({
      success: true,
      message: "fetched all orders successfully.",
      data: order,
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

export const createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  const { id } = req.user;
  try {
    const { orders } = req.body;
    await connection.beginTransaction();

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Order data must be a valid Array required into this feilds are required! product_id, quantity",
      });
    }

    const insertOrderQuery = `INSERT INTO orders (user_id) VALUES (?)`;
    const [insertedId] = await connection.query(insertOrderQuery, [+id]);
    const orderedId = insertedId.insertId;

    if (!!orderedId) {
      for (let item of orders) {
        const productFindQuery = `SELECT price FROM products WHERE id = ?`;
        const [findProduct] = await connection.query(productFindQuery, [
          item.product_id,
        ]);

        console.log(findProduct[0]);

        const addOrderQuery =
          "INSERT INTO order_items (order_id, product_id, quantity, product_price, total_price) VALUES (?, ?, ?, ?, ?)";
        await connection.query(addOrderQuery, [
          orderedId,
          item.product_id,
          item.quantity,
          Number(findProduct[0].price),
          item.quantity * Number(findProduct[0].price),
        ]);
      }
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "your order placed successfully.",
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({
      success: false,
      message: "something went wrong!",
      originalError: error.message,
    });
  } finally {
    connection.release();
  }
};
