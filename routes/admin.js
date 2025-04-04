import express from 'express';
import * as adminController from '../controllers/admin.js';

const router = express.Router();

router.route('/')
   .get(adminController.getLogin) // GET request
   .post(adminController.postLogin); // POST request

router.get('/logout', adminController.logout); // GET request  

router.post('/changestatus', adminController.postChangeStatus); // ✅ Fixed function name

router.route('/addhotel')
      .get(adminController.getAddHotel) // GET request for hotel add page
      .post(adminController.postAddHotel); // POST request for hotel add to DB

router.route('/search')
      .get(adminController.getSearch) // GET request   
      .post(adminController.postSearch); // POST request

router.route('/update')
      .get(adminController.getUpdate); // ✅ Fixed comment (GET request)

router.route('/updateData')
      .post(adminController.updatePrevData); // Update previous data      

export default router;
