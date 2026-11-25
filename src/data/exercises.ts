// La bibliothèque d'exercices : consignes, erreurs à éviter, variantes et animation associée.

export type Category = 'mobilite' | 'echauffement' | 'explosivite' | 'lancers' | 'haut' | 'bas' | 'gainage' | 'figures' | 'course' | 'golf' | 'tests';

export const CATEGORY_LABEL: Record<Category, string> = {
  mobilite: 'Mobilité',
  echauffement: 'Échauffement et tibias',
  explosivite: 'Pliométrie et sprints',
  lancers: 'Lancers',
  haut: 'Haut du corps',
  bas: 'Bas du corps',
  gainage: 'Gainage et dos',
  figures: 'Figures',
  course: 'Course',
  golf: 'Vitesse de swing',
  tests: 'Tests',
};

/** Les tests ne sont pas des exercices de la bibliothèque. */
export const CATEGORIES = (Object.keys(CATEGORY_LABEL) as Category[]).filter((c) => c !== 'tests');

export interface Exercise {
  id: string;
  name: string;
  cat: Category;
  /** Identifiant de l'animation dans poses.ts. */
  anim: string;
  muscles: string;
  steps: string[];
  avoid: string;
  easier?: string;
  harder?: string;
}

const list: Exercise[] = [
  // Mobilité
  {
    id: 'chat-vache',
    name: 'Chat-vache',
    cat: 'mobilite',
    anim: 'catcow',
    muscles: 'Colonne vertébrale',
    steps: [
      'À quatre pattes, mains sous les épaules, genoux sous les hanches.',
      'Arrondis le dos vers le plafond en rentrant le menton.',
      'Creuse ensuite le dos en regardant devant toi. Enchaîne lentement.',
    ],
    avoid: 'Aller vite. Chaque vertèbre doit avoir le temps de bouger.',
  },
  {
    id: 'rotation-thoracique',
    name: 'Rotation thoracique à quatre pattes',
    cat: 'mobilite',
    anim: 'tspine',
    muscles: 'Haut du dos, rotation du buste',
    steps: [
      'À quatre pattes, passe un bras sous le buste en suivant ta main du regard.',
      'Ouvre ensuite ce bras vers le plafond en tournant la poitrine.',
      'Garde les hanches immobiles : seul le haut du dos tourne.',
    ],
    avoid: 'Faire tourner le bassin à la place du haut du dos.',
    harder: 'Place la main derrière la tête et monte le coude vers le plafond.',
  },
  {
    id: 'livre-ouvert',
    name: 'Livre ouvert',
    cat: 'mobilite',
    anim: 'openbook',
    muscles: 'Haut du dos, poitrine',
    steps: [
      'Allongé sur le côté, genoux pliés à 90 degrés, bras tendus devant toi.',
      'Le bras du dessus dessine un grand arc au-dessus de la tête jusqu’à l’autre côté.',
      'Les genoux restent collés l’un à l’autre et au sol.',
    ],
    avoid: 'Laisser les genoux décoller : la rotation doit venir du buste.',
  },
  {
    id: 'hanches-90-90',
    name: 'Hanches en 90/90',
    cat: 'mobilite',
    anim: 'hips9090',
    muscles: 'Rotation des hanches',
    steps: [
      'Assis, jambes pliées, pieds écartés plus large que le bassin.',
      'Laisse tomber les deux genoux du même côté, jusqu’au sol si possible.',
      'Repasse par le centre et bascule de l’autre côté, le buste droit.',
    ],
    avoid: 'S’affaisser vers l’arrière. Garde le buste le plus droit possible.',
    easier: 'Pose les mains au sol derrière toi pour t’aider.',
  },
  {
    id: 'fente-rotation',
    name: 'Grande fente avec rotation',
    cat: 'mobilite',
    anim: 'lungerot',
    muscles: 'Hanches, haut du dos, ischio-jambiers',
    steps: [
      'En grande fente, les deux mains au sol à l’intérieur du pied avant.',
      'Ouvre le bras du côté de la jambe avant vers le plafond, regard sur la main.',
      'Repose la main, puis recommence. Change de jambe à la moitié.',
    ],
    avoid: 'Laisser le genou arrière se poser si tu veux aussi étirer la hanche.',
  },
  {
    id: 'genou-au-mur',
    name: 'Genou au mur',
    cat: 'mobilite',
    anim: 'kneewall',
    muscles: 'Cheville, mollet',
    steps: [
      'Un genou au sol, le pied avant à une main du mur.',
      'Avance le genou avant vers le mur sans décoller le talon.',
      'Quand le genou touche facilement, recule un peu le pied.',
    ],
    avoid: 'Laisser le talon se soulever ou le genou partir vers l’intérieur.',
  },
  {
    id: 'passages-epaules',
    name: 'Passages d’épaules à l’élastique',
    cat: 'mobilite',
    anim: 'dislocate',
    muscles: 'Épaules, poitrine',
    steps: [
      'Debout, tiens l’élastique de 10 kg à deux mains, prise large.',
      'Bras tendus, monte l’élastique au-dessus de la tête puis derrière le dos.',
      'Reviens par le même chemin. Écarte davantage les mains si ça coince.',
    ],
    avoid: 'Plier les coudes ou cambrer pour passer.',
  },
  {
    id: 'squat-profond',
    name: 'Squat profond tenu',
    cat: 'mobilite',
    anim: 'deepsquat',
    muscles: 'Hanches, chevilles',
    steps: [
      'Pieds un peu plus larges que le bassin, descends le plus bas possible.',
      'Talons au sol, mains jointes, coudes qui repoussent les genoux.',
      'Respire calmement et grandis le dos.',
    ],
    avoid: 'Décoller les talons.',
    easier: 'Tiens-toi à un meuble pour garder l’équilibre.',
  },

  // Figures
  {
    id: 'poirier-mur',
    name: 'Poirier ventre au mur',
    cat: 'figures',
    anim: 'wallwalk',
    muscles: 'Épaules, gainage',
    steps: [
      'En position de pompe, les pieds contre le bas du mur.',
      'Monte les pieds le long du mur en reculant les mains, jusqu’à être presque vertical.',
      'Corps gainé, bras tendus, regard entre les mains. Tiens, puis redescends pas à pas.',
    ],
    avoid: 'Cambrer le dos. Serre les fessiers et rentre les côtes.',
    easier: 'Arrête-toi à mi-hauteur, le corps à 45 degrés.',
    harder: 'Rapproche les mains à 10 cm du mur, puis décolle un pied.',
  },
  {
    id: 'l-sit-groupe',
    name: 'Tuck (L-sit genoux repliés)',
    cat: 'figures',
    anim: 'lsitTuck',
    muscles: 'Abdos, fléchisseurs de hanche, triceps',
    steps: [
      'Sur deux chaises stables ou des parallettes, mains à côté des hanches.',
      'Pousse les épaules vers le bas pour décoller les fesses.',
      'Ramène les genoux vers la poitrine, talons sous les fesses, pieds décollés. Tiens.',
    ],
    avoid: 'Hausser les épaules vers les oreilles.',
    easier: 'Garde les orteils au sol et ne décolle que les fesses.',
    harder: 'Éloigne les genoux jusqu’à avoir les cuisses horizontales : c’est le tuck avancé.',
  },
  {
    id: 'appui-parallettes',
    name: 'Maintien en appui',
    cat: 'figures',
    anim: 'support',
    muscles: 'Triceps, bas des trapèzes, grand dorsal, poignets',
    steps: [
      'Sur deux chaises stables ou des parallettes, mains à côté des hanches.',
      'Bras verrouillés, pousse les épaules vers le bas, loin des oreilles.',
      'Jambes pliées sous toi, regard devant. Tiens sans que les épaules remontent.',
    ],
    avoid: 'Laisser les épaules remonter : dès qu’elles touchent presque les oreilles, la série s’arrête.',
    easier: 'Garde les talons au sol devant toi (appui pieds au sol).',
    harder: 'Ramène les genoux vers la poitrine : c’est le tuck.',
  },
  {
    id: 'tuck-avance',
    name: 'Tuck avancé',
    cat: 'figures',
    anim: 'lsitAdv',
    muscles: 'Fléchisseurs de hanche, abdos, triceps',
    steps: [
      'Monte en tuck sur les chaises ou les parallettes.',
      'Éloigne les genoux de la poitrine jusqu’à avoir les cuisses horizontales.',
      'Genoux pliés à 90 degrés, épaules basses. Tiens.',
    ],
    avoid: 'Laisser les cuisses redescendre sous l’horizontale : le levier se raccourcit sans que tu le voies. Filme-toi de profil.',
    easier: 'Reviens au tuck en fin de série.',
    harder: 'Tends une jambe à la fois : c’est le L-sit une jambe.',
  },
  {
    id: 'l-sit-une-jambe',
    name: 'L-sit une jambe',
    cat: 'figures',
    anim: 'lsitOne',
    muscles: 'Fléchisseurs de hanche, quadriceps, abdos',
    steps: [
      'Depuis le tuck avancé, tends une jambe devant toi.',
      'Genou verrouillé, pied pointé, jambe à l’horizontale. L’autre reste en tuck.',
      'Tiens, repose, puis change de jambe.',
    ],
    avoid: 'Plier le genou de la jambe tendue pour tenir plus longtemps.',
    easier: 'Tends la jambe 3 secondes seulement, puis reviens en tuck avancé.',
    harder: 'Tends les deux jambes : c’est le L-sit.',
  },
  {
    id: 'l-sit',
    name: 'L-sit',
    cat: 'figures',
    anim: 'lsitFull',
    muscles: 'Fléchisseurs de hanche, abdos, quadriceps, triceps',
    steps: [
      'En appui sur les chaises ou les parallettes, épaules basses.',
      'Monte les deux jambes tendues et serrées à l’horizontale, pieds pointés.',
      'Tiens, en respirant court par le ventre gainé.',
    ],
    avoid: 'Laisser les jambes descendre sous l’horizontale ou plier les genoux.',
    easier: 'Écarte un peu les jambes, ou reviens au L-sit une jambe.',
    harder: 'Au sol, sans parallettes : les poignets et la place manquent, c’est plus dur.',
  },
  {
    id: 'appui-pieds-sol',
    name: 'Appui pieds au sol',
    cat: 'haut',
    anim: 'supportFeet',
    muscles: 'Triceps, bas des trapèzes, grand dorsal',
    steps: [
      'Entre deux chaises ou parallettes, bras tendus, talons posés devant toi.',
      'Pousse les épaules vers le bas.',
      'Transfère le plus de poids possible dans les mains. Semaine après semaine, mets-en moins dans les talons.',
    ],
    avoid: 'Plier les coudes pour te soulever : la hauteur vient des épaules.',
    harder: 'Décolle les talons quelques secondes : c’est le maintien en appui.',
  },
  {
    id: 'haussements-appui',
    name: 'Haussements d’épaules en appui',
    cat: 'haut',
    anim: 'supportShrug',
    muscles: 'Bas des trapèzes, grand dorsal',
    steps: [
      'En appui bras tendus sur les chaises (pieds au sol si besoin).',
      'Laisse les épaules monter vers les oreilles.',
      'Repousse-les vers le bas le plus loin possible. Les coudes ne plient jamais.',
    ],
    avoid: 'Plier les coudes : tout le mouvement se fait dans les épaules.',
  },
  {
    id: 'releves-jambes-assis',
    name: 'Relevés de jambes assis',
    cat: 'gainage',
    anim: 'pikeLift',
    muscles: 'Fléchisseurs de hanche en position courte',
    steps: [
      'Assis jambes tendues, mains au sol à côté des genoux.',
      'Penche le buste légèrement en avant et contracte les cuisses.',
      'Décolle les talons de quelques centimètres, tiens 1 à 2 secondes, repose.',
    ],
    avoid: 'Te pencher en arrière pour décoller les jambes : c’est le dos qui fait le travail.',
    easier: 'Si rien ne décolle, pousse quand même 3 secondes : l’effort compte.',
    harder: 'Mains à côté des hanches, puis derrière les hanches.',
  },
  {
    id: 'verrouillage-quadriceps',
    name: 'Verrouillage des quadriceps',
    cat: 'mobilite',
    anim: 'quadSet',
    muscles: 'Quadriceps',
    steps: [
      'Assis jambes tendues, pieds pointés.',
      'Contracte les cuisses au maximum : la rotule remonte, l’arrière du genou se plaque au sol.',
      'Tiens 10 secondes, relâche.',
    ],
    avoid: 'Ne contracter qu’à moitié. Le but est d’apprendre la contraction maximale.',
  },
  {
    id: 'etirement-pike',
    name: 'Étirement pike actif',
    cat: 'mobilite',
    anim: 'pikeStretch',
    muscles: 'Ischio-jambiers',
    steps: [
      'Assis jambes tendues, dos long.',
      'Bascule depuis les hanches, ventre vers les cuisses, sans arrondir le dos.',
      'Finis par 10 petites pulsations en contractant les quadriceps.',
    ],
    avoid: 'Arrondir le dos pour aller plus loin. Ça tire, jamais de douleur vive.',
  },
  {
    id: 'pike-sureleve',
    name: 'Pike tenu pieds surélevés',
    cat: 'figures',
    anim: 'pikeBox',
    muscles: 'Épaules, triceps, haut du dos',
    steps: [
      'Pieds sur une chaise, mains au sol, recule les mains jusqu’à avoir les hanches au-dessus des épaules.',
      'Bras tendus, pousse le sol pour monter les épaules vers les oreilles.',
      'Regarde entre tes mains et tiens.',
    ],
    avoid: 'Laisser les épaules s’affaisser vers le sol.',
    easier: 'Pieds sur une marche basse.',
    harder: 'Rapproche les mains de la chaise : le buste devient vertical.',
  },
  {
    id: 'poirier-decollages',
    name: 'Décollages du mur',
    cat: 'figures',
    anim: 'wallToe',
    muscles: 'Épaules, avant-bras, gainage',
    steps: [
      'Monte au poirier ventre au mur, mains à 10 à 15 cm du mur.',
      'Corps gainé, appuie sur les doigts pour décoller doucement les pieds du mur.',
      'Tiens en équilibre, en corrigeant avec les doigts. Reviens au mur quand tu sens que ça part.',
    ],
    avoid: 'Pousser le mur avec les pieds : c’est la pression des doigts qui t’en éloigne.',
    easier: 'Décolle un pied, puis l’autre.',
    harder: 'Décolle les deux pieds et tiens plus longtemps.',
  },
  {
    id: 'poirier-libre',
    name: 'Poirier libre',
    cat: 'figures',
    anim: 'handstand',
    muscles: 'Épaules, avant-bras, gainage',
    steps: [
      'Monte par un lancer contrôlé, mains écartées largeur d’épaules, doigts écartés.',
      'Épaules poussées vers le plafond, corps en ligne, fessiers serrés.',
      'Corrige avec les doigts si tu pars vers le dos, avec la paume si tu pars vers le ventre.',
    ],
    avoid: 'Cambrer en banane pour rattraper l’équilibre.',
    easier: 'Reviens aux décollages du mur.',
  },
  {
    id: 'haussements-poirier',
    name: 'Haussements d’épaules au poirier',
    cat: 'haut',
    anim: 'handstandShrug',
    muscles: 'Trapèzes, dentelé antérieur, épaules',
    steps: [
      'Au poirier ventre au mur, bras tendus.',
      'Laisse le corps descendre de quelques centimètres en relâchant les épaules.',
      'Pousse le sol pour monter les épaules vers les oreilles. Les coudes restent tendus.',
    ],
    avoid: 'Plier les coudes : le mouvement est petit et vient des omoplates.',
    easier: 'En pike pieds surélevés.',
  },
  {
    id: 'ouverture-epaules',
    name: 'Ouverture d’épaules sur chaise',
    cat: 'mobilite',
    anim: 'shoulderOpen',
    muscles: 'Grand dorsal, pectoraux, triceps',
    steps: [
      'À genoux devant une chaise, coudes posés sur l’assise, mains jointes derrière la tête.',
      'Recule les hanches et laisse la poitrine descendre vers le sol.',
      'Garde les côtes rentrées et respire lentement.',
    ],
    avoid: 'Cambrer le bas du dos : c’est l’épaule qui doit s’ouvrir, pas les lombaires.',
  },
  {
    id: 'sortie-poirier',
    name: 'Sortie de secours',
    cat: 'figures',
    anim: 'kickup',
    muscles: 'Coordination, confiance',
    steps: [
      'Monte au poirier à côté d’un mur ou depuis un lancer doux.',
      'Quand tu bascules vers le dos, déplace une main d’un pas sur le côté et pivote.',
      'Redescends les pieds sur le côté, l’un après l’autre, comme une roue ratée.',
    ],
    avoid: 'Rester bloqué en bascule vers l’arrière : décide tôt et pivote.',
  },
  {
    id: 'lancers-poirier',
    name: 'Lancers au poirier',
    cat: 'figures',
    anim: 'kickup',
    muscles: 'Coordination, épaules',
    steps: [
      'Debout en fente, bras tendus au-dessus de la tête.',
      'Pose les mains, lance la jambe arrière et pousse avec la jambe avant.',
      'Cherche à arriver doucement en haut, jambes réunies. Moins d’élan vaut mieux que trop.',
    ],
    avoid: 'Lancer trop fort et tomber vers le dos. Arriver lentement est la compétence à apprendre.',
  },
  {
    id: 'pistol-chaise',
    name: 'Pistol vers une chaise',
    cat: 'figures',
    anim: 'pistolBox',
    muscles: 'Quadriceps, fessiers, équilibre',
    steps: [
      'Debout sur une jambe devant une chaise, l’autre jambe tendue devant, bras devant toi.',
      'Descends lentement jusqu’à t’asseoir sur la chaise, sans te laisser tomber.',
      'Remonte sur la même jambe sans élan.',
    ],
    avoid: 'Te laisser tomber sur la chaise ou te balancer pour remonter.',
    easier: 'Prends un siège plus haut, ou deux coussins.',
    harder: 'Une marche ou une boîte plus basse.',
  },
  {
    id: 'pistol-boite',
    name: 'Pistol vers une marche basse',
    cat: 'figures',
    anim: 'pistolLow',
    muscles: 'Quadriceps, fessiers, équilibre',
    steps: [
      'Même mouvement que vers la chaise, avec un support à mi-tibia (marche, pile de livres, coussin ferme).',
      'Effleure le support des fesses sans t’asseoir dessus.',
      'Remonte sur la même jambe, talon au sol.',
    ],
    avoid: 'Décoller le talon en bas : si ça arrive, la cheville manque de souplesse.',
    easier: 'Remonte d’un cran la hauteur du support.',
    harder: 'Plus de support : passe au pistol assisté.',
  },
  {
    id: 'pistol-assiste',
    name: 'Pistol assisté',
    cat: 'figures',
    anim: 'pistolAssist',
    muscles: 'Quadriceps, fessiers, mollets',
    steps: [
      'Tiens un montant de porte ou l’élastique accroché à la barre, bras tendus.',
      'Descends en pistol complet, la jambe libre tendue devant toi.',
      'Remonte en t’aidant le moins possible des bras.',
    ],
    avoid: 'Tirer fort avec les bras. Ils servent à l’équilibre, pas à remonter.',
    harder: 'Tiens-toi avec un seul doigt, puis plus du tout en descente.',
  },
  {
    id: 'pistol-negatif',
    name: 'Pistol négatif',
    cat: 'figures',
    anim: 'pistolNeg',
    muscles: 'Quadriceps, fessiers, contrôle',
    steps: [
      'Debout sur une jambe, l’autre tendue devant, bras devant toi.',
      'Descends en 4 secondes jusqu’en bas, sans aide.',
      'Pose l’autre pied, remonte sur deux jambes et recommence.',
    ],
    avoid: 'Lâcher la tension sur les derniers centimètres.',
    harder: 'Marque une pause de 2 secondes en bas.',
  },
  {
    id: 'pistol',
    name: 'Pistol squat',
    cat: 'figures',
    anim: 'pistol',
    muscles: 'Quadriceps, fessiers, mollets, fléchisseurs de hanche',
    steps: [
      'Debout sur une jambe, l’autre tendue devant, bras devant toi.',
      'Descends jusqu’en bas, talon au sol, genou dans l’axe du pied.',
      'Remonte sans rebond, la jambe libre toujours décollée.',
    ],
    avoid: 'Rebondir en bas ou laisser le genou rentrer vers l’intérieur.',
    easier: 'Un petit talon (chaussure de sport, livre fin sous le talon) aide la cheville.',
    harder: 'Tiens une bouteille d’eau ou un sac à dos léger devant toi.',
  },
  {
    id: 'equilibre-jambe-tendue',
    name: 'Équilibre jambe tendue',
    cat: 'bas',
    anim: 'balanceLeg',
    muscles: 'Fléchisseurs de hanche, quadriceps, fessier de la jambe d’appui',
    steps: [
      'Debout sur une jambe, monte l’autre tendue devant toi, le plus haut possible.',
      'Pied pointé, genou verrouillé, buste droit.',
      'Tiens, puis change de jambe.',
    ],
    avoid: 'Te pencher en arrière pour monter la jambe.',
    easier: 'Une main sur un mur.',
  },

  // Haut du corps
  {
    id: 'tractions-assistees',
    name: 'Tractions assistées à l’élastique',
    cat: 'haut',
    anim: 'pullupBand',
    muscles: 'Dos, biceps',
    steps: [
      'Accroche l’élastique de 30 kg à la barre et passe un pied ou un genou dedans.',
      'Pars bras tendus, tire les coudes vers les hanches.',
      'Monte le menton au-dessus de la barre, puis redescends en contrôlant.',
    ],
    avoid: 'Te balancer ou ne pas redescendre jusqu’en bas.',
    harder: 'Passe à l’élastique de 20 kg, puis de 10 kg.',
  },
  {
    id: 'tractions-negatives',
    name: 'Tractions négatives',
    cat: 'haut',
    anim: 'pullup',
    muscles: 'Dos, biceps',
    steps: [
      'Monte en sautant ou depuis une chaise, menton au-dessus de la barre.',
      'Descends le plus lentement possible, en 5 secondes au moins.',
      'Lâche en bas, remonte et recommence.',
    ],
    avoid: 'Te laisser tomber sur la fin de la descente.',
  },
  {
    id: 'tractions-supination',
    name: 'Tractions en supination assistées',
    cat: 'haut',
    anim: 'pullupBand',
    muscles: 'Dos, biceps',
    steps: [
      'Paumes tournées vers toi, mains à la largeur des épaules.',
      'Avec l’élastique de 30 kg, tire jusqu’à passer le menton au-dessus de la barre.',
      'Redescends bras tendus à chaque répétition.',
    ],
    avoid: 'Raccourcir le mouvement en bas.',
  },
  {
    id: 'tractions-faciles',
    name: 'Tractions faciles',
    cat: 'haut',
    anim: 'pullupBand',
    muscles: 'Dos, biceps',
    steps: [
      'En passant devant la barre, fais une courte série assistée ou négative.',
      'Arrête-toi bien avant d’être fatigué.',
      'L’objectif est de répéter le geste souvent, pas de forcer.',
    ],
    avoid: 'Aller jusqu’à l’échec : ce n’est pas une séance.',
  },
  {
    id: 'pompes',
    name: 'Pompes',
    cat: 'haut',
    anim: 'pushup',
    muscles: 'Pectoraux, triceps, épaules',
    steps: [
      'Mains un peu plus larges que les épaules, corps aligné des talons à la tête.',
      'Descends la poitrine près du sol, coudes à 45 degrés du buste.',
      'Repousse le sol jusqu’aux bras tendus.',
    ],
    avoid: 'Laisser le bassin s’affaisser ou monter les fesses.',
    easier: 'Mains surélevées sur une chaise ou un banc.',
    harder: 'Pieds surélevés.',
  },
  {
    id: 'pompes-lentes',
    name: 'Pompes lentes',
    cat: 'haut',
    anim: 'pushup',
    muscles: 'Pectoraux, triceps, épaules',
    steps: [
      'Même position que les pompes classiques.',
      'Descends en 3 secondes, marque un court arrêt en bas.',
      'Remonte normalement.',
    ],
    avoid: 'Accélérer la descente quand ça devient dur.',
  },
  {
    id: 'rowing-elastique',
    name: 'Rowing à l’élastique',
    cat: 'haut',
    anim: 'row',
    muscles: 'Dos, arrière des épaules',
    steps: [
      'Fixe l’élastique à hauteur de poitrine et recule jusqu’à le tendre.',
      'Tire les coudes vers l’arrière en serrant les omoplates.',
      'Reviens bras tendus en freinant.',
    ],
    avoid: 'Te pencher en arrière pour t’aider.',
    harder: 'Prends un élastique plus fort ou recule davantage.',
  },
  {
    id: 'pike-push-ups',
    name: 'Pike push-ups',
    cat: 'haut',
    anim: 'pike',
    muscles: 'Épaules, triceps',
    steps: [
      'Mains et pieds au sol, fesses hautes, corps en V inversé.',
      'Plie les coudes pour amener le haut de la tête entre les mains.',
      'Repousse jusqu’aux bras tendus.',
    ],
    avoid: 'Écarter les coudes sur les côtés.',
    harder: 'Pose les pieds sur une chaise.',
  },
  {
    id: 'developpe-epaules',
    name: 'Développé épaules à l’élastique',
    cat: 'haut',
    anim: 'press',
    muscles: 'Épaules, triceps',
    steps: [
      'Debout sur l’élastique, mains à hauteur d’épaules, paumes vers l’avant.',
      'Pousse au-dessus de la tête jusqu’aux bras tendus.',
      'Redescends en contrôlant jusqu’aux épaules.',
    ],
    avoid: 'Cambrer le bas du dos. Serre les abdos et les fessiers.',
  },
  {
    id: 'tirage-visage',
    name: 'Tirage vers le visage',
    cat: 'haut',
    anim: 'facepull',
    muscles: 'Arrière des épaules, haut du dos',
    steps: [
      'Élastique fixé à hauteur de visage, bras tendus devant toi.',
      'Tire les mains vers le front, coudes hauts et écartés.',
      'Serre les omoplates une seconde, puis reviens.',
    ],
    avoid: 'Baisser les coudes sous les épaules.',
  },

  // Abdos et gainage
  {
    id: 'hollow-body',
    name: 'Hollow body',
    cat: 'gainage',
    anim: 'hollow',
    muscles: 'Abdos profonds',
    steps: [
      'Allongé sur le dos, plaque le bas du dos au sol.',
      'Décolle les épaules et les jambes, bras tendus derrière la tête.',
      'Tiens la position en respirant.',
    ],
    avoid: 'Laisser le bas du dos se décoller.',
    easier: 'Plie les genoux ou garde les bras le long du corps.',
  },
  {
    id: 'pallof-press',
    name: 'Pallof press',
    cat: 'gainage',
    anim: 'pallof',
    muscles: 'Obliques, anti-rotation',
    steps: [
      'Élastique fixé sur le côté à hauteur de poitrine, tu es de profil par rapport à lui.',
      'Mains jointes contre la poitrine, tends les bras devant toi.',
      'Résiste à l’élastique qui veut te faire tourner, puis ramène les mains.',
    ],
    avoid: 'Laisser le buste ou les hanches tourner vers l’élastique.',
    harder: 'Éloigne-toi du point d’attache.',
  },
  {
    id: 'gainage-lateral',
    name: 'Gainage latéral',
    cat: 'gainage',
    anim: 'sideplank',
    muscles: 'Obliques',
    steps: [
      'Sur le côté, en appui sur l’avant-bras, coude sous l’épaule.',
      'Décolle le bassin pour aligner chevilles, hanches et épaules.',
      'Tiens sans laisser le bassin redescendre.',
    ],
    avoid: 'Laisser les hanches partir vers l’arrière.',
    easier: 'Pose le genou du bas au sol.',
  },
  {
    id: 'planche',
    name: 'Planche',
    cat: 'gainage',
    anim: 'plank',
    muscles: 'Abdos, épaules',
    steps: [
      'En appui sur les avant-bras et les pointes de pieds.',
      'Corps aligné, fessiers serrés, nombril rentré.',
      'Tiens en respirant normalement.',
    ],
    avoid: 'Creuser le bas du dos.',
  },
  {
    id: 'releves-jambes',
    name: 'Relevés de jambes au sol',
    cat: 'gainage',
    anim: 'legraise',
    muscles: 'Bas des abdos',
    steps: [
      'Allongé sur le dos, mains le long du corps, jambes tendues.',
      'Monte les jambes à la verticale.',
      'Redescends lentement sans poser les talons.',
    ],
    avoid: 'Cambrer en fin de descente. Arrête-toi avant que le dos ne décolle.',
    easier: 'Plie légèrement les genoux.',
  },
  {
    id: 'releves-genoux',
    name: 'Relevés de genoux suspendu',
    cat: 'gainage',
    anim: 'kneeraise',
    muscles: 'Abdos, fléchisseurs de hanche',
    steps: [
      'Suspendu à la barre, bras tendus, épaules engagées.',
      'Monte les genoux vers la poitrine en enroulant le bassin.',
      'Redescends en contrôlant, sans te balancer.',
    ],
    avoid: 'Utiliser l’élan.',
    harder: 'Jambes tendues, pour préparer le L-sit.',
  },

  // Explosivité
  {
    id: 'squat-jumps',
    name: 'Squat jumps',
    cat: 'explosivite',
    anim: 'squatjump',
    muscles: 'Cuisses, fessiers, mollets',
    steps: [
      'Descends en squat, bras vers l’arrière.',
      'Saute le plus haut possible en lançant les bras.',
      'Amortis la réception et marque un arrêt avant le saut suivant.',
    ],
    avoid: 'Enchaîner sans te replacer : chaque saut se fait à fond.',
  },
  {
    id: 'bonds-longueur',
    name: 'Bonds en longueur',
    cat: 'explosivite',
    anim: 'broadjump',
    muscles: 'Fessiers, cuisses',
    steps: [
      'Pieds largeur de bassin, descends et lance les bras vers l’arrière.',
      'Saute le plus loin possible vers l’avant.',
      'Réceptionne sur les deux pieds, genoux souples. Reviens en marchant.',
    ],
    avoid: 'Atterrir jambes tendues.',
  },
  {
    id: 'sprints',
    name: 'Sprints courts',
    cat: 'explosivite',
    anim: 'sprint',
    muscles: 'Chaîne postérieure, puissance',
    steps: [
      'Départ debout, buste penché vers l’avant.',
      'Accélère à fond pendant 8 à 10 secondes.',
      'Ralentis progressivement et récupère 1 min 30 en marchant.',
    ],
    avoid: 'Sprinter à 100 % les deux premières semaines : en côte ou à 80 %, pour protéger les ischio-jambiers.',
  },
  {
    id: 'rotations-explosives',
    name: 'Rotations explosives à l’élastique',
    cat: 'explosivite',
    anim: 'rotation',
    muscles: 'Obliques, hanches, vitesse de rotation',
    steps: [
      'Élastique fixé sur le côté à hauteur de poitrine, pieds comme à l’adresse.',
      'Déclenche la rotation par les hanches, les bras suivent.',
      'Va le plus vite possible, puis reviens lentement.',
    ],
    avoid: 'Tirer avec les bras. Le mouvement part du sol et des hanches, comme au swing.',
  },
  {
    id: 'sauts-lateraux',
    name: 'Sauts latéraux',
    cat: 'explosivite',
    anim: 'skater',
    muscles: 'Fessiers, stabilité de la hanche',
    steps: [
      'En appui sur une jambe, saute sur le côté.',
      'Réceptionne sur l’autre jambe et stabilise une seconde.',
      'Repars dans l’autre sens.',
    ],
    avoid: 'Laisser le genou rentrer vers l’intérieur à la réception.',
  },

  // Bas du corps
  {
    id: 'fentes-bulgares',
    name: 'Fentes bulgares',
    cat: 'bas',
    anim: 'bulgarian',
    muscles: 'Cuisses, fessiers',
    steps: [
      'Pied arrière posé sur une chaise, pied avant à un grand pas devant.',
      'Descends à la verticale jusqu’à frôler le sol avec le genou arrière.',
      'Remonte en poussant dans le talon avant.',
    ],
    avoid: 'Laisser le genou avant rentrer vers l’intérieur.',
    harder: 'Passe l’élastique sous le pied avant et tiens-le aux épaules.',
  },
  {
    id: 'souleve-une-jambe',
    name: 'Soulevé de terre sur une jambe',
    cat: 'bas',
    anim: 'rdl',
    muscles: 'Ischio-jambiers, fessiers, équilibre',
    steps: [
      'Debout sur un pied, l’élastique sous ce pied, tenu à deux mains.',
      'Bascule le buste vers l’avant, dos plat, pendant que l’autre jambe part en arrière.',
      'Remonte en serrant le fessier de la jambe d’appui.',
    ],
    avoid: 'Arrondir le dos ou ouvrir la hanche sur le côté.',
    easier: 'Sans élastique, une main contre un mur.',
  },
  {
    id: 'mollets',
    name: 'Mollets sur une jambe',
    cat: 'bas',
    anim: 'calf',
    muscles: 'Mollets, tendon d’Achille',
    steps: [
      'L’avant du pied sur une marche, une main contre le mur.',
      'Monte sur la pointe en 2 secondes.',
      'Redescends en 3 secondes, le talon plus bas que la marche.',
    ],
    avoid: 'Rebondir en bas du mouvement.',
  },
  {
    id: 'squat-elastique',
    name: 'Squat à l’élastique',
    cat: 'bas',
    anim: 'squatBand',
    muscles: 'Cuisses, fessiers',
    steps: [
      'Debout sur l’élastique de 30 kg, passe-le derrière les épaules.',
      'Descends les fesses en arrière, cuisses au moins parallèles au sol.',
      'Remonte en poussant dans tout le pied.',
    ],
    avoid: 'Décoller les talons ou arrondir le dos.',
  },
  {
    id: 'hip-thrust',
    name: 'Hip thrust sur une jambe',
    cat: 'bas',
    anim: 'hipthrust',
    muscles: 'Fessiers, ischio-jambiers',
    steps: [
      'Allongé sur le dos, un pied au sol près des fesses, l’autre jambe tendue.',
      'Pousse dans le talon pour monter le bassin jusqu’à aligner genou, hanche et épaule.',
      'Serre le fessier une seconde, puis redescends.',
    ],
    avoid: 'Cambrer pour monter plus haut.',
    harder: 'Pose les épaules sur un canapé.',
  },
  {
    id: 'releves-tibia',
    name: 'Relevés de tibia',
    cat: 'bas',
    anim: 'tibia',
    muscles: 'Avant de la jambe (jambier antérieur)',
    steps: [
      'Dos et fesses contre un mur, pieds avancés d’un pas.',
      'Remonte les pointes de pied le plus haut possible, talons au sol.',
      'Redescends lentement.',
    ],
    avoid: 'Plier les genoux pour tricher.',
    harder: 'Avance davantage les pieds.',
  },

  // Course
  {
    id: 'footing',
    name: 'Footing en aisance',
    cat: 'course',
    anim: 'run',
    muscles: 'Endurance fondamentale',
    steps: [
      'Cours à une allure où tu peux parler en phrases complètes.',
      'Pour toi aujourd’hui : autour de 6 min 40 au kilomètre.',
      'Si tu es essoufflé, ralentis sans hésiter.',
    ],
    avoid: 'Courir trop vite : c’est l’erreur la plus fréquente, et elle fatigue sans faire progresser.',
  },
  {
    id: 'fractions',
    name: 'Fractions rapides',
    cat: 'course',
    anim: 'sprint',
    muscles: 'Vitesse, capacité cardiaque',
    steps: [
      'Cours les portions rapides à une allure soutenue mais tenable sur toutes les répétitions.',
      'Trottine très lentement pendant les récupérations, sans t’arrêter.',
      'La dernière fraction doit être aussi rapide que la première.',
    ],
    avoid: 'Partir trop vite sur les premières et craquer ensuite.',
  },
  {
    id: 'lignes-droites',
    name: 'Accélérations progressives',
    cat: 'course',
    anim: 'sprint',
    muscles: 'Foulée, relâchement',
    steps: [
      'Sur 80 mètres, accélère progressivement jusqu’à 90 % de ta vitesse.',
      'Reste relâché : épaules basses, mains détendues.',
      'Récupère en marchant jusqu’au point de départ.',
    ],
    avoid: 'Finir crispé.',
  },
  ...more(),
];

