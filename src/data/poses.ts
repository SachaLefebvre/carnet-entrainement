// Les animations du personnage. Chaque pose donne les points d'appui dans un cadre de 200 x 190,
// sol à y = 175 (cheville posée à y = 171). Coudes et genoux sont calculés par Figure.tsx.

export type Pt = [number, number];

export interface Pose {
  hip: Pt;
  /** Direction des épaules depuis le bassin (la longueur du buste est fixe). */
  sh: Pt;
  hA: Pt;
  hB?: Pt;
  fA: Pt;
  fB?: Pt;
  /** Coude ou genou imposé, quand le calcul automatique ne convient pas (vues de face au sol). */
  eA?: Pt;
  eB?: Pt;
  kA?: Pt;
  kB?: Pt;
  /** Direction du pied, en degrés : 0 vers la droite, 90 vers le bas. */
  toeA?: number;
  toeB?: number;
  head?: Pt;
  /** Courbure du dos. */
  curve?: number;
  /** Direction du club de golf tenu en main. */
  club?: number;
}

export type Anchor = Pt | 'hA' | 'hB' | 'fA' | 'fB' | 'sh' | 'hip';

export type Prop =
  | { t: 'bar'; at: Pt }
  | { t: 'wall'; x: number }
  | { t: 'box'; x: number; y: number; w: number; h: number }
  | { t: 'band'; from: Anchor; to: Anchor };

export interface Anim {
  frames: Pose[];
  loop?: 'pingpong' | 'cycle' | 'restart';
  /** Durée d'une transition et pause sur chaque pose, en millisecondes. */
  ms?: number;
  pause?: number;
  /** Vue de face : épaules et hanches ont une largeur. */
  front?: boolean;
  /** Côté vers lequel plient les coudes et les genoux. */
  elbow?: Pt;
  elbowB?: Pt;
  knee?: Pt;
  kneeB?: Pt;
  ground?: boolean;
  props?: Prop[];
  /** Pose affichée quand l'animation est figée. */
  still?: number;
}

const BAR: Pt = [100, 26];
const QUAD = { hip: [100, 134] as Pt, sh: [140, 134] as Pt, fA: [69, 168] as Pt, toeA: 180 };
const FRONT_FEET = { fA: [88, 171] as Pt, fB: [112, 171] as Pt, toeA: 180, toeB: 0 };

const pullup: Anim = {
  frames: [
    { hip: [97, 108], sh: [99, 68], hA: [100, 28], fA: [84, 152], head: [0, -1] },
    { hip: [86, 76], sh: [82, 36], hA: [100, 28], fA: [76, 120], head: [0.1, -1] },
  ],
  elbow: [0.5, 1],
  knee: [1, 0.3],
  ground: false,
  ms: 1100,
  props: [{ t: 'bar', at: BAR }],
};

const squatFrames: Pose[] = [
  { hip: [100, 110], sh: [101, 70], hA: [104, 111], fA: [100, 171] },
  { hip: [86, 141], sh: [104, 105], hA: [143, 104], fA: [100, 171] },
];

const run: Anim = {
  frames: [
    { hip: [98, 108], sh: [106, 69], hA: [86, 100], hB: [124, 86], fA: [114, 144], fB: [70, 158], toeA: 20, toeB: 70 },
    { hip: [98, 108], sh: [106, 69], hA: [124, 86], hB: [86, 100], fA: [70, 158], fB: [114, 144], toeA: 70, toeB: 20 },
  ],
  elbow: [-0.4, 1],
  ms: 330,
  pause: 0,
  still: 0,
};

// Figures : appui sur deux parallettes (ou deux chaises), mains à hauteur de bassin.
const PARA: Prop = { t: 'box', x: 92, y: 125, w: 18, h: 50 };
const SEAT = { hip: [96, 122] as Pt, sh: [100, 82] as Pt, hA: [101, 124] as Pt };
const SUPPORT_LEGS = { kA: [103, 152] as Pt, fA: [78, 133] as Pt, toeA: 200 };
const TUCK_LEGS = { kA: [121.4, 104.2] as Pt, fA: [106, 131] as Pt, toeA: 60 };
const ADV_LEGS = { kA: [127, 122] as Pt, fA: [122, 152.6] as Pt, toeA: 80 };
const HANDSTAND: Pose = { hip: [100, 92], sh: [100, 132], hA: [100, 173], fA: [100, 30], toeA: -90, head: [0, 1] };
const WALL_HS: Pose = { hip: [136, 92], sh: [132, 132], hA: [130, 173], fA: [145, 32], toeA: -90, head: [0, 1] };
const PISTOL_TOP: Pose = { hip: [96, 110], sh: [98, 70], hA: [138, 76], fA: [100, 171], fB: [140, 150], toeA: 0, toeB: -10 };
const PISTOL_BOTTOM: Pose = { hip: [84, 158], sh: [106, 124], hA: [146, 118], fA: [100, 171], fB: [146, 150], toeA: 0, toeB: -10 };

