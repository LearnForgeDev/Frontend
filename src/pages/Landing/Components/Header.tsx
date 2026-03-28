import './Header.css';
import GlowButton from './GlowButton.tsx';
import {useNavigate} from "react-router-dom";

export default function Header() {
    const navigate = useNavigate();
    const handlePress = (): void => {
        navigate("/admin");
    }

  return (
    <header className="hero" id="home">
      <div className="hero-glow hero-glow-left" aria-hidden="true" />
      <div className="hero-glow hero-glow-right" aria-hidden="true" />
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="company-name">LearnForge</h1>
          <p className="slogan">Создавайте и запускайте обучение быстрее, чем когда-либо.</p>
          <div className="hero-actions">
            <div className="cta-buttons">
              <GlowButton 
                  className="btn-primary" 
                  type="button"
                  onClick={handlePress}
              >
                Тест Admin panel
              </GlowButton>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
