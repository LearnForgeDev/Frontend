import type {JSX} from "react";

export default function MarketplaceUpgrade(): JSX.Element {
    return(
        <section className="admin-marketplace-upgrade admin-card">
            <div style={{ display: "flex", alignContent: 'flex-end', flexDirection: 'column', height: '100%' }}>
                <h3 className="admin-widget-title">Нужно индивидуальное решение для школы?</h3>
                <p>
                    LearnForge предлагает массовое лицензирование студентов, отдельный домен и
                    персонального менеджера для школ с более чем 50 преподавателями.
                </p>
                <a
                    className="admin-button ghost"
                    type="button"
                    href={'https://t.me/fgdsfgjsykswrtyasgrjs'}
                    target={'_blank`'}
                >Связаться со специалистом</a>
            </div>
            <div className="admin-marketplace-upgrade-media" aria-hidden="true" />
        </section>
    );
}
