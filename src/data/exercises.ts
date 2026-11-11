// La bibliothèque d'exercices : consignes, erreurs à éviter, variantes et animation associée.

export type Category = 'mobilite' | 'haut' | 'bas' | 'explosivite' | 'gainage' | 'figures' | 'course';

export const CATEGORY_LABEL: Record<Category, string> = {
  mobilite: 'Mobilité',
  haut: 'Haut du corps',
  bas: 'Bas du corps',
  explosivite: 'Explosivité',
  gainage: 'Abdos et gainage',
  figures: 'Figures',
  course: 'Course',
};

export const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];

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
    name: 'L-sit genoux repliés',
    cat: 'figures',
    anim: 'lsit',
    muscles: 'Abdos, fléchisseurs de hanche, triceps',
    steps: [
      'Assis, mains au sol à côté des hanches, ou sur deux chaises.',
      'Pousse fort dans les mains pour décoller les fesses, épaules basses.',
      'Ramène les genoux vers la poitrine et décolle les pieds. Tiens.',
    ],
    avoid: 'Hausser les épaules vers les oreilles.',
    easier: 'Garde les orteils au sol et ne décolle que les fesses.',
    harder: 'Tends une jambe, puis les deux.',
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
];

export const EXERCISES: Record<string, Exercise> = Object.fromEntries(list.map((e) => [e.id, e]));
export const EXERCISE_LIST = list;
