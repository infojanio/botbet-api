"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSignalsRoutes = generateSignalsRoutes;
const generate_signals_controller_1 = require("../controllers/generate-signals-controller");
const controller = new generate_signals_controller_1.GenerateSignalsController();
async function generateSignalsRoutes(app) {
    app.post('/signals/generate', (req, reply) => controller.run(req, reply));
}
