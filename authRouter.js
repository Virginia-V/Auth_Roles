const Router = require("express");
const router = Router();
const controller = require("./authController");
const check = require("express-validator").check;
const authMiddleware = require("./middlewares/authMiddleware");
const roleMiddleware = require("./middlewares/roleMiddleware");

router.post(
  "/registration",
  [
    check("username", "Username should not be empty!").notEmpty(),
    check(
      "password",
      "Password should be more than 4 and less than 10 symbols"
    ).isLength({ min: 4, max: 10 }),
  ],
  controller.registration
);
router.post("/login", controller.login);
router.get("/users", roleMiddleware(["ADMIN"]), controller.getUsers);
// router.get("/users", authMiddleware, controller.getUsers);

module.exports = router;
