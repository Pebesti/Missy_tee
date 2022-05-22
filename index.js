// add code in here to create an API with ExpressJS
require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

const GarmentManager = require("./shop/garment-manager");
const UserManager = require("./shop/user-manager");
const ShoppingCart = require("./shop/shopping-cart");
const pg = require("pg");
const Pool = pg.Pool;
const bcrypt = require("bcrypt");

// enable the static folder...
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// import the dataset to be used here

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://missy_tee:missy123@localhost:5432/missy_tee_app";

const pool = new Pool({
  connectionString,
});

const garmentManager = GarmentManager(pool);
const userManager = UserManager(pool);
const shoppingCart = ShoppingCart(pool);

const PORT = process.env.PORT || 4017;

// API routes to be added here

app.get("/api/garments", async function (req, res) {
  const gender = req.query.gender;
  const season = req.query.season;

  const filteredGarments = await garmentManager.filter({
    gender,
    season,
  });

  res.json({
    garments: filteredGarments,
  });
});

app.get("/api/garments/price/:price", async function (req, res) {
  const maxPrice = Number(req.params.price);
  const filteredGarments = await garmentManager.filterByPrice(maxPrice);

  res.json({
    garments: filteredGarments,
  });
});

app.post("/api/garments", async function (req, res) {
  // get the fields send in from req.body
  const { description, img, gender, season, price } = req.body;

  // add some validation to see if all the fields are there.
  // only 3 fields are made mandatory here
  // you can change that

  if (!description || !img || !price) {
    res.json({
      status: "error",
      message: "Required data not supplied",
    });
  } else {
    // you can check for duplicates here using garments.find

    // add a new entry into the garments list

    const result = await garmentManager.addGarment(
      description,
      img,
      season,
      gender,
      price
    );

    if (result > 0) {
      res.json({
        status: "success",
        message: "New garment added.",
      });
    } else {
      res.json({
        status: "error",
        message: "New garment could not be added.",
      });
    }
  }
});

app.post("/api/login", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const account = await userManager.getUserByID(username);

  if (account && bcrypt.compareSync(password, account.password)) {
    const user = {
      name: account.username,
      role: account.user_role,
      userId: account.id,
    };
    const accessKey = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "24h",
    });

    res.json({ key: accessKey });
  } else {
    res.sendStatus(401);
  }
});

app.get("/api/users", authenticateToken, async function (req, res) {
  const usersList = await userManager.getUsers();
  res.json(usersList);
});

app.get("/api/users/:id", authenticateToken, async (req, res) => {
  const username = req.params.id;

  if (!username) {
    res.json(await userManager.getUserByID(username));
  } else {
    res.json(null);
  }
});

app.post("/api/users", authenticateToken, async (req, res) => {
  const { first_name, last_name, password, email, username, user_role } =
    req.body;

  if (
    !first_name ||
    !last_name ||
    !password ||
    !email ||
    !username ||
    !user_role
  ) {
    res.json({
      status: "error",
      message: "Required data not supplied",
    });
  } else {
    const passwordHash = bcrypt.hashSync(password, 10);

    const result = await userManager.registerUser(
      first_name,
      last_name,
      passwordHash,
      email,
      username,
      user_role
    );

    if (result > 0) {
      res.json({
        status: "success",
        message: "User saved",
      });
    } else {
      res.json({
        status: "error",
        message: "User not saved",
      });
    }
  }
});

app.post("/api/users/:id", authenticateToken, async function (req, res) {
  const username = req.params.id;
  const { first_name, last_name, password, email, user_role } = req.body;

  if (
    !first_name ||
    !last_name ||
    !password ||
    !email ||
    !username ||
    !user_role
  ) {
    res.json({
      status: "error",
      message: "Required data not supplied",
    });
  } else {
    const passwordHash = bcrypt.hashSync(password, 10);
    const result = await userManager.updateUser(
      first_name,
      last_name,
      passwordHash,
      email,
      username,
      user_role
    );

    if (result > 0) {
      res.json({
        status: "success",
        message: "User Updated",
      });
    } else {
      res.json({
        status: "error",
        message: "User not found",
      });
    }
  }
});

app.get("/api/cart", authenticateToken, async (req, res) => {
  res.json({
    carts: await shoppingCart.carts(req.user.userId),
  });
});

app.get("/api/cart/:id", authenticateToken, async (req, res) => {
  const cartId = req.params.id;

  res.json({
    cart: await shoppingCart.getCart(req.user.userId, cartId),
  });
});

app.post("/api/cart/", authenticateToken, async (req, res) => {
  const cartId = req.body.id;
  const itemID = req.body.garment_id;
  const qty = req.body.qty;

  res.json({
    cart: await shoppingCart.addCart(req.user.userId),
  });
});

app.post("/api/cart/add", authenticateToken, async (req, res) => {
  const cartId = req.body.id;
  const itemID = req.body.garment_id;
  const qty = req.body.qty;

  res.json({
    cart: await shoppingCart.addToCart(req.user.userId, cartId, itemID, qty),
  });
});

app.post("/api/cart/checkout", authenticateToken, async (req, res) => {
  const cartId = await shoppingCart.getCurrentCart(req.user.user_id);

  res.json({
    cart: await shoppingCart.checkOut(cartId),
  });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ");

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token[0], process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      res.sendStatus(403);
    } else {
      req.user = user;
      next();
    }
  });
}

app.listen(PORT, function () {
  console.log(`App started on port ${PORT}`);
});
