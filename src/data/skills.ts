// Les figures de callisthénie : étapes de progression, critères de passage, diagnostic et contenu.
// Chaque figure repose sur trois « verrous » (des qualités physiques). Le diagnostic note chacun
// de 0 (point faible) à 2 (acquis), ce qui donne l'étape de départ et les exercices d'assistance.

export type LockId = string;

export interface Lock {
  id: LockId;
  name: string;
  text: string;
}

export interface SkillStep {
  name: string;
  /** Exercice pratiqué à cette étape (exercises.ts). */
  ex: string;
  anim: string;
  metric: 'hold' | 'reps';
  /** Valeur par série pour valider l'étape (secondes ou répétitions). */
  target: number;
  /** Nombre de séries au niveau de la cible, dans une même séance. */
  targetSets: number;
  perSide?: boolean;
  /** Dose en séance principale. */
  sets: number;
  rest: number;
  what: string;
  tip: string;
  /** Charge relative sur les hanches (L-sit), en pourcentage du L-sit complet. */
  load?: number;
}

export interface AssistDose {
  ex: string;
  sets: number;
  reps?: number;
  hold?: number;
  perSide?: boolean;
  rest: number;
  note?: string;
}

export interface Question {
  lock: LockId;
  q: string;
  hint: string;
  options: [string, string, string];
}

export interface LockExercise {
  ex: string;
  dose: string;
  why: string;
}

export interface Skill {
  id: string;
  name: string;
  tagline: string;
  anim: string;
  locks: [Lock, Lock, Lock];
  steps: SkillStep[];
  questions: Question[];
  /** Réponses supposées tant que le diagnostic n'a pas été fait. */
  defaults: Record<LockId, number>;
  startStep: (a: Record<LockId, number>) => number;
  /** Exercice d'assistance proposé en séance, selon la réponse au diagnostic (0, 1 ou 2). */
  assist: Record<LockId, [AssistDose, AssistDose, AssistDose]>;
  exercises: Record<LockId, LockExercise[]>;
  /** Plan conseillé selon la réponse, par verrou. */
  advice: Record<LockId, [string, string, string]>;
  intro: string[];
  keyPoint: { title: string; text: string[] };
  muscles: Record<LockId, { name: string; role: string }[]>;
  errors: { title: string; text: string }[];
  timeline: string;
}

