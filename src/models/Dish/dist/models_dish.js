"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var DishSchema = new mongoose_1.Schema({
    type: {
        type: String,
        trim: true
    },
    code: {
        type: String,
        trim: true
    },
    name: {
        type: String,
        trim: true
    },
    stock: {
        type: Number,
        "default": null
    },
    price: {
        type: Number,
        "default": null
    },
    desc: {
        type: String,
        "default": null,
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
var DishModel = mongoose_1["default"].model('Dish', DishSchema, 'Dish');
exports["default"] = DishModel;
