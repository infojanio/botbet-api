export function betaPosteriorMean(successes: number, trials: number, p0 = 0.55, n0 = 10) {
  const alpha = p0 * n0;
  const beta = (1 - p0) * n0;
  return (successes + alpha) / (trials + alpha + beta);
}

export function freqOver(values: number[], line: number) {
  const n = values.length;
  const s = values.filter(v => v > line).length;
  return { n, s, pHat: n ? s / n : 0 };
}

export function calcOverProb(h2h: number[], recent: number[], line: number, leagueAvg = 0.55) {
  const H2H_MIN = 4, RECENT_MIN = 6;

  const fH2H = freqOver(h2h, line);
  const fRecent = freqOver(recent, line);

  const pH2H = fH2H.n >= H2H_MIN ? betaPosteriorMean(fH2H.s, fH2H.n, leagueAvg, 10) : null;
  const pRecent = fRecent.n >= RECENT_MIN ? betaPosteriorMean(fRecent.s, fRecent.n, leagueAvg, 10) : null;

  if (pH2H === null && pRecent === null) return null;
  if (pH2H === null) return pRecent!;
  if (pRecent === null) return pH2H!;
  return 0.55 * pH2H + 0.45 * pRecent;
}
