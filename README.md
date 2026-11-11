# Carnet d'entraînement

Application web installable (PWA) pour planifier et suivre mes entraînements : musculation, course, mobilité et travail technique de golf au filet.

- **Accueil** : progression du jour, séances à faire, semaine en cours par discipline.
- **Planning** : les séances jour par jour et la progression de course sur 8 semaines.
- **Mode guidé** : un exercice à la fois, avec compteur de séries, chronos de tenue et de repos, et minuteur de fractionné.
- **Exercices** : 40 mouvements illustrés par un personnage animé, avec consignes et variantes.
- **Stats** : régularité, journal des séances, records et courbes d'évolution.

Le personnage est dessiné en SVG à partir de points d'appui (bassin, mains, pieds) : coudes et genoux sont calculés par cinématique inverse, ce qui permet d'animer chaque exercice avec deux ou trois poses seulement (`src/components/Figure.tsx`, `src/data/poses.ts`).

## Technique

React, TypeScript, Vite. Les coches sont écrites d'abord sur l'appareil (l'app fonctionne hors ligne), puis synchronisées avec Supabase, ce qui permet de retrouver les mêmes données sur le téléphone et l'ordinateur. Chaque compte ne peut lire et modifier que ses propres lignes (règles RLS dans `supabase/schema.sql`).

## Lancer en local

```bash
npm install
npm run dev
```

Sans les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_KEY`, l'app tourne en mode local : les données restent sur l'appareil.

## Modifier le programme

Le contenu des séances et le planning de la semaine sont dans `src/data/programme.ts`, les fiches d'exercices dans `src/data/exercises.ts`.
