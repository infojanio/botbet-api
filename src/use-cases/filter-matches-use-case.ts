import { MatchFilterService } from '../services/MatchFilterService'

interface FilterMatchesInput {
  date: string
  maxOdd: number
  league?: string
}

export class FilterMatchesUseCase {
  constructor(private matchFilterService: MatchFilterService) {}

  async execute({ date, maxOdd, league }: FilterMatchesInput) {
    return this.matchFilterService.execute({ date, maxOdd, league })
  }
}
