export type GameState = 'TITLE_MENU' | 'PLAYING';

export type SchoolCategory = 'elementary' | 'junior' | 'combined';

export type GradeLevel = 'elementary' | 'junior';

export type ZoneId = 'xinma' | 'harbor' | 'downtown' | 'nanfango' | 'dananao';

export type TransportMode = 'walk' | 'clog' | 'bike' | 'sailboat';

export interface QuestionItem {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface School {
  id: string;
  name: string;
  shortName: string;
  category: SchoolCategory;
  categoryLabel: string;
  zone: ZoneId;
  zoneLabel: string;
  address: string;
  x: number;
  y: number;
  accentColor: string;
  roofColor: string;
  npcName: string;
  npcTitle: string;
  greeting: string;
  featureSummary: string;
  landmarkName: string;
  stampTitle: string;
  questions: {
    elementary: QuestionItem[];
    junior: QuestionItem[];
  };
}

export interface Collectible {
  id: string;
  name: string;
  type: 'bubble' | 'mackerel' | 'clog' | 'feather' | 'shell';
  x: number;
  y: number;
  fact: string;
}

export interface Landmark {
  id: string;
  name: string;
  subtitle: string;
  x: number;
  y: number;
  kind: 'spring' | 'bridge' | 'train' | 'lighthouse' | 'wetland' | 'bay';
}

export interface StudentProgress {
  id: string;
  name: string;
  gradeLevel: GradeLevel;
  playerX: number;
  playerY: number;
  transport: TransportMode;
  discoveredSchools: string[];
  stampedSchools: string[];
  collectedItems: string[];
  schoolScores: Record<string, number>;
  updatedAt: number;
}