const lsit: Skill = {
  id: 'lsit',
  name: 'L-sit',
  tagline: 'Assis en l’air, jambes tendues à l’horizontale.',
  anim: 'lsitFull',
  locks: [
    { id: 'pousser', name: 'Pousser', text: 'Bras verrouillés, épaules basses : tu portes tout ton poids sur les mains.' },
    { id: 'plier', name: 'Plier', text: 'Les hanches tiennent les jambes à 90 degrés, environ un tiers de ton poids, loin du pivot.' },
    { id: 'tendre', name: 'Tendre', text: 'Genoux tendus alors que l’arrière des cuisses est étiré au maximum.' },
  ],
  steps: [
    {
      name: 'Appui',
      ex: 'appui-parallettes',
      anim: 'support',
      metric: 'hold',
      target: 30,
      targetSets: 3,
      sets: 4,
      rest: 60,
      load: 0,
      what: 'Bras tendus, épaules basses, jambes pliées sous toi.',
      tip: 'La base de tout. Si tu n’arrives pas encore à décoller, fais l’appui pieds au sol et retire du poids des talons semaine après semaine.',
    },
    {
      name: 'Tuck',
      ex: 'l-sit-groupe',
      anim: 'lsitTuck',
      metric: 'hold',
      target: 15,
      targetSets: 3,
      sets: 5,
      rest: 60,
      load: 52,
      what: 'Genoux ramenés vers la poitrine, talons sous les fesses.',
      tip: 'Au sol, cette étape est déjà dure car les pieds frottent. Sur parallettes ou chaises, tu as la place.',
    },
    {
      name: 'Tuck avancé',
      ex: 'tuck-avance',
      anim: 'lsitAdv',
      metric: 'hold',
      target: 15,
      targetSets: 3,
      sets: 5,
      rest: 60,
      load: 77,
      what: 'Cuisses à l’horizontale, genoux pliés à 90 degrés.',
      tip: 'Tes fléchisseurs de hanche travaillent ici à l’angle exact du L-sit. Seul le levier est plus court.',
    },
    {
      name: 'Une jambe',
      ex: 'l-sit-une-jambe',
      anim: 'lsitOne',
      metric: 'hold',
      target: 10,
      targetSets: 3,
      perSide: true,
      sets: 3,
      rest: 60,
      load: 76,
      what: 'Une jambe tendue, l’autre en tuck avancé. Alterne à chaque série.',
      tip: 'Le pont idéal si tes genoux plient : une seule jambe à tendre, avec l’autre qui aide à garder le bassin.',
    },
    {
      name: 'L-sit',
      ex: 'l-sit',
      anim: 'lsitFull',
      metric: 'hold',
      target: 10,
      targetSets: 3,
      sets: 5,
      rest: 75,
      load: 100,
      what: 'Jambes tendues et serrées, pieds pointés, à l’horizontale.',
      tip: 'Séries courtes et propres : plusieurs tenues de 5 secondes valent mieux qu’une longue série tremblante.',
    },
    {
      name: 'L-sit 20 s',
      ex: 'l-sit',
      anim: 'lsitFull',
      metric: 'hold',
      target: 20,
      targetSets: 3,
      sets: 4,
      rest: 90,
      load: 100,
      what: 'Le même L-sit, tenu longtemps.',
      tip: 'Une fois acquis : L-sit au sol, V-sit, ou simplement viser 30 secondes.',
    },
  ],
  questions: [
    {
      lock: 'pousser',
      q: 'Entre deux chaises stables, bras tendus, pieds décollés du sol : combien de temps tu tiens ?',
      hint: 'Épaules loin des oreilles. Si elles remontent, le chrono s’arrête.',
      options: ['Je n’arrive pas à décoller', 'Moins de 20 s', '30 s ou plus, propre'],
    },
    {
      lock: 'plier',
      q: 'Assis au sol, jambes tendues, mains à plat à côté des genoux : tu arrives à décoller les deux talons ?',
      hint: 'Sans plier les genoux, sans te pencher en arrière.',
      options: ['Non, rien ne décolle', 'Un peu, 1 à 2 s', 'Oui, 5 s ou plus'],
    },
    {
      lock: 'tendre',
      q: 'Assis dos contre un mur, jambes tendues devant toi : tes genoux restent verrouillés, arrière des genoux au sol ?',
      hint: 'Les fesses et le dos touchent le mur, le bas du dos ne s’arrondit pas.',
      options: ['Non, les genoux plient', 'Oui mais ça tire fort', 'Oui, facilement'],
    },
  ],
  defaults: { pousser: 0, plier: 1, tendre: 0 },
  startStep: (a) => {
    if (a.pousser < 2) return 0;
    if (a.plier === 0) return 1;
    if (a.plier === 1) return 2;
    if (a.tendre < 2) return 3;
    return 4;
  },
  assist: {
    pousser: [
      { ex: 'appui-pieds-sol', sets: 4, hold: 25, rest: 45 },
      { ex: 'haussements-appui', sets: 3, reps: 10, rest: 45 },
      { ex: 'haussements-appui', sets: 2, reps: 12, rest: 45 },
    ],
    plier: [
      { ex: 'releves-jambes-assis', sets: 3, reps: 10, rest: 45 },
      { ex: 'releves-genoux', sets: 3, reps: 8, rest: 60 },
      { ex: 'releves-jambes-assis', sets: 3, reps: 12, rest: 45, note: 'Mains à côté des hanches.' },
    ],
    tendre: [
      { ex: 'etirement-pike', sets: 3, hold: 40, rest: 20 },
      { ex: 'verrouillage-quadriceps', sets: 5, hold: 10, rest: 10 },
      { ex: 'etirement-pike', sets: 2, hold: 30, rest: 20 },
    ],
  },
  exercises: {
    pousser: [
      { ex: 'appui-pieds-sol', dose: '4 x 20 à 30 s', why: 'Tu apprends la position d’épaule exacte du L-sit en ne portant qu’une partie de ton poids.' },
      { ex: 'haussements-appui', dose: '3 x 8 à 12, lent', why: 'C’est le mouvement qui crée la hauteur : la dépression des omoplates. La hauteur vient des épaules, pas des bras.' },
      { ex: 'appui-parallettes', dose: '4 x 15 à 30 s', why: 'Endurance des triceps et des poignets. Si tu tiens 30 s propres, l’appui n’est plus ton verrou.' },
    ],
    plier: [
      { ex: 'releves-jambes-assis', dose: '3 x 8 à 12', why: 'Il entraîne les fléchisseurs de hanche dans leur position la plus courte, celle où ils sont les plus faibles, à l’angle exact du L-sit.' },
      { ex: 'releves-genoux', dose: '3 x 8 à 12', why: 'Mêmes muscles avec plus de charge, et l’enroulement du bassin par les abdos.' },
      { ex: 'hollow-body', dose: '3 x 20 à 30 s', why: 'Apprend à basculer le bassin vers l’arrière et à gainer : la même forme de tronc que dans le L-sit.' },
      { ex: 'l-sit-groupe', dose: '5 à 6 x 5 à 10 s', why: 'Le pont entre appui et compression : les deux verrous ensemble, avec un levier court.' },
    ],
    tendre: [
      { ex: 'verrouillage-quadriceps', dose: '5 x 10 s, tous les jours', why: 'Le quadriceps doit garder le genou tendu alors qu’il est raccourci. La contraction maximale s’apprend, et vite.' },
      { ex: 'etirement-pike', dose: '2 à 3 x 30 à 45 s, tous les jours', why: 'Des ischios raides plient les genoux et tirent le bassin. Il faut pouvoir être assis à 90 degrés jambes tendues sans effort.' },
      { ex: 'l-sit-une-jambe', dose: '3 x 3 à 5 s par jambe', why: 'Tendre une jambe sous charge, avec un levier plus court que le L-sit complet.' },
    ],
  },
  advice: {
    pousser: ['Appui pieds au sol et haussements d’épaules à chaque séance.', 'Maintien en appui, objectif 3 x 30 s.', 'Garde une série d’appui en échauffement.'],
    plier: ['Relevés de jambes assis et hollow body.', 'Relevés de genoux à la barre et tuck.', 'Tuck avancé et une jambe : tu peux attaquer le levier.'],
    tendre: ['Étirement pike et verrouillage des quadriceps tous les jours.', 'Étirement pike 4 à 5 fois par semaine, L-sit une jambe.', 'Entretien : un étirement par séance suffit.'],
  },
  intro: [
    'Le L-sit a l’air simple : tu t’assois en l’air, jambes tendues devant toi. En réalité, ton corps fait trois choses difficiles en même temps. Si une seule manque, la position ne tient pas.',
    'Tes jambes pèsent environ un tiers de ton poids. Plus elles sont loin de ta hanche, plus le couple que tes fléchisseurs de hanche doivent retenir est grand. C’est pour ça qu’on progresse en éloignant les jambes petit à petit : genoux pliés d’abord, puis une jambe tendue, puis les deux.',
  ],
  keyPoint: {
    title: 'Pourquoi lever les jambes tendues est si dur',
    text: [
      'Le droit fémoral passe devant la hanche et devant le genou. Dans le L-sit, il est raccourci aux deux bouts : hanche fléchie et genou tendu. Un muscle très raccourci produit peu de force, c’est l’insuffisance active. Le psoas fait donc presque tout le travail, lui aussi en fin de course.',
      'Conséquence : être fort en squat ou en relevés de jambes allongé ne suffit pas. Il faut entraîner la flexion de hanche dans la position la plus fermée. C’est le rôle des exercices de compression.',
    ],
  },
  muscles: {
    pousser: [
      { name: 'Trapèze inférieur, grand dorsal, petit pectoral', role: 'Tirent les omoplates vers le bas. Ce mouvement crée la hauteur.' },
      { name: 'Triceps', role: 'Coudes tendus et verrouillés en continu.' },
      { name: 'Dentelé antérieur, pectoraux', role: 'Empêchent l’épaule de s’effondrer vers l’avant.' },
      { name: 'Avant-bras, poignets', role: 'Très sollicités au sol, moins sur parallettes.' },
    ],
    plier: [
      { name: 'Psoas-iliaque', role: 'Le moteur principal : il fléchit la hanche.' },
      { name: 'Droit fémoral', role: 'Aide, mais il est mal placé (voir plus haut).' },
      { name: 'Tenseur du fascia lata, sartorius', role: 'Fléchisseurs secondaires.' },
      { name: 'Abdominaux', role: 'Basculent le bassin vers l’arrière et gainent le tronc.' },
    ],
    tendre: [
      { name: 'Quadriceps', role: 'Gardent le genou tendu contre la gravité.' },
      { name: 'Ischio-jambiers', role: 'Doivent accepter d’être étirés. Raides, ils plient les genoux et tirent le bassin.' },
      { name: 'Mollets', role: 'Pointer les pieds les relâche, ce qui aide à tendre la jambe.' },
      { name: 'Adducteurs', role: 'Gardent les jambes serrées.' },
    ],
  },
  errors: [
    { title: 'Épaules collées aux oreilles', text: 'Tu t’assois sur tes articulations au lieu de pousser. Pense « cou long, épaules dans les poches arrière ».' },
    { title: 'Coudes pliés', text: 'Les bras fatiguent deux fois plus vite. Verrouille-les, sans forcer en hyperextension.' },
    { title: 'Genoux pliés pour tenir quand même', text: 'Tu fais un tuck avancé déguisé. Mieux vaut un vrai tuck avancé ou un L-sit une jambe, propre.' },
    { title: 'Jambes sous l’horizontale', text: 'Ça ressemble à un L-sit mais le levier est plus court. Filme-toi de profil pour vérifier.' },
    { title: 'Pieds relâchés', text: 'Pointe les pieds et serre les jambes : la tension se propage et le genou se tend mieux.' },
    { title: 'Séries jusqu’à l’échec', text: 'Pour l’isométrie, plusieurs séries courtes et propres battent une longue série tremblante.' },
    { title: 'Retenir sa respiration', text: 'Respire court, par le ventre gainé. Bloquer l’air fait tenir 2 s de plus, pas progresser.' },
    { title: 'Toujours au sol', text: 'Le sol est la version la plus dure (poignets en extension, peu de place). Commence sur parallettes ou chaises.' },
  ],
  timeline: 'Partir de zéro et tenir 10 s de L-sit prend souvent entre 2 et 6 mois de travail régulier. La souplesse des ischios est souvent ce qui prend le plus de temps, d’où l’intérêt de la travailler tous les jours dès maintenant.',
};

