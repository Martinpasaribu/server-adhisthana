"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const activityLogger = (req, res, next) => {
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
exports.default = activityLogger;
