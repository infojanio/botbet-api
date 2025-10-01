import { IStatsRepository } from "../repositories/interfaces/IStatsRepository";

export class GetStatsUseCase {
  constructor(private repo: IStatsRepository) {}
  async execute(params: { from?: Date; to?: Date; market?: string }) {
    return this.repo.getAggregates(params);
  }
}
