export const APP_URL = 'https://swipejobs-khaki.vercel.app';

export const NAV_LINKS = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'job-seekers', label: 'Job Seekers', href: '#job-seekers' },
  { id: 'employers', label: 'Employers', href: '#employers' },
  { id: 'features', label: 'Features', href: '#features' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'contact', label: 'Contact', href: '#contact' },
] as const;

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Discover',
    text: 'Swipe through curated roles tailored to your skills, location, and preferences — not endless lists.',
  },
  {
    step: '02',
    title: 'Match',
    text: 'Intelligent scoring surfaces opportunities with the highest fit so you spend time on roles that matter.',
  },
  {
    step: '03',
    title: 'Apply',
    text: 'One tap to apply with your profile. Track status in real time and never lose momentum.',
  },
] as const;

export const FEATURES = [
  { title: 'Swipe Discovery', text: 'Mobile-native job browsing that feels instant and intuitive.' },
  { title: 'Smart Matching', text: 'Personalized recommendations powered by your profile and activity.' },
  { title: 'Saved Opportunities', text: 'Bookmark roles and return when you are ready to move.' },
  { title: 'Real-time Applications', text: 'Live status updates the moment employers respond.' },
  { title: 'Mobile First', text: 'Designed for thumbs, not spreadsheets — fast on every device.' },
  { title: 'PWA Support', text: 'Install SwipeJobs to your home screen for app-like speed.' },
] as const;

export const SHOWCASE_JOBS = [
  { company: 'NovaTech', title: 'Senior Product Designer', salary: '$120k – $145k', location: 'Remote · US' },
  { company: 'Atlas Labs', title: 'Full Stack Engineer', salary: '$95k – $130k', location: 'Berlin · Hybrid' },
  { company: 'Pulse Health', title: 'Growth Marketing Lead', salary: '$85k – $110k', location: 'London · On-site' },
  { company: 'Orbit AI', title: 'Machine Learning Engineer', salary: '$140k – $175k', location: 'San Francisco · Hybrid' },
  { company: 'Brightline', title: 'Customer Success Manager', salary: '$70k – $90k', location: 'Remote · EU' },
] as const;

export const STATS = [
  { value: 12400, suffix: '+', label: 'Jobs' },
  { value: 8900, suffix: '+', label: 'Applications' },
  { value: 620, suffix: '+', label: 'Companies' },
  { value: 94, suffix: '%', label: 'Matches' },
] as const;

export const TESTIMONIALS = [
  {
    quote: 'I found my role in under a week. SwipeJobs cut through the noise and showed me exactly what fit.',
    name: 'Sarah Chen',
    role: 'Product Designer · NovaTech',
  },
  {
    quote: 'We fill positions faster with qualified candidates who actually match our requirements.',
    name: 'Marcus Webb',
    role: 'Head of Talent · Atlas Labs',
  },
  {
    quote: 'The mobile experience is unmatched. I applied on my commute and had a response the same day.',
    name: 'Amira Hassan',
    role: 'Software Engineer · Orbit AI',
  },
] as const;
