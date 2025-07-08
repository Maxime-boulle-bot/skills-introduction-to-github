# Application Mobile de Planning de Chantier avec IA

## 🏗️ Description

Cette application mobile permet de gérer et planifier des chantiers de construction avec l'aide de l'intelligence artificielle. Elle offre des fonctionnalités complètes de planification, de pointage et de suivi de projet.

## ✨ Fonctionnalités Principales

### 🤖 Génération IA de Planning
- **Création automatique** : Génère un planning complet basé sur la description du projet
- **Optimisation intelligente** : Organise les tâches selon les dépendances et priorités
- **Suggestions personnalisées** : Analyse le planning existant et propose des améliorations

### 📅 Gestion du Planning
- **Calendrier interactif** : Visualisation claire des tâches par date
- **Gestion des tâches** : Création, modification et suppression de tâches
- **Statuts multiples** : Suivi de l'avancement (Non commencé, En cours, Terminé, En attente, Annulé)
- **Système de priorités** : Classification par urgence (Urgent, Élevé, Moyen, Faible)
- **Catégories de tâches** : Fondation, Structure, Électricité, Plomberie, Finition, Inspection

### ⏱️ Pointage et Suivi du Temps
- **Pointage en temps réel** : Démarrage/arrêt avec minuteur automatique
- **Saisie manuelle** : Ajout d'heures de travail a posteriori
- **Progression visuelle** : Barres de progression pour chaque tâche
- **Statistiques journalières** : Résumé des heures travaillées

### 📊 Tableau de Bord
- **Vue d'ensemble** : Statistiques globales du projet
- **Métriques clés** : Tâches terminées, en cours, en retard
- **Analyse d'efficacité** : Comparaison heures estimées vs réalisées
- **Tâches du jour** : Aperçu des activités quotidiennes
- **Prochaines échéances** : Planification sur 7 jours

## 📱 Interface Utilisateur

### Navigation
L'application utilise une navigation par onglets avec 3 écrans principaux :

1. **📊 Tableau de Bord** - Vue d'ensemble et statistiques
2. **📅 Planning** - Gestion du calendrier et des tâches
3. **⏱️ Pointage** - Suivi du temps de travail

### Design
- **Interface moderne** : Design épuré avec couleurs intuitives
- **Responsive** : Adapté aux différentes tailles d'écran
- **Icônes explicites** : Emojis et icônes pour une navigation intuitive
- **Feedback visuel** : Animations et indicateurs de statut

## 🔧 Technologies Utilisées

- **React Native** avec Expo
- **TypeScript** pour la sécurité des types
- **React Navigation** pour la navigation
- **React Native Elements** pour l'UI
- **AsyncStorage** pour le stockage local
- **Date-fns** pour la gestion des dates
- **React Native Calendars** pour l'affichage du calendrier

## 📦 Installation et Démarrage

### Prérequis
```bash
- Node.js (v18 ou plus)
- npm ou yarn
- Expo CLI
```

### Installation
```bash
cd ChantierPlanningApp
npm install
```

### Démarrage
```bash
# Démarrage général
npm start

# Android
npm run android

# iOS (macOS uniquement)
npm run ios

# Web
npm run web
```

## 📋 Guide d'Utilisation

### 1. Première Utilisation

#### Génération IA d'un Planning
1. Allez dans l'onglet **Planning**
2. Appuyez sur **🤖 Générer avec IA**
3. Décrivez votre projet (ex: "Construction d'une maison de 120m²")
4. Définissez la durée et la taille de l'équipe
5. L'IA génère automatiquement un planning optimisé

### 2. Gestion des Tâches

#### Créer une Tâche Manuellement
1. Dans l'onglet **Planning**, appuyez sur **➕ Nouvelle tâche**
2. Remplissez les informations : titre, description, dates, etc.
3. Assignez des priorités et catégories
4. Sauvegardez

#### Modifier une Tâche
1. Appuyez sur l'icône ✏️ à côté de la tâche
2. Modifiez les informations nécessaires
3. Sauvegardez les changements

#### Changer le Statut
- Appuyez directement sur les boutons de statut colorés sous chaque tâche
- Les couleurs indiquent l'état : Rouge (Non commencé), Bleu (En cours), Vert (Terminé)

### 3. Pointage du Temps

