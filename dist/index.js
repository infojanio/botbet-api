"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const matches_routes_1 = require("./http/routes/matches-routes");
const signals_routes_1 = require("./http/routes/signals-routes");
const stats_routes_1 = require("./http/routes/stats-routes");
const make_generate_signals_1 = require("./factories/make-generate-signals");
const node_cron_1 = __importDefault(require("node-cron"));
const generate_signals_routes_1 = require("./http/routes/generate-signals-routes");
const app = (0, fastify_1.default)({ logger: true });
app.register(matches_routes_1.matchesRoutes);
app.register(signals_routes_1.signalsRoutes);
app.register(stats_routes_1.statsRoutes);
app.register(generate_signals_routes_1.generateSignalsRoutes);
// Schedule job every 6 hours
node_cron_1.default.schedule('0 */6 * * *', async () => {
    const job = (0, make_generate_signals_1.makeGenerateSignals)();
    await job.execute();
});
const PORT = parseInt(process.env.PORT || '3333');
app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
    console.log(`🚀 Bot-Bet API running at ${address}`);
});
