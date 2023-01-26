const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/Orders");
const { body, validationResult } = require("express-validator");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const jwtSecert = "moin";
router.post(
  "/createuser",
  [
    body("email").isEmail(),
    body("name").isLength({ min: 4 }),
    body("password", "Password is Short").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const salt = await bcrypt.genSalt(10);
    let setPassword = await bcrypt.hash(req.body.password, salt);
    try {
      await User.create({
        name: req.body.name,
        password: setPassword,
        email: req.body.email,
        location: req.body.location,
      }).then(res.json({ success: true }));
    } catch (error) {
      console.log(error);
      res.json({ success: false });
    }
  }
);

router.post(
  "/loginuser",
  [
    body("email").isEmail(),
    body("password", "Password is Short").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let email = req.body.email;
    try {
      let userdata = await User.findOne({ email });
      if (!userdata) {
        return res.status(400).json({ errors: "User Not Found" });
      }
      const pwdCompare = await bcrypt.compare(
        req.body.password,
        userdata.password
      );
      if (!pwdCompare) {
        return res.status(400).json({ errors: "Incorrect Password" });
      }
      const data = {
        user: {
          id: userdata.id,
        },
      };
      const authToken = jwt.sign(data, jwtSecert);
      return res.json({ success: true, authToken: authToken });
    } catch (error) {
      console.log(error);
      res.json({ success: false });
    }
  }
);
router.post("/foodData", (req, res) => {
  try {
    res.send([global.foodItems, global.foodCategory]);
  } catch (error) {
    console.log(error);
  }
});

router.post("/orderData", async (req, res) => {
  let data = req.body.order_data;
  await data.splice(0, 0, { Order_date: req.body.orderDate });
  let user_id = await Order.findOne({ email: req.body.email });
  if (user_id) {
    try {
      await Order.findOneAndUpdate(
        { email: req.body.email },
        {
          $push: { order_data: data },
        }
      ).then(() => {
        res.json({ success: true });
      });
    } catch (error) {
      console.log(error.message);
      res.send("Server Error", error.message);
    }
  } else {
    try {
      await Order.create({
        email: req.body.email,
        order_data: [data],
      }).then(() => {
        res.json({ success: true });
      });
    } catch (error) {
      console.log(error.message);
      res.send("Server Error", error.message);
    }
  }
});
router.post("/getOrderData", async (req, res) => {
  try {
    let eId = await Order.findOne({ email: req.body.email });
    res.json({ orderData: eId });
  } catch (error) {
    console.log(error.message);
    res.send("Error", error.message);
  }
});
module.exports = router;
