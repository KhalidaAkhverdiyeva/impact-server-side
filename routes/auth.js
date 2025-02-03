const express = require('express');

const { AuthRegister, AuthLogin, ForgotPassword, resetPassword } = require("../controllers/UserController");

const router = express.Router();

router.post("/signup", AuthRegister);
router.post("/login", AuthLogin);
router.post('/forgot-password', ForgotPassword)
router.put('/reset-password/:token', resetPassword);
// router.get('/reset-password/:token', (req, res) => {
//     res.redirect(`/reset-password/${req.params.token}`);
// });



module.exports = router;