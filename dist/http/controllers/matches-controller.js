"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchesController = void 0;
const make_get_matches_1 = require("../../factories/make-get-matches");
const make_get_match_details_1 = require("../../factories/make-get-match-details");
class MatchesController {
    async list(req, reply) {
        const { from, to, market, minProb, limit } = req.query;
        const useCase = (0, make_get_matches_1.makeGetMatches)();
        const result = await useCase.execute({
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
            market,
            minProb: minProb ? parseFloat(minProb) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
        return reply.send(result);
    }
    async details(req, reply) {
        const { id } = req.params;
        const useCase = (0, make_get_match_details_1.makeGetMatchDetails)();
        const result = await useCase.execute(id);
        if (!result)
            return reply.status(404).send({ error: "Match not found" });
        return reply.send(result);
    }
}
exports.MatchesController = MatchesController;