const pistol: Anim = { frames: [PISTOL_TOP, PISTOL_BOTTOM], knee: [1, -0.6], ms: 1200, pause: 300, still: 1 };

export const ANIMS: Record<string, Anim> = {
  // Figures : L-sit
  support: { frames: [{ ...SEAT, ...SUPPORT_LEGS }], props: [PARA] },
  supportFeet: { frames: [{ ...SEAT, fA: [134, 171], toeA: -75 }], knee: [0, -1], props: [PARA] },
  supportShrug: {
    frames: [
      { ...SEAT, ...SUPPORT_LEGS, eA: [100.5, 103] },
      { hip: [96, 129], sh: [100, 89], hA: [101, 124], eA: [100.5, 106.5], kA: [103, 159], fA: [78, 140], toeA: 200 },
    ],
    ms: 700,
    pause: 400,
    props: [PARA],
  },
  lsitTuck: { frames: [{ ...SEAT, ...TUCK_LEGS }], props: [PARA] },
  lsitAdv: { frames: [{ ...SEAT, ...ADV_LEGS }], props: [PARA] },
  lsitOne: { frames: [{ ...SEAT, fA: [158, 122], toeA: 0, kB: ADV_LEGS.kA, fB: ADV_LEGS.fA, toeB: 80 }], props: [PARA] },
  lsitFull: { frames: [{ ...SEAT, fA: [158, 122], toeA: 0 }], props: [PARA] },
  pikeLift: {
    frames: [
      { hip: [80, 166], sh: [100, 131], hA: [112, 170], fA: [142, 166], toeA: -80 },
      { hip: [80, 166], sh: [100, 131], hA: [112, 170], fA: [141, 157], toeA: -60 },
    ],
    elbow: [-1, -0.3],
    ms: 700,
    pause: 700,
  },
  quadSet: {
    frames: [
      { hip: [70, 166], sh: [62, 127], hA: [52, 168], fA: [132, 166], toeA: -80 },
      { hip: [70, 166], sh: [62, 127], hA: [52, 168], fA: [132, 164], toeA: -55 },
    ],
    elbow: [1, 0],
    ms: 600,
    pause: 1400,
  },
  pikeStretch: {
    frames: [
      { hip: [70, 166], sh: [80, 127], hA: [112, 160], fA: [132, 166], toeA: -80 },
      { hip: [70, 166], sh: [106, 148], hA: [134, 162], fA: [132, 166], toeA: -80, head: [1, 0.5] },
    ],
    elbow: [0, -1],
    ms: 1300,
    pause: 900,
  },

  // Figures : poirier
  pikeBox: {
    frames: [{ hip: [106, 95], sh: [118, 133], hA: [124, 173], fA: [50, 125], toeA: 160, head: [0.2, 1] }],
    props: [{ t: 'box', x: 26, y: 130, w: 38, h: 45 }],
  },
  handstand: {
    frames: [HANDSTAND, { ...HANDSTAND, hip: [101, 92], fA: [103, 30] }],
    ms: 1400,
    pause: 200,
  },
  wallToe: {
    frames: [WALL_HS, { ...WALL_HS, hip: [134, 92], fA: [137, 31] }],
    knee: [0, -1],
    ms: 1100,
    pause: 900,
    props: [{ t: 'wall', x: 153 }],
  },
  handstandShrug: {
    frames: [
      { ...WALL_HS, eA: [131, 152.4] },
      { ...WALL_HS, hip: [136, 99], sh: [132, 139], fA: [145, 39], eA: [131, 156] },
    ],
    knee: [0, -1],
    ms: 800,
    pause: 400,
    props: [{ t: 'wall', x: 153 }],
  },
  shoulderOpen: {
    frames: [
      { hip: [70, 140], sh: [108, 146], eA: [137, 136], hA: [134, 118], kA: [70, 171], fA: [39, 171], toeA: 180, head: [1, 0.3] },
      { hip: [70, 140], sh: [108, 154], eA: [137, 136], hA: [134, 118], kA: [70, 171], fA: [39, 171], toeA: 180, head: [1, 0.5] },
    ],
    ms: 1400,
    pause: 900,
    props: [{ t: 'box', x: 132, y: 140, w: 40, h: 35 }],
  },
  kickup: {
    frames: [
      { hip: [80, 114], sh: [86, 75], hA: [96, 34], fA: [100, 171], fB: [50, 168], toeA: 0, toeB: -10, head: [0.2, -1] },
      { hip: [100, 96], sh: [116, 133], hA: [118, 173], fA: [98, 160], fB: [62, 62], toeA: 60, toeB: -120, head: [0.3, 1] },
      { hip: [118, 92], sh: [118, 132], hA: [118, 173], fA: [118, 30], fB: [118, 30], toeA: -90, toeB: -90, head: [0, 1] },
    ],
    ms: 650,
    pause: 350,
    still: 2,
  },

  // Figures : pistol squat
  pistol,
  pistolNeg: { ...pistol, loop: 'restart', ms: 2600, pause: 0 },
  pistolBox: {
    frames: [PISTOL_TOP, { hip: [80, 127], sh: [96, 91], hA: [134, 88], fA: [100, 171], fB: [140, 117], toeA: 0, toeB: -10 }],
    knee: [1, -0.6],
    ms: 1200,
    pause: 300,
    still: 1,
    props: [{ t: 'box', x: 44, y: 133, w: 42, h: 42 }],
  },
  pistolLow: {
    frames: [PISTOL_TOP, { hip: [84, 147], sh: [104, 112], hA: [143, 107], fA: [100, 171], fB: [145, 139], toeA: 0, toeB: -10 }],
    knee: [1, -0.6],
    ms: 1200,
    pause: 300,
    still: 1,
    props: [{ t: 'box', x: 54, y: 153, w: 38, h: 22 }],
  },
  pistolAssist: {
    frames: [
      { ...PISTOL_TOP, hA: [136, 86] },
      { ...PISTOL_BOTTOM, hA: [143, 112] },
    ],
    knee: [1, -0.6],
    ms: 1200,
    pause: 300,
    still: 1,
    props: [
      { t: 'wall', x: 170 },
      { t: 'band', from: [170, 76], to: 'hA' },
    ],
  },
  balanceLeg: {
    frames: [{ hip: [96, 110], sh: [94, 70], hA: [128, 92], fA: [100, 171], fB: [156, 108], toeA: 0, toeB: 0 }],
    knee: [1, -0.3],
  },

  stand: { frames: [{ hip: [100, 110], sh: [100, 70], hA: [103, 111], fA: [100, 171] }] },

  // Haut du corps
  pushup: {
    frames: [
      { hip: [97, 146], sh: [136, 134], hA: [124, 173], fA: [38, 165], toeA: 90 },
      { hip: [100, 159], sh: [142, 155], hA: [124, 173], fA: [38, 165], toeA: 90 },
    ],
    elbow: [-1, -1],
    still: 1,
  },
  pike: {
    frames: [
      { hip: [88, 112], sh: [114, 142], hA: [140, 173], fA: [60, 167], toeA: 60 },
      { hip: [96, 120], sh: [120, 152], hA: [140, 173], fA: [60, 167], toeA: 60 },
    ],
    elbow: [-1, 0.2],
  },
  pullup,
  pullupBand: { ...pullup, props: [{ t: 'bar', at: BAR }, { t: 'band', from: BAR, to: 'fA' }] },
  kneeraise: {
    frames: [
      { hip: [100, 109], sh: [100, 68], hA: [100, 28], fA: [102, 168], toeA: 30, head: [0, -1] },
      { hip: [98, 110], sh: [100, 68], hA: [100, 28], fA: [124, 110], toeA: 30, head: [0, -1] },
    ],
    knee: [1, -0.3],
    ground: false,
    props: [{ t: 'bar', at: BAR }],
  },
  lsit: {
    frames: [
      { hip: [92, 171], sh: [102, 133], hA: [104, 173], fA: [128, 171], toeA: -20 },
      { hip: [92, 166], sh: [103, 131], hA: [104, 173], fA: [120, 154], toeA: -20 },
    ],
    knee: [0.3, -1],
    ms: 900,
    pause: 900,
  },
  wallwalk: {
    frames: [
      { hip: [85, 146], sh: [47, 134], hA: [47, 173], fA: [144, 165], toeA: 90 },
      { hip: [136, 92], sh: [132, 132], hA: [130, 173], fA: [145, 32], toeA: -90, head: [0, 1] },
    ],
    knee: [0, -1],
    ms: 1700,
    pause: 900,
    props: [{ t: 'wall', x: 153 }],
  },
  row: {
    frames: [
      { hip: [92, 110], sh: [90, 70], hA: [130, 90], fA: [90, 171], fB: [104, 171] },
      { hip: [90, 110], sh: [86, 70], hA: [104, 92], fA: [90, 171], fB: [104, 171] },
    ],
    elbow: [-1, 0.2],
    props: [{ t: 'band', from: [186, 90], to: 'hA' }],
  },
  press: {
    frames: [
      { hip: [100, 110], sh: [100, 70], hA: [80, 72], hB: [120, 72], ...FRONT_FEET },
      { hip: [100, 110], sh: [100, 70], hA: [86, 30], hB: [114, 30], ...FRONT_FEET },
    ],
    front: true,
    elbow: [-1, 0.6],
    elbowB: [1, 0.6],
    props: [
      { t: 'band', from: 'fA', to: 'hA' },
      { t: 'band', from: 'fB', to: 'hB' },
    ],
  },
  facepull: {
    frames: [
      { hip: [94, 110], sh: [92, 70], hA: [132, 66], fA: [92, 171], fB: [104, 171] },
      { hip: [92, 110], sh: [90, 70], hA: [106, 60], fA: [92, 171], fB: [104, 171] },
    ],
    elbow: [-0.4, -1],
    props: [{ t: 'band', from: [188, 62], to: 'hA' }],
  },

  // Abdos et gainage
  hollow: {
    frames: [
      { hip: [100, 166], sh: [60, 166], hA: [19, 166], fA: [161, 166], toeA: -60 },
      { hip: [100, 167], sh: [61, 158], hA: [24, 140], fA: [158, 146], toeA: -30 },
    ],
    ms: 900,
    pause: 1200,
  },
  pallof: {
    frames: [
      { hip: [100, 110], sh: [100, 70], hA: [98, 92], hB: [98, 92], ...FRONT_FEET },
      { hip: [101, 110], sh: [102, 70], hA: [102, 92], hB: [102, 92], ...FRONT_FEET },
    ],
    front: true,
    ms: 700,
    pause: 500,
    props: [{ t: 'band', from: [10, 92], to: 'hA' }],
  },
  sideplank: {
    frames: [
      { hip: [102, 166], sh: [64, 154], hA: [86, 173], hB: [100, 160], fA: [160, 168], toeA: -70 },
      { hip: [103, 149], sh: [64, 152], hA: [86, 173], hB: [64, 111], fA: [160, 168], toeA: -70 },
    ],
    elbow: [0, 1],
    elbowB: [0, -1],
    ms: 900,
    pause: 1300,
  },
  plank: {
    frames: [{ hip: [99, 157], sh: [138, 152], hA: [158, 173], fA: [38, 165], toeA: 90 }],
    elbow: [0, 1],
  },
  legraise: {
    frames: [
      { hip: [100, 165], sh: [60, 165], hA: [100, 169], fA: [161, 165], toeA: -50 },
      { hip: [100, 165], sh: [60, 165], hA: [100, 169], fA: [143, 121], toeA: -95 },
      { hip: [100, 165], sh: [60, 165], hA: [100, 169], fA: [104, 104], toeA: -140 },
    ],
    ms: 600,
    pause: 0,
  },

  // Bas du corps
  squat: { frames: squatFrames, knee: [1, -0.3] },
  squatBand: { frames: squatFrames, knee: [1, -0.3], props: [{ t: 'band', from: 'fA', to: 'sh' }] },
  squatjump: {
    frames: [
      squatFrames[0],
      squatFrames[1],
      { hip: [100, 84], sh: [100, 44], hA: [103, 3], fA: [100, 145], toeA: 70 },
      squatFrames[1],
    ],
    knee: [1, -0.3],
    loop: 'cycle',
    ms: 380,
    pause: 60,
    still: 1,
  },
  deepsquat: {
    frames: [{ hip: [90, 152], sh: [103, 114], hA: [122, 128], fA: [100, 171] }],
    elbow: [0.2, 1],
    knee: [1, -0.5],
  },
  broadjump: {
    frames: [
      { hip: [44, 141], sh: [62, 105], hA: [36, 132], fA: [58, 171] },
      { hip: [98, 100], sh: [120, 67], hA: [158, 52], fA: [66, 128], toeA: 50 },
      { hip: [142, 141], sh: [160, 105], hA: [196, 104], fA: [156, 171] },
    ],
    loop: 'restart',
    ms: 460,
    pause: 0,
    still: 1,
  },
  run,
  sprint: { ...run, ms: 220 },
  bulgarian: {
    frames: [
      { hip: [92, 112], sh: [94, 72], hA: [98, 108], fA: [114, 171], fB: [62, 136], toeB: 160 },
      { hip: [90, 138], sh: [96, 98], hA: [96, 134], fA: [114, 171], fB: [62, 136], toeB: 160 },
    ],
    kneeB: [0, 1],
    props: [{ t: 'box', x: 38, y: 143, w: 34, h: 36 }],
    still: 1,
  },
  rdl: {
    frames: [
      { hip: [100, 110], sh: [100, 70], hA: [104, 111], fA: [100, 171], fB: [97, 171] },
      { hip: [95, 112], sh: [132, 97], hA: [133, 138], fA: [100, 171], fB: [38, 134], toeB: 100 },
    ],
    props: [{ t: 'band', from: 'fA', to: 'hA' }],
  },
  calf: {
    frames: [
      { hip: [97, 105.5], sh: [98, 65.5], hA: [138, 84], fA: [97, 166], toeA: -15, fB: [86, 148], toeB: 60 },
      { hip: [101, 93], sh: [102, 53], hA: [138, 80], fA: [102.5, 153.5], toeA: 60, fB: [90, 136], toeB: 60 },
    ],
    props: [
      { t: 'box', x: 92, y: 168, w: 40, h: 11 },
      { t: 'wall', x: 142 },
    ],
  },
  hipthrust: {
    frames: [
      { hip: [98, 166], sh: [58, 165], hA: [97, 170], fA: [124, 171], fB: [152, 136], toeB: -60, head: [-1, 0] },
      { hip: [89, 140], sh: [58, 165], hA: [97, 170], fA: [124, 171], fB: [143, 108], toeB: -60, head: [-1, 0] },
    ],
    knee: [0, -1],
    kneeB: [0, -1],
  },
  skater: {
    frames: [
      { hip: [68, 128], sh: [60, 90], hA: [40, 112], hB: [84, 118], fA: [62, 171], fB: [100, 152], toeA: 180, toeB: 180 },
      { hip: [100, 104], sh: [100, 64], hA: [84, 84], hB: [116, 84], fA: [86, 150], fB: [114, 150], toeA: 180, toeB: 0 },
      { hip: [132, 128], sh: [140, 90], hA: [116, 118], hB: [160, 112], fA: [100, 152], fB: [138, 171], toeA: 0, toeB: 0 },
    ],
    front: true,
    ms: 400,
    pause: 120,
    still: 0,
  },
  tibia: {
    frames: [
      { hip: [76, 113], sh: [73, 73], hA: [78, 113], fA: [100, 171], toeA: 0 },
      { hip: [76, 113], sh: [73, 73], hA: [78, 113], fA: [100, 171], toeA: -48 },
    ],
    ms: 700,
    props: [{ t: 'wall', x: 62 }],
  },
  rotation: {
    frames: [
      { hip: [98, 112], sh: [96, 72], hA: [58, 96], hB: [62, 100], fA: [82, 171], fB: [118, 171], toeA: 180, toeB: 0 },
      { hip: [104, 112], sh: [106, 72], hA: [146, 84], hB: [150, 88], fA: [82, 171], fB: [118, 171], toeA: 180, toeB: 0 },
    ],
    front: true,
    ms: 420,
    pause: 500,
    props: [{ t: 'band', from: [10, 96], to: 'hA' }],
  },

  // Mobilité
  catcow: {
    frames: [
      { ...QUAD, hA: [140, 173], curve: -9, head: [0.5, 0.87] },
      { ...QUAD, hA: [140, 173], curve: 7, head: [0.85, -0.5] },
    ],
    knee: [0.3, 1],
    ms: 1300,
  },
  tspine: {
    frames: [
      { ...QUAD, hA: [118, 166], hB: [140, 173] },
      { ...QUAD, hA: [136, 94], hB: [140, 173] },
    ],
    knee: [0.3, 1],
    ms: 1300,
  },
  openbook: {
    frames: [
      { hip: [104, 112], sh: [64, 112], hA: [64, 152], hB: [66, 152], fA: [135, 142], head: [-1, 0] },
      { hip: [104, 112], sh: [64, 112], hA: [30, 134], hB: [66, 152], fA: [135, 142], head: [-1, 0] },
      { hip: [104, 112], sh: [64, 112], hA: [34, 86], hB: [66, 152], fA: [135, 142], head: [-1, 0] },
      { hip: [104, 112], sh: [64, 112], hA: [64, 72], hB: [66, 152], fA: [135, 142], head: [-1, 0] },
    ],
    knee: [-0.3, 1],
    ground: false,
    ms: 520,
    pause: 0,
  },
  hips9090: {
    frames: [
      { hip: [100, 160], sh: [100, 120], hA: [80, 160], hB: [120, 160], kA: [112, 169], fA: [84, 172], kB: [138, 167], fB: [148, 173] },
      { hip: [100, 160], sh: [100, 120], hA: [80, 160], hB: [120, 160], kA: [76, 130], fA: [68, 172], kB: [124, 130], fB: [132, 172] },
      { hip: [100, 160], sh: [100, 120], hA: [80, 160], hB: [120, 160], kA: [62, 167], fA: [52, 173], kB: [88, 169], fB: [116, 172] },
    ],
    front: true,
    ms: 700,
    pause: 300,
    still: 0,
  },
  lungerot: {
    frames: [
      { hip: [88, 140], sh: [127, 133], hA: [134, 173], hB: [122, 173], fA: [128, 171], fB: [38, 165], toeB: 90 },
      { hip: [88, 140], sh: [127, 133], hA: [166, 125], hB: [122, 173], fA: [128, 171], fB: [38, 165], toeB: 90 },
      { hip: [88, 140], sh: [127, 133], hA: [122, 93], hB: [122, 173], fA: [128, 171], fB: [38, 165], toeB: 90 },
    ],
    knee: [1, -1],
    kneeB: [0, 1],
    ms: 650,
    pause: 200,
  },
  kneewall: {
    frames: [
      { hip: [96, 136], sh: [96, 96], hA: [100, 132], fA: [128, 171], kB: [84, 165], fB: [54, 168], toeB: 180 },
      { hip: [106, 139], sh: [108, 99], hA: [110, 135], fA: [128, 171], kB: [84, 165], fB: [54, 168], toeB: 180 },
    ],
    knee: [1, -0.4],
    props: [{ t: 'wall', x: 147 }],
  },
  dislocate: {
    frames: [
      { hip: [100, 110], sh: [100, 70], hA: [66, 104], hB: [134, 104], ...FRONT_FEET },
      { hip: [100, 110], sh: [100, 70], hA: [50, 70], hB: [150, 70], ...FRONT_FEET },
      { hip: [100, 110], sh: [100, 70], hA: [70, 34], hB: [130, 34], ...FRONT_FEET },
    ],
    front: true,
    ms: 650,
    pause: 150,
    props: [{ t: 'band', from: 'hA', to: 'hB' }],
  },

  // Golf
  swing: {
    frames: [
      { hip: [100, 116], sh: [100, 78], hA: [98, 116], hB: [102, 116], fA: [84, 171], fB: [116, 171], toeA: 180, toeB: 0, club: 85 },
      { hip: [98, 116], sh: [96, 78], hA: [72, 52], hB: [74, 54], fA: [84, 171], fB: [116, 171], toeA: 180, toeB: 0, club: 345 },
      { hip: [101, 116], sh: [100, 78], hA: [98, 116], hB: [102, 116], fA: [84, 171], fB: [116, 171], toeA: 180, toeB: 0, club: 85 },
      { hip: [106, 114], sh: [108, 76], hA: [132, 50], hB: [130, 52], fA: [84, 171], fB: [116, 171], toeA: 180, toeB: 0, club: -200 },
    ],
    front: true,
    loop: 'cycle',
    ms: 520,
    pause: 260,
    still: 1,
  },
};
