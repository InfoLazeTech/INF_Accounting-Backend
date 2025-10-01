const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const {
  registerValidation,
  loginValidation,
} = require("../validations/auth.validations");

router.post("/register", validate(registerValidation), auth.register);
router.post("/login", validate(loginValidation), auth.login);
// router.post('/logout', auth.logout);

module.exports = router;
