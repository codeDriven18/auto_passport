export interface PublicProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline?: string;
  location?: string;
  profileImageUrl?: string;
  bannerUrl?: string;
  skills: string[];
  hasLinkedIn: boolean;
  hasGitHub: boolean;
  hasPortfolio: boolean;
}
