export interface TrainerShift {
  start_time: string;
  end_time: string;
}

export interface TrainerAvailability {
  day: string;
  active: boolean;
  shifts: TrainerShift[];
}

export interface AddTrainerForm {
  // Personal
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: string;
  phone: string;
  email: string;
  nationality: string;
  national_id: string;
  bio: string;
  photo_url: string | null;

  // Qualifications
  education_level: string;
  field_of_study: string;
  years_experience: number | null;
  certifications: string;
  specializations: string[];
  languages: string[];

  // Schedule
  availability: TrainerAvailability[];
  session_duration_minutes: number;
  max_clients_per_day: number | null;
  contract_start: string | null;
  contract_end: string | null;

  // Compensation
  salary_type: string;
  monthly_salary: number | null;
  session_rate: number | null;
  commission_percent: number | null;

  // Social
  instagram: string;
  youtube: string;
  tiktok: string;
  website: string;

  // Admin
  initial_rating: number;
  target_monthly_sessions: number | null;
  admin_notes: string;
  status: 'active' | 'on_leave' | 'inactive';
}

export const SPECIALIZATIONS = [
  'Weight loss', 'Muscle building', 'Cardio & endurance',
  'Yoga & flexibility', 'CrossFit', 'Boxing & MMA',
  'Pilates', 'Rehabilitation', 'Nutrition coaching',
  'Kids & teens', 'Senior fitness', 'Prenatal fitness',
];

export const LANGUAGES = ['Arabic', 'English', 'Hindi', 'Urdu', 'French', 'German'];

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];