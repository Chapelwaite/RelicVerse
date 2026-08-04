import { Link } from 'react-router-dom';
import { Home, Search, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container notfound">
      <div className="orb orb-violet orb-anim" style={{ width: 380, height: 380, top: '10%', left: '50%', transform: 'translateX(-50%)' }} />

      <span className="eyebrow" style={{ position: 'relative' }}>შეცდომა 404</span>
      <div className="big" style={{ position: 'relative' }}>404</div>

      <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', position: 'relative' }}>
        ეს პორტალი სხვა სამყაროში მიდის
      </h1>
      <p className="text-muted" style={{ maxWidth: '48ch', position: 'relative' }}>
        გვერდი, რომელსაც ეძებ, ან წაიშალა, ან არასდროს არსებობდა. მოდი, დავბრუნდეთ ნაცნობ ტერიტორიაზე.
      </p>

      <div className="flex gap-10 flex-wrap" style={{ justifyContent: 'center', position: 'relative' }}>
        <Link to="/" className="btn btn-primary"><Home size={16} /> მთავარი გვერდი</Link>
        <Link to="/catalog" className="btn btn-ghost"><Search size={16} /> კატალოგი</Link>
        <Link to="/universes" className="btn btn-ghost"><Compass size={16} /> სამყაროები</Link>
      </div>
    </div>
  );
}
