import express from 'express';
import { verfiyAdmin, verifyToken, verfiyWholeSeller } from '../../utils/verifyToken';
import { addTVC, deleteTVC, getAllTVC, getTVC, updateTVC , getTvcByCategory, addTVCWithCoverImage } from '../controllers/tvcController';
import multer from 'multer';
import DateTime from '../../utils/constant/getDate&Time';
import path from 'path';
import fs from 'fs';
import { TVC } from '../models/TVC';

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '../assests/images/tvc')
      // cb(null, './src/assests/images/tvc')
    },
    filename: async function (req, file, cb) {
      const coverImageName = file.originalname.split('.')[0] + "-" + Date.now() + path.extname(file.originalname);
      if(req.query.TVC_Id){
        //update---->
        const getTVC= await TVC.findOne({
            where:{
                id: req.query.TVC_Id
            }
        });
        const __dirname = path.resolve();
        const p = path.join(__dirname,"../assests/images/tvc/",getTVC.coverImageName);
        // const p = path.join(__dirname,"./src/assests/images/tvc/",getTVC.coverImageName);
        // console.log("Path ::>>", p);
        fs.access(p, fs.constants.F_OK, (err) => {
            if (err) {
            //   console.error('File does not exist or cannot be accessed.');
            } else {
            //   console.log('File exists.');
            fs.unlinkSync(p);
            }
        });
        const updateTVC = await TVC.update({
            TVC_Name:req.query.TVC_Name,
            TVC_Link:req.query.TVC_Link,
            TVC_Category: req.query.TVC_Category,
            coverImageName:coverImageName,
            coverImagePath:`/tvc/${coverImageName}`,
            status:req.query.status,
            updateByStaff: req.user.data.name,
            updatedIstAt:DateTime()
        },{
            where:{
                id:req.query.TVC_Id
            }
        });
        req.newTVC = updateTVC;
      }
      else{
        //add---->
        const tvcObj = {
            TVC_Name:req.query.TVC_Name,
            TVC_Link:req.query.TVC_Link,
            TVC_Category: req.query.TVC_Category,
            coverImageName:coverImageName,
            coverImagePath:`/tvc/${coverImageName}`,
            status:req.query.status,
            updateByStaff: req.user.data.name,
            createdIstAt:DateTime(),
            updatedIstAt:DateTime()
          };
          const newTVC= await TVC.create(tvcObj);
          req.newTVC = newTVC;
      }
      cb(null, coverImageName)
    }
  })
  
  const upload = multer({ storage: storage })

//without-- cover image of tvc
// router.post('/addTvc', verifyToken, verfiyAdmin, addTVC);
//with cover  
router.post('/addTVC', verifyToken,verfiyAdmin, upload.single('image'),addTVCWithCoverImage);
router.put('/updateTvc', verifyToken, verfiyAdmin, updateTVC);
router.post('/getTvc', verifyToken, verfiyAdmin, getTVC);
router.post('/getAllTvc', verifyToken, verfiyAdmin, getAllTVC);
router.delete('/deleteTvc', verifyToken, verfiyAdmin, deleteTVC);
router.post('/get-Tvc-By-Category', verifyToken, verfiyAdmin, getTvcByCategory);


export default router;