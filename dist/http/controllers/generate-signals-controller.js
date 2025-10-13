"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateSignalsController = void 0;
const make_generate_signals_1 = require("../../factories/make-generate-signals");
class GenerateSignalsController {
    async run(req, reply) {
        try {
            const job = (0, make_generate_signals_1.makeGenerateSignals)();
            await job.execute();
            return reply.send({ message: '✅ Sinais gerados e salvos com sucesso!' });
        }
        catch (error) {
            console.error('Erro ao gerar sinais:', error);
            return reply.status(500).send({ error: 'Erro ao gerar sinais' });
        }
    }
}
exports.GenerateSignalsController = GenerateSignalsController;
