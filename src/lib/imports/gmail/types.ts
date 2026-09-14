export type GmailCandidateKind = "flight" | "hotel" | "train" | "car" | "activity" | "other";

export type GmailCandidateConfidence = "high" | "medium" | "low";

export type GmailCandidateConflictField = "kind" | "date" | "route" | "provider";

export type GmailImportCandidate = {
  id: string;
  kind: GmailCandidateKind;
  title: string;
  provider: string;
  startDate: string | null;
  endDate: string | null;
  originCode: string | null;
  destinationCode: string | null;
  flightNumber: string | null;
  suggestedBookingState: "missing" | "conflict";
  confidence: GmailCandidateConfidence;
  confidenceReasons: string[];
  duplicate: boolean;
  conflicts: Array<{ field: GmailCandidateConflictField; existingIndex: number }>;
};

export type ExistingBookingFact = {
  kind: GmailCandidateKind;
  startDate?: string | null;
  endDate?: string | null;
  originCode?: string | null;
  destinationCode?: string | null;
  provider?: string | null;
};

export type GmailMessageInput = {
  privateSourceId: string;
  subject: string;
  sentAt: string;
  text: string;
};

export type GmailPreviewRequest = {
  searchTerm: string;
  after: string | null;
  before: string | null;
  maxMessages: number;
  existing: ExistingBookingFact[];
};
