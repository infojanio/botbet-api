export function calculatePatterns(statsResponse: any) {
  if (!statsResponse || !statsResponse.length) return []

  const flatStats = statsResponse.flatMap((s: any) => s.stats || [])

  const get = (key: string) => {
    const item = flatStats.find((s: any) => s.key === key)
    return item?.stats || [0, 0]
  }

  const [homePoss, awayPoss] = get('BallPossesion')
  const [homeXG, awayXG] = get('expected_goals')
  const [homeShots, awayShots] = get('ShotsOnTarget')
  const [homeCorners, awayCorners] = get('corners')
  const [homeFouls, awayFouls] = get('fouls')
  const [homeYellows, awayYellows] = get('yellow_cards')
  const [homeReds, awayReds] = get('red_cards')

  const patterns = []

  if (Number(homeXG) + Number(awayXG) > 2.5)
    patterns.push({
      type: 'Over 2.5 Gols',
      probability: 0.75,
      description: 'Tendência ofensiva alta',
    })

  if (Number(homeShots) + Number(awayShots) > 6)
    patterns.push({
      type: 'Ambas Marcam',
      probability: 0.65,
      description: 'Ataques ativos de ambos os lados',
    })

  if (Number(homeCorners) + Number(awayCorners) > 9)
    patterns.push({
      type: 'Mais de 9.5 Escanteios',
      probability: 0.7,
      description: 'Alta média de corners',
    })

  if (
    Number(homeYellows) +
      Number(awayYellows) +
      Number(homeReds) +
      Number(awayReds) >=
    5
  )
    patterns.push({
      type: 'Mais de 5 Cartões',
      probability: 0.68,
      description: 'Jogo propenso a faltas e cartões',
    })

  if (Number(homePoss) > 60)
    patterns.push({
      type: 'Mandante domina posse',
      probability: 0.6,
      description: 'Controle de bola elevado',
    })

  return patterns
}
