const express= require('express');
const router = express.Router();

const authController = require('../controllers/auth');

router.get('/signup',authController.getsignup);
router.get('/login',authController.getlogin);
router.post('/signup',authController.postsignup);
router.post('/login',authController.postlogin);
router.post('/logout',authController.postlogout);
module.exports = router;