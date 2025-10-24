// Profile picture options - people with glasses and study-focused emojis
export const PROFILE_PICTURE_PRESETS = [
  {
    id: 'person1',
    name: 'Guy with Glasses',
    emoji: '👨‍💼',
    color: '#4ECDC4',
  },
  {
    id: 'person2',
    name: 'Girl with Glasses',
    emoji: '👩‍💼',
    color: '#FF6B6B',
  },
  {
    id: 'study1',
    name: 'Books',
    emoji: '📚',
    color: '#45B7D1',
  },
  {
    id: 'study2',
    name: 'Graduation',
    emoji: '🎓',
    color: '#96CEB4',
  },
  {
    id: 'study4',
    name: 'Pencil',
    emoji: '✏️',
    color: '#DDA0DD',
  },
  {
    id: 'study5',
    name: 'Books',
    emoji: '📖',
    color: '#FFB347',
  },
  {
    id: 'study6',
    name: 'Brain',
    emoji: '🧠',
    color: '#98D8C8',
  },
];

export type ProfilePicturePreset = typeof PROFILE_PICTURE_PRESETS[0];
