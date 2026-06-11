import { Route, Routes } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/models/auth';
import { EmployerProfilePage } from './EmployerProfilePage';
import { ProfileCompletePage } from './ProfileCompletePage';
import { ProfileHubPage } from './ProfileHubPage';
import { ProfileSectionPage } from './ProfileSectionPage';

export function ProfilePage() {
  const { user } = useAuth();

  if (user?.role === UserRole.Company) {
    return <EmployerProfilePage />;
  }

  return (
    <Routes>
      <Route index element={<ProfileHubPage />} />
      <Route path="complete" element={<ProfileCompletePage />} />
      <Route path=":section" element={<ProfileSectionPage />} />
    </Routes>
  );
}
