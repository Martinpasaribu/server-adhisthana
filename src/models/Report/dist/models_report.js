"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var ReportSchema = new mongoose_1.Schema({
    villa: [{
            roomId: { type: String },
            type: { type: String },
            name: { type: String },
            status1: { type: String },
            status2: { type: String },
            r_receptionist: { type: String },
            r_housekeeping: { type: String }
        }],
    incharge: {
        type: String,
        trim: true
    },
    mu_checkout: {
        type: String,
        trim: true
    },
    mu_extend: {
        type: String,
        trim: true
    },
    request: {
        type: String,
        trim: true
    },
    complain: {
        type: String,
        trim: true
    },
    lf: {
        type: String,
        trim: true
    },
    createAt: {
        type: Number,
        "default": Date.now
    },
    creatorId: {
        type: String,
        required: false
    },
    isDeleted: {
        type: Boolean,
        "default": false
    }
}, {
    timestamps: true
});
var ReportModel = mongoose_1["default"].model('ReportRoom', ReportSchema, 'ReportRoom');
exports["default"] = ReportModel;
