module.exports = function UserManager(pool) {
  async function getUsers() {
    const result = await pool.query(`select * from system_user`);
    return result.rows;
  }

  async function getUserByID(username) {
    const result = await pool.query(
      `select * from system_user where username = $1`,
      [username]
    );
    return result.rowCount > 0 ? result.rows[0] : null;
  }

  async function registerUser(
    first_name,
    last_name,
    password,
    email,
    username,
    user_role
  ) {
    const result = await pool.query(
      `INSERT INTO system_user(first_name,last_name,password,email,username,user_role) VALUES($1,$2,$3,$4,$5,$6); `,
      [first_name, last_name, password, email, username, user_role]
    );

    return result.rowCount;
  }

  async function updateUser(
    first_name,
    last_name,
    password,
    email,
    username,
    user_role
  ) {
    const result = await pool.query(
      `UPDATE system_user SET 
      first_name = $1,
      last_name = $2,
      password = $3,
      email = $4,
      user_role = $5
      WHERE username = $6 `,
      [first_name, last_name, password, email, user_role, username]
    );
    return result.rowCount;
  }

  return {
    getUsers,
    getUserByID,
    registerUser,
    updateUser,
  };
};
