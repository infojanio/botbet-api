import { FiltersUseCase } from "../use-cases/filters-use-case"
import { ApiFootballService } from "../services/external-api/api-football-service"

export function makeFiltersUseCase() {
  return new FiltersUseCase(new ApiFootballService())
}