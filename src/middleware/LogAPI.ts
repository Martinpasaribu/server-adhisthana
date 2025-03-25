import express, { Request, Response, NextFunction } from "express";

const activityLogger = (req: Request, res: Response, next: NextFunction) => {
    
    console.log(`\n--- Log Aktivitas ---`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.originalUrl}`);
    console.log(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
    console.log(`Query: ${JSON.stringify(req.query, null, 2)}`);
    console.log(`Params: ${JSON.stringify(req.params, null, 2)}`);
    console.log(`Body: ${JSON.stringify(req.body, null, 2)}`);
    console.log(`Files: ${JSON.stringify(req.files, null, 2)}`);
    console.log(`--- End Log ---\n`);

    next();
};

export default activityLogger;
