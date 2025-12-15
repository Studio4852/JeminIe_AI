
export enum AdherenceStatus {
  Excellent = 'Excellent', // > 90%
  Good = 'Good', // 75-90%
  AtRisk = 'At Risk', // < 75%
  Critical = 'Critical' // < 50%
}

export type SubscriptionStatus = 'Active' | 'Inactive' | 'Unsubscribed';
export type CommunicationChannel = 'WhatsApp' | 'SMS' | 'Email' | 'Phone Call';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  remainingSupply: number; // in days
  refillDue: boolean;
  instructions: string;
  price: number;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  provider: string;
  status: 'Scheduled' | 'Completed' | 'Missed';
}

export interface VitalLog {
  id: string;
  date: string;
  type: 'Blood Pressure' | 'Blood Sugar' | 'Weight' | 'Heart Rate';
  value: string;
  unit: string;
  status: 'Normal' | 'Warning' | 'Critical';
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  category: 'Discount' | 'Product' | 'Service';
}

export interface LoyaltyRule {
  id: string;
  action: string;
  points: number;
  description: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  language: string;
  condition: string;
  adherenceRate: number; // 0-100
  status: AdherenceStatus;
  subscriptionStatus: SubscriptionStatus;
  communicationPreference: CommunicationChannel;
  loyaltyPoints: number;
  medications: Medication[];
  appointments: Appointment[];
  vitals: VitalLog[];
  lastContact: string;
}

export interface DashboardStats {
  totalPatients: number;
  avgAdherence: number;
  refillsDue: number;
  criticalPatients: number;
  avgSatisfaction: number; // 1-5 Scale
  activeSubscriptions: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface SurveyResponse {
  id: string;
  patientName: string;
  date: string;
  rating: number; // 1-5
  comment: string;
}

export interface RegionTemplate {
  id: string;
  title: string;
  region: 'West Africa' | 'East Africa' | 'Southern Africa' | 'North Africa' | 'General';
  category: 'Reminder' | 'Refill' | 'Welcome';
  content: string;
}

export interface AppTranslations {
  dashboard: string;
  patients: string;
  communication: string;
  analytics: string;
  settings: string;
  logout: string;
  overview: string;
  exportReport: string;
  addPatient: string;
  activePatients: string;
  avgAdherence: string;
  refillsDue: string;
  criticalStatus: string;
  patientDirectory: string;
  searchPlaceholder: string;
  pushSurvey: string;
  manageLoyalty: string;
}
