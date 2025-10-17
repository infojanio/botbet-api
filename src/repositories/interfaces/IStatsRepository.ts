export interface IStatsRepository {
  getSummary(params?: any): Promise<{
    total: number;
    avgConfidence: number;
    byType: { type: string; count: number; avgConfidence: number }[];
  }>;
}
