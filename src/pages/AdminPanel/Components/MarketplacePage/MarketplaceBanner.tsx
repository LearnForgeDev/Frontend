import type {JSX} from "react";

export default function MarketplaceBanner(): JSX.Element {
    return (
        <section className="admin-marketplace-hero admin-card">
            <div className="admin-marketplace-hero-content">
                <h1 className="admin-page-title">
                    <span>Создайте свое рабочее пространство.</span>
                    <br />
                    Платите только за то, чем пользуетесь.
                </h1>
                <p className="admin-page-description">
                    LearnForge растет вместе с Вами.
                    Масштабируйтесь или ли сохраняйте минималистичный набор для уроков.
                </p>
            </div>
            <div className="admin-marketplace-hero-orbit" aria-hidden="true" />
        </section>
    );
}