export const EXERCISES: Record<string, Exercise> = Object.fromEntries(list.map((e) => [e.id, e]));
/** La bibliothèque affichée : sans les fiches de test. */
export const EXERCISE_LIST = list.filter((e) => e.cat !== 'tests');

type Def = [id: string, name: string, cat: Category, anim: string, muscles: string, steps: string[], avoid: string, easier?: string, harder?: string];

function more(): Exercise[] {
  const defs: Def[] = [

    // Mobilité du matin v2 (sans matériel)
    ['poignets-inclinaisons', 'Inclinaisons de poignet', 'mobilite', 'wristCircles', 'Poignets, avant-bras', [
      'Bras tendus devant toi, poings fermés, pouces vers le haut.',
      'Incline les poignets pour monter les pouces vers toi, puis descends-les vers le sol.',
      'C’est le mouvement d’armement du swing, sans club.',
    ], 'Bouger les bras au lieu des poignets.'],
    ['avant-bras-rotation-libre', 'Rotation des avant-bras', 'mobilite', 'wristCircles', 'Avant-bras, coudes', [
      'Coudes collés au corps et pliés à 90 degrés, poings fermés devant toi.',
      'Tourne les avant-bras pour mettre les paumes vers le plafond, puis vers le sol, le plus loin possible.',
      'Les avant-bras tournent à chaque impact : cette rotation protège aussi les coudes.',
    ], 'Écarter les coudes pour aller plus loin.'],
    ['anges-au-mur', 'Anges au mur', 'mobilite', 'wallAngel', 'Épaules, haut du dos', [
      'Dos au mur, talons à une main du mur, bas du dos, haut du dos et tête contre le mur.',
      'Bras en W, coudes et dos des mains contre le mur, fais glisser les bras vers le haut puis reviens.',
      'Monte seulement tant que tout reste collé au mur.',
    ], 'Décoller le bas du dos ou les mains pour monter plus haut.', 'Fais-le allongé au sol.'],
    ['thread-the-needle', 'Thread the needle', 'mobilite', 'tspine', 'Haut du dos, rotation du buste', [
      'À quatre pattes, passe un bras sous le buste en suivant la main du regard, l’épaule descend vers le sol.',
      'Ouvre ensuite ce bras vers le plafond en tournant la poitrine.',
      'Les hanches restent immobiles : seul le haut du dos tourne.',
    ], 'Faire tourner le bassin à la place du haut du dos.'],
    ['w-turns', 'W Turns', 'mobilite', 'wTurns', 'Haut du dos, rotation externe des épaules', [
      'À genoux, fesses serrées, bras en W : coudes à hauteur d’épaules, mains vers le plafond.',
      'Tourne le buste d’un côté le plus loin possible sans bouger le bassin, en gardant les bras en W.',
      'Reviens au centre et tourne de l’autre côté.',
    ], 'Laisser les coudes tomber ou le bassin tourner.'],
    ['worlds-greatest-stretch', 'World’s Greatest Stretch', 'mobilite', 'wgs', 'Hanches, ischios, haut du dos, chevilles', [
      'Grande fente, mains au sol à l’intérieur du pied avant, genou arrière décollé.',
      'Ouvre le bras du côté de la jambe avant vers le plafond, regard sur la main.',
      'Repose la main, recule le bassin en tendant la jambe avant pour étirer l’ischio, puis reviens en fente.',
    ], 'Laisser le genou arrière s’affaisser au sol.'],
    ['chien-tete-bas-pedale', 'Chien tête en bas en pédalant', 'mobilite', 'downDog', 'Mollets, ischios, épaules', [
      'Mains et pieds au sol, bassin vers le plafond : le corps forme un V inversé.',
      'Plie un genou en poussant le talon de l’autre jambe vers le sol, puis alterne.',
      'Pousse le sol avec les mains pour allonger le dos.',
    ], 'Arrondir le dos : plie les genoux si besoin pour le garder plat.'],
    ['t-squat', 'Charnière en T sur une jambe', 'mobilite', 'tStance', 'Hanches, ischios, équilibre', [
      'Debout sur une jambe, bras écartés en T.',
      'Penche le buste vers l’avant en montant la jambe arrière tendue, jusqu’à former un T.',
      'Le bassin reste face au sol. Remonte lentement.',
    ], 'Ouvrir le bassin sur le côté de la jambe levée.', 'Garde la pointe du pied arrière au sol.'],
    ['pas-chasse-rotation', 'Pas chassés avec rotation', 'mobilite', 'shuffleRot', 'Hanches, rotation du buste', [
      'Bras croisés sur la poitrine, fais un pas chassé sur le côté.',
      'En te posant, tourne le buste vers la direction du déplacement.',
      'Enchaîne, puis repars dans l’autre sens.',
    ], 'Se raidir : le mouvement reste souple.'],
    ['rotation-posture', 'Rotation en posture de golf', 'mobilite', 'postureRot', 'Rotation du buste, hanches', [
      'Prends ta posture d’adresse, bras croisés sur la poitrine, mains sur les épaules.',
      'Tourne les épaules comme pour la montée, puis comme pour le finish.',
      'Le bassin reste stable en montée : la rotation vient du haut du dos.',
    ], 'Te redresser ou perdre l’inclinaison du buste.'],
    // Mobilité du matin
    ['cou-rotations', 'Mobilité du cou', 'mobilite', 'neckTilt', 'Cou, haut du dos', [
      'Debout, épaules basses, tourne lentement la tête d’un côté puis de l’autre, le plus loin possible sans forcer.',
      'Penche ensuite l’oreille vers l’épaule, de chaque côté.',
      'Au golf, la tête reste stable pendant que les épaules tournent : le cou doit avoir de la marge.',
    ], 'Hausser les épaules pour tourner plus loin.'],
    ['epaules-cercles', 'Grands cercles d’épaule', 'mobilite', 'shoulderCircle', 'Épaules', [
      'Bras tendu, dessine le plus grand cercle possible, lentement.',
      'Le reste du corps ne bouge pas : seul le bras tourne.',
      'Fais les cercles vers l’avant puis vers l’arrière.',
    ], 'Cambrer le dos quand le bras passe derrière.'],
    ['etirement-dorsaux', 'Étirement des dorsaux', 'mobilite', 'shoulderOpen', 'Grand dorsal, épaules', [
      'Coudes posés sur une chaise ou sur la barre, recule les fesses vers les talons.',
      'Laisse la poitrine descendre vers le sol, sans creuser le bas du dos.',
      'Respire lentement : l’étirement augmente à chaque expiration.',
    ], 'Cambrer le bas du dos au lieu d’ouvrir les épaules.'],
    ['poignets-cercles', 'Cercles de poignets', 'mobilite', 'wristCircles', 'Poignets, avant-bras', [
      'Bras devant toi, poings fermés, fais de grands cercles avec les poignets.',
      'Dix dans un sens, dix dans l’autre.',
      'C’est l’échauffement de base avant de taper des balles.',
    ], 'Faire des petits cercles rapides : cherche l’amplitude.'],
    ['poignets-appui', 'Bascules sur les poignets', 'mobilite', 'wristRock', 'Poignets, avant-bras', [
      'À quatre pattes, mains à plat sous les épaules, doigts vers l’avant.',
      'Bascule doucement les épaules au-delà des mains, puis reviens.',
      'Fais ensuite une série doigts tournés vers les genoux, plus légère.',
    ], 'Aller jusqu’à la douleur : c’est une mobilisation, pas un étirement fort.'],
    ['poignets-armement', 'Armement des poignets avec un club', 'mobilite', 'wristHinge', 'Poignets, avant-bras', [
      'Tiens un club devant toi, bras détendus, comme à l’adresse.',
      'Arme les poignets pour monter la tête du club, puis laisse-la redescendre.',
      'C’est le mouvement de la cassure du swing : il doit être libre et ample.',
    ], 'Plier les coudes pour monter le club.'],
    ['avant-bras-rotation', 'Rotation des avant-bras avec un club', 'mobilite', 'forearmRot', 'Avant-bras, poignets', [
      'Club tenu à la verticale devant toi, coudes au corps.',
      'Fais pivoter les avant-bras pour incliner le club à gauche, puis à droite.',
      'Le mouvement vient des avant-bras, pas des épaules.',
    ], 'Écarter les coudes pour aller plus loin.'],
    ['rotation-genou-club', 'Rotation à genoux avec un club', 'mobilite', 'kneelRot', 'Haut du dos, rotation du buste', [
      'À genoux, bassin serré, club posé sur le haut de la poitrine, bras croisés dessus.',
      'Tourne le buste d’un côté le plus loin possible, sans bouger le bassin, puis de l’autre.',
      'C’est la rotation de ta montée de swing, sans compensation des hanches.',
    ], 'Laisser le bassin tourner avec le buste.'],
    ['rotation-interne-hanche', 'Rotation interne de hanche active', 'mobilite', 'hipIR', 'Hanches', [
      'Assis en 90/90, buste droit, mains au sol.',
      'Décolle le pied de la jambe arrière du sol, sans pencher le buste. Tiens 2 secondes.',
      'La rotation interne de la hanche avant est la qualité qui manque le plus aux golfeurs.',
    ], 'Pencher le buste pour décoller le pied.'],
    ['adducteurs-balances', 'Balancés en quadrupédie', 'mobilite', 'quadRock', 'Adducteurs, hanches', [
      'À quatre pattes, tends une jambe sur le côté, pied à plat.',
      'Recule les fesses vers le talon, puis reviens, dos plat.',
      'Tu dois sentir l’étirement à l’intérieur de la cuisse tendue.',
    ], 'Arrondir le dos en reculant.'],
    ['chevilles-cercles', 'Cercles de chevilles', 'mobilite', 'ankleCircles', 'Chevilles', [
      'Debout sur une jambe, l’autre pied levé, dessine de grands cercles avec le pied.',
      'Dix dans un sens, dix dans l’autre, puis change de pied.',
      'Tiens un mur si l’équilibre te gêne.',
    ], 'Bouger toute la jambe au lieu de la cheville.'],

    // Échauffement et tibias
    ['corde-a-sauter', 'Corde à sauter', 'echauffement', 'jumpRope', 'Mollets, chevilles, cardio', [
      'Petits sauts sur l’avant des pieds, genoux souples, talons qui ne touchent pas le sol.',
      'Les poignets font tourner la corde, les bras restent près du corps.',
      'Reste détendu : c’est un échauffement, pas un effort.',
    ], 'Sauter haut. Quelques centimètres suffisent.', 'Sans corde, sautille sur place.', 'Alterne pieds joints et pas de course.'],
    ['mollets-genou-flechi', 'Mollets genou fléchi', 'echauffement', 'calfBent', 'Soléaire', [
      'Sur une marche, genou fléchi d’environ 30 degrés, monte sur la pointe du pied.',
      'Garde le genou plié du début à la fin : c’est ce qui fait travailler le soléaire.',
      'Descends lentement sous le niveau de la marche.',
    ], 'Tendre le genou en montant.', 'Sur les deux pieds.', 'Avec un sac lesté.'],
    ['mollets-excentriques', 'Mollets excentriques', 'echauffement', 'calfEcc', 'Mollets, tendon d’Achille', [
      'Monte sur la pointe avec les deux pieds sur une marche.',
      'Retire un pied et redescends sur une seule jambe, en 3 à 4 secondes.',
      'La descente lente renforce le mollet et le tendon : c’est la meilleure protection pour courir.',
    ], 'Se laisser tomber à la fin de la descente.'],
    ['tibial-posterieur', 'Tibial postérieur à l’élastique', 'echauffement', 'tibPost', 'Tibial postérieur, voûte plantaire', [
      'Assis, élastique autour de l’avant du pied, tiré vers l’extérieur.',
      'Tourne la plante du pied vers l’intérieur contre l’élastique, puis reviens lentement.',
      'Ce muscle soutient la voûte et encaisse les impacts : il est souvent en cause dans la périostite.',
    ], 'Bouger la jambe au lieu de la cheville.'],
    ['pied-court', 'Pied court', 'echauffement', 'shortFoot', 'Muscles du pied, voûte plantaire', [
      'Debout pieds nus, rapproche la base du gros orteil du talon sans plier les orteils.',
      'La voûte se creuse. Tiens la position en respirant.',
      'Ça paraît minuscule, mais c’est la base d’un pied qui absorbe bien les chocs.',
    ], 'Recroqueviller les orteils.'],
    ['abduction-couchee', 'Abduction de hanche couché', 'echauffement', 'sideAbd', 'Moyen fessier', [
      'Couché sur le côté, jambes tendues, bassin bien empilé.',
      'Monte la jambe du dessus, talon légèrement en arrière, sans tourner le pied vers le plafond.',
      'Si la hanche lâche, ce sont les tibias qui encaissent : ce muscle protège toute la jambe.',
    ], 'Basculer le bassin vers l’arrière pour monter plus haut.', undefined, 'Avec un élastique autour des genoux.'],
    ['balances-jambes', 'Balancés de jambe', 'echauffement', 'legSwing', 'Hanches, ischios', [
      'Une main au mur, balance la jambe d’avant en arrière, de plus en plus ample.',
      'Le buste reste droit.',
      'Fais ensuite des balancés de côté, devant toi.',
    ], 'Forcer l’amplitude dès les premiers balancés.'],
    ['fentes-marchees', 'Fentes marchées', 'echauffement', 'walkLunge', 'Quadriceps, fessiers, hanches', [
      'Grand pas en avant, descends jusqu’à frôler le sol avec le genou arrière.',
      'Pousse sur le pied avant pour enchaîner sur l’autre jambe.',
      'Buste droit, genou avant dans l’axe du pied.',
    ], 'Laisser le genou avant rentrer vers l’intérieur.'],
    ['montees-genoux', 'Montées de genoux', 'echauffement', 'highKnees', 'Fléchisseurs de hanche, mollets', [
      'Sur place, monte les genoux à hauteur de hanche, sur l’avant des pieds.',
      'Les bras accompagnent comme en sprint.',
      'Rythme rapide mais contrôlé.',
    ], 'Se pencher en arrière.'],
    ['tractions-omoplates', 'Tractions des omoplates', 'echauffement', 'scapPull', 'Bas des trapèzes, dorsaux', [
      'Suspendu à la barre, bras tendus.',
      'Sans plier les coudes, tire les épaules vers le bas : le corps monte de quelques centimètres.',
      'Relâche lentement. C’est l’allumage des muscles de tes tractions.',
    ], 'Plier les bras.'],
    ['pompes-inclinees', 'Pompes inclinées', 'echauffement', 'inclinePush', 'Pectoraux, triceps, épaules', [
      'Mains sur une chaise ou un meuble stable, corps gainé.',
      'Descends la poitrine jusqu’au bord, puis pousse.',
      'Rythme tranquille : c’est pour préparer les épaules.',
    ], 'Laisser le bassin s’affaisser.'],

    // Pliométrie
    ['pogos', 'Pogos', 'explosivite', 'pogo', 'Mollets, tendons, réactivité', [
      'Petits sauts rapides, jambes presque tendues, sur l’avant des pieds.',
      'Le contact au sol doit être le plus court possible, comme un ressort.',
      'Les chevilles font le travail, les genoux plient à peine.',
    ], 'Écraser les talons au sol.', 'Moins haut, plus lentement.', 'Sur une jambe.'],
    ['sauts-groupes', 'Sauts genoux groupés', 'explosivite', 'tuckJump', 'Quadriceps, fessiers, abdos', [
      'Saute le plus haut possible et ramène les genoux vers la poitrine.',
      'Reçois-toi en souplesse, genoux dans l’axe, et enchaîne.',
      'Arrête la série dès que les sauts baissent.',
    ], 'Courber le dos pour aller chercher les genoux.'],
    ['sauts-contrebas', 'Sauts en contrebas', 'explosivite', 'depthJump', 'Jambes complètes, réactivité', [
      'Debout sur une marche ou une chaise basse (30 cm environ), laisse-toi tomber, ne saute pas.',
      'Dès que tes pieds touchent le sol, rebondis le plus haut possible.',
      'Le contact doit être bref : touche et repars. Repos complet entre chaque saut.',
    ], 'Partir d’un support trop haut. Au-delà de 40 cm, le rebond ralentit.', 'Juste la réception, sans rebond.', 'Rebond en longueur.'],
    ['bonds-enchaines', 'Bonds enchaînés', 'explosivite', 'broadjump', 'Fessiers, ischios, quadriceps', [
      'Trois bonds en longueur pieds joints, sans pause entre eux.',
      'Les bras lancent chaque bond.',
      'Cherche la distance et un temps au sol court.',
    ], 'S’arrêter entre les bonds.'],
    ['sauts-lateraux-joints', 'Sauts latéraux pieds joints', 'explosivite', 'latHops', 'Mollets, hanches, appuis', [
      'Pieds joints, saute de part et d’autre d’une ligne, le plus vite possible.',
      'Contacts courts, buste stable, regard devant.',
      'C’est le transfert latéral rapide du swing.',
    ], 'Sauter haut au lieu de sauter vite.'],
    ['cloche-pied', 'Sauts à cloche-pied', 'explosivite', 'hop', 'Jambe complète, cheville, équilibre', [
      'Sur une jambe, enchaîne des sauts vers l’avant.',
      'Reçois-toi sur l’avant du pied, genou dans l’axe, et repars aussitôt.',
      'Fais le même nombre de sauts de chaque côté.',
    ], 'Laisser le genou rentrer à la réception.', 'Un saut à la fois, avec réception stabilisée.'],
    ['fentes-sautees', 'Fentes sautées', 'explosivite', 'jumpLunge', 'Quadriceps, fessiers', [
      'En fente, saute et inverse les jambes en l’air.',
      'Reçois-toi directement en fente, genou arrière près du sol.',
      'Garde le buste droit et le rythme régulier.',
    ], 'Se recevoir genoux tendus.'],

    // Lancers
    ['lancer-rotatif', 'Lancer rotatif au médecine-ball', 'lancers', 'mbRotThrow', 'Hanches, abdos obliques, épaules', [
      'De profil à un mur, ballon tenu à hauteur de hanche côté arrière.',
      'Lance le ballon contre le mur en tournant violemment les hanches, puis le buste : comme un swing.',
      'Rattrape, replace-toi, et relance. Chaque lancer est un effort maximal.',
    ], 'Lancer avec les bras. La puissance vient des hanches qui tournent en premier.', 'Sans médecine-ball : rotations explosives à l’élastique.'],
    ['lancer-pousse-rotatif', 'Lancer poussé en rotation', 'lancers', 'mbShotPut', 'Hanches, obliques, poitrine', [
      'De profil au mur, ballon contre l’épaule arrière, coude sous le ballon.',
      'Tourne les hanches puis pousse le ballon vers le mur comme un lancer de poids.',
      'C’est le test de puissance qui prédit le mieux la vitesse de club.',
    ], 'Pousser avant que les hanches aient tourné.'],
    ['lancer-poitrine', 'Lancer poitrine au médecine-ball', 'lancers', 'mbChest', 'Pectoraux, triceps, épaules', [
      'Face à un mur, ballon contre la poitrine.',
      'Pousse le ballon le plus fort possible contre le mur, bras qui finissent tendus.',
      'Rattrape et relance aussitôt.',
    ], 'Lancer en cloche : la trajectoire doit être tendue.'],
    ['lancer-au-dessus', 'Lancer au sol par-dessus la tête', 'lancers', 'mbSlam', 'Dorsaux, abdos, chaîne complète', [
      'Ballon tenu bras tendus au-dessus de la tête, sur la pointe des pieds.',
      'Écrase-le au sol devant toi de toutes tes forces en fléchissant les hanches.',
      'Ramasse-le, remonte, et recommence.',
    ], 'Arrondir le dos pour ramasser le ballon.', undefined, 'Utilise un ballon qui ne rebondit pas trop pour enchaîner.'],

    // Haut du corps
    ['tractions-strictes', 'Tractions strictes', 'haut', 'pullup', 'Grand dorsal, biceps, avant-bras', [
      'Départ bras tendus, épaules engagées vers le bas.',
      'Monte jusqu’au menton au-dessus de la barre, sans élan.',
      'Redescends en contrôle jusqu’à bras tendus.',
    ], 'Les demi-répétitions. Bras tendus en bas, toujours.', 'Tractions assistées à l’élastique.', 'Monte le plus vite possible.'],
    ['rowing-inverse', 'Rowing inversé sous une table', 'haut', 'invRow', 'Haut du dos, biceps', [
      'Allongé sous une table solide, mains au bord, corps gainé en planche.',
      'Tire la poitrine jusqu’à la table, omoplates serrées.',
      'Redescends lentement jusqu’à bras tendus.',
    ], 'Laisser les hanches tomber.', 'Pieds plus près, genoux pliés.', 'Pieds surélevés sur une chaise.'],
    ['rowing-un-bras', 'Rowing un bras à l’élastique', 'haut', 'row', 'Haut du dos, rotation du buste', [
      'Élastique accroché devant toi, en fente, une main sur l’élastique.',
      'Tire le coude vers l’arrière, près du corps, en gardant le buste face à l’avant.',
      'Résister à la rotation fait aussi travailler les abdos.',
    ], 'Tourner les épaules pour tirer plus loin.'],
    ['rotation-externe', 'Rotation externe à l’élastique', 'haut', 'extRot', 'Coiffe des rotateurs', [
      'Coude collé au corps, plié à 90 degrés, élastique tendu dans la main.',
      'Tourne l’avant-bras vers l’extérieur sans décoller le coude.',
      'Reviens lentement. Ces petits muscles protègent l’épaule à chaque swing.',
    ], 'Décoller le coude du corps.'],
    ['pompes-pieds-sureleves', 'Pompes pieds surélevés', 'haut', 'feetUpPush', 'Pectoraux, épaules, triceps', [
      'Pieds sur une chaise, mains au sol un peu plus larges que les épaules.',
      'Descends la poitrine près du sol, coudes à 45 degrés.',
      'Pousse en gardant le corps droit.',
    ], 'Cambrer le bas du dos.'],
    ['pompes-explosives', 'Pompes explosives', 'haut', 'plyoPush', 'Pectoraux, triceps, explosivité', [
      'Descends en contrôle, puis pousse si fort que les mains décollent du sol.',
      'Reçois-toi bras souples et enchaîne.',
      'Arrête la série dès que les mains ne décollent plus.',
    ], 'Se recevoir bras tendus.', 'Mains sur une chaise.', 'Frappe dans les mains en l’air.'],
    ['turkish-get-up', 'Turkish get-up', 'haut', 'getUp', 'Épaules, gainage complet', [
      'Allongé, kettlebell tenu bras tendu vers le plafond, genou du même côté plié.',
      'Monte sur le coude, puis sur la main, sans jamais quitter la kettlebell des yeux.',
      'Le bras reste vertical tout le long. Redescends dans l’ordre inverse.',
    ], 'Laisser le bras chargé partir en arrière.', 'Sans poids, avec une chaussure en équilibre sur le poing.', 'Va jusqu’à la position debout.'],

    // Bas du corps
    ['souleve-elastique', 'Soulevé de terre à l’élastique', 'bas', 'rdl2', 'Ischios, fessiers, bas du dos', [
      'Debout sur l’élastique, mains qui le tiennent devant les cuisses.',
      'Pousse les fesses en arrière, dos plat, jusqu’à sentir l’étirement des ischios.',
      'Remonte en serrant les fessiers, vite.',
    ], 'Arrondir le dos.'],
    ['pont-fessier', 'Pont fessier', 'bas', 'bridge', 'Fessiers, ischios', [
      'Allongé sur le dos, pieds à plat, genoux pliés.',
      'Pousse dans les talons pour monter le bassin jusqu’à l’alignement épaules, hanches, genoux.',
      'Serre les fessiers 2 secondes en haut.',
    ], 'Cambrer le dos en haut.', undefined, 'Hip thrust sur une jambe.'],
    ['nordic-negatif', 'Nordic curl négatif', 'bas', 'nordic', 'Ischio-jambiers', [
      'À genoux, chevilles bloquées sous un canapé ou tenues par quelqu’un.',
      'Descends le buste vers l’avant le plus lentement possible, corps droit des genoux aux épaules.',
      'Rattrape-toi avec les mains, puis remonte en t’aidant des bras.',
    ], 'Plier les hanches pour freiner moins.', 'Descends seulement à mi-chemin.', 'Remonte avec les ischios.'],
    ['fente-laterale', 'Fente latérale', 'bas', 'sideLunge', 'Adducteurs, fessiers, quadriceps', [
      'Grand pas sur le côté, descends sur cette jambe en poussant les fesses en arrière.',
      'L’autre jambe reste tendue, pied à plat.',
      'Pousse pour revenir au centre. C’est le transfert latéral du swing.',
    ], 'Laisser le genou fléchi dépasser loin devant le pied.'],
    ['cossack', 'Cossack squat', 'bas', 'cossack', 'Adducteurs, hanches, chevilles', [
      'Pieds très écartés, descends sur une jambe jusqu’en bas.',
      'La jambe tendue pointe les orteils vers le plafond.',
      'Passe d’un côté à l’autre sans remonter complètement.',
    ], 'Décoller le talon de la jambe pliée.', 'Tiens-toi à un support.'],
    ['copenhagen', 'Gainage Copenhague', 'bas', 'copenhagen', 'Adducteurs, obliques', [
      'Sur le côté, avant-bras au sol, pied du dessus posé sur une chaise.',
      'Monte le bassin pour aligner le corps, la jambe du dessous décolle.',
      'Les adducteurs portent le poids : ils protègent l’aine des mouvements violents.',
    ], 'Laisser le bassin tomber vers l’arrière.', 'Genou posé sur la chaise au lieu du pied.'],

    // Gainage et dos
    ['dead-bug', 'Dead bug', 'gainage', 'deadBug', 'Abdos profonds, bas du dos', [
      'Sur le dos, bras vers le plafond, hanches et genoux à 90 degrés.',
      'Tends un bras derrière la tête et la jambe opposée, sans décoller le bas du dos.',
      'Reviens et change de côté. Lent et contrôlé.',
    ], 'Laisser le bas du dos se creuser.'],
    ['bird-dog', 'Bird dog', 'gainage', 'birdDog', 'Bas du dos, fessiers, gainage', [
      'À quatre pattes, tends un bras devant et la jambe opposée derrière.',
      'Le bassin ne bascule pas. Tiens 8 secondes.',
      'Reviens sans poser, et recommence. Exercice clé pour un dos qui tient la répétition des swings.',
    ], 'Monter la jambe trop haut en cambrant.'],
    ['curl-up', 'Curl-up', 'gainage', 'curlUp', 'Grands droits, gainage', [
      'Sur le dos, une jambe pliée, mains sous le bas du dos.',
      'Décolle juste la tête et les épaules de quelques centimètres, sans plier la nuque. Tiens 8 secondes.',
      'Le bas du dos garde sa courbe naturelle : c’est le gainage qui protège la colonne.',
    ], 'Faire un crunch complet en enroulant le dos.'],

    // Vitesse de swing
    ['swings-progressifs', 'Swings progressifs', 'golf', 'swing', 'Échauffement golf', [
      'Commence par des demi-swings au fer 7, puis des swings complets.',
      'Monte progressivement jusqu’au driver, à 80 % de ta vitesse.',
      'Tu dois être chaud avant le premier swing à fond.',
    ], 'Taper à fond dès les premières balles.'],
    ['swing-retourne', 'Swings à vide club retourné', 'golf', 'swingFast', 'Vitesse de rotation, système nerveux', [
      'Tiens le driver par la tête : il devient plus léger et tu swingues plus vite.',
      'Swingue le plus vite possible, en cherchant le bruit le plus fort après la balle.',
      'Fais aussi des swings du côté opposé : ça équilibre le corps et améliore la vitesse.',
    ], 'Perdre ton équilibre. Vitesse maximale, mais finish tenu.'],
    ['drive-max', 'Drives à fond', 'golf', 'swing', 'Vitesse de club', [
      'Tape chaque drive à vitesse maximale, avec le R10.',
      'Prends 30 secondes entre chaque balle : la qualité avant la quantité.',
      'Note la vitesse de club la plus haute et la moyenne de la série.',
    ], 'Enchaîner les balles sans récupérer.'],

    // Course
    ['seuil', 'Allure seuil', 'course', 'run', 'Endurance, allure soutenue', [
      'Allure soutenue mais tenable, autour de ton allure sur 10 km.',
      'Tu peux dire quelques mots, pas tenir une conversation.',
      'Régulier du début à la fin de chaque portion.',
    ], 'Partir trop vite et finir à l’arrêt.'],
    ['cotes', 'Montées de côte', 'course', 'sprint', 'Puissance de course, mollets', [
      'Sur une côte assez raide, monte vite, buste légèrement penché, genoux hauts.',
      'Redescends en trottinant ou en marchant.',
      'C’est de la musculation en courant, avec peu d’impact.',
    ], 'Se pencher en arrière en montée.'],
    ['course-allure', 'Course à allure soutenue', 'course', 'run', 'Endurance', [
      'Échauffe-toi 10 à 15 minutes en footing.',
      'Cours la distance à une allure soutenue et régulière.',
      'Reporte le temps et la distance de ta montre.',
    ], 'Partir trop vite sur le premier kilomètre.'],

    // Tests
    ['test-detente', 'Test : détente verticale', 'tests', 'squatjump', 'Puissance des jambes', [
      'Debout de profil contre un mur, marque la hauteur atteinte bras tendu.',
      'Saute avec élan des bras et touche le plus haut possible.',
      'La différence entre les deux marques est ta détente. 3 essais, garde le meilleur.',
    ], 'Faire un pas d’élan.'],
    ['test-longueur', 'Test : saut en longueur sans élan', 'tests', 'broadjump', 'Puissance des jambes', [
      'Pieds joints derrière une ligne, saute le plus loin possible.',
      'Réception stable, sans reculer.',
      'Mesure de la ligne jusqu’aux talons. 3 essais, garde le meilleur.',
    ], 'Tomber en arrière à la réception : l’essai ne compte pas.'],
    ['test-sprint', 'Test : sprint 20 m', 'tests', 'sprint', 'Vitesse', [
      'Départ debout, sur du plat.',
      'Filme au ralenti avec le téléphone posé de côté à l’arrivée, ou fais chronométrer.',
      '2 essais avec 3 minutes de repos, garde le meilleur.',
    ], 'Ralentir avant la ligne.'],
    ['test-tractions', 'Test : tractions strictes', 'tests', 'pullup', 'Force de tirage', [
      'Une seule série, au maximum.',
      'Bras tendus en bas, menton au-dessus de la barre, sans élan.',
      'Seules les répétitions propres comptent.',
    ], 'Les demi-répétitions.'],
    ['test-pompes', 'Test : pompes', 'tests', 'pushup', 'Force de poussée', [
      '3 minutes après les tractions.',
      'Une série au maximum, poitrine près du sol, sans pause en haut.',
      'Arrête quand la forme se dégrade.',
    ], 'Laisser les hanches tomber.'],
    ['test-lancer-rotatif', 'Test : lancer rotatif', 'tests', 'mbShotPut', 'Puissance de rotation', [
      'Médecine-ball de 3 kg, de profil, ballon contre l’épaule arrière.',
      'Lance le plus loin possible en tournant, sans dépasser la ligne avec le pied avant.',
      'Mesure jusqu’à l’impact. 3 essais de chaque côté, garde le meilleur.',
    ], 'Faire un pas en avant.'],
    ['test-lancer-poitrine', 'Test : lancer poitrine assis', 'tests', 'mbChestSeated', 'Puissance de poussée', [
      'Assis sur une chaise, dos collé au dossier, pieds à plat.',
      'Lance le médecine-ball de 3 kg le plus loin possible depuis la poitrine.',
      'Mesure jusqu’à l’impact. 3 essais, garde le meilleur.',
    ], 'Décoller le dos de la chaise.'],
  ];
  return defs.map(([id, name, cat, anim, muscles, steps, avoid, easier, harder]) => ({ id, name, cat, anim, muscles, steps, avoid, easier, harder }));
}
