"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signalsRoutes = signalsRoutes;
const signals_controller_1 = require("../controllers/signals-controller");
const controller = new signals_controller_1.SignalsController();
async function signalsRoutes(app) {
    app.get("/signals", (req, reply) => controller.list(req, reply));
}
