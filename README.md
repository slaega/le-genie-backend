# Legenei Blog Backend

LeUn backend moderne et robuste pour le blog Legenei, construit avec NestJS et suivant les principes de Clean Architecture.

## 🚀 Technologies

- **Framework**: NestJS v11
- **Base de données**: Prisma ORM
- **Authentication**: JWT, Passport (Google & GitHub OAuth)
- **File Storage**: AWS S3
- **Queue Management**: BullMQ
- **Logging**: Pino
- **Documentation**: Swagger/OpenAPI
- **Internationalisation**: nestjs-i18n
- **Testing**: Jest

## 🏗️ Architecture

Le projet suit une architecture hexagonale (Clean Architecture) avec les couches suivantes :

- **applications**: Contient les cas d'utilisation de l'application
- **domain**: Définit les entités et les interfaces du domaine
- **infra**: Implémentations concrètes des interfaces (repositories, services externes)
- **shared**: Utilitaires et composants partagés
- **core**: Fonctionnalités fondamentales de l'application

## 🔧 Installation

```bash
# Installation des dépendances
yarn install

# Configuration des variables d'environnement
cp .env.sample .env
# Remplir les variables dans .env

# Génération du client Prisma
yarn prisma generate

# Migration de la base de données
yarn prisma migrate dev
```

## 🚀 Démarrage

```bash
# Mode développement
yarn start:dev

# Mode production
yarn build
yarn start:prod
```

## 🧪 Tests

```bash
# Tests unitaires
yarn test

# Tests e2e
yarn test:e2e

# Couverture de tests
yarn test:cov
```

## 📚 Documentation API

La documentation Swagger est disponible à l'URL `/api` une fois l'application lancée.

## 🔐 Sécurité

- Utilisation de Helmet pour la sécurité des en-têtes HTTP
- Rate limiting avec @nestjs/throttler
- Validation des données avec class-validator
- Authentification sécurisée via JWT et OAuth

## 🌍 Internationalisation

Le projet supporte plusieurs langues grâce à nestjs-i18n. Les traductions sont stockées dans le dossier `assets/i18n/`.

## 📨 File d'attente

BullMQ est utilisé pour gérer les tâches asynchrones comme l'envoi d'emails et le traitement des fichiers.

## 🤝 Contribution

Pour contribuer au projet :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## License

Ce projet est sous licence MIT.
