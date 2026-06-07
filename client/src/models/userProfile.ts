export interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface Skill {
  id?: string;
  name: string;
  level?: string;
}

export interface Experience {
  id?: string;
  company: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface UserProfile {
  id: string;
  userId?: string;
  externalUserId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  resumeUrl?: string;
  location?: string;
  isProfileComplete: boolean;
  educations: Education[];
  skills: Skill[];
  experiences: Experience[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserProfileRequest {
  externalUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  resumeUrl?: string;
  location?: string;
  educations?: Education[];
  skills?: Skill[];
  experiences?: Experience[];
}

export interface UpdateUserProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  resumeUrl?: string;
  location?: string;
  educations?: Education[];
  skills?: Skill[];
  experiences?: Experience[];
}

export interface ProfileCompleteness {
  isComplete: boolean;
  missingFields: string[];
}
