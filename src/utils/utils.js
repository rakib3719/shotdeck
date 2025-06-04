export const base_url = 'https://shotdeck-backend.vercel.app/api';
// export const base_url = 'http://localhost:5000/api';

export const upload_preset = 'e-paper';
export const cloud_name = 'djf8l2ahy'


export const filters = [
  {
    id: 1,
    name: 'mediaType',
    title: 'Media Type',
    item: ['Movie', 'TV', 'Trailer', 'Music Video', 'Commercial'],
  },
  {
    id: 2,
    name: 'genre',
    title: 'Genre',
    item: ['Movie/TV', 'Music Video', 'Commercial'],
  },
  {
    id: 3,
    name: 'timePeriod',
    title: 'Time Period',
    item: [
      'Future',
      '2020s',
      '2010s',
      '2000s',
      '1900s',
      '1800s',
      '1700s',
      'Renaissance: 1400–1700',
      'Medieval: 500–1499',
      'Ancient: 2000BC–500AD',
      'Stone Age: pre–2000BC',
    ],
  },
  {
    id: 4,
    name: 'color',
    title: 'Color',
    item: [
      'Warm',
      'Cool',
      'Mixed',
      'Saturated',
      'Desaturated',
      'Red',
      'Orange',
      'Yellow',
      'Green',
      'Cyan',
      'Blue',
      'Purple',
      'Magenta',
      'Pink',
      'White',
      'Sepia',
      'Black & White',
    ],
  },
  {
    id: 5,
    name: 'aspectRatio',
    title: 'Aspect Ratio',
    item: [
      '9:16',
      '1:1',
      '1.20',
      '1.33',
      '1.37',
      '1.43',
      '1.66',
      '1.78',
      '1.85',
      '1.90',
      '2.00',
      '2.20',
      '2.35',
      '2.39',
      '2.55',
      '2.67',
      '2.76',
    ],
  },
  {
    id: 6,
    name: 'opticalFormat',
    title: 'Optical Format',
    item: [
      'Anamorphic',
      'Spherical',
      'Super 35',
      '3 perf',
      '2 perf',
      'Open Gate',
      '3D',
    ],
  },



  
  {
    id: 7,
    name: 'labProcesssss',
    title: 'Lab Process',
    item: ['Bleach Bypass', 'Cross Process', 'Flashing'],
  },
  {
    id: 8,
    name: 'format',
    title: 'Format',
    item: [
      'Film - 35mm',
      'Film - 16mm',
      'Film - Super 8mm',
      'Film - 65mm',
      'Film - 70mm',
      'Film - IMAX',
      'Digital',
      'Animation',
    ],
  },
  {
    id: 9,
    name: 'interiorExterior',
    title: 'Interior / Exterior',
    item: ['Interior', 'Exterior'],
  },
  {
    id: 10,
    name: 'timeOfDay',
    title: 'Time Of Day',
    item: ['Day', 'Night', 'Dusk', 'Dawn', 'Sunrise', 'Sunset'],
  },
  {
    id: 21,
    name: 'particles',
    title: 'Particles',
    item: [
      "Sparks",
      "Debris",
      "Rain",
      "Snow",
      "Ashes",
      "Magic",
      "Swarms"
    ],
  },
  {
    id: 22,
    name: 'rigidbodies',
    title: 'Rigid Bodies',
    item: [
      "Destruction",
      "Impact",
      "Collisions",
      "Breaking",
      "Falling Objects"
    ],
  },
  {
    id: 23,
    name: 'softBodies',
    title: 'Soft Bodies',
    item: [
      "Muscles system",
      "Anatomical deformation",
      "Squishy Objects"
    ],
  },
  {
    id: 24,
    name: 'clothgroom',
    title: 'Cloth & Groom',
    item: [
      "Cloth Setup",
      "Cloth Dynamics",
      "Groom Setup",
      "Groom Dynamics"
    ],
  },
  {
    id: 25,
    name: 'magicAbstract',
    title: 'Magic & Abstract',
    item: [
      "Energy FX",
      "Plasma",
      "Portals",
      "Teleportation",
      "Glitches",
      "Hologram",
      "Conceptual"
    ],
  },
  {
    id: 26,
    name: 'crowd',
    title: 'Crowd',
    item: [
      "Agent Simulation",
      "Crowd Dynamics",
      "Battles",
      "Swarms"
    ],
  },
  {
    id: 27,
    name: 'mechanicsTech',
    title: 'Mechanics & Tech',
    item: [
      "Vehicles Crash",
      "Cables / Ropes",
      "Mechanical Parts"
    ],
  },
  {
    id: 28,
    name: 'compositing',
    title: 'Compositing',
    item: [
      "Volumetrics",
      "Liquids / Fluids",
      "Particles",
      "Base of FX compositing"
    ],
  },

   {
    id: 29, 
    name: 'simulationSize',
    title: 'Size Scale',
    item: [
         "extra-small",
        "small",
        "structural",
        "massive",
        "human"
    ]
  },
   {
    id: 30, 
    name: 'simulationStyle',
    title: 'Style',
    item: [
   "realist", 
    "semi-stylized", 
    "stylized",
    "anime"]
  },
   {
    id: 31, 
    name: 'motionStyle',
    title: 'Motion Style',
    item: [
   "realist", 
    "stylized",
    "anime"]
  },
   {
    id: 32, 
    name: 'emitterSpeed',
    title: 'Emitter Speed',
    item: [
   "static",
        "slow",
        "fast"]
  },
   {
    id: 33, 
    name: 'simulationSoftware',
    title: 'Software',
    item: [
  "houdini",
        "blender",
        "embergen",
        "real-flow",
        "phoenix-fd",
        "x-particles",
        "krakatoa",
        "ncloth",
        "ornatrix"]
  },
  {
    id: 12,
    name: 'gender',
    title: 'Gender',
    item: ['male', 'female', 'trans'],
  },
  // {
  //   id: 13,
  //   name: 'age',
  //   title: 'Age',
  //   item: [
  //     'Baby',
  //     'Toddler',
  //     'Child',
  //     'Teenager',
  //     'Young Adult',
  //     'Middle Age',
  //     'Senior',
  //   ],
  // },
  // {
  //   id: 14,
  //   name: 'ethnicity',
  //   title: 'Ethnicity',
  //   item: [
  //     'Black',
  //     'White',
  //     'Latinx',
  //     'Middle Eastern',
  //     'South-East Asian',
  //     'East Asian',
  //     'Indigenous Peoples',
  //     'Mixed-race',
  //   ],
  // },
  {
    id: 15,
    name: 'frameSize',
    title: 'Frame Size',
    item: [
      'Extreme Wide',
      'Wide',
      'Medium Wide',
      'Medium',
      'Medium Close-Up',
      'Close-Up',
      'Extreme Close-Up',
    ],
  },
  {
    id: 16,
    name: 'shotType',
    title: 'Shot Type',
    item: [
      'Aerial',
      'Overhead',
      'High Angle',
      'Low Angle',
      'Dutch Angle',
      'Establishing Shot',
      'Over the Shoulder',
      'Clean Single',
      '2 Shot',
      '3 Shot',
      'Group Shot',
      'Insert',
    ],
  },
  {
    id: 17,
    name: 'composition',
    title: 'Composition',
    item: [
      'Center',
      'Left Heavy',
      'Right Heavy',
      'Balanced',
      'Symmetrical',
      'Short Side',
    ],
  },
  {
    id: 18,
    name: 'lensType',
    title: 'Lens Type',
    item: [
      'Ultra Wide / Fisheye',
      'Wide',
      'Medium',
      'Long Lens',
      'Telephoto',
    ],
  },
  {
    id: 19,
    name: 'lightingStyle',
    title: 'Lighting Style',
    item: [
      'Soft Light',
      'Hard Light',
      'High Contrast',
      'Low Contrast',
      'Silhouette',
      'Top Light',
      'Underlight',
      'Side Light',
      'Backlight',
      'Edge Light',
    ],
  },
  {
    id: 20,
    name: 'lightingType',
    title: 'Lighting Type',
    item: [
      'Daylight',
      'Sunny',
      'Overcast',
      'Moonlight',
      'Artificial Light',
      'Practical Light',
      'Fluorescent',
      'Firelight',
      'Mixed Light',
    ],
  },


 
];