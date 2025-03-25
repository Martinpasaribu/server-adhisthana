import express, { Request, Response, NextFunction } from "express";
import { BookingController } from "../controller/Booking/controller_booking";
import activityLogger from "../middleware/LogAPI";
import { TransactionController } from "../controller/Transaction/controller_transaction";
import { verifyID } from "../middleware/VerifyId";
import { verifyToken } from "../middleware/VerifyToken";

const TransactionRouter: express.Router = express.Router();




// semantic meaning


TransactionRouter.get("/get-transaction/:transaction_id", TransactionController.getTransactionsById);

TransactionRouter.get("/get-transaction-user/:user", verifyID , verifyToken, TransactionController.getTransactionsByUser);

TransactionRouter.get("/get-transaction-user", verifyID , verifyToken, TransactionController.getTransactionsByMember);

TransactionRouter.get("/update-status-failed/:order_id", TransactionController.updateTransactionFailed);

TransactionRouter.post("/notification", TransactionController.TrxNotif);

TransactionRouter.post("/test", TransactionController.TestSendEmailTransaction);




// TransactionRouter.get("/getContact", BookingController.getContact)

// TransactionRouter.post("/addSubscribe", BookingController.addSubscribe);


export default TransactionRouter;
