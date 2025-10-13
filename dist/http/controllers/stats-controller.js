"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsController = void 0;
const make_get_stats_1 = require("../../factories/make-get-stats");
class StatsController {
    async summary(req, reply) {
        const { from, to, market } = req.query;
        const useCase = (0, make_get_stats_1.makeGetStats)();
        const result = await useCase.execute({
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
            market,
        });
        return reply.send(result);
    }
}
exports.StatsController = StatsController;
