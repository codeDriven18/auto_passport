import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppIcon } from '@/components/brand/AppIcon';
import { useTheme } from '@/theme/ThemeProvider';
import { APP_URL, NAV_LINKS } from './constants';
import styles from './LandingNav.module.css';

export function LandingNav() {
  const { mode, setPreference } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <a href="#home" className={styles.brand} onClick={closeMenu}>
          <AppIcon size="sm" showShadow={false} />
          <span>SwipeJobs</span>
        </a>

        <nav className={styles.desktopNav} aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.id} href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <div className={styles.themeToggle} role="group" aria-label="Theme">
            <button
              type="button"
              className={mode === 'light' ? styles.themeActive : ''}
              onClick={() => setPreference('light')}
              aria-pressed={mode === 'light'}
            >
              Light
            </button>
            <button
              type="button"
              className={mode === 'dark' ? styles.themeActive : ''}
              onClick={() => setPreference('dark')}
              aria-pressed={mode === 'dark'}
            >
              Dark
            </button>
          </div>
          <a href={APP_URL} className={styles.openApp}>
            Open App
          </a>
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu} role="dialog" aria-modal="true" aria-label="Navigation">
          <nav className={styles.mobileNav}>
            {NAV_LINKS.map((link) => (
              <a key={link.id} href={link.href} className={styles.mobileLink} onClick={closeMenu}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className={styles.mobileTheme}>
            <button type="button" onClick={() => setPreference('light')}>Light</button>
            <button type="button" onClick={() => setPreference('dark')}>Dark</button>
          </div>
          <a href={APP_URL} className={styles.mobileCta} onClick={closeMenu}>
            Open App
          </a>
          <Link to="/privacy" className={styles.mobileLegal} onClick={closeMenu}>
            Privacy
          </Link>
        </div>
      )}
    </header>
  );
}
