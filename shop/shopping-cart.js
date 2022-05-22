module.exports = function ShoppingCart(pool) {
  async function addCart(userId) {
    const result = await pool.query(
      `INSERT INTO cart(user_id,status) VALUES($1 ,$2); `,
      ["open", userId]
    );

    return result.rowCount;
  }
  async function addToCart(cartId, itemId, qty) {
    const result = await pool.query(
      `INSERT INTO shopping_cart(status,cart_id,garment_id,qty) VALUES($1,$2,$3,$4); `,
      ["added", cartId, itemId, qty]
    );

    return result.rowCount;
  }

  async function getCart(userId) {
    const result = await pool.query(
      `select * from cart where user_id= $1 AND status = 'open'`,
      [userId]
    );

    //if(result.)

    return result.rows;
  }

  async function carts(userId) {
    const result = await pool.query(`select * from cart where user_id = $1`, [
      userId,
    ]);
    return result.rows;
  }

  async function checkOut(cartId) {
    const result = await pool.query(
      `UPDATE cart SET status =$1 WHERE id = $2`,
      ["completed", cartId]
    );

    return result.rowCount;
  }

  return {
    addToCart,
    getCart,
    carts,
    checkOut,
    addCart,
  };
};
