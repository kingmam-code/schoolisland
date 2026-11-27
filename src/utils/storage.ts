import { StudentProgress, TransportMode } from '../types';

const STORAGE_KEY = 'suao-learning-island-profiles-v1';
const ACTIVE_KEY = 'suao-learning-island-active-v1';

export const DEFAULT_SPAWN = { x: 930, y: 690 }; // 蘇澳冷泉市鎮廣場

export function createDefaultProfile(id: string, name: string): StudentProgress {
  return {
    id,
    name,
    gradeLevel: 'elementary',
    playerX: DEFAULT_SPAWN.x,
    playerY: DEFAULT_SPAWN.y,
    transport: 'walk',
    discoveredSchools: ['suao-es'],
    stampedSchools: [],
    collectedItems: [],
    schoolScores: {},
    updatedAt: Date.now(),
  };
}

export function loadProfiles(): StudentProgress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const guest = createDefaultProfile('guest', '訪客同學');
      saveProfiles([guest]);
      return [guest];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const guest = createDefaultProfile('guest', '訪客同學');
      saveProfiles([guest]);
      return [guest];
    }
    return parsed;
  } catch {
    return [createDefaultProfile('guest', '訪客同學')];
  }
}

export function saveProfiles(profiles: StudentProgress[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadActiveProfileId(): string {
  try {
    return localStorage.getItem(ACTIVE_KEY) || 'guest';
  } catch {
    return 'guest';
  }
}

export function saveActiveProfileId(id: string) {
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    // Ignore storage quota errors
  }
}

export function getUnlockedTransports(profile: StudentProgress): TransportMode[] {
  const unlocked: TransportMode[] = ['walk'];
  const stampCount = profile.stampedSchools.length;
  const itemCount = profile.collectedItems.length;

  if (stampCount >= 2 || itemCount >= 3) {
    unlocked.push('clog');
  }
  if (stampCount >= 5) {
    unlocked.push('bike');
  }
  if (profile.stampedSchools.includes('yueming') || stampCount >= 7) {
    unlocked.push('sailboat');
  }
  return unlocked;
}
