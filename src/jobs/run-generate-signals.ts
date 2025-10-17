
import { makeGenerateSignalUseCase } from '../factories/make-generate-signals'

async function run() {
  const useCase = makeGenerateSignalUseCase();
  await useCase.execute();
  process.exit(0);
}
run();
