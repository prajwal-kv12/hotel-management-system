import express from 'express';
import * as userController from '../controllers/user.js'; // ✅ FIXED

const router = express.Router();

router.get('/', userController.getHome); // Home page 

router.route('/login')
       .get(userController.getLogin) // GET request for login
       .post(userController.postLogin); // POST request for login

router.route('/createaccount') 
       .get(userController.getCreateAccount) // GET request for account creation   
       .post(userController.postCreateAccount); // POST request for account creation  

router.route('/category')
       .get(userController.authentication, userController.getCategory) // GET request for category  
       .post(userController.postCategory); // POST request from the category

router.route('/booking') // ✅ FIXED typo (was 'boooking')
       .post(userController.postBooking); // POST booking data    

router.route('/status')
       .post(userController.postStatus); 

router.route('/showStatus')
       .get(userController.authentication, userController.getShowStatus); // GET show status

router.post('/deletereq', userController.deleteBooking, userController.getShowStatus);

router.get('/contact', userController.getContact);       

router.get('/logout', userController.logout); // Logout       


export default router;
