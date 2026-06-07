const USER_ID_KEY = 'swipejobs-user-id';
const PROFILE_ID_KEY = 'swipejobs-profile-id';
const RESUME_KEY = 'swipejobs-resume-name';

export function getExternalUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export function getProfileId(): string | null {
  return localStorage.getItem(PROFILE_ID_KEY);
}

export function setProfileId(id: string) {
  localStorage.setItem(PROFILE_ID_KEY, id);
}

export function getLocalResumeName(): string | null {
  return localStorage.getItem(RESUME_KEY);
}

export function setLocalResumeName(name: string) {
  localStorage.setItem(RESUME_KEY, name);
}

export function clearLocalResumeName() {
  localStorage.removeItem(RESUME_KEY);
}