const poirier: Skill = {
  id: 'poirier',
  name: 'Poirier',
  tagline: 'En équilibre sur les mains, corps aligné.',
  anim: 'handstand',
  locks: [
    { id: 'porter', name: 'Porter', text: 'Des épaules assez fortes pour tenir tout ton poids, bras tendus au-dessus de la tête.' },
    { id: 'ouvrir', name: 'Ouvrir', text: 'Bras alignés avec le buste sans cambrer : c’est la mobilité des épaules.' },
    { id: 'equilibrer', name: 'Équilibrer', text: 'Corriger l’équilibre avec les doigts, et savoir sortir sans peur.' },
  ],
  steps: [
    {
      name: 'Pike surélevé',
      ex: 'pike-sureleve',
      anim: 'pikeBox',
      metric: 'hold',
      target: 30,
      targetSets: 3,
      sets: 4,
      rest: 60,
      what: 'Pieds sur une chaise, hanches au-dessus des épaules, bras tendus.',
      tip: 'Ton poids passe en grande partie dans les mains, la tête en bas, sans risque de chute.',
    },
    {
      name: 'Ventre au mur',
      ex: 'poirier-mur',
      anim: 'wallwalk',
      metric: 'hold',
      target: 45,
      targetSets: 3,
      sets: 4,
      rest: 75,
      what: 'Ventre face au mur, mains à 20 cm, corps gainé et aligné.',
      tip: 'Rapproche les mains du mur au fil des séances : plus tu es vertical, plus la position ressemble au vrai poirier.',
    },
    {
      name: 'Décollages',
      ex: 'poirier-decollages',
      anim: 'wallToe',
      metric: 'hold',
      target: 5,
      targetSets: 5,
      sets: 6,
      rest: 45,
      what: 'Ventre au mur, tu décolles les pieds et tiens en équilibre.',
      tip: 'C’est ici que tu apprends à corriger avec les doigts. Le mur reste là pour te rattraper.',
    },
    {
      name: 'Libre 5 s',
      ex: 'poirier-libre',
      anim: 'handstand',
      metric: 'hold',
      target: 5,
      targetSets: 3,
      sets: 8,
      rest: 40,
      what: 'Un lancer doux, puis tu tiens en équilibre sans mur.',
      tip: 'Beaucoup de tentatives courtes valent mieux que quelques longues. Compte chaque tentative comme une série.',
    },
    {
      name: 'Libre 15 s',
      ex: 'poirier-libre',
      anim: 'handstand',
      metric: 'hold',
      target: 15,
      targetSets: 3,
      sets: 8,
      rest: 45,
      what: 'Le poirier libre, tenu plus longtemps.',
      tip: 'Pense à pousser le sol en continu : des épaules actives rendent l’équilibre bien plus facile.',
    },
    {
      name: 'Libre 30 s',
      ex: 'poirier-libre',
      anim: 'handstand',
      metric: 'hold',
      target: 30,
      targetSets: 2,
      sets: 6,
      rest: 60,
      what: 'Un vrai poirier tenu.',
      tip: 'Ensuite : marcher sur les mains, poirier jambes en pancake, ou les pompes au poirier.',
    },
  ],
  questions: [
    {
      lock: 'porter',
      q: 'Au poirier ventre au mur, mains à 30 cm du mur, corps gainé : combien de temps tu tiens ?',
      hint: 'Bras tendus, épaules poussées vers le plafond.',
      options: ['Je n’y arrive pas, ou moins de 15 s', 'Entre 15 et 45 s', '45 s ou plus, propre'],
    },
    {
      lock: 'ouvrir',
      q: 'Debout dos au mur, bas du dos collé : tes bras tendus touchent le mur au-dessus de la tête ?',
      hint: 'Pouces vers le mur, coudes tendus, sans décoller le bas du dos.',
      options: ['Non, il reste un grand écart', 'Presque, ou en cambrant un peu', 'Oui, facilement'],
    },
    {
      lock: 'equilibrer',
      q: 'Au poirier, tu sais sortir en pivotant sur le côté, et décoller les pieds du mur 2 s ?',
      hint: 'La sortie en pivot : une main avance sur le côté et tu redescends les pieds l’un après l’autre.',
      options: ['Ni l’un ni l’autre', 'Je sais sortir, pas décoller', 'Oui, les deux'],
    },
  ],
  defaults: { porter: 1, ouvrir: 1, equilibrer: 0 },
  startStep: (a) => {
    if (a.porter === 0) return 0;
    if (a.porter === 1 || a.equilibrer === 0) return 1;
    if (a.equilibrer === 1) return 2;
    return 3;
  },
  assist: {
    porter: [
      { ex: 'pike-push-ups', sets: 3, reps: 5, rest: 75 },
      { ex: 'pike-push-ups', sets: 3, reps: 8, rest: 75 },
      { ex: 'haussements-poirier', sets: 3, reps: 8, rest: 60 },
    ],
    ouvrir: [
      { ex: 'ouverture-epaules', sets: 3, hold: 30, rest: 20 },
      { ex: 'ouverture-epaules', sets: 2, hold: 40, rest: 20 },
      { ex: 'passages-epaules', sets: 1, reps: 10, rest: 0 },
    ],
    equilibrer: [
      { ex: 'sortie-poirier', sets: 3, reps: 2, perSide: true, rest: 30, note: 'Sur un sol doux, près d’un mur.' },
      { ex: 'lancers-poirier', sets: 1, reps: 8, rest: 0, note: 'Lancers doux, arriver lentement en haut.' },
      { ex: 'poirier-decollages', sets: 4, hold: 5, rest: 30 },
    ],
  },
  exercises: {
    porter: [
      { ex: 'pike-sureleve', dose: '4 x 20 à 30 s', why: 'Met la plus grande partie de ton poids dans les mains, épaules au-dessus de la tête, sans peur de tomber.' },
      { ex: 'pike-push-ups', dose: '3 x 5 à 8', why: 'La force de poussée verticale, dans le même angle que le poirier.' },
      { ex: 'haussements-poirier', dose: '3 x 8', why: 'Apprend l’élévation des omoplates qui rend l’épaule stable en haut. C’est l’inverse du L-sit.' },
      { ex: 'poirier-mur', dose: '4 x 30 à 60 s', why: 'L’endurance de la position elle-même, avec le mur comme filet.' },
    ],
    ouvrir: [
      { ex: 'ouverture-epaules', dose: '2 à 3 x 30 à 40 s', why: 'Étire le grand dorsal et les pectoraux qui empêchent les bras de s’aligner avec le buste.' },
      { ex: 'passages-epaules', dose: '10 répétitions', why: 'Mobilité de l’épaule dans toute son amplitude, à faire chaque matin.' },
      { ex: 'hollow-body', dose: '3 x 20 à 30 s', why: 'La forme du corps au poirier : côtes rentrées, fessiers serrés, pas de banane.' },
    ],
    equilibrer: [
      { ex: 'sortie-poirier', dose: '3 x 2 par côté', why: 'Savoir sortir enlève la peur, et la peur est ce qui bloque le plus de gens.' },
      { ex: 'poirier-decollages', dose: '5 x 5 s', why: 'Apprend à corriger l’équilibre avec les doigts, avec le mur comme sécurité.' },
      { ex: 'lancers-poirier', dose: '8 à 10 lancers', why: 'Arriver doucement en haut, sans trop d’élan : la moitié du poirier libre.' },
    ],
  },
  advice: {
    porter: ['Pike surélevé et pike push-ups à chaque séance.', 'Ventre au mur plus longtemps, objectif 3 x 45 s.', 'Haussements au poirier pour garder des épaules actives.'],
    ouvrir: ['Ouverture d’épaules à chaque séance et passages d’épaules chaque matin.', 'Ouverture d’épaules 3 fois par semaine.', 'Entretien : les passages d’épaules du matin suffisent.'],
    equilibrer: ['Apprends la sortie en pivot avant tout, sur un sol doux.', 'Décollages du mur à chaque séance.', 'Lancers et tentatives libres : multiplie les essais courts.'],
  },
  intro: [
    'Au poirier, tu ne tiens pas l’équilibre avec les épaules : tu le corriges avec les mains. Si tu pars vers le dos, appuie le bout des doigts. Si tu pars vers le ventre, relâche les doigts et appuie la paume.',
    'Les épaules, elles, doivent pousser le sol en continu, comme pour te grandir vers le plafond. Des épaules relâchées obligent à cambrer, et un corps en banane est presque impossible à équilibrer.',
  ],
  keyPoint: {
    title: 'Pourquoi le mur ventre face à lui',
    text: [
      'Dos au mur, on monte facilement mais on prend l’habitude de cambrer et de laisser les épaules fermées. Ventre au mur, tu es obligé d’aligner le corps et de pousser le sol, comme au poirier libre.',
      'Le travail du poirier se fait au mieux souvent et peu : quelques minutes presque tous les jours valent mieux qu’une longue séance par semaine. C’est pour ça que l’app le place dans trois séances.',
    ],
  },
  muscles: {
    porter: [
      { name: 'Deltoïdes', role: 'Portent le poids, bras au-dessus de la tête.' },
      { name: 'Trapèzes', role: 'Montent les omoplates vers les oreilles : l’épaule se verrouille en haut.' },
      { name: 'Triceps', role: 'Gardent les coudes tendus.' },
      { name: 'Dentelé antérieur', role: 'Fait tourner l’omoplate vers le haut et la plaque contre les côtes.' },
    ],
    ouvrir: [
      { name: 'Grand dorsal', role: 'Doit s’allonger : raide, il tire les bras vers l’avant et force à cambrer.' },
      { name: 'Grand pectoral', role: 'Même effet quand il manque de souplesse.' },
      { name: 'Abdominaux, fessiers', role: 'Gardent le bassin rentré pour que le corps reste droit.' },
    ],
    equilibrer: [
      { name: 'Fléchisseurs des doigts', role: 'Corrigent quand tu pars vers le dos.' },
      { name: 'Avant-bras, poignets', role: 'Supportent le poids en extension. À échauffer avant chaque séance.' },
      { name: 'Gainage complet', role: 'Un corps rigide se corrige d’un seul bloc.' },
    ],
  },
  errors: [
    { title: 'La banane', text: 'Dos cambré, côtes sorties. Serre les fessiers, rentre les côtes, pense à un corps tout droit.' },
    { title: 'Épaules fermées', text: 'Les bras restent devant la tête au lieu d’être alignés. Travaille l’ouverture d’épaules.' },
    { title: 'Épaules qui ne poussent pas', text: 'Pousse le sol comme pour te grandir. Des épaules passives s’effondrent.' },
    { title: 'Coudes pliés', text: 'Verrouille les bras : un coude qui plie fait tout descendre.' },
    { title: 'Lancer trop fort', text: 'Tu passes de l’autre côté. Mieux vaut cent lancers trop courts qu’un trop long.' },
    { title: 'Pas de sortie de secours', text: 'Sans elle, la peur bloque. Apprends à pivoter avant de travailler le poirier libre.' },
    { title: 'Doigts serrés', text: 'Écarte les doigts au maximum : ce sont tes outils d’équilibre.' },
    { title: 'Poignets froids', text: 'Cercles, appuis sur les paumes dans tous les sens : 3 minutes avant chaque séance.' },
  ],
  timeline: 'Tenir 45 s ventre au mur prend souvent quelques semaines. Le poirier libre de 10 à 15 s demande en général 6 mois à 1 an de pratique régulière, par petites doses fréquentes.',
};

