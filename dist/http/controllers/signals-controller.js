"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalsController = void 0;
const make_get_signals_1 = require("../../factories/make-get-signals");
class SignalsController {
    async list(req, reply) {
        const { market, line, selection, competition, from, to, minProb, page, pageSize } = req.query;
        const useCase = (0, make_get_signals_1.makeGetSignals)();
        const result = await useCase.execute({
            market,
            line: line ? parseFloat(line) : undefined,
            selection,
            competition,
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
            minProb: minProb ? parseFloat(minProb) : undefined,
            skip: page && pageSize ? (parseInt(page) - 1) * parseInt(pageSize) : 0,
            take: pageSize ? parseInt(pageSize) : 20,
        });
        return reply.send(result);
    }
}
exports.SignalsController = SignalsController;
