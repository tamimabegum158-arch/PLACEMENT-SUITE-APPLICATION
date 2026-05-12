import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePlatform } from '../store/PlatformContext';
import { computeAtsScore } from '../lib/atsScore';

export default function NotificationBanner() {
  const { resumeData, lastActivity, preferences } = usePlatform();
  const atsScore = useMemo(() => computeAtsScore(resumeData), [resumeData]);
  const hasPreferences = Boolean(preferences?.roleKeywords?.length);

  const message = useMemo(() => {
    if (atsScore > 0 && atsScore < 70) {
      return { text: 'Your resume ATS score is below 70. Improve it to stand out.', to: '/resume/builder' };
    }
    // Only nudge returning users who already set preferences (avoid stacking with Jobs onboarding banner)
    if (lastActivity && hasPreferences) {
      const t = new Date(lastActivity).getTime();
      if (!Number.isFinite(t)) return null;
      const days = (Date.now() - t) / (24 * 60 * 60 * 1000);
      if (days >= 3) {
        return { text: "You haven't been active for 3+ days. Open Dashboard or analyze a JD to get back on track.", to: '/dashboard' };
      }
    }
    return null;
  }, [atsScore, lastActivity, hasPreferences]);

  if (!message) return null;

  return (
    <div
      className="preferences-banner"
      style={{ margin: 0, borderRadius: 0, textAlign: 'center' }}
    >
      {message.to ? (
        <Link to={message.to}>{message.text}</Link>
      ) : (
        message.text
      )}
    </div>
  );
}
