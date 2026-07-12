export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      missions: { Row: MissionDB; Insert: Partial<MissionDB>; Update: Partial<MissionDB> }
      projects: { Row: ProjectDB; Insert: Partial<ProjectDB>; Update: Partial<ProjectDB> }
      project_missions: { Row: ProjectMission; Insert: Partial<ProjectMission>; Update: Partial<ProjectMission> }
      milestones: { Row: MilestoneDB; Insert: Partial<MilestoneDB>; Update: Partial<MilestoneDB> }
      tasks: { Row: TaskDB; Insert: Partial<TaskDB>; Update: Partial<TaskDB> }
      task_missions: { Row: TaskMission; Insert: Partial<TaskMission>; Update: Partial<TaskMission> }
      subtasks: { Row: SubTaskDB; Insert: Partial<SubTaskDB>; Update: Partial<SubTaskDB> }
      habits: { Row: HabitDB; Insert: Partial<HabitDB>; Update: Partial<HabitDB> }
      habit_logs: { Row: HabitLogDB; Insert: Partial<HabitLogDB>; Update: Partial<HabitLogDB> }
      journal_entries: { Row: JournalDB; Insert: Partial<JournalDB>; Update: Partial<JournalDB> }
      knowledge_items: { Row: KnowledgeDB; Insert: Partial<KnowledgeDB>; Update: Partial<KnowledgeDB> }
      research_papers: { Row: ResearchPaperDB; Insert: Partial<ResearchPaperDB>; Update: Partial<ResearchPaperDB> }
      writing_projects: { Row: WritingProjectDB; Insert: Partial<WritingProjectDB>; Update: Partial<WritingProjectDB> }
      writing_sessions: { Row: WritingSessionDB; Insert: Partial<WritingSessionDB>; Update: Partial<WritingSessionDB> }
      business_clients: { Row: ClientDB; Insert: Partial<ClientDB>; Update: Partial<ClientDB> }
      invoices: { Row: InvoiceDB; Insert: Partial<InvoiceDB>; Update: Partial<InvoiceDB> }
      calendar_events: { Row: CalendarEventDB; Insert: Partial<CalendarEventDB>; Update: Partial<CalendarEventDB> }
      activity_log: { Row: ActivityLogDB; Insert: Partial<ActivityLogDB>; Update: Partial<ActivityLogDB> }
      user_levels: { Row: UserLevelDB; Insert: Partial<UserLevelDB>; Update: Partial<UserLevelDB> }
      achievements: { Row: AchievementDB; Insert: Partial<AchievementDB>; Update: Partial<AchievementDB> }
      ai_recommendations: { Row: AIRecommendationDB; Insert: Partial<AIRecommendationDB>; Update: Partial<AIRecommendationDB> }
    }
  }
}

export interface Profile { id: string; display_name: string | null; avatar_url: string | null; timezone: string; work_hours_start: string; work_hours_end: string; focus_duration_minutes: number; created_at: string; updated_at: string }
export interface MissionDB { id: string; user_id: string; title: string; description: string | null; category: string | null; color: string | null; icon: string | null; progress: number; deadline: string | null; is_active: boolean; sort_order: number; created_at: string; updated_at: string }
export interface ProjectDB { id: string; user_id: string; title: string; description: string | null; category: string | null; status: string; priority: string; progress: number; deadline: string | null; start_date: string | null; budget: number | null; tags: string[]; created_at: string; updated_at: string }
export interface ProjectMission { project_id: string; mission_id: string }
export interface MilestoneDB { id: string; project_id: string; title: string; description: string | null; deadline: string | null; status: string; completed_at: string | null; sort_order: number; created_at: string; updated_at: string }
export interface TaskDB { id: string; user_id: string; title: string; description: string | null; priority: string; importance: number; urgency: number; estimated_time: number; actual_time: number; category: string | null; project_id: string | null; deadline: string | null; status: string; progress: number; difficulty: number; energy_required: string; location: string | null; context: string | null; ai_suggestion: string | null; reflection_after: string | null; scheduled_date: string | null; scheduled_start: string | null; scheduled_end: string | null; is_recurring: boolean; recurring_pattern: string | null; completed_at: string | null; tags: string[]; created_at: string; updated_at: string }
export interface TaskMission { task_id: string; mission_id: string }
export interface SubTaskDB { id: string; task_id: string; title: string; completed: boolean; sort_order: number; created_at: string }
export interface HabitDB { id: string; user_id: string; title: string; description: string | null; category: string | null; frequency: string; target_count: number; current_streak: number; longest_streak: number; created_at: string; updated_at: string }
export interface HabitLogDB { id: string; habit_id: string; date: string; count: number; completed: boolean; created_at: string }
export interface JournalDB { id: string; user_id: string; date: string; type: string | null; content: string | null; mood: string | null; energy: string | null; wins: string[]; challenges: string[]; lessons_learned: string[]; gratitude: string[]; created_at: string; updated_at: string }
export interface KnowledgeDB { id: string; user_id: string; title: string; content: string | null; type: string; tags: string[]; project_id: string | null; source: string | null; url: string | null; is_favorite: boolean; created_at: string; updated_at: string }
export interface ResearchPaperDB { id: string; user_id: string; title: string; authors: string[]; journal: string | null; year: number | null; doi: string | null; url: string | null; abstract: string | null; notes: string | null; tags: string[]; status: string; rating: number; citations: number; reading_list: boolean; rejection_journal: string | null; rejection_cause: string | null; rejection_date: string | null; created_at: string; updated_at: string }
export interface WritingProjectDB { id: string; user_id: string; title: string; type: string | null; description: string | null; target_word_count: number; current_word_count: number; status: string; deadline: string | null; tags: string[]; created_at: string; updated_at: string }
export interface WritingSessionDB { id: string; writing_project_id: string; date: string; word_count: number; time_spent: number; notes: string | null; created_at: string }
export interface ClientDB { id: string; user_id: string; name: string; email: string | null; phone: string | null; company: string | null; type: string | null; status: string; notes: string | null; tags: string[]; created_at: string; updated_at: string }
export interface InvoiceDB { id: string; user_id: string; client_id: string | null; number: string; amount: number; status: string; due_date: string | null; paid_at: string | null; created_at: string; updated_at: string }
export interface CalendarEventDB { id: string; user_id: string; title: string; description: string | null; start_time: string; end_time: string; all_day: boolean; type: string; project_id: string | null; color: string | null; recurring: string | null; created_at: string; updated_at: string }
export interface ActivityLogDB { id: string; user_id: string; type: string; action: string; description: string | null; entity_id: string | null; created_at: string }
export interface UserLevelDB { id: string; user_id: string; level: number; xp: number; total_xp_earned: number; created_at: string; updated_at: string }
export interface AchievementDB { id: string; user_id: string; code: string; title: string; description: string | null; icon: string | null; category: string | null; xp_reward: number; unlocked_at: string }
export interface AIRecommendationDB { id: string; user_id: string; type: string; title: string; description: string | null; priority: string | null; category: string | null; action_label: string | null; action_link: string | null; dismissed: boolean; created_at: string }
