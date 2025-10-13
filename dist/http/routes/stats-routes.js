"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsRoutes = statsRoutes;
const stats_controller_1 = require("../controllers/stats-controller");
const controller = new stats_controller_1.StatsController();
async function statsRoutes(app) {
    app.get("/stats", (req, reply) => controller.summary(req, reply));
}
