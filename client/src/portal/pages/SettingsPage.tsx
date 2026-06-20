import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  SettingsAccountSection,
  SettingsSecuritySection,
} from '@/portal/components/SettingsSections';
import { SettingsThemeToggle } from '@/portal/components/SettingsThemeToggle';
import { PageFrame } from '@/portal/components/PageFrame';
import ws from '@/portal/workspace.module.css';

type SettingsSectionId =
  | 'account'
  | 'security'
  | 'notifications'
  | 'workspace'
  | 'company'
  | 'sessions';

interface SettingsSectionDef {
  id: SettingsSectionId;
  label: string;
  description: string;
  status?: 'coming-soon';
}

const SECTIONS: SettingsSectionDef[] = [
  { id: 'account', label: 'Account', description: 'Profile, email, and sign-in.' },
  { id: 'security', label: 'Security', description: 'Password and account protection.' },
  { id: 'notifications', label: 'Notifications', description: 'Alerts for applicants and messages.', status: 'coming-soon' },
  { id: 'workspace', label: 'Workspace', description: 'Hiring defaults and team preferences.', status: 'coming-soon' },
  { id: 'company', label: 'Company', description: 'Employer brand and public profile.' },
  { id: 'sessions', label: 'Sessions', description: 'Devices signed in to your account.', status: 'coming-soon' },
];

function PlaceholderSection({ description }: { description: string }) {
  return (
    <div className={ws.settingsSectionBody}>
      <p className={ws.bodyText}>{description}</p>
      <span className={ws.badgeMuted}>Coming soon</span>
    </div>
  );
}

function renderSectionContent(id: SettingsSectionId) {
  switch (id) {
    case 'account':
      return <SettingsAccountSection />;
    case 'security':
      return <SettingsSecuritySection />;
    case 'notifications':
      return <PlaceholderSection description="Configure email and in-app alerts when new candidates apply or message you." />;
    case 'workspace':
      return <PlaceholderSection description="Set hiring defaults, pipeline preferences, and team workspace options." />;
    case 'company':
      return (
        <div className={ws.settingsSectionBody}>
          <p className={ws.bodyText}>Manage your public employer brand, cover image, logo, and company story.</p>
          <Link to="/portal/company" className={ws.btnPrimary}>Open company profile</Link>
        </div>
      );
    case 'sessions':
      return <PlaceholderSection description="Review active sessions and sign out from other devices." />;
    default:
      return null;
  }
}

export function SettingsPage() {
  const [active, setActive] = useState<SettingsSectionId>('account');
  const current = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];

  return (
    <PageFrame>
      <div className={ws.settingsPageHeader}>
        <div>
          <h2 className={ws.settingsPageTitle}>Settings</h2>
          <p className={ws.candidateSub}>Workspace preferences and account controls</p>
        </div>
        <SettingsThemeToggle />
      </div>

      <div className={ws.settingsWorkspace}>
        <nav className={ws.settingsNav} aria-label="Settings sections">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={[ws.settingsNavItem, active === section.id ? ws.settingsNavItemActive : ''].filter(Boolean).join(' ')}
              onClick={() => setActive(section.id)}
            >
              <span className={ws.settingsNavLabel}>{section.label}</span>
              {section.status === 'coming-soon' && <span className={ws.settingsNavHint}>Soon</span>}
            </button>
          ))}
        </nav>

        <section className={ws.settingsContent}>
          <header className={ws.settingsContentHeader}>
            <h3 className={ws.settingsContentTitle}>{current.label}</h3>
            <p className={ws.candidateSub}>{current.description}</p>
          </header>
          {renderSectionContent(current.id)}
        </section>
      </div>
    </PageFrame>
  );
}
