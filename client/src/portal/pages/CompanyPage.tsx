import { IconMapPin } from '@/components/icons/Icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { portalApi } from '@/api/portalApi';
import { CompanyAvatar } from '@/components/profile/CompanyAvatar';
import { ImageDropZone } from '@/portal/components/ImageDropZone';
import { PageFrame, Panel } from '@/portal/components/PageFrame';
import ws from '@/portal/workspace.module.css';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/lib/apiErrors';
import type { Company } from '@/models/company';
import type { PortalUpdateCompanyRequest } from '@/models/portal';

function brandedBannerStyle() {
  return {
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 55%, color-mix(in srgb, #ffd600 35%, #1a1a1a) 100%)',
  } as const;
}

export function CompanyPage() {
  const { showToast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [form, setForm] = useState<PortalUpdateCompanyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    portalApi.getCompany()
      .then((c) => {
        setCompany(c);
        setForm({
          description: c.description ?? '',
          industry: c.industry ?? '',
          location: c.location ?? '',
          companySize: c.companySize ?? '',
          logoUrl: c.logoUrl ?? '',
          bannerUrl: c.bannerUrl ?? '',
          website: c.website ?? '',
          linkedInUrl: c.linkedInUrl ?? '',
        });
      })
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, []);

  const previewCompany = useMemo(() => {
    if (!company || !form) return null;
    return {
      ...company,
      description: form.description,
      industry: form.industry,
      location: form.location,
      companySize: form.companySize,
      logoUrl: form.logoUrl || company.logoUrl,
      bannerUrl: form.bannerUrl || company.bannerUrl,
      website: form.website,
      linkedInUrl: form.linkedInUrl,
    };
  }, [company, form]);

  const save = useCallback(async () => {
    if (!form) return;
    setSaving(true);
    try {
      const updated = await portalApi.updateCompany(form);
      setCompany(updated);
      showToast('Company profile saved', 'success');
      setEditing(false);
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Save failed'), 'error');
    } finally {
      setSaving(false);
    }
  }, [form, showToast]);

  if (loading) {
    return <p className={ws.statusText}>Loading company profile…</p>;
  }

  if (!company || !form || !previewCompany) {
    return (
      <PageFrame>
        <Panel>
          <h2 className={ws.panelTitle}>Company profile unavailable</h2>
          <p className={ws.candidateSub}>Your employer account is not linked to a company yet.</p>
          <Link to="/portal" className={ws.btnPrimary}>Open command center</Link>
        </Panel>
      </PageFrame>
    );
  }

  const display = editing ? previewCompany : company;
  const bannerStyle = display.bannerUrl
    ? { backgroundImage: `url(${display.bannerUrl})` }
    : brandedBannerStyle();

  return (
    <PageFrame
      meta="Build your employer brand — candidates see this before they apply."
      actions={(
        <>
          <Link to={`/companies/${company.slug}`} className={ws.btnGhost} target="_blank" rel="noopener noreferrer">Preview public page</Link>
          {editing ? (
            <>
              <button type="button" className={ws.btnGhost} onClick={() => setEditing(false)}>Cancel</button>
              <button type="button" className={ws.btnPrimary} disabled={saving} onClick={() => void save()}>
                {saving ? 'Saving…' : 'Save brand'}
              </button>
            </>
          ) : (
            <button type="button" className={ws.btnPrimary} onClick={() => setEditing(true)}>Edit brand</button>
          )}
        </>
      )}
    >
      <div className={editing ? ws.companyEditLayout : undefined}>
        <article className={ws.companyHero}>
          <div className={ws.companyBanner} style={bannerStyle} aria-hidden />
          {!display.bannerUrl && (
            <div className={ws.companyBannerLabel} aria-hidden>Branded cover</div>
          )}
          <div className={ws.companyHeroBody}>
            <CompanyAvatar company={display} size="lg" />
            <div className={ws.companyHeroInfo}>
              <h2 className={ws.profileName}>{display.name}</h2>
              <p className={ws.profileHeadline}>
                {display.industry || 'Add your industry'}
                {display.location && (
                  <>
                    {' · '}
                    <IconMapPin size={16} /> {display.location}
                  </>
                )}
              </p>
              <div className={ws.companyHeroTags}>
                {display.companySize && <span className={ws.badgeMuted}>{display.companySize}</span>}
                <span className={ws.badgeOk}>{display.openJobsCount} open {display.openJobsCount === 1 ? 'role' : 'roles'}</span>
              </div>
            </div>
          </div>
        </article>

        {editing && (
          <aside className={ws.companyEditor}>
            <section className={ws.panel}>
              <h3 className={ws.panelTitle}>Visual identity</h3>
              <ImageDropZone
                label="Cover image"
                hint="Drag & drop or paste a URL. Without a cover, a branded placeholder is shown."
                value={form.bannerUrl ?? ''}
                onChange={(bannerUrl) => setForm({ ...form, bannerUrl })}
                aspect="banner"
                placeholder={<span className={ws.dropZonePlaceholder}>Branded cover preview</span>}
              />
              <ImageDropZone
                label="Logo"
                hint="Square logo works best. Drag & drop or paste a URL."
                value={form.logoUrl ?? ''}
                onChange={(logoUrl) => setForm({ ...form, logoUrl })}
                aspect="square"
              />
            </section>

            <section className={ws.panel}>
              <h3 className={ws.panelTitle}>Company story</h3>
              <div className={ws.field}>
                <label htmlFor="description">About your company</label>
                <textarea
                  id="description"
                  className={ws.textarea}
                  rows={5}
                  placeholder="Mission, culture, and what makes your team unique."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className={ws.fieldRow}>
                <div className={ws.field}>
                  <label htmlFor="industry">Industry</label>
                  <input id="industry" className={ws.input} value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
                </div>
                <div className={ws.field}>
                  <label htmlFor="size">Team size</label>
                  <input id="size" className={ws.input} value={form.companySize} onChange={(e) => setForm({ ...form, companySize: e.target.value })} placeholder="51–200" />
                </div>
              </div>
              <div className={ws.field}>
                <label htmlFor="location">Location</label>
                <input id="location" className={ws.input} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
            </section>

            <section className={ws.panel}>
              <h3 className={ws.panelTitle}>Links</h3>
              <div className={ws.field}>
                <label htmlFor="website">Website</label>
                <input id="website" className={ws.input} value={form.website ?? ''} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://…" />
              </div>
              <div className={ws.field}>
                <label htmlFor="linkedin">LinkedIn</label>
                <input id="linkedin" className={ws.input} value={form.linkedInUrl ?? ''} onChange={(e) => setForm({ ...form, linkedInUrl: e.target.value })} placeholder="https://linkedin.com/company/…" />
              </div>
            </section>
          </aside>
        )}
      </div>

      {!editing && (
        <div className={ws.companyShowcase}>
          <Panel>
            <section className={ws.profileBlock}>
              <h3 className={ws.profileSectionTitle}>Company story</h3>
              <p className={ws.bodyText}>
                {company.description.trim() || 'Describe your mission, culture, and what makes your team unique.'}
              </p>
            </section>

            <section className={ws.profileBlock}>
              <h3 className={ws.profileSectionTitle}>Culture & benefits</h3>
              <p className={ws.bodyText}>
                {company.description.trim()
                  ? 'Your public company page showcases this story to candidates before they apply.'
                  : 'Add your company story to highlight culture, values, and benefits on your public page.'}
              </p>
            </section>

            {(company.website || company.linkedInUrl) && (
              <section className={ws.profileBlock}>
                <h3 className={ws.profileSectionTitle}>Links</h3>
                <ul className={ws.linkList}>
                  {company.website && <li><a href={company.website} target="_blank" rel="noopener noreferrer">Website</a></li>}
                  {company.linkedInUrl && <li><a href={company.linkedInUrl} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>}
                </ul>
              </section>
            )}
          </Panel>

          <aside className={ws.stack}>
            <Panel title="Team size">
              <p className={ws.bodyText}>{company.companySize || 'Add team size in brand editor'}</p>
            </Panel>
            <Panel title="Open roles">
              <p className={ws.bodyText}>{company.openJobsCount} active {company.openJobsCount === 1 ? 'role' : 'roles'}</p>
              <Link to="/portal/jobs" className={ws.btnPrimary}>Manage campaigns</Link>
            </Panel>
            <Panel title="Public preview" muted>
              <p className={ws.bodyText}>See how candidates experience your employer brand.</p>
              <Link to={`/companies/${company.slug}`} className={ws.btnGhost} target="_blank" rel="noopener noreferrer">View public page</Link>
            </Panel>
          </aside>
        </div>
      )}
    </PageFrame>
  );
}
