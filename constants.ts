import { FocusMode, FocusModeConfig } from './types';

export const FOCUS_MODES: FocusModeConfig[] = [
  {
    id: FocusMode.WEB,
    label: 'Web Search',
    description: 'Searches the entire internet for the best answer.',
    icon: 'Globe'
  },
  {
    id: FocusMode.ACADEMIC,
    label: 'Academic',
    description: 'Searches published academic papers and research.',
    icon: 'GraduationCap'
  },
  {
    id: FocusMode.WRITING,
    label: 'Writing',
    description: 'Pure generation without web search.',
    icon: 'PenTool'
  },
  {
    id: FocusMode.YOUTUBE,
    label: 'YouTube',
    description: 'Finds relevant videos and channels.',
    icon: 'Youtube'
  },
  {
    id: FocusMode.REDDIT,
    label: 'Reddit',
    description: 'Searches discussions and opinions on Reddit.',
    icon: 'MessageCircle'
  }
];

export const INITIAL_GREETING: string = "Where knowledge begins.";