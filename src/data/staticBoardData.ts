import type { StaticPhrase } from '../types';

export interface StaticBoardCategory {
  id: string;
  title: string;
  icon: string;
}

export const staticBoardCategories: StaticBoardCategory[] = [
  { id: 'basic', title: 'Basic needs', icon: 'HandHeart' },
  { id: 'feelings', title: 'Feelings', icon: 'Heart' },
  { id: 'activities', title: 'Activities', icon: 'Users' },
  { id: 'urgent', title: 'Urgent help', icon: 'ShieldAlert' },
];

/**
 * A deliberately small, fixed phrase board. It is not the primary interaction
 * of IntentPath; it exists as the comparison condition in the demo harness.
 * Every phrase is also a complete message so no construction step is needed.
 */
export const staticBoardPhrases: StaticPhrase[] = [
  // Basic needs
  {
    id: 'sb-water',
    category: 'basic',
    text: 'I would like some water, please.',
    icon: 'Droplets',
  },
  {
    id: 'sb-rice',
    category: 'basic',
    text: 'I would like some rice, please.',
    icon: 'Utensils',
  },
  {
    id: 'sb-open-jar',
    category: 'basic',
    text: 'Please help me open this jar.',
    icon: 'Package',
  },
  {
    id: 'sb-eat',
    category: 'basic',
    text: 'I would like something to eat, please.',
    icon: 'Utensils',
  },
  {
    id: 'sb-drink',
    category: 'basic',
    text: 'I would like something to drink, please.',
    icon: 'CupSoda',
  },
  {
    id: 'sb-help',
    category: 'basic',
    text: 'I need some help, please.',
    icon: 'LifeBuoy',
  },
  {
    id: 'sb-bathroom',
    category: 'basic',
    text: 'I need help getting to the bathroom, please.',
    icon: 'Bath',
  },
  {
    id: 'sb-break',
    category: 'basic',
    text: 'I need a short break, please.',
    icon: 'Pause',
  },
  {
    id: 'sb-quiet-rest',
    category: 'basic',
    text: 'I need a quiet rest, please.',
    icon: 'Armchair',
  },
  {
    id: 'sb-glasses',
    category: 'basic',
    text: 'Please help me find my glasses.',
    icon: 'Glasses',
  },

  // Feelings
  {
    id: 'sb-pain-head-moderate',
    category: 'feelings',
    text: 'I have pain in my head. The pain is moderate.',
    icon: 'Activity',
  },
  {
    id: 'sb-pain-head-mild',
    category: 'feelings',
    text: 'I have pain in my head. The pain is mild.',
    icon: 'Activity',
  },
  {
    id: 'sb-pain-stomach',
    category: 'feelings',
    text: 'I have pain in my stomach. The pain is moderate.',
    icon: 'Activity',
  },
  {
    id: 'sb-worried-talk',
    category: 'feelings',
    text: 'I feel worried and would like to talk to someone.',
    icon: 'CloudRain',
  },
  {
    id: 'sb-worried',
    category: 'feelings',
    text: 'I feel worried.',
    icon: 'CloudRain',
  },
  {
    id: 'sb-sad-company',
    category: 'feelings',
    text: 'I feel sad and would like some company.',
    icon: 'Frown',
  },
  {
    id: 'sb-uncomfortable-head',
    category: 'feelings',
    text: 'My head feels uncomfortable. The discomfort is mild.',
    icon: 'Meh',
  },
  {
    id: 'sb-okay',
    category: 'feelings',
    text: 'I feel okay right now.',
    icon: 'Smile',
  },
  {
    id: 'sb-tired',
    category: 'feelings',
    text: 'I feel tired.',
    icon: 'BedDouble',
  },

  // Activities
  {
    id: 'sb-go-outside',
    category: 'activities',
    text: 'I would like to go outside.',
    icon: 'Sun',
  },
  {
    id: 'sb-talk-family-phone',
    category: 'activities',
    text: 'I want to talk to my family by phone.',
    icon: 'Phone',
  },
  {
    id: 'sb-rest-while',
    category: 'activities',
    text: 'I would like to rest for a while.',
    icon: 'Armchair',
  },
  {
    id: 'sb-read',
    category: 'activities',
    text: 'I would like to read for a while.',
    icon: 'BookOpen',
  },
  {
    id: 'sb-tv',
    category: 'activities',
    text: 'I would like to watch TV for a while.',
    icon: 'Tv',
  },
  {
    id: 'sb-music',
    category: 'activities',
    text: 'I would like to listen to music.',
    icon: 'Music',
  },
  {
    id: 'sb-walk',
    category: 'activities',
    text: 'I would like to take a walk.',
    icon: 'Footprints',
  },
  {
    id: 'sb-garden',
    category: 'activities',
    text: 'I would like to go to the garden.',
    icon: 'TreePine',
  },
  {
    id: 'sb-family-person',
    category: 'activities',
    text: 'I would like to talk to my family in person.',
    icon: 'Users',
  },
  {
    id: 'sb-friend-phone',
    category: 'activities',
    text: 'I would like to talk to a friend by phone.',
    icon: 'Phone',
  },
  {
    id: 'sb-quiet-time',
    category: 'activities',
    text: 'I would like some quiet time.',
    icon: 'Pause',
  },
  {
    id: 'sb-lie-down',
    category: 'activities',
    text: 'I would like to lie down for a while.',
    icon: 'BedDouble',
  },
  {
    id: 'sb-company',
    category: 'activities',
    text: 'I would like some company.',
    icon: 'Users',
  },

  // Urgent
  {
    id: 'sb-urgent',
    category: 'urgent',
    text: 'I need help now, please.',
    icon: 'ShieldAlert',
  },
  {
    id: 'sb-urgent-right-now',
    category: 'urgent',
    text: 'I need help right now.',
    icon: 'ShieldAlert',
  },
  {
    id: 'sb-chest-help',
    category: 'urgent',
    text: 'I have pain in my chest, and I need help now.',
    icon: 'HeartPulse',
  },
  {
    id: 'sb-call-nurse',
    category: 'urgent',
    text: 'Please call a nurse for me.',
    icon: 'Stethoscope',
  },
];

export function getStaticPhraseById(id: string): StaticPhrase | undefined {
  return staticBoardPhrases.find((phrase) => phrase.id === id);
}
