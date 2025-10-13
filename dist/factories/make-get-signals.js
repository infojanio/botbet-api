"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeGetSignals = makeGetSignals;
const prisma_signal_repository_1 = require("../repositories/prisma/prisma-signal-repository");
const get_signals_1 = require("../use-cases/get-signals");
function makeGetSignals() {
    return new get_signals_1.GetSignalsUseCase(new prisma_signal_repository_1.PrismaSignalRepository());
}
