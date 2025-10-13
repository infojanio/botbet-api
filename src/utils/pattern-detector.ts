export function detectPatterns(teamStats: any) {
  const patterns: string[] = []

  if (teamStats.avg_goals_scored > 1.8) patterns.push('Ataque forte')
  if (teamStats.avg_goals_conceded > 1.5) patterns.push('Defesa vulnerável')
  if (teamStats.over25_rate > 0.6) patterns.push('Tendência de jogos com mais de 2.5 gols')
  if (teamStats.clean_sheets_rate < 0.3) patterns.push('Raramente mantém o zero')
  if (teamStats.first_half_goal_rate > 0.6) patterns.push('Costuma marcar no 1º tempo')

  return patterns
}
