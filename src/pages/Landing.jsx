import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <section className="route-content">
      <h1 className="heading-1">Placement Suite</h1>
      <p className="subtext">One pipeline: Jobs → JD Analysis → Resume → Applications → Readiness.</p>
      <p>
        <Link to="/dashboard" className="btn btn--primary">Go to Dashboard</Link>
      </p>
    </section>
  );
}
