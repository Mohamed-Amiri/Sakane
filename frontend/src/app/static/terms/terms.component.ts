import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terms-page">
      <div class="container">
        <div class="terms-header">
          <h1>Conditions d'utilisation</h1>
          <p>Dernière mise à jour : 1er janvier 2024</p>
        </div>

        <div class="terms-content">
          <section class="terms-section">
            <h2>1. Acceptation des conditions</h2>
            <p>En utilisant Sakane, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.</p>
          </section>

          <section class="terms-section">
            <h2>2. Description du service</h2>
            <p>Sakane est une plateforme de location d'espaces qui met en relation propriétaires et locataires. Nous fournissons un service de réservation en ligne pour divers types d'espaces.</p>
          </section>

          <section class="terms-section">
            <h2>3. Inscription et compte utilisateur</h2>
            <p>Pour utiliser certains services, vous devez créer un compte. Vous êtes responsable de maintenir la confidentialité de vos informations de connexion et de toutes les activités qui se produisent sous votre compte.</p>
          </section>

          <section class="terms-section">
            <h2>4. Utilisation acceptable</h2>
            <p>Vous vous engagez à utiliser le service uniquement à des fins légales et conformément à ces conditions. Vous ne devez pas :</p>
            <ul>
              <li>Utiliser le service de manière frauduleuse</li>
              <li>Violer les droits de propriété intellectuelle</li>
              <li>Publier du contenu offensant ou inapproprié</li>
              <li>Tenter d'accéder non autorisé à nos systèmes</li>
            </ul>
          </section>

          <section class="terms-section">
            <h2>5. Réservations et paiements</h2>
            <p>Les réservations sont soumises à disponibilité. Les paiements sont traités de manière sécurisée et les frais sont détaillés lors de la réservation.</p>
          </section>

          <section class="terms-section">
            <h2>6. Annulations et remboursements</h2>
            <p>Les politiques d'annulation varient selon les propriétaires. Veuillez consulter les conditions spécifiques de chaque espace avant de réserver.</p>
          </section>

          <section class="terms-section">
            <h2>7. Responsabilité</h2>
            <p>Sakane agit comme intermédiaire entre propriétaires et locataires. Nous ne sommes pas responsables des dommages causés par l'utilisation des espaces loués.</p>
          </section>

          <section class="terms-section">
            <h2>8. Protection des données</h2>
            <p>Nous collectons et traitons vos données personnelles conformément à notre politique de confidentialité. Vos données sont protégées et ne sont pas vendues à des tiers.</p>
          </section>

          <section class="terms-section">
            <h2>9. Modifications des conditions</h2>
            <p>Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications seront publiées sur cette page avec une nouvelle date d'effet.</p>
          </section>

          <section class="terms-section">
            <h2>10. Contact</h2>
            <p>Pour toute question concernant ces conditions, contactez-nous à contact&#64;locaspace.com</p>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .terms-page {
      padding: 40px 0;
      background: #f8fafc;
      min-height: 100vh;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .terms-header {
      text-align: center;
      margin-bottom: 60px;
    }

    .terms-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 16px;
    }

    .terms-header p {
      font-size: 1.125rem;
      color: #6b7280;
    }

    .terms-content {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .terms-section {
      margin-bottom: 40px;
    }

    .terms-section:last-child {
      margin-bottom: 0;
    }

    .terms-section h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
    }

    .terms-section p {
      color: #4b5563;
      line-height: 1.7;
      margin-bottom: 16px;
    }

    .terms-section ul {
      color: #4b5563;
      line-height: 1.7;
      padding-left: 20px;
    }

    .terms-section li {
      margin-bottom: 8px;
    }

    @media (max-width: 768px) {
      .terms-header h1 {
        font-size: 2rem;
      }

      .terms-content {
        padding: 24px;
      }
    }
  `]
})
export class TermsComponent {} 