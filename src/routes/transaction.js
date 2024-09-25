import express from 'express';
import { addTransaction , updateTransaction , deleteTransaction , filterTransaction, getAllTransaction , getSortTransaction, getAllTransactionByPandF, toSellerGetAllTransactionByPandF, getTransactionByTransactionId, getTransactionBetweenDates} from "../controllers/transactionController.js";
import { verifyToken , verfiyAdmin, verfiyWholeSeller } from '../../utils/verifyToken';

const router = express.Router();

router.post('/addTransaction', verifyToken , verfiyAdmin ,addTransaction);
router.put('/updateTransaction', verifyToken , verfiyAdmin ,updateTransaction);
router.delete("/deleteTransaction", verifyToken , verfiyAdmin ,deleteTransaction);
router.get("/filterTransaction", verifyToken , verfiyAdmin ,filterTransaction);
router.get("/sortTransaction", verifyToken , verfiyAdmin , getSortTransaction)
router.get("/getAllTransaction", verifyToken , verfiyAdmin ,getAllTransaction);
router.post("/get-transaction-PandF", verifyToken , verfiyAdmin , getAllTransactionByPandF);
router.post("/gettransactionByTransactionId", verifyToken , verfiyWholeSeller , getTransactionByTransactionId);
router.post("/getTransactionBWDates", getTransactionBetweenDates);





export default router;
