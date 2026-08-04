import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Music2 } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useShop } from '../../context/ShopContext';

const SHOP_LINKS = [
  { to: '/catalog', label: 'ყველა პროდუქტი' },
  { to: '/universes', label: 'სამყაროები' },
  { to: '/collections', label: 'კოლექციები' },
  { to: '/sale', label: 'აქციები' },
  { to: '/catalog?newArrival=1', label: 'ახალი ნივთები' },
];

const HELP_LINKS = [
  { to: '/help', label: 'დახმარება' },
  { to: '/shipping', label: 'მიწოდება' },
  { to: '/returns', label: 'დაბრუნების პირობები' },
  { to: '/privacy', label: 'კონფიდენციალურობა' },
  { to: '/about', label: 'ჩვენ შესახებ' },
];

export function Footer() {
  const { settings } = useShop();
  const social = settings.social || {};

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Logo slogan={null} />
            <p className="text-muted text-sm mt-14" style={{ maxWidth: '38ch' }}>
              {settings.tagline || 'ნივთები იმ სამყაროებიდან, რომლებიც არასდროს დაგავიწყდება.'}
            </p>
            <div className="social-row">
              {social.facebook && <a className="social-btn" href={social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={17} /></a>}
              {social.instagram && <a className="social-btn" href={social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17} /></a>}
              {social.tiktok && <a className="social-btn" href={social.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok"><Music2 size={17} /></a>}
              {social.youtube && <a className="social-btn" href={social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube"><Youtube size={17} /></a>}
            </div>
          </div>

          <div>
            <h4>კატალოგი</h4>
            <div className="footer-links">
              {SHOP_LINKS.map((l) => <Link key={l.to} to={l.to}>{l.label}</Link>)}
            </div>
          </div>

          <div>
            <h4>დახმარება</h4>
            <div className="footer-links">
              {HELP_LINKS.map((l) => <Link key={l.to} to={l.to}>{l.label}</Link>)}
            </div>
          </div>

          <div>
            <h4>კონტაქტი</h4>
            <div className="footer-contact">
              {settings.phone && <div><Phone size={15} /> <a href={`tel:${settings.phone.replace(/\s/g, '')}`}>{settings.phone}</a></div>}
              {settings.email && <div><Mail size={15} /> <a href={`mailto:${settings.email}`}>{settings.email}</a></div>}
              {settings.address && <div><MapPin size={15} /> <span>{settings.address}</span></div>}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} RelicVerse. ყველა უფლება დაცულია.</span>
          <button
            type="button"
            className="footer-replay"
            onClick={() => {
              try { sessionStorage.removeItem('relicverse-intro-seen'); } catch { /* ignore */ }
              window.location.assign('/');
            }}
          >
            ✦ Intro-ს თავიდან ნახვა
          </button>
          <span>დამზადებულია ❤️-ით საქართველოში</span>
        </div>
      </div>
    </footer>
  );
}
