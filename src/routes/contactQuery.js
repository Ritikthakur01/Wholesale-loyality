import express from 'express';
import multer  from 'multer';
import { verfiyAdmin, verifyToken } from '../../utils/verifyToken';
import { addQuery, addQueryImages, exportContactQuery, getAllContactQuery, replyOfContactQuery } from '../controllers/contactQueryController';
import { createError } from '../../utils/error';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../assests/images/contactQuery')
        // cb(null, './src/assests/images/contactQuery')
    },
    filename: function (req, file, cb) {
        const fArr = file.originalname.split('.');
        const imageName = fArr[0]+"-"+Date.now()+path.extname(file.originalname);
        const imagePath = `/contactQuery/${imageName}`;
        if(!req.images){
            req.images = [];
        }
        const object = {
            imageName,
            path:imagePath
        }
        req.images.push(object);
      cb(null, imageName)
    }
  })

  // File filter function to allow only text and image files
const fileFilter = (req, file, cb) => {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|gif|txt/;
    // Check file extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check MIME type
    const mimetype = filetypes.test(file.mimetype);
  
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .txt and image files are allowed!'));
    }
  };
  
  const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
 })

const Router = express();

const imageHelperCheck = (req, res, next)=>{
    try {
        const { imageCount } = req.query;
        if(!imageCount || imageCount<=0 || imageCount>5){
            return next(createError(403, imageCount<=0 ? `Please Select Images first for Query` : `Maximum 5 images allowed for query`));
        }
        next();
    } catch (error) {
        console.log("Query Images Error :>>",error);
        next(error);
    }
}

Router.post('/addQueryImages', imageHelperCheck, upload.array('query'), addQueryImages);
Router.post('/addQuery', addQuery);
Router.post('/allQueries', verifyToken, verfiyAdmin, getAllContactQuery);
Router.post('/exportContactQueries',  exportContactQuery);
Router.post('/replyToQueryInMail',  replyOfContactQuery);

export default Router;