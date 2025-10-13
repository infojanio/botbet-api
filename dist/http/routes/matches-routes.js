"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchesRoutes = matchesRoutes;
const matches_controller_1 = require("../controllers/matches-controller");
const controller = new matches_controller_1.MatchesController();
async function matchesRoutes(app) {
    app.get("/matches", (req, reply) => controller.list(req, reply));
    app.get("/matches/:id", (req, reply) => controller.details(req, reply));
}
