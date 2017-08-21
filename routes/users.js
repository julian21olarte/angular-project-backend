var express = require('express');
var userController = require('../controllers/user.js');
var router = express.Router();

/* GET users listing. */
router.get('/', userController.getUsers);




/* POST users listing. */
router.post('/register', userController.saveUser);
router.post('/login', userController.login);


module.exports = router;
