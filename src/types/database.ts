export type CollegeEnum =
  | 'CCSICT'
  | 'COE'
  | 'CA'
  | 'CON'
  | 'CBAPA'
  | 'CCJE'
  | 'CED'
  | 'CAS'
  | 'SVM'
  | 'IOF'
  | 'COM'

export type QuestStatus = 'available' | 'in_progress' | 'completed' | 'expired'

export type QuestDifficulty = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type VerificationType = 'qr_code' | 'gps' | 'evidence_upload' | 'manual'

export type UserRole = 'player' | 'quest_giver' | 'game_master'

export interface GpsRequirement {
  type: 'gps'
  latitude: number
  longitude: number
  radiusMeters: number
}

export interface QrCodeRequirement {
  type: 'qr_code'
  code: string
}

export interface EvidenceRequirement {
  type: 'evidence_upload'
  description: string
}

export interface ManualRequirement {
  type: 'manual'
  instructions: string
}

export type QuestRequirement =
  | GpsRequirement
  | QrCodeRequirement
  | EvidenceRequirement
  | ManualRequirement

export interface UserProfile {
  id: string
  email: string
  studentId: string
  firstName: string
  lastName: string
  college: CollegeEnum
  role: UserRole
  xp: number
  gold: number
  level: number
  avatarUrl: string | null
  activityStreak: number
  lastActiveAt: string
  createdAt: string
  updatedAt: string
}

export interface Quest {
  id: string
  title: string
  description: string
  shortDescription: string
  difficulty: QuestDifficulty
  xpReward: number
  goldReward: number
  requirements: QuestRequirement
  startsAt: string
  expiresAt: string
  maxParticipants: number | null
  currentParticipants: number
  createdById: string
  targetColleges: CollegeEnum[] | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserQuestLog {
  id: string
  oderId: string
  questId: string
  status: QuestStatus
  startedAt: string
  completedAt: string | null
  proofUrl: string | null
  verifiedById: string | null
  verifiedAt: string | null
  xpAwarded: number
  goldAwarded: number
  createdAt: string
}

export interface GuildLeaderboard {
  college: CollegeEnum
  guildName: string
  totalXp: number
  totalMembers: number
  averageLevel: number
  rank: number
}

export interface StudentCluster {
  id: string
  userId: string
  clusterLabel: string
  clusterDescription: string
  questCompletionRate: number
  averageSessionDuration: number
  socialInteractionScore: number
  attritionRisk: number
  analyzedAt: string
}

export interface ActivityLog {
  id: string
  userId: string
  actionType: string
  metadata: Record<string, unknown>
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'quest' | 'achievement' | 'guild' | 'system'
  isRead: boolean
  createdAt: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  iconUrl: string
  xpBonus: number
  requirement: Record<string, unknown>
}

export interface UserAchievement {
  id: string
  userId: string
  achievementId: string
  unlockedAt: string
}




