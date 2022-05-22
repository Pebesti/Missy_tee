module.exports = function GarmentManager(pool) {
  async function getList() {
    const result = await pool.query(`select * from garment`);
    return result.rows;
  }

  async function filterByPrice(price) {
    if (price) {
      sql = "select * from garment where price < $1";
    }
    const result = await pool.query(sql, [price]);
    return result.rows;
  }

  async function filter({ season, gender }) {
    if (gender != "All" && season != "All") {
      const result = await pool.query(
        "select * from garment where season = $1 and gender = $2",
        [season, gender]
      );
      return result.rows;
    } else if (gender != "All") {
      // if gender was supplied
      sql = "select * from garment where gender = $1";
      const result = await pool.query(
        "select * from garment where gender = $1",
        [gender]
      );
      return result.rows;
    } else if (season != "All") {
      // if season was supplied
      const result = await pool.query(
        "select * from garment where season = $1",
        [season]
      );
      return result.rows;
    }

    const result = await pool.query("select * from garment");
    return result.rows;
  }

  async function addGarment(description, img, season, gender, price) {
    const result = await pool.query(
      `insert into garment(description, img, season, gender, price) values($1,$2,$3,$4,$5);`,
      [description, img, season, gender, price]
    );

    return result.rowCount;
  }

  return {
    filter,
    getList,
    filterByPrice,
    addGarment,
  };
};
