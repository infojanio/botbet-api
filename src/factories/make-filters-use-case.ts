import { FiltersUseCase } from "../use-cases/filters-use-case"
import { ApiFootballService } from "../services/api-football-service"

export function makeFiltersUseCase() {
  return new FiltersUseCase(new ApiFootballService())
}