import express from 'express';
import { addContactStaff, deleteContactStaff, getAllContactStaff, getContactStaff, getOnlyStaffEmail, updateContactStaff } from '../controllers/queryStaffController';

const Router = express();

Router.post('/addContactStaff', addContactStaff);
Router.post('/getContactStaff', getContactStaff);
Router.put('/updateContactStaff', updateContactStaff);
Router.delete('/deleteContactStaff', deleteContactStaff);
Router.post('/getAllContatStaff', getAllContactStaff);
Router.post('/getAllStaffEmail', getOnlyStaffEmail);

export default Router;