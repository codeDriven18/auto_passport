import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  SettingsAccountSection,
  SettingsAppearanceSection,
  SettingsSecuritySection,
} from '@/portal/components/SettingsSections';
import { PageFrame } from '@/portal/components/PageFrame';
import ws from '@/portal/workspace.module.css';

type SettingsSectionId =
  | 'account'
  | 'appearance'
  | 'notifications'
  | 'team'
  | 'company'
  | 'integrations'
  | 'billing'
  | 'security';

interface SettingsSectionDef {
  id: SettingsSectionId;
  label: string;
  description: string;
  status?: 'coming-soon';
  group: 'Workspace' | 'Account';
}

const SECTIONS: SettingsSectionDef[] = [
  { id: 'account', label: 'Account', description: 'Profile, email, and session.', group: 'Account' },
  { id: 'security', label: 'Security', description: 'Password and sign-in.', group: 'Account' },
  { id: 'appearance', label: 'Appearance', description: 'Theme and display.', group: 'Workspace' },
  { id: 'notifications', label: 'Notifications', description: 'Alerts for applicants and messages.', status: 'coming-soon', group: 'Workspace' },
  { id: 'team', label: 'Team Members', description: 'Recruiter access and roles.', status: 'coming-soon', group: 'Workspace' },
  { id: 'company', label: 'Company', description: 'Employer brand and open roles.', group: 'Workspace' },
  { id: 'integrations', label: 'Integrations', description: 'Email, calendar, and ATS connections.', status: 'coming-soon', group: 'Workspace' },
  { id: 'billing', label: 'Billing', description: 'Plans, invoices, and payment methods.', status: 'coming-soon', group: 'Workspace' },
];

const GROUP_ORDER: SettingsSectionDef['group'][] = ['Workspace', 'Account'];

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
    case 'appearance':
      return <SettingsAppearanceSection />;
    case 'security':
      return <SettingsSecuritySection />;
    case 'notifications':
      return <PlaceholderSection description="Configure email and in-app alerts when new candidates apply or message you." />;
    case 'team':
      return <PlaceholderSection description="Invite teammates and assign recruiter permissions." />;
    case 'company':
      return (
        <div className={ws.settingsSectionBody}>
          <p className={ws.bodyText}>Manage your public employer brand, culture story, and open roles.</p>
          <Link to="/portal/company" className={ws.btnPrimary}>Open company profile</Link>
        </div>
      );
    case 'billing':
      return <PlaceholderSection description="View plans, payment methods, and invoices." />;
    case 'integrations':
      return <PlaceholderSection description="Connect calendar, email, and ATS tools." />;
    default:
      return null;
  }
}

export function SettingsPage() {
  const [active, setActive] = useState<SettingsSectionId>('account');
  const current = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];

  return (
    <PageFrame meta="Workspace preferences and account controls">
      <div className={ws.settingsWorkspace}>
        <nav className={ws.settingsNav} aria-label="Settings sections">
          {GROUP_ORDER.map((group) => (
            <div key={group} className={ws.settingsNavGroup}>
              <p className={ws.settingsNavGroupLabel}>{group}</p>
              {SECTIONS.filter((s) => s.group === group).map((section) => (
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
            </div>
          ))}
        </nav>

        <section className={ws.settingsContent}>
          <header className={ws.settingsContentHeader}>
            <h2 className={ws.settingsContentTitle}>{current.label}</h2>
            <p className={ws.candidateSub}>{current.description}</p>
          </header>
          {renderSectionContent(current.id)}
        </section>
      </div>
    </PageFrame>
  );
}
