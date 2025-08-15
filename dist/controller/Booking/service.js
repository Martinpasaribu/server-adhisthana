"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapVillaToClass = mapVillaToClass;
// Fungsi helper untuk mapping nameVilla → class
function mapVillaToClass(nameVilla) {
    const name = (nameVilla === null || nameVilla === void 0 ? void 0 : nameVilla.toLowerCase()) || '';
    if (name.includes("garden pool villa")) {
        if (name.includes("deluxe"))
            return "Deluxe";
        return "Superior";
    }
    if (name.includes("residence"))
        return "Residence";
    return "Unknown";
}
