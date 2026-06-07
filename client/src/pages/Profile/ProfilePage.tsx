import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { profilesApi } from '@/api/profilesApi';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import {
  calculateProfileProgress,
  PROFILE_STEPS,
  type ProfileFormState,
} from '@/lib/profileProgress';
import {
  getLocalResumeName,
  setLocalResumeName,
  clearLocalResumeName,
} from '@/lib/userStorage';
import type { Education, Experience, Skill } from '@/models/userProfile';
import styles from './ProfilePage.module.css';

const emptyEducation = (): Education => ({
  institution: '', degree: '', fieldOfStudy: '', isCurrent: false,
});
const emptySkill = (): Skill => ({ name: '', level: '' });
const emptyExperience = (): Experience => ({
  company: '', title: '', description: '', isCurrent: false,
});

export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, reload, setProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [resumeName, setResumeName] = useState(getLocalResumeName() ?? '');
  const [educations, setEducations] = useState<Education[]>([emptyEducation()]);
  const [skills, setSkills] = useState<Skill[]>([emptySkill()]);
  const [experiences, setExperiences] = useState<Experience[]>([emptyExperience()]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (profile || initialized || !user) return;
    setEmail(user.email);
    setInitialized(true);
  }, [profile, initialized, user]);

  useEffect(() => {
    if (!profile || initialized) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setEmail(profile.email);
    setPhone(profile.phone ?? '');
    setBio(profile.bio ?? '');
    setLocation(profile.location ?? '');
    setResumeName(getLocalResumeName() ?? profile.resumeUrl?.replace('local://', '') ?? '');
    setEducations(profile.educations.length ? profile.educations : [emptyEducation()]);
    setSkills(profile.skills.length ? profile.skills : [emptySkill()]);
    setExperiences(profile.experiences.length ? profile.experiences : [emptyExperience()]);
    setInitialized(true);
  }, [profile, initialized]);

  const formState: ProfileFormState = useMemo(() => ({
    firstName, lastName, email, phone, bio, location, resumeName,
    educations, skills, experiences,
  }), [firstName, lastName, email, phone, bio, location, resumeName, educations, skills, experiences]);

  const progress = useMemo(() => calculateProfileProgress(formState), [formState]);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeName(file.name);
      setLocalResumeName(file.name);
    }
  };

  const buildPayload = () => ({
    firstName, lastName, email,
    phone: phone || undefined,
    bio: bio || undefined,
    location: location || undefined,
    resumeUrl: resumeName ? `local://${resumeName}` : undefined,
    educations: educations.filter((e) => e.institution || e.degree),
    skills: skills.filter((s) => s.name),
    experiences: experiences.filter((e) => e.company || e.title),
  });

  const handleSave = async (andNavigate = false) => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = buildPayload();
      const updated = await profilesApi.updateMe(payload);
      setProfile(updated);
      setMessage('Profile saved!');
      await reload();
      if (andNavigate && progress.percentage >= 80) {
        navigate('/swipe');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className={styles.status}>Loading profile...</p>;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Your Profile</h1>
        <p className={styles.pageSubtitle}>Complete your profile to Quick Apply</p>
      </header>

      <div className={styles.progressCard}>
        <div className={styles.progressTop}>
          <span className={styles.progressLabel}>{progress.percentage}% complete</span>
          <span className={styles.progressSteps}>
            Step {step + 1} of {PROFILE_STEPS.length}
          </span>
        </div>
        <div className={styles.progressTrack}>
          <motion.div
            className={styles.progressFill}
            initial={false}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
        <div className={styles.stepPills}>
          {PROFILE_STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              className={`${styles.stepPill} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}
              onClick={() => setStep(i)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && (
            <div className={styles.section}>
              <h2>Personal info</h2>
              <p className={styles.sectionHint}>Required for Quick Apply</p>
              <div className={styles.row}>
                <input placeholder="First name *" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <input placeholder="Last name *" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <input placeholder="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input placeholder="Phone *" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input placeholder="City / Location" value={location} onChange={(e) => setLocation(e.target.value)} />
              <textarea placeholder="Short bio — tell employers about yourself" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
            </div>
          )}

          {step === 1 && (
            <div className={styles.section}>
              <h2>Resume</h2>
              <p className={styles.sectionHint}>Stored locally on your device for now</p>
              <label className={styles.uploadZone}>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} hidden />
                <span className={styles.uploadIcon}>📄</span>
                <span>{resumeName ? 'Replace resume' : 'Upload PDF or Word doc'}</span>
              </label>
              {resumeName && (
                <p className={styles.fileName}>
                  {resumeName}
                  <button type="button" onClick={() => { setResumeName(''); clearLocalResumeName(); }}>Remove</button>
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <>
              <div className={styles.section}>
                <h2>Education</h2>
                {educations.map((ed, i) => (
                  <div key={i} className={styles.block}>
                    <input placeholder="Institution" value={ed.institution}
                      onChange={(e) => { const n = [...educations]; n[i] = { ...ed, institution: e.target.value }; setEducations(n); }} />
                    <input placeholder="Degree" value={ed.degree}
                      onChange={(e) => { const n = [...educations]; n[i] = { ...ed, degree: e.target.value }; setEducations(n); }} />
                    <input placeholder="Field of study" value={ed.fieldOfStudy ?? ''}
                      onChange={(e) => { const n = [...educations]; n[i] = { ...ed, fieldOfStudy: e.target.value }; setEducations(n); }} />
                  </div>
                ))}
                <button type="button" className={styles.addBtn} onClick={() => setEducations([...educations, emptyEducation()])}>+ Add education</button>
              </div>

              <div className={styles.section}>
                <h2>Skills</h2>
                {skills.map((sk, i) => (
                  <div key={i} className={styles.row}>
                    <input placeholder="Skill name" value={sk.name}
                      onChange={(e) => { const n = [...skills]; n[i] = { ...sk, name: e.target.value }; setSkills(n); }} />
                    <input placeholder="Level" value={sk.level ?? ''}
                      onChange={(e) => { const n = [...skills]; n[i] = { ...sk, level: e.target.value }; setSkills(n); }} />
                  </div>
                ))}
                <button type="button" className={styles.addBtn} onClick={() => setSkills([...skills, emptySkill()])}>+ Add skill</button>
              </div>

              <div className={styles.section}>
                <h2>Experience</h2>
                {experiences.map((ex, i) => (
                  <div key={i} className={styles.block}>
                    <input placeholder="Company" value={ex.company}
                      onChange={(e) => { const n = [...experiences]; n[i] = { ...ex, company: e.target.value }; setExperiences(n); }} />
                    <input placeholder="Title" value={ex.title}
                      onChange={(e) => { const n = [...experiences]; n[i] = { ...ex, title: e.target.value }; setExperiences(n); }} />
                    <textarea placeholder="Description" value={ex.description ?? ''} rows={2}
                      onChange={(e) => { const n = [...experiences]; n[i] = { ...ex, description: e.target.value }; setExperiences(n); }} />
                  </div>
                ))}
                <button type="button" className={styles.addBtn} onClick={() => setExperiences([...experiences, emptyExperience()])}>+ Add experience</button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {progress.missing.length > 0 && progress.percentage < 100 && (
        <p className={styles.missingHint}>
          Still needed: {progress.missing.slice(0, 3).join(', ')}
          {progress.missing.length > 3 ? '…' : ''}
        </p>
      )}

      <div className={styles.navRow}>
        {step > 0 && (
          <button type="button" className={styles.backBtn} onClick={() => setStep(step - 1)}>Back</button>
        )}
        {step < PROFILE_STEPS.length - 1 ? (
          <button type="button" className={styles.nextBtn} onClick={() => setStep(step + 1)}>Continue</button>
        ) : (
          <button type="button" className={styles.nextBtn} disabled={saving} onClick={() => void handleSave(true)}>
            {saving ? 'Saving...' : 'Save & start swiping'}
          </button>
        )}
      </div>

      <button type="button" className={styles.saveBtn} disabled={saving} onClick={() => void handleSave()}>
        {saving ? 'Saving...' : 'Save progress'}
      </button>

      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </section>
  );
}
