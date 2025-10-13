"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const make_generate_signals_1 = require("../factories/make-generate-signals");
async function run() {
    const useCase = (0, make_generate_signals_1.makeGenerateSignals)();
    await useCase.execute();
    process.exit(0);
}
run();
