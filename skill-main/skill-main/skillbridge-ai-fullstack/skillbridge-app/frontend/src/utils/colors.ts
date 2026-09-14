export const brand = {
  blue: '#75BDE0',
  blueDeep: '#4E9FC9',
  gold: '#F8D49B',
  peach: '#F8BC9B',
  coral: '#F89B9B',
};

export function levelColor(level: string): string {
  switch (level) {
    case 'strong':
      return brand.blue;
    case 'developing':
      return brand.gold;
    case 'needs_focus':
      return brand.coral;
    default:
      return '#D1D5DB';
  }
}

export function levelLabel(level: string): string {
  switch (level) {
    case 'strong':
      return 'Strong';
    case 'developing':
      return 'Developing';
    case 'needs_focus':
      return 'Needs Focus';
    default:
      return 'Locked';
  }
}

export function readinessStatus(score: number): string {
  if (score < 40) return 'Foundation Building';
  if (score < 60) return 'Developing';
  if (score < 80) return 'Approaching Readiness';
  return 'Interview Ready';
}
