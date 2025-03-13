import express, { Request, Response, NextFunction } from "express";

import { verifyAdmin } from "../../middleware/VerifyAdminId";
import { LoggingController } from "../../controller/Admin/Logging/controller_Logging";

const LoggingRouter: express.Router = express.Router();




// semantic meaning

LoggingRouter.get("/get-logging",verifyAdmin , LoggingController.GetAllLogging); 
LoggingRouter.get("/get-pagination",verifyAdmin , LoggingController.GetLogsPagination); 




export default LoggingRouter;
