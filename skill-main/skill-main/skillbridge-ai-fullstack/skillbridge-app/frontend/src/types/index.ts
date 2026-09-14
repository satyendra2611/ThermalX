export type CompetencyLevel = 'strong' | 'developing' | 'needs_focus' | 'locked';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  authProvider: 'google' | 'mobile';
  createdAt: string;
}

export interface CareerDomain {
  id: string;
  name: string;
  status: 'active' | 'coming_soon';
  description: string;
  icon: string;
}

export interface Topic {
  id: string;
  domainId: string;
  name: string;
  description: string;
  difficultyLevel: number;
}

export interface TopicScore {
  topicId: string;
  topicName: string;
  score: number;
  level: CompetencyLevel;
}

export interface AssessmentQuestion {
  id: string;
  topicId: string;
  questionType: 'mcq' | 'conceptual' | 'scenario';
  question: string;
  options?: string[];
}

export interface AssessmentSubmission {
  userId: string;
  domainId: string;
  answers: { questionId: string; answer: string }[];
}

export interface AssessmentResult {
  overallScore: number;
  topicScores: TopicScore[];
  aiSummary: string;
}

export interface RoadmapNode {
  topicId: string;
  topicName: string;
  status: 'completed' | 'current' | 'priority' | 'upcoming' | 'locked';
  competencyLevel: CompetencyLevel;
}

export interface Roadmap {
  userId: string;
  domainId: string;
  nodes: RoadmapNode[];
  updatedAt: string;
}

export interface ProjectChallenge {
  id: string;
  topicId: string;
  title: string;
  description: string;
  requirements: string[];
  skillsTested: string[];
}

export interface ProjectSubmission {
  id: string;
  userId: string;
  projectId: string;
  fileUrl?: string;
  status: 'submitted' | 'validated' | 'rejected';
  score?: number;
}

export interface VivaTurn {
  question: string;
  answer?: string;
  followUp?: string;
}

export interface VivaResult {
  technicalScore: number;
  understandingScore: number;
  communicationScore: number;
  finalScore: number;
  feedback: string;
}

export interface ModificationChallenge {
  id: string;
  projectId: string;
  challenge: string;
  status: 'pending' | 'submitted' | 'evaluated';
  score?: number;
}

export interface InterviewTurn {
  question: string;
  answer?: string;
}

export interface InterviewResult {
  technicalScore: number;
  problemSolvingScore: number;
  communicationScore: number;
  projectUnderstandingScore: number;
  finalScore: number;
}

export interface ReadinessContributor {
  label: string;
  impact: number;
}

export interface JobReadinessReport {
  readinessScore: number;
  status: 'foundation' | 'developing' | 'approaching' | 'interview_ready';
  positiveContributors: ReadinessContributor[];
  improvementFactors: ReadinessContributor[];
  recommendedNextSteps: string[];
}
