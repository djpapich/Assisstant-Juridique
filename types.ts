interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
export interface CaseDetails {
  numeroDossier: string;
  tribunal: string;
  category?: string;
  typeAffaire?: string;
  etatDossier?: string;
  parties?: { role: string; nom: string }[];
  historique?: { date: string; evenement: string }[];
}

export interface TimelineEvent {
  date: string;
  description: string;
  source: 'المستند' | 'عبر الإنترنت';
}

export interface AnalysisReport {
  resume: string;
  incoherences: string[];
  pointsCles: string[];
  prochainesEtapes: string[];
  timeline: TimelineEvent[];
}