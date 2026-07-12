import type { Task, Project, Mission, Milestone, SubTask, CareerEntry, Skill } from '@/types'
import { supabase } from './supabase'

const db = supabase as any

function toCamelCase<T>(rows: any[]): T[] {
  return rows.map((r) => {
    if (!r) return r
    const obj: any = {}
    for (const [key, val] of Object.entries(r)) {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
      obj[camelKey] = val
    }
    return obj
  }) as unknown as T[]
}

// ── Tasks ──
export async function fetchTasks(userId: string): Promise<Task[]> {
  const { data, error } = await db
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return toCamelCase<Task>(data ?? [])
}

export async function createTask(userId: string, task: Partial<Task>): Promise<Task> {
  const { data, error } = await db
    .from('tasks')
    .insert({
      user_id: userId,
      title: task.title || '',
      description: task.description || null,
      priority: task.priority || 'medium',
      status: task.status || 'not_started',
      deadline: task.deadline || null,
      category: task.category || null,
      tags: task.tags || [],
      progress: task.progress ?? 0,
      estimated_time: task.estimatedTime ?? 0,
      actual_time: task.actualTime ?? 0,
      importance: task.importance ?? 3,
      urgency: task.urgency ?? 3,
      difficulty: task.difficulty ?? 2,
      energy_required: task.energyRequired || 'medium',
      is_recurring: task.isRecurring ?? false,
      completed_at: task.completedAt || null,
      scheduled_date: task.scheduledDate || null,
      scheduled_start: task.scheduledStart || null,
      scheduled_end: task.scheduledEnd || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return toCamelCase<Task>([data])[0]!
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const { error } = await db
    .from('tasks')
    .update({
      ...updates.title !== undefined && { title: updates.title },
      ...updates.description !== undefined && { description: updates.description },
      ...updates.priority !== undefined && { priority: updates.priority },
      ...updates.status !== undefined && { status: updates.status },
      ...updates.deadline !== undefined && { deadline: updates.deadline },
      ...updates.progress !== undefined && { progress: updates.progress },
      ...updates.completedAt !== undefined && { completed_at: updates.completedAt },
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await db.from('tasks').delete().eq('id', id)
  if (error) throw error
}

// ── Projects ──
export async function fetchProjects(userId: string): Promise<Project[]> {
  const { data, error } = await db
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return toCamelCase<Project>(data ?? [])
}

export async function createProject(userId: string, project: Partial<Project>): Promise<Project> {
  const { data, error } = await db
    .from('projects')
    .insert({
      user_id: userId,
      title: project.title || '',
      description: project.description || null,
      status: project.status || 'not_started',
      priority: project.priority || 'medium',
      category: project.category || null,
      deadline: project.deadline || null,
      tags: project.tags || [],
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return toCamelCase<Project>([data])[0]!
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  const { error } = await db
    .from('projects')
    .update({
      ...updates.title !== undefined && { title: updates.title },
      ...updates.description !== undefined && { description: updates.description },
      ...updates.status !== undefined && { status: updates.status },
      ...updates.priority !== undefined && { priority: updates.priority },
      ...updates.deadline !== undefined && { deadline: updates.deadline },
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await db.from('projects').delete().eq('id', id)
  if (error) throw error
}

// ── Missions ──
export async function fetchMissions(userId: string): Promise<Mission[]> {
  const { data, error } = await db
    .from('missions')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return toCamelCase<Mission>(data ?? [])
}

export async function createMission(userId: string, mission: Partial<Mission>): Promise<Mission> {
  const { data, error } = await db
    .from('missions')
    .insert({
      user_id: userId,
      title: mission.title || '',
      description: mission.description || null,
      category: mission.category || null,
      color: mission.color || '#8B5CF6',
      icon: mission.icon || 'target',
      progress: mission.progress ?? 0,
      deadline: mission.deadline || null,
      is_active: mission.isActive ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return toCamelCase<Mission>([data])[0]!
}

export async function updateMission(id: string, updates: Partial<Mission>): Promise<void> {
  const { error } = await db
    .from('missions')
    .update({
      ...updates.title !== undefined && { title: updates.title },
      ...updates.description !== undefined && { description: updates.description },
      ...updates.progress !== undefined && { progress: updates.progress },
      ...updates.deadline !== undefined && { deadline: updates.deadline },
      ...updates.isActive !== undefined && { is_active: updates.isActive },
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteMission(id: string): Promise<void> {
  const { error } = await db.from('missions').delete().eq('id', id)
  if (error) throw error
}

// ── Research Papers ──
export async function fetchResearchPapers(userId: string): Promise<any[]> {
  const { data, error } = await db
    .from('research_papers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return toCamelCase<any>(data ?? [])
}

export async function createResearchPaper(userId: string, paper: any): Promise<any> {
  const { data, error } = await db
    .from('research_papers')
    .insert({
      user_id: userId,
      title: paper.title || '',
      authors: paper.authors || [],
      journal: paper.journal || null,
      year: paper.year || null,
      doi: paper.doi || null,
      url: paper.url || null,
      abstract: paper.abstract || null,
      notes: paper.notes || null,
      tags: paper.tags || [],
      status: paper.status || 'to_read',
      rating: paper.rating ?? 0,
      citations: paper.citations ?? 0,
      reading_list: paper.readingList ?? false,
      rejection_journal: paper.rejectionJournal ?? null,
      rejection_cause: paper.rejectionCause ?? null,
      rejection_date: paper.rejectionDate ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return toCamelCase<any>([data])[0]!
}

export async function updateResearchPaper(id: string, updates: any): Promise<void> {
  const { error } = await db
    .from('research_papers')
    .update({
      ...updates.title !== undefined && { title: updates.title },
      ...updates.authors !== undefined && { authors: updates.authors },
      ...updates.journal !== undefined && { journal: updates.journal },
      ...updates.year !== undefined && { year: updates.year },
      ...updates.doi !== undefined && { doi: updates.doi },
      ...updates.url !== undefined && { url: updates.url },
      ...updates.abstract !== undefined && { abstract: updates.abstract },
      ...updates.notes !== undefined && { notes: updates.notes },
      ...updates.tags !== undefined && { tags: updates.tags },
      ...updates.status !== undefined && { status: updates.status },
      ...updates.rating !== undefined && { rating: updates.rating },
      ...updates.citations !== undefined && { citations: updates.citations },
      ...updates.readingList !== undefined && { reading_list: updates.readingList },
      ...updates.rejectionJournal !== undefined && { rejection_journal: updates.rejectionJournal },
      ...updates.rejectionCause !== undefined && { rejection_cause: updates.rejectionCause },
      ...updates.rejectionDate !== undefined && { rejection_date: updates.rejectionDate },
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteResearchPaper(id: string): Promise<void> {
  const { error } = await db.from('research_papers').delete().eq('id', id)
  if (error) throw error
}

// ── Activity Log ──
export async function logActivity(
  userId: string, type: string, action: string, description: string, entityId?: string,
): Promise<void> {
  await db.from('activity_log').insert({
    user_id: userId, type, action,
    description, entity_id: entityId || null,
  })
}

// ── User Level ──
export async function fetchUserLevel(userId: string) {
  const { data, error } = await db
    .from('user_levels')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function upsertUserLevel(userId: string, level: number, xp: number, totalXpEarned: number) {
  const { error } = await db.from('user_levels').upsert({
    user_id: userId, level, xp,
    total_xp_earned: totalXpEarned,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}

// ── Milestones ──
export async function fetchMilestones(projectId: string): Promise<Milestone[]> {
  const { data, error } = await db
    .from('milestones')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return toCamelCase<Milestone>(data ?? [])
}

export async function createMilestone(projectId: string, milestone: Partial<Milestone>): Promise<Milestone> {
  const { data, error } = await db
    .from('milestones')
    .insert({
      project_id: projectId,
      title: milestone.title || '',
      description: milestone.description || null,
      deadline: milestone.deadline || null,
      status: milestone.status || 'not_started',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return toCamelCase<Milestone>([data])[0]!
}

export async function updateMilestone(id: string, updates: Partial<Milestone>): Promise<void> {
  const { error } = await db.from('milestones').update({
    ...updates.title !== undefined && { title: updates.title },
    ...updates.status !== undefined && { status: updates.status },
    updated_at: new Date().toISOString(),
  }).eq('id', id)
  if (error) throw error
}

export async function deleteMilestone(id: string): Promise<void> {
  const { error } = await db.from('milestones').delete().eq('id', id)
  if (error) throw error
}

// ── Subtasks ──
export async function fetchSubtasks(taskId: string): Promise<SubTask[]> {
  const { data, error } = await db
    .from('subtasks')
    .select('*')
    .eq('task_id', taskId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return toCamelCase<SubTask>(data ?? [])
}

export async function createSubtask(taskId: string, subtask: Partial<SubTask>): Promise<SubTask> {
  const { data, error } = await db
    .from('subtasks')
    .insert({ task_id: taskId, title: subtask.title || '', completed: subtask.completed ?? false })
    .select()
    .single()
  if (error) throw error
  return toCamelCase<SubTask>([data])[0]!
}

export async function updateSubtask(id: string, updates: Partial<SubTask>): Promise<void> {
  const { error } = await db.from('subtasks').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteSubtask(id: string): Promise<void> {
  const { error } = await db.from('subtasks').delete().eq('id', id)
  if (error) throw error
}

// ── Career Entries ──
export async function fetchCareerEntries(userId: string): Promise<any[]> {
  const { data, error } = await db
    .from('career_entries')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })
  if (error) throw error
  return toCamelCase<any>(data ?? [])
}

export async function createCareerEntry(userId: string, entry: any): Promise<any> {
  const { data, error } = await db
    .from('career_entries')
    .insert({
      user_id: userId,
      title: entry.title || '',
      subtitle: entry.subtitle || '',
      type: entry.type || 'other',
      start_date: entry.startDate || null,
      end_date: entry.endDate || null,
      description: entry.description || '',
      category: entry.category || '',
      url: entry.url || null,
      icon: entry.icon || null,
      sort_order: entry.sortOrder ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return toCamelCase<any>([data])[0]!
}

export async function updateCareerEntry(id: string, updates: any): Promise<void> {
  const { error } = await db
    .from('career_entries')
    .update({
      ...updates.title !== undefined && { title: updates.title },
      ...updates.subtitle !== undefined && { subtitle: updates.subtitle },
      ...updates.type !== undefined && { type: updates.type },
      ...updates.startDate !== undefined && { start_date: updates.startDate },
      ...updates.endDate !== undefined && { end_date: updates.endDate },
      ...updates.description !== undefined && { description: updates.description },
      ...updates.category !== undefined && { category: updates.category },
      ...updates.url !== undefined && { url: updates.url },
      ...updates.icon !== undefined && { icon: updates.icon },
      ...updates.sortOrder !== undefined && { sort_order: updates.sortOrder },
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteCareerEntry(id: string): Promise<void> {
  const { error } = await db.from('career_entries').delete().eq('id', id)
  if (error) throw error
}

// ── Skills ──
export async function fetchSkills(userId: string): Promise<any[]> {
  const { data, error } = await db
    .from('skills')
    .select('*')
    .eq('user_id', userId)
    .order('year', { ascending: false })
  if (error) throw error
  return toCamelCase<any>(data ?? [])
}

export async function createSkill(userId: string, skill: any): Promise<any> {
  const { data, error } = await db
    .from('skills')
    .insert({
      user_id: userId,
      name: skill.name || '',
      category: skill.category || '',
      level: skill.level ?? 1,
      year: skill.year ?? new Date().getFullYear(),
      description: skill.description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return toCamelCase<any>([data])[0]!
}

export async function updateSkill(id: string, updates: any): Promise<void> {
  const { error } = await db
    .from('skills')
    .update({
      ...updates.name !== undefined && { name: updates.name },
      ...updates.category !== undefined && { category: updates.category },
      ...updates.level !== undefined && { level: updates.level },
      ...updates.year !== undefined && { year: updates.year },
      ...updates.description !== undefined && { description: updates.description },
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteSkill(id: string): Promise<void> {
  const { error } = await db.from('skills').delete().eq('id', id)
  if (error) throw error
}

// ── Skill-Career Links ──
export async function fetchSkillLinks(careerEntryId: string): Promise<any[]> {
  const { data, error } = await db
    .from('skill_career_links')
    .select('skill_id')
    .eq('career_entry_id', careerEntryId)
  if (error) throw error
  return (data ?? []).map((r: any) => r.skill_id)
}

export async function setSkillLinks(careerEntryId: string, skillIds: string[]): Promise<void> {
  const { error: delErr } = await db.from('skill_career_links').delete().eq('career_entry_id', careerEntryId)
  if (delErr) throw delErr
  if (skillIds.length === 0) return
  const { error: insErr } = await db.from('skill_career_links').insert(
    skillIds.map((skill_id) => ({ career_entry_id: careerEntryId, skill_id })),
  )
  if (insErr) throw insErr
}
