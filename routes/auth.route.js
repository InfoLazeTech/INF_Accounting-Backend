const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth.controller");
const validate = require('../middlewares/validate');
const {registerValidation, loginValidation, verifyOtpValidation, forgotPasswordValidation, resetPasswordValidation} = require('../validations/auth.validations');
const authToken = require("../middlewares/authToken");


router.post('/register', validate(registerValidation), auth.register);
router.post('/login', validate(loginValidation), auth.login);
router.post('/verify-otp', validate(verifyOtpValidation), auth.verifyOtp);
router.post('/forgot-password', validate(forgotPasswordValidation), auth.forgotPassword);
router.post('/verify-otp-forgotPassword', validate(verifyOtpValidation), auth.verifyOtpforPasswordforgot);
router.post('/reset-password', authToken, validate(resetPasswordValidation), auth.resetPassword);
// router.post('/logout', auth.logout);

module.exports = router;