
import { Patient, AdherenceStatus, RegionTemplate, SurveyResponse, LoyaltyRule, Reward } from '../types';

export const mockPatients: Patient[] = [
  {
    id: 'P001',
    name: 'Kwame Mensah',
    age: 45,
    phone: '+233 24 123 4567',
    email: 'kwame.m@example.com',
    language: 'English',
    condition: 'Hypertension',
    adherenceRate: 92,
    status: AdherenceStatus.Excellent,
    subscriptionStatus: 'Active',
    communicationPreference: 'WhatsApp',
    loyaltyPoints: 450,
    lastContact: '2023-10-24',
    medications: [
      { id: 'M1', name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', remainingSupply: 14, refillDue: false, instructions: 'Take in the morning with food', price: 45.00 },
      { id: 'M2', name: 'Amlodipine', dosage: '5mg', frequency: 'Daily', remainingSupply: 5, refillDue: true, instructions: 'Take before bed', price: 30.00 }
    ],
    appointments: [
      { id: 'A1', date: '2023-11-15', time: '09:00 AM', type: 'Cardiology Check-up', provider: 'Dr. Bello', status: 'Scheduled' },
      { id: 'A2', date: '2023-10-01', time: '10:30 AM', type: 'Lab Work', provider: 'General Lab', status: 'Completed' }
    ],
    vitals: [
      { id: 'V1', date: '2023-10-24', type: 'Blood Pressure', value: '120/80', unit: 'mmHg', status: 'Normal' },
      { id: 'V2', date: '2023-10-20', type: 'Blood Pressure', value: '125/82', unit: 'mmHg', status: 'Normal' },
      { id: 'V3', date: '2023-10-15', type: 'Blood Pressure', value: '130/85', unit: 'mmHg', status: 'Warning' },
      { id: 'V4', date: '2023-10-10', type: 'Blood Pressure', value: '128/84', unit: 'mmHg', status: 'Normal' }
    ]
  },
  {
    id: 'P002',
    name: 'Ngozi Okafor',
    age: 62,
    phone: '+234 80 987 6543',
    email: 'ngozi.o@example.com',
    language: 'Igbo',
    condition: 'Type 2 Diabetes',
    adherenceRate: 65,
    status: AdherenceStatus.AtRisk,
    subscriptionStatus: 'Active',
    communicationPreference: 'SMS',
    loyaltyPoints: 120,
    lastContact: '2023-10-20',
    medications: [
      { id: 'M3', name: 'Metformin', dosage: '500mg', frequency: 'Twice Daily', remainingSupply: 20, refillDue: false, instructions: 'Take with meals', price: 25.50 }
    ],
    appointments: [
      { id: 'A3', date: '2023-11-05', time: '02:00 PM', type: 'Endocrinology Review', provider: 'Dr. Mensah', status: 'Scheduled' }
    ],
    vitals: [
      { id: 'V5', date: '2023-10-24', type: 'Blood Sugar', value: '180', unit: 'mg/dL', status: 'Warning' },
      { id: 'V6', date: '2023-10-20', type: 'Blood Sugar', value: '165', unit: 'mg/dL', status: 'Warning' }
    ]
  },
  {
    id: 'P003',
    name: 'Amara Diop',
    age: 34,
    phone: '+221 77 654 3210',
    email: 'amara.d@example.com',
    language: 'French',
    condition: 'Asthma',
    adherenceRate: 88,
    status: AdherenceStatus.Good,
    subscriptionStatus: 'Inactive',
    communicationPreference: 'Email',
    loyaltyPoints: 300,
    lastContact: '2023-10-25',
    medications: [
      { id: 'M4', name: 'Albuterol Inhaler', dosage: '90mcg', frequency: 'As needed', remainingSupply: 100, refillDue: false, instructions: 'Use for sudden symptoms', price: 120.00 }
    ],
    appointments: [],
    vitals: []
  },
  {
    id: 'P004',
    name: 'Samuel Kiprotich',
    age: 55,
    phone: '+254 71 234 5678',
    email: 'sam.k@example.com',
    language: 'Swahili',
    condition: 'Hypertension',
    adherenceRate: 40,
    status: AdherenceStatus.Critical,
    subscriptionStatus: 'Unsubscribed',
    communicationPreference: 'Phone Call',
    loyaltyPoints: 50,
    lastContact: '2023-10-15',
    medications: [
      { id: 'M1', name: 'Lisinopril', dosage: '20mg', frequency: 'Daily', remainingSupply: 2, refillDue: true, instructions: 'Take every morning', price: 55.00 }
    ],
    appointments: [
       { id: 'A4', date: '2023-10-10', time: '11:00 AM', type: 'Cardiology Check-up', provider: 'Dr. Bello', status: 'Missed' }
    ],
    vitals: [
       { id: 'V7', date: '2023-10-15', type: 'Blood Pressure', value: '150/95', unit: 'mmHg', status: 'Critical' }
    ]
  }
];

export const mockTemplates: RegionTemplate[] = [
  {
    id: 'T1',
    title: 'Formal Elder Greeting (Ghana/Nigeria)',
    region: 'West Africa',
    category: 'Reminder',
    content: 'Good morning Papa/Mama [Name]. We trust the family is well. This is a respectful reminder from the pharmacy to take your morning medication.'
  },
  {
    id: 'T2',
    title: 'Direct & Warm (Kenya)',
    region: 'East Africa',
    category: 'Refill',
    content: 'Habari [Name]. Hope your week is going well. Your prescription is due for a refill in 3 days. Shall we prepare it for pickup?'
  },
  {
    id: 'T3',
    title: 'Francophone Professional',
    region: 'West Africa',
    category: 'Welcome',
    content: 'Bonjour [Name]. Bienvenue à notre programme de santé. N\'hésitez pas à nous contacter si vous avez des questions.'
  },
  {
    id: 'T4',
    title: 'Community Check-in (General)',
    region: 'General',
    category: 'Reminder',
    content: 'Hello [Name], just checking in on your health goals for this week. Remember, small steps lead to big changes!'
  },
  {
    id: 'T5',
    title: 'Ubuntu Style Support (Southern)',
    region: 'Southern Africa',
    category: 'Reminder',
    content: 'Sawubona [Name]. We are here to support your health journey together. Please remember your scheduled check-up tomorrow.'
  }
];

export const mockLoyaltyRules: LoyaltyRule[] = [
    { id: 'L1', action: 'On-time Refill', points: 50, description: 'Earn points for picking up medication before due date.' },
    { id: 'L2', action: 'Adherence Streak (7 Days)', points: 25, description: 'Earn points for a week of perfect medication logging.' },
    { id: 'L3', action: 'Attend Check-up', points: 100, description: 'Earn points for attending a scheduled doctor visit.' },
    { id: 'L4', action: 'Update Vitals', points: 10, description: 'Earn points for logging blood pressure or sugar levels.' },
];

export const mockRewardCatalog: Reward[] = [
    { id: 'R1', title: 'Free Consultation', cost: 500, category: 'Service' },
    { id: 'R2', title: '10% Off Medication', cost: 200, category: 'Discount' },
    { id: 'R3', title: 'Wellness Check', cost: 300, category: 'Service' },
    { id: 'R4', title: 'Diabetes Care Kit', cost: 1000, category: 'Product' },
];

export const mockSurveyResponses: SurveyResponse[] = [
    { id: 'S1', patientName: 'Kwame Mensah', date: '2023-10-20', rating: 5, comment: 'Very helpful reminders.' },
    { id: 'S2', patientName: 'Ngozi Okafor', date: '2023-10-21', rating: 4, comment: 'Good service but app is slow sometimes.' },
    { id: 'S3', patientName: 'Amara Diop', date: '2023-10-22', rating: 5, comment: 'J\'adore le service.' },
    { id: 'S4', patientName: 'Samuel Kiprotich', date: '2023-10-23', rating: 2, comment: 'Too many messages.' },
    { id: 'S5', patientName: 'Anonymous', date: '2023-10-24', rating: 5, comment: 'Life saver.' },
];

export const adherenceHistoryData = [
  { name: 'Week 1', value: 78 },
  { name: 'Week 2', value: 82 },
  { name: 'Week 3', value: 80 },
  { name: 'Week 4', value: 85 },
  { name: 'Week 5', value: 88 },
];

export const getStats = (): {
  totalPatients: number;
  avgAdherence: number;
  refillsDue: number;
  criticalPatients: number;
  avgSatisfaction: number;
  activeSubscriptions: number;
} => {
  const totalPatients = mockPatients.length;
  const avgAdherence = Math.round(mockPatients.reduce((acc, curr) => acc + curr.adherenceRate, 0) / totalPatients);
  const refillsDue = mockPatients.filter(p => p.medications.some(m => m.refillDue)).length;
  const criticalPatients = mockPatients.filter(p => p.status === AdherenceStatus.Critical).length;
  const avgSatisfaction = 4.2;
  const activeSubscriptions = mockPatients.filter(p => p.subscriptionStatus === 'Active').length;

  return { totalPatients, avgAdherence, refillsDue, criticalPatients, avgSatisfaction, activeSubscriptions };
};
