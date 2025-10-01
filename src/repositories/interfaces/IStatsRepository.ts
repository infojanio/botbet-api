export interface IStatsRepository {
  getAggregates(params: { from?: Date; to?: Date; market?: string }): Promise<any>;
}
