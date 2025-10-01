import { makeGenerateSignals } from "../factories/make-generate-signals";

async function run() {
  const useCase = makeGenerateSignals();
  await useCase.execute();
  process.exit(0);
}
run();
