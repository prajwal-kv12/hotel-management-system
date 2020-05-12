const express = require('express');
const path = require('path');


const router = express.Router();

const userControler = require('../controllers/user');

router.get('/',userControler.getHome); //home page 
router.route('/login')
       .get(userControler.getLogin) // get request for login


router.route('/createaccount') 
       .get(userControler.getCreateAccount)   //get request for create account   
       .post(userControler.postCreateAccount); //post request for create account   


module.exports = router;