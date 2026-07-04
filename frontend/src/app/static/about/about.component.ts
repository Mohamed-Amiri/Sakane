import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { fadeInUpAnimation } from '../../shared/animations/fade.animation';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  animations: [fadeInUpAnimation],
  template: `
    <div class="about-page" [@fadeInUp]>
      <!-- Hero -->
      <div class="about-hero">
        <div class="container">
          <span class="eyebrow"><span class="dot"></span>À propos</span>
          <h1>L'art de louer un espace, au Maroc</h1>
          <p class="hero-subtitle">Sakane connecte les propriétaires d'espaces d'exception avec ceux qui cherchent le lieu parfait — d'Agadir à Tanger.</p>
        </div>
      </div>

      <!-- Mission -->
      <div class="content-section">
        <div class="container">
          <div class="about-grid">
            <div class="about-text">
              <h2>Notre mission</h2>
              <p>
                Nous repensons la façon dont on trouve et loue un espace au Maroc. Chaque lieu de
                notre catalogue est sélectionné avec soin — villas, riads, bureaux, studios — pour
                vos événements, vos réunions ou vos projets créatifs.
              </p>

              <h3>Nos valeurs</h3>
              <ul class="values">
                <li><i class="ph ph-shield-check"></i><div><strong>Confiance</strong><span>Chaque espace est vérifié avant sa mise en ligne.</span></div></li>
                <li><i class="ph ph-cursor-click"></i><div><strong>Simplicité</strong><span>Une réservation claire, en quelques étapes.</span></div></li>
                <li><i class="ph ph-medal"></i><div><strong>Qualité</strong><span>Une sélection exigeante, pensée pour durer.</span></div></li>
                <li><i class="ph ph-headset"></i><div><strong>Accompagnement</strong><span>Une équipe disponible à chaque étape.</span></div></li>
              </ul>
            </div>

            <aside class="about-aside">
              <div class="aside-card">
                <i class="ph ph-buildings aside-mark"></i>
                <h4>Vous avez un espace à louer ?</h4>
                <p>Rejoignez les premiers propriétaires de Sakane et donnez de la valeur à vos espaces inoccupés.</p>
                <a routerLink="/register" class="aside-cta">Devenir propriétaire <i class="ph ph-arrow-right"></i></a>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { --navy:#0A2540; --navy-2:#0F3460; --gold:#C9A84C; --cream:#FAF7F0; --ink:#2C3E50; --muted:#6B7C93; }

    .about-page { min-height: 100vh; background: var(--cream); font-family: 'DM Sans', sans-serif; }

    .container { max-width: 1100px; margin: 0 auto; padding: 0 2rem; }

    .about-hero {
      background: linear-gradient(135deg, var(--navy) 0%, var(--navy-2) 100%);
      color: #fff;
      padding: 6rem 0 4.5rem;
      position: relative;
      overflow: hidden;
    }
    .about-hero::after {
      content: ''; position: absolute; right: -6%; bottom: -40%;
      width: 360px; height: 360px; border-radius: 50% 50% 0 50%;
      border: 1px solid rgba(201,168,76,0.18);
    }
    .eyebrow {
      display: inline-flex; align-items: center; gap: 0.5rem;
      font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
      color: var(--gold);
      .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--gold); }
    }
    .about-hero h1 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(2.25rem, 5vw, 3.4rem);
      font-weight: 700; line-height: 1.1; letter-spacing: -0.01em;
      margin: 1rem 0 1.25rem; max-width: 16ch; color: #fff;
    }
    .hero-subtitle { font-size: 1.1rem; line-height: 1.7; color: rgba(255,255,255,0.78); max-width: 56ch; }

    .content-section { padding: 4.5rem 0 5.5rem; }

    .about-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 4rem; align-items: start; }

    .about-text {
      h2 {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 2.1rem; font-weight: 600; color: var(--navy); margin: 0 0 1rem;
      }
      h3 {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 1.55rem; font-weight: 600; color: var(--navy); margin: 2.25rem 0 1.25rem;
      }
      p { font-size: 1.05rem; line-height: 1.8; color: var(--ink); }
    }

    .values {
      list-style: none; padding: 0; margin: 0;
      display: flex; flex-direction: column; gap: 1.1rem;

      li { display: flex; gap: 0.9rem; align-items: flex-start; }
      i { font-size: 1.4rem; color: var(--gold); margin-top: 2px; flex-shrink: 0; }
      strong { display: block; font-size: 1rem; font-weight: 600; color: var(--navy); }
      span { font-size: 0.92rem; color: var(--muted); line-height: 1.5; }
    }

    .aside-card {
      background: var(--navy);
      color: #fff;
      border-radius: 12px;
      padding: 2.25rem;
      position: sticky; top: 100px;
      box-shadow: 0 2px 16px rgba(10,37,64,0.10);

      .aside-mark { font-size: 2.25rem; color: var(--gold); }
      h4 {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 1.6rem; font-weight: 600; color: #fff; margin: 1rem 0 0.6rem;
      }
      p { font-size: 0.95rem; line-height: 1.65; color: rgba(255,255,255,0.72); margin-bottom: 1.5rem; }
      .aside-cta {
        display: inline-flex; align-items: center; gap: 0.5rem;
        background: var(--gold); color: var(--navy);
        font-weight: 600; font-size: 0.92rem; text-decoration: none;
        padding: 0.7rem 1.25rem; border-radius: 6px; transition: all 200ms ease;
        i { transition: transform 200ms ease; }
        &:hover { background: #E8C46A; i { transform: translateX(3px); } }
      }
    }

    @media (max-width: 860px) {
      .about-grid { grid-template-columns: 1fr; gap: 2.5rem; }
      .aside-card { position: static; }
      .about-hero { padding: 4.5rem 0 3.5rem; }
    }
  `]
})
export class AboutComponent {}
