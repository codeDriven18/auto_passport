import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconChevronLeft } from '@/components/icons/Icons';
import { ProfileBannerUpload } from '@/components/profile/ProfileBannerUpload';
import { ProfileImageUpload } from '@/components/profile/ProfileImageUpload';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/context/ToastContext';
import { useProfile } from '@/hooks/useProfile';
import { getApiErrorMessage } from '@/lib/apiErrors';
import {
  emptyEducation,
  emptyExperience,
  emptySkill,
  formStateToPayload,
  profileToFormState,
  type ProfileFormState,
} from '@/lib/profileForm';
import styles from './ProfilePage.module.css';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

export function ProfileInfoPage() {
  const { showToast } = useToast();
  const {
    profile,
    loading,
    saving,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    uploadBanner,
    removeBanner,
  } = useProfile();

  const [form, setForm] = useState<ProfileFormState | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!profile) return;
    setForm(profileToFormState(profile));
  }, [profile?.id, profile?.updatedAt]);

  const save = useCallback(async (message = 'Saved') => {
    if (!form) return;
    try {
      await updateProfile(formStateToPayload(form));
      showToast(message, 'success');
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Save failed'), 'error');
    }
  }, [form, updateProfile, showToast]);

  const patchForm = (patch: Partial<ProfileFormState>) => {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  if (loading || !form || !profile) {
    return (
      <section className={styles.page}>
        <ProfileSkeleton />
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.sectionPageHeader}>
        <Link to="/profile" className={styles.backLink}>
          <IconChevronLeft size={18} /> Profile
        </Link>
        <h1 className={styles.sectionPageTitle}>Profile info</h1>
      </header>

      <div className={styles.panel}>
        <h2 className={styles.infoBlockTitle}>Background image</h2>
        <ProfileBannerUpload
          bannerUrl={profile.bannerUrl}
          uploading={saving}
          uploadProgress={uploadProgress}
          onUpload={async (file) => {
            setUploadProgress(0);
            await uploadBanner(file, setUploadProgress);
            showToast('Background updated', 'success');
          }}
          onRemove={async () => {
            await removeBanner();
            showToast('Background removed', 'success');
          }}
        />
      </div>

      <div className={styles.panel}>
        <h2 className={styles.infoBlockTitle}>Profile photo</h2>
        <ProfileImageUpload
          profile={profile}
          uploading={saving}
          uploadProgress={uploadProgress}
          onUpload={async (file) => {
            setUploadProgress(0);
            await uploadAvatar(file, setUploadProgress);
            showToast('Photo updated', 'success');
          }}
          onRemove={async () => {
            await removeAvatar();
            showToast('Photo removed', 'success');
          }}
        />
      </div>

      <div className={styles.panel}>
        <h2 className={styles.infoBlockTitle}>About me</h2>
        <Field label="Bio">
          <textarea
            rows={5}
            value={form.bio}
            onChange={(e) => patchForm({ bio: e.target.value })}
            placeholder="Tell employers who you are and what you are looking for."
          />
        </Field>
        <button type="button" className={styles.saveBtn} disabled={saving} onClick={() => void save('About me saved')}>
          {saving ? 'Saving…' : 'Save about me'}
        </button>
      </div>

      <div className={styles.panel}>
        <h2 className={styles.infoBlockTitle}>Experience</h2>
        {form.experiences.map((ex, i) => (
          <div key={i} className={styles.block}>
            <input
              placeholder="Company"
              value={ex.company}
              onChange={(e) => {
                const experiences = [...form.experiences];
                experiences[i] = { ...ex, company: e.target.value };
                patchForm({ experiences });
              }}
            />
            <input
              placeholder="Title"
              value={ex.title}
              onChange={(e) => {
                const experiences = [...form.experiences];
                experiences[i] = { ...ex, title: e.target.value };
                patchForm({ experiences });
              }}
            />
            <textarea
              placeholder="Description"
              rows={2}
              value={ex.description ?? ''}
              onChange={(e) => {
                const experiences = [...form.experiences];
                experiences[i] = { ...ex, description: e.target.value };
                patchForm({ experiences });
              }}
            />
          </div>
        ))}
        <button type="button" className={styles.ghostBtn} onClick={() => patchForm({ experiences: [...form.experiences, emptyExperience()] })}>
          + Add experience
        </button>
        <button type="button" className={styles.saveBtn} disabled={saving} onClick={() => void save('Experience saved')}>
          {saving ? 'Saving…' : 'Save experience'}
        </button>
      </div>

      <div className={styles.panel}>
        <h2 className={styles.infoBlockTitle}>Skills</h2>
        {form.skills.map((sk, i) => (
          <div key={i} className={styles.grid2}>
            <input
              placeholder="Skill"
              value={sk.name}
              onChange={(e) => {
                const skills = [...form.skills];
                skills[i] = { ...sk, name: e.target.value };
                patchForm({ skills });
              }}
            />
            <input
              placeholder="Level"
              value={sk.level ?? ''}
              onChange={(e) => {
                const skills = [...form.skills];
                skills[i] = { ...sk, level: e.target.value };
                patchForm({ skills });
              }}
            />
          </div>
        ))}
        <button type="button" className={styles.ghostBtn} onClick={() => patchForm({ skills: [...form.skills, emptySkill()] })}>
          + Add skill
        </button>
        <button type="button" className={styles.saveBtn} disabled={saving} onClick={() => void save('Skills saved')}>
          {saving ? 'Saving…' : 'Save skills'}
        </button>
      </div>

      <div className={styles.panel}>
        <h2 className={styles.infoBlockTitle}>Education</h2>
        {form.educations.map((ed, i) => (
          <div key={i} className={styles.block}>
            <input
              placeholder="Institution"
              value={ed.institution}
              onChange={(e) => {
                const educations = [...form.educations];
                educations[i] = { ...ed, institution: e.target.value };
                patchForm({ educations });
              }}
            />
            <input
              placeholder="Degree"
              value={ed.degree}
              onChange={(e) => {
                const educations = [...form.educations];
                educations[i] = { ...ed, degree: e.target.value };
                patchForm({ educations });
              }}
            />
            <input
              placeholder="Field of study"
              value={ed.fieldOfStudy ?? ''}
              onChange={(e) => {
                const educations = [...form.educations];
                educations[i] = { ...ed, fieldOfStudy: e.target.value };
                patchForm({ educations });
              }}
            />
          </div>
        ))}
        <button type="button" className={styles.ghostBtn} onClick={() => patchForm({ educations: [...form.educations, emptyEducation()] })}>
          + Add education
        </button>
        <button type="button" className={styles.saveBtn} disabled={saving} onClick={() => void save('Education saved')}>
          {saving ? 'Saving…' : 'Save education'}
        </button>
      </div>
    </section>
  );
}