const pistolSkill: Skill = {
  id: 'pistol',
  name: 'Pistol squat',
  tagline: 'Un squat complet sur une jambe, l’autre tendue devant.',
  anim: 'pistol',
  locks: [
    { id: 'force', name: 'Force', text: 'Une seule jambe remonte tout ton poids depuis tout en bas.' },
    { id: 'cheville', name: 'Cheville', text: 'Le genou avance loin devant les orteils, talon au sol.' },
    { id: 'jambe', name: 'Jambe libre', text: 'L’autre jambe reste tendue devant toi pendant que tu gardes l’équilibre.' },
  ],
  steps: [
    {
      name: 'Vers une chaise',
      ex: 'pistol-chaise',
      anim: 'pistolBox',
      metric: 'reps',
      target: 5,
      targetSets: 3,
      perSide: true,
      sets: 3,
      rest: 60,
      what: 'Tu t’assois sur une chaise et remontes sur une jambe.',
      tip: 'Descends lentement : c’est le contrôle en descente qui construit la force du bas.',
    },
    {
      name: 'Vers une marche',
      ex: 'pistol-boite',
      anim: 'pistolLow',
      metric: 'reps',
      target: 5,
      targetSets: 3,
      perSide: true,
      sets: 3,
      rest: 60,
      what: 'Le même mouvement vers un support à mi-tibia.',
      tip: 'Si le talon décolle en bas, c’est la cheville : continue le genou au mur chaque jour.',
    },
    {
      name: 'Assisté',
      ex: 'pistol-assiste',
      anim: 'pistolAssist',
      metric: 'reps',
      target: 6,
      targetSets: 3,
      perSide: true,
      sets: 3,
      rest: 60,
      what: 'Pistol complet en te tenant à un montant de porte ou à l’élastique.',
      tip: 'Les bras servent à l’équilibre. Tiens-toi de moins en moins au fil des séances.',
    },
    {
      name: 'Négatif',
      ex: 'pistol-negatif',
      anim: 'pistolNeg',
      metric: 'reps',
      target: 4,
      targetSets: 3,
      perSide: true,
      sets: 3,
      rest: 75,
      what: 'Descente en 4 secondes sans aide, remontée sur deux jambes.',
      tip: 'Garde la tension jusqu’en bas : c’est là que tout se joue.',
    },
    {
      name: 'Pistol',
      ex: 'pistol',
      anim: 'pistol',
      metric: 'reps',
      target: 3,
      targetSets: 3,
      perSide: true,
      sets: 3,
      rest: 90,
      what: 'Le pistol complet, sans aide.',
      tip: 'Un petit talon sous le pied (chaussure de sport) aide beaucoup au début.',
    },
    {
      name: 'Pistol x 6',
      ex: 'pistol',
      anim: 'pistol',
      metric: 'reps',
      target: 6,
      targetSets: 3,
      perSide: true,
      sets: 3,
      rest: 90,
      what: 'Six pistols de chaque côté, propres.',
      tip: 'Ensuite : pistol pieds nus, avec un sac à dos, ou le shrimp squat.',
    },
  ],
  questions: [
    {
      lock: 'force',
      q: 'Assis-debout sur une jambe vers une chaise (assise à hauteur de genou), sans élan, bras devant : combien de répétitions propres ?',
      hint: 'Descente lente, sans te laisser tomber. Le côté le plus faible compte.',
      options: ['Aucune, je tombe sur la chaise', '1 à 5', 'Plus de 5 de chaque côté'],
    },
    {
      lock: 'cheville',
      q: 'Genou au mur : pied à 10 cm du mur, talon au sol. Ton genou touche le mur ?',
      hint: 'Le genou avance dans l’axe du pied, sans rentrer vers l’intérieur.',
      options: ['Non', 'Tout juste', 'Oui, même à 12 cm ou plus'],
    },
    {
      lock: 'jambe',
      q: 'Debout sur une jambe, l’autre tendue devant toi à hauteur de hanche : tu tiens 10 s ?',
      hint: 'Genou tendu, buste droit.',
      options: ['Non, la jambe tombe ou je perds l’équilibre', 'Oui, en me tenant', 'Oui, sans aide'],
    },
  ],
  defaults: { force: 1, cheville: 1, jambe: 1 },
  startStep: (a) => {
    if (a.force === 0) return 0;
    if (a.force === 1) return 1;
    if (a.cheville === 0 || a.jambe === 0) return 2;
    return 3;
  },
  assist: {
    force: [
      { ex: 'fentes-bulgares', sets: 3, reps: 6, perSide: true, rest: 75 },
      { ex: 'fentes-bulgares', sets: 3, reps: 10, perSide: true, rest: 75 },
      { ex: 'fentes-bulgares', sets: 2, reps: 12, perSide: true, rest: 60, note: 'Descente en 3 secondes.' },
    ],
    cheville: [
      { ex: 'genou-au-mur', sets: 2, reps: 12, perSide: true, rest: 0 },
      { ex: 'genou-au-mur', sets: 1, reps: 12, perSide: true, rest: 0 },
      { ex: 'squat-profond', sets: 2, hold: 30, rest: 15 },
    ],
    jambe: [
      { ex: 'equilibre-jambe-tendue', sets: 3, hold: 10, perSide: true, rest: 20 },
      { ex: 'equilibre-jambe-tendue', sets: 3, hold: 20, perSide: true, rest: 20 },
      { ex: 'releves-jambes-assis', sets: 3, reps: 10, rest: 45 },
    ],
  },
  exercises: {
    force: [
      { ex: 'pistol-chaise', dose: '3 x 5 par jambe', why: 'La force en bas, avec la chaise comme filet.' },
      { ex: 'fentes-bulgares', dose: '3 x 6 à 12 par jambe', why: 'Force d’une jambe avec un appui arrière pour l’équilibre. Le meilleur exercice d’assistance.' },
      { ex: 'pistol-negatif', dose: '3 x 3 à 4 par jambe', why: 'Le muscle est plus fort en freinant qu’en poussant : tu travailles toute l’amplitude avant de savoir remonter.' },
    ],
    cheville: [
      { ex: 'genou-au-mur', dose: '2 x 12 par jambe, tous les jours', why: 'La flexion de cheville limite souvent le pistol. Elle progresse lentement, d’où le travail quotidien.' },
      { ex: 'squat-profond', dose: '2 x 30 s', why: 'Habitue chevilles et hanches à la position du bas, talons au sol.' },
    ],
    jambe: [
      { ex: 'equilibre-jambe-tendue', dose: '3 x 10 à 20 s par jambe', why: 'Fléchisseurs de hanche et équilibre sur la jambe d’appui, exactement comme en haut du pistol.' },
      { ex: 'releves-jambes-assis', dose: '3 x 10', why: 'Tenir la jambe libre en bas demande de la compression, comme au L-sit.' },
      { ex: 'etirement-pike', dose: '2 x 30 s', why: 'Des ischios raides plient la jambe libre et la font toucher le sol.' },
    ],
  },
  advice: {
    force: ['Pistol vers une chaise et fentes bulgares, lentement.', 'Fentes bulgares plus lourdes et négatifs.', 'Entretien : la force n’est plus ton frein.'],
    cheville: ['Genou au mur chaque jour, et un petit talon pour t’entraîner en attendant.', 'Genou au mur 3 à 4 fois par semaine.', 'Entretien : squat profond tenu de temps en temps.'],
    jambe: ['Équilibre jambe tendue à chaque séance.', 'Équilibre jambe tendue plus longtemps.', 'Entretien : relevés de jambes assis.'],
  },
  intro: [
    'Le pistol, c’est un squat complet sur une jambe, l’autre tendue devant. Trois choses le limitent : la force en bas du mouvement, la souplesse de la cheville, et la capacité à tenir la jambe libre en l’air.',
    'Pour le golf, c’est un exercice précieux : force et stabilité d’une jambe à la fois, contrôle du genou dans l’axe, et équilibre. Exactement ce que demande la jambe d’appui pendant le swing.',
  ],
  keyPoint: {
    title: 'Le talon qui décolle',
    text: [
      'Si ton talon décolle en bas, ce n’est pas un manque de force : la cheville ne laisse pas le genou avancer assez. Tu bascules alors vers l’arrière et tu tombes.',
      'La solution rapide : un petit talon sous le pied (chaussure de sport, livre fin). La solution durable : le genou au mur chaque jour. Les deux se combinent très bien.',
    ],
  },
  muscles: {
    force: [
      { name: 'Quadriceps', role: 'Le moteur principal pour remonter.' },
      { name: 'Grand fessier', role: 'Pousse la hanche, surtout en bas.' },
      { name: 'Adducteurs', role: 'Aident en bas et gardent le genou dans l’axe.' },
    ],
    cheville: [
      { name: 'Soléaire, mollets', role: 'Doivent s’allonger pour que le genou avance, talon au sol.' },
      { name: 'Jambier antérieur', role: 'Tire le tibia vers l’avant.' },
    ],
    jambe: [
      { name: 'Fléchisseurs de hanche', role: 'Tiennent la jambe libre en l’air, en position très fermée en bas.' },
      { name: 'Quadriceps de la jambe libre', role: 'Gardent le genou tendu.' },
      { name: 'Moyen fessier, muscles du pied', role: 'L’équilibre sur la jambe d’appui.' },
    ],
  },
  errors: [
    { title: 'Talon qui décolle', text: 'La cheville manque de souplesse. Petit talon en attendant, genou au mur chaque jour.' },
    { title: 'Genou qui rentre', text: 'Pousse le genou dans l’axe du deuxième orteil, sur toute la descente.' },
    { title: 'Rebond en bas', text: 'Tu utilises l’élastique des tissus, pas tes muscles. Marque un arrêt d’une seconde.' },
    { title: 'Descente qui s’effondre', text: 'Les derniers centimètres doivent rester contrôlés. Travaille les négatifs.' },
    { title: 'Jambe libre qui tombe', text: 'Elle touche le sol et tu perds l’équilibre. Travaille l’équilibre jambe tendue.' },
    { title: 'Bras le long du corps', text: 'Les bras tendus devant font contrepoids. Garde-les à hauteur d’épaules.' },
  ],
  timeline: 'Avec ta base en jambes, passer de la chaise au pistol complet prend souvent 2 à 4 mois. La cheville est ce qui change le plus lentement.',
};

export const SKILLS: Skill[] = [lsit, poirier, pistolSkill];
export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
