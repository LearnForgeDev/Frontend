import GlowButton from './GlowButton';

export default function Navbar() {
  return (
    <nav className="top-nav" aria-label="Основная навигация">
      <div className="nav-shell">
        <div className="nav-brand">learnForge</div>
        <div className="nav-links">
          <a href="#home">Главная</a>
          <a href="#features">Возможности</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-action">
          <GlowButton className="nav-login" type="button">
            Войти
          </GlowButton>
        </div>
      </div>
    </nav>
  );
}
