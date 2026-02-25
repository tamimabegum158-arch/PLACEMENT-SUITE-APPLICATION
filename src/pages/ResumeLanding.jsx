import { Link } from 'react-router-dom';

export default function ResumeLanding() {
  return (
    <section className="route-content landing">
      <h1 className="heading-1">Build a Resume That Gets Read.</h1>
      <p className="subtext">Create a clean, ATS-friendly resume. Edit in the builder and preview in real time.</p>
      <p className="landing__cta">
        <Link to="/resume/builder" className="btn btn--primary">Start Building</Link>
      </p>
    </section>
  );
}
