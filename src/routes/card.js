import express from 'express';
import { addCard, deleteCard, getAllCard, getCardById, updateCard } from '../controllers/cardController';
import multer from 'multer';
import path from 'path';
import { CardImage } from '../models/Card';
import fs from 'fs';
import DateTime from '../../utils/constant/getDate&Time';
import { createError } from '../../utils/error';


const router = express();

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, '../assests/images/card')
        // cb(null, './src/assests/images/card')
    },
    filename: async function (req, file, cb) {
      const fArr = file.originalname.split('.');
      const cardName = fArr[0]+"-"+Date.now()+path.extname(file.originalname);
      const cardPath = `/card/${cardName}`;
      const cardType = req.query.cardType;
      const status = req.query.status;
      const visibilityInDays = req.query.visibilityInDays;
      const cardObj = {
        cardName,
        cardPath,
        cardType,
        status,
        visibilityInDays,
        updateByStaff:req.user.data.name, 
        createdIstAt: DateTime(),
        updatedIstAt: DateTime(),
      };
       let [card, created] = await CardImage.findOrCreate({
        where:{
          cardType:cardType
        },
        defaults:cardObj,
        raw:true
       });
       if(!created){
        const __dirname = path.resolve();
        const p = path.join(__dirname,"../assests/images/card/",card.cardName);
        // const p = path.join(__dirname,"./src/assests/images/card/",card.cardName);
        // console.log("Path ::>>", p);
        fs.access(p, fs.constants.F_OK, (err) => {
            if (err) {
            //   console.error('File does not exist or cannot be accessed.');
            } else {
            //   console.log('File exists.');
            fs.unlinkSync(p);
            }
        });
        const {createdIstAt, ...rest} = cardObj;
        card = await CardImage.update({...rest},{
          where:{
            cardType:cardType
          }
        });
      }
      req.newCard =card;
      cb(null, cardName);
      }
});
// const storage = multer.diskStorage({
//     destination: function(req, file, cb){
//         cb(null, './src/assests/images/card')
//     },
//     filename: async function (req, file, cb) {
//       const fArr = file.originalname.split('.');
//       const cardName = fArr[0]+"-"+Date.now()+path.extname(file.originalname);
//         if(req.query.cardId){
//           const getCard = await CardImage.findOne({
//               where:{
//                   id:req.query.cardId
//               }
//           });
//           const __dirname = path.resolve();
//           const p = path.join(__dirname,"./src/assests/images/card/",getCard.cardName);
//           // console.log("Path ::>>", p);
//           fs.access(p, fs.constants.F_OK, (err) => {
//               if (err) {
//               //   console.error('File does not exist or cannot be accessed.');
//               } else {
//               //   console.log('File exists.');
//               fs.unlinkSync(p);
//               }
//           });
//           const cardPath = `/card/${cardName}`;
//           const cardType = req.query.cardType;
//           const status = req.query.status;
//           const visibilityInDays = req.query.visibilityInDays;
//           const cardObj = {
//             cardName,
//             cardPath,
//             cardType,
//             status,
//             visibilityInDays,
//             updateByStaff:req.user.data.name,
//             updatedIstAt: DateTime(),
//           };
//           const updateCard = await CardImage.update(cardObj,{
//               where:{
//                   id:req.query.cardId
//               }
//           });
//           req.newCard = updateCard;
//         }
//         else{
//             const cardPath = `/card/${cardName}`;
//             const cardType = req.query.cardType;
//             const status = req.query.status;
//             const visibilityInDays = req.query.visibilityInDays;
//             const cardObj = {
//               cardName,
//               cardPath,
//               cardType,
//               status,
//               visibilityInDays,
//               updateByStaff:req.user.data.name, 
//               createdIstAt: DateTime(),
//               updatedIstAt: DateTime(),
//             };
//             const newCard = await CardImage.create(cardObj);
//             req.newCard = newCard;
//         }
//         cb(null, cardName);
//       }
// });

const upload = multer({ storage: storage });

// const checkCard = async(req, res, next)=>{
//   const cardType = req.query.cardType;
//   // console.log("CardId ::>>",req.query.cardId);
//   if(req.query.cardId){
//     return next();
//   }
//   const getCard = await CardImage.findOne({
//     where:{
//       cardType
//     },
//     raw:true
//   });
//   // console.log("Get Card ::>>", getCard);
//   if(getCard){
//     return next(createError(403, `This type of ${cardType} Card Already has been added.`));
//   }
//   return next();
// };

router.post('/addCard', upload.single('card'), addCard);
router.post('/getCardById', getCardById);
router.put('/updateCardById', updateCard);
router.post('/deleteCard', deleteCard);
router.post('/getAllCard', getAllCard);

export default router;