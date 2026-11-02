// Display names and caption colors for every speaker.
export const SPEAKERS = {
  marcus: {name: 'MARCUS', color: '#FF4B4B'},
  dev: {name: 'DEV', color: '#3EE37E'},
  tank: {name: 'TANK', color: '#C9CED6'},
  jace: {name: 'JACE', color: '#47A6FF'},
  radio: {name: '???', color: '#FFB703'},
  all: {name: 'EVERYONE', color: '#FFFFFF'},
} as const;

export type SpeakerId = keyof typeof SPEAKERS;
export type Who = 'marcus' | 'dev' | 'tank' | 'jace';