#### Pointage Automatique
1. Allez dans l'onglet **Pointage**
2. Trouvez votre tâche dans la liste
3. Appuyez sur **▶️ Démarrer** pour commencer
4. Appuyez sur **⏹️ Arrêter** pour terminer
5. Le temps est automatiquement calculé et enregistré

#### Saisie Manuelle
1. Appuyez sur **📝 Saisie manuelle**
2. Sélectionnez la tâche
3. Entrez le nombre d'heures
4. Ajoutez une description (optionnel)
5. Enregistrez

### 4. Suivi et Analyse

#### Consulter le Tableau de Bord
- Statistiques en temps réel
- Progression globale du projet
- Heures travaillées (jour/semaine/total)
- Tâches prioritaires d'aujourd'hui
- Prochaines échéances

#### Obtenir des Suggestions IA
1. Dans le tableau de bord, appuyez sur **📊 Analyser Planning**
2. L'IA analyse votre planning actuel
3. Recevez des suggestions d'optimisation

## 🎯 Cas d'Usage Types

### Chef de Chantier
- Planifie les tâches avec l'IA
- Assigne les équipes aux différentes activités
- Suit l'avancement en temps réel
- Identifie les retards et goulots d'étranglement

### Ouvrier/Artisan
- Consulte ses tâches du jour
- Pointe ses heures de travail
- Met à jour le statut des tâches
- Accède aux détails matériaux et localisation

### Gestionnaire de Projet
- Vue d'ensemble sur le tableau de bord
- Analyse l'efficacité et les performances
- Optimise la planification avec l'IA
- Suit le budget temps vs réalisé

## 🔮 Fonctionnalités Avancées

### Intelligence Artificielle
- **Analyse prédictive** : Détection des risques de retard
- **Optimisation automatique** : Réorganisation des tâches
- **Suggestions contextuelles** : Recommandations basées sur l'historique
- **Estimation intelligente** : Calcul automatique des durées

### Gestion Avancée
- **Dépendances entre tâches** : Gestion automatique des prérequis
- **Gestion des matériaux** : Liste et suivi des ressources
- **Géolocalisation** : Informations de localisation pour chaque tâche
- **Historique complet** : Traçabilité de tous les changements

## 📊 Métriques et KPI

L'application calcule automatiquement :
- **Taux de completion** : % de tâches terminées
- **Efficacité temporelle** : Heures estimées vs réalisées
- **Respect des délais** : Tâches livrées à temps
- **Charge de travail** : Répartition des heures par période
- **Performance par catégorie** : Analyse par type de travaux

## 💾 Stockage des Données

- **Stockage local** : Toutes les données sont sauvées localement
- **Pas de serveur requis** : Fonctionne hors ligne
- **Sauvegarde automatique** : Aucun risque de perte de données
- **Export possible** : Données facilement exportables

## 🔒 Sécurité et Confidentialité

- **Données locales** : Aucune transmission sur internet
- **Confidentialité garantie** : Vos projets restent privés
- **Pas de compte requis** : Utilisation immédiate
- **Contrôle total** : Vous possédez vos données

## 🚀 Évolutions Futures

### Fonctionnalités Prévues
- **Synchronisation cloud** : Sauvegarde en ligne optionnelle
- **Collaboration d'équipe** : Partage de projets
- **Notifications push** : Rappels et alertes
- **Export PDF** : Génération de rapports
- **Photos de progression** : Documentation visuelle
- **Intégration météo** : Planification selon conditions
- **Mode hors-ligne avancé** : Synchronisation différée

### Améliorations IA
- **IA plus sophistiquée** : Intégration OpenAI/Claude
- **Apprentissage adaptatif** : IA qui s'améliore avec l'usage
- **Prédictions avancées** : Analyse prédictive des retards
- **Recommandations personnalisées** : Suggestions sur mesure

## 📞 Support et Contribution

### Problèmes Connus
- Compatible avec React Native 0.79+
- Testé sur iOS et Android
- Quelques animations peuvent être lentes sur anciens appareils

### Améliorer l'Application
- Rapporter des bugs via GitHub Issues
- Proposer des fonctionnalités
- Contribuer au code source
- Partager des retours d'usage

## 📄 Licence

Cette application est développée comme exemple d'intégration IA dans le BTP. 
Libre d'usage pour projets personnels et éducatifs.

---

**Développé avec ❤️ pour les professionnels du BTP**

*L'IA au service de la construction moderne*