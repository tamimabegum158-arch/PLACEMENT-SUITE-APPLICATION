import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePlatform } from '../store/PlatformContext';
import { computeAtsScore } from '../lib/atsScore';

export default function NotificationBanner() {
  const { resumeData, lastActivity } = usePlatform();
  const atsScore = useMemo(() => computeAtsScore(resumeData), [resumeData]);

  const message = useMemo(() => {
    if (atsScore > 0 && atsScore < 70) {
      return { text: 'Your resume ATS score is below 70. Improve it to stand out.', to: '/resume/builder' };
    }
    if (lastActivity) {
      const days = (Date.now() - new Date(lastActivity).getTime()) / (24 * 60 * 60 * 1000);
      if (days >= 3) {
        return { text: "You haven't been active for 3+ days. Set preferences or analyze a JD to get back on track.", to: '/dashboard' };
      }
    }
    return null;
  }, [atsScore, lastActivity]);

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
