import { CollegeEnum } from '@/types'

export interface GuildInfo {
  acronym: CollegeEnum
  officialName: string
  guildName: string
  focus: string
  color: string
  icon: string
}

export const GUILDS: Record<CollegeEnum, GuildInfo> = {
  CCSICT: {
    acronym: 'CCSICT',
    officialName: 'College of Computing Studies, ICT',
    guildName: 'The Technomancers',
    focus: 'Intelligence',
    color: '#fda003',
    icon: '⚡',
  },
  COE: {
    acronym: 'COE',
    officialName: 'College of Engineering',
    guildName: 'The Artificers',
    focus: 'Strength',
    color: '#4c0204',
    icon: '⚙️',
  },
  CA: {
    acronym: 'CA',
    officialName: 'College of Agriculture',
    guildName: 'The Druids',
    focus: 'Nature',
    color: '#174008',
    icon: '🌿',
  },
  CON: {
    acronym: 'CON',
    officialName: 'College of Nursing',
    guildName: 'The Vitalists',
    focus: 'Vitality',
    color: '#d60685',
    icon: '💗',
  },
  CBAPA: {
    acronym: 'CBAPA',
    officialName: 'Business Admin & Public Admin',
    guildName: 'The Tycoons',
    focus: 'Charisma',
    color: '#080e88',
    icon: '💎',
  },
  CCJE: {
    acronym: 'CCJE',
    officialName: 'Criminal Justice Education',
    guildName: 'The Wardens',
    focus: 'Defense',
    color: '#7d0608',
    icon: '🛡️',
  },
  CED: {
    acronym: 'CED',
    officialName: 'College of Education',
    guildName: 'The Sages',
    focus: 'Wisdom',
    color: '#217580',
    icon: '📚',
  },
  CAS: {
    acronym: 'CAS',
    officialName: 'Arts and Sciences',
    guildName: 'The Alchemists',
    focus: 'Agility',
    color: '#dac607',
    icon: '⚗️',
  },
  SVM: {
    acronym: 'SVM',
    officialName: 'School of Veterinary Medicine',
    guildName: 'The Beastmasters',
    focus: 'Spirit',
    color: '#464646',
    icon: '🐾',
  },
  IOF: {
    acronym: 'IOF',
    officialName: 'Institute of Fisheries',
    guildName: 'The Tidemasters',
    focus: 'Dexterity',
    color: '#018d99',
    icon: '🌊',
  },
  COM: {
    acronym: 'COM',
    officialName: 'College of Medicine',
    guildName: 'The Clerics',
    focus: 'Recovery',
    color: '#2c9103',
    icon: '✚',
  },
}

export const DIFFICULTY_CONFIG = {
  common: {
    label: 'Common',
    color: '#9ca3af',
    xpMultiplier: 1,
    goldMultiplier: 1,
  },
  uncommon: {
    label: 'Uncommon',
    color: '#22c55e',
    xpMultiplier: 1.5,
    goldMultiplier: 1.5,
  },
  rare: {
    label: 'Rare',
    color: '#3b82f6',
    xpMultiplier: 2,
    goldMultiplier: 2,
  },
  epic: {
    label: 'Epic',
    color: '#a855f7',
    xpMultiplier: 3,
    goldMultiplier: 3,
  },
  legendary: {
    label: 'Legendary',
    color: '#f59e0b',
    xpMultiplier: 5,
    goldMultiplier: 5,
  },
}

export const XP_PER_LEVEL = 1000

export const calculateLevel = (xp: number): number => {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export const calculateXpProgress = (xp: number): number => {
  return (xp % XP_PER_LEVEL) / XP_PER_LEVEL
}

export const calculateXpForNextLevel = (xp: number): number => {
  return XP_PER_LEVEL - (xp % XP_PER_LEVEL)
}




