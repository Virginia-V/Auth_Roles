const User = require("./models/User");
const Role = require("./models/Role");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { secret } = require("./config");

const generateAccessToken = (id, roles) => {
  const payload = {
    id,
    roles,
  };
  return jwt.sign(payload, secret, { expiresIn: "24h" });
};

class authController {
  async registration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Registration error", errors });
      }
      const { username, password } = req.body;
      const candidate = await User.findOne({ username });

      if (candidate) {
        return res
          .status(400)
          .json({ message: "User with such username already exists!" });
      }

      const hashPassword = bcrypt.hashSync(password, 7); // hash the password
      const userRole = await Role.findOne({ value: "ADMIN" });
      const user = new User({
        username,
        password: hashPassword,
        roles: [userRole.value],
      }); // create the user
      await user.save(); // save the user in the database
      return res.json({ message: "The user was successfully registered." });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: "Registration error" });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res
          .status(400)
          .json({ message: `Username ${username} was not found.` });
      }
      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: `Wrong Password` });
      }
      const token = generateAccessToken(user._id, user.roles);
      return res.json({ token });
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Login error" });
    }
  }

  async getUsers(req, res) {
    try {
      // const userRole = new Role(); // by default, the role is "USER"
      // const adminRole = new Role({ value: "ADMIN" });
      // await userRole.save(); // save the role in the database
      // await adminRole.save();
      const users = await User.find();
      res.json(users);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new authController();
