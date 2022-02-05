const express= require('express');
const router = express.Router();
const feedController = require('../controllers/feed');
const isAuth = require('../middleware/isAuth');

router.get('/',feedController.getPosts);
router.get('/view/:postId',feedController.getPost);
router.post('/search',feedController.searchPost);
router.post('/create',isAuth,feedController.createPost);
router.get('/create',feedController.getcreatePost);
router.post('/edit/:postId',isAuth,feedController.updatePost);
router.get('/edit/:postId',isAuth,feedController.getupdatePost);
router.post('/delete/:postId',isAuth,feedController.deletePost);


module.exports = router;