import GlowButton from './GlowButton';

export default function Header() {
  return (
    <header className="hero" id="home">
      <div className="hero-glow hero-glow-left" aria-hidden="true" />
      <div className="hero-glow hero-glow-right" aria-hidden="true" />
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="company-name">learnForge</h1>
          <p className="slogan">Создавайте и запускайте обучение быстрее, чем когда-либо.</p>
          <div className="hero-actions">
            <div className="cta-buttons">
              <GlowButton className="btn-primary" type="button">
                Попробовать
              </GlowButton>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
