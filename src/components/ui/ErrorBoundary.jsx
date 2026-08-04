import { Component } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

/**
 * გლობალური შეცდომების დამჭერი — თუ რომელიმე კომპონენტი ჩავარდება,
 * მომხმარებელი ცარიელ ეკრანს კი არ ნახავს, არამედ გასაგებ შეტყობინებას.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[RelicVerse] კომპონენტის შეცდომა:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="container" style={{ paddingTop: 120 }}>
        <div className="empty-state">
          <div className="empty-icon" style={{ color: 'var(--danger)' }}><AlertTriangle size={38} /></div>
          <h3>რაღაც არასწორად წავიდა</h3>
          <p>ჩვენ უკვე ვიცით პრობლემის შესახებ. სცადე გვერდის განახლება.</p>
          <details style={{ maxWidth: '60ch', color: 'var(--text-dim)', fontSize: '.8rem' }}>
            <summary style={{ cursor: 'pointer' }}>ტექნიკური დეტალები</summary>
            <pre style={{ whiteSpace: 'pre-wrap', marginTop: 10 }}>{String(this.state.error?.message || this.state.error)}</pre>
          </details>
          <div className="flex gap-10 flex-wrap" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              <RotateCcw size={16} /> გვერდის განახლება
            </button>
            <a className="btn btn-ghost" href="/"><Home size={16} /> მთავარი გვერდი</a>
          </div>
        </div>
      </div>
    );
  }
}
