var express = require('express');
var userController = require('../controllers/user.js');
var router = express.Router();
var md_auth = require('../middlewares/authenticate');
var multiparty = require('connect-multiparty');

var md_upload = multiparty({ uploadDir: './uploads/users' });

/* GET users listing. */
router.get('/', userController.getUsers);
router.get('/get-image-file/:imageFile', userController.getImageFile);




/* POST users listing. */
router.post('/register', userController.saveUser);
router.post('/login', userController.login);
router.post('/test-auth', md_auth.ensureAuth, userController.testAuth);
router.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], userController.uploadImage);

/**
 * PUT users listing
 */
router.put('/update-user/:id', md_auth.ensureAuth, userController.updateUser);



module.exports = router;
