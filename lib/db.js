import { supabase } from './supabase'

export async function getProjects() {
  const { data } = await supabase.from('projects').select('*').order('priority', { ascending: true, nullsFirst: false })
  return (data || []).map(p => ({ id:p.id, name:p.name, description:p.description, star:p.star, status:p.status, color:p.color, priority:p.priority, created:p.created_at }))
}
export async function insertProject(p) {
  await supabase.from('projects').insert({ name:p.name, description:p.description, star:p.star, status:p.status, color:p.color, priority:p.priority })
}
export async function updateProject(id, u) {
  await supabase.from('projects').update(u).eq('id', id)
}

export async function getSessions() {
  const { data } = await supabase.from('sessions').select('*').order('start_time', { ascending: false })
  return (data || []).map(s => ({ id:s.id, projectId:s.project_id, startTime:s.start_time, endTime:s.end_time, whatDid:s.what_did, nextStep:s.next_step, mood:s.mood, duration:s.duration_minutes }))
}
export async function insertSession(s) {
  await supabase.from('sessions').insert({ project_id:s.projectId, start_time:s.startTime, end_time:s.endTime, what_did:s.whatDid, next_step:s.nextStep, mood:s.mood, duration_minutes:s.duration })
}

export async function getDecisions() {
  const { data } = await supabase.from('decisions').select('*').order('decided_at', { ascending: false })
  return (data || []).map(d => ({ id:d.id, projectId:d.project_id, title:d.title, decided:d.decided, reason:d.reason, date:d.decided_at, status:d.status }))
}
export async function insertDecision(d) {
  await supabase.from('decisions').insert({ project_id:d.projectId, title:d.title, decided:d.decided, reason:d.reason })
}

export async function getBlockers() {
  const { data } = await supabase.from('blockers').select('*').order('created_at', { ascending: false })
  return (data || []).map(b => ({ id:b.id, projectId:b.project_id, description:b.description, type:b.blocker_type, resolved:b.resolved, created:b.created_at }))
}
export async function insertBlocker(b) {
  await supabase.from('blockers').insert({ project_id:b.projectId, description:b.description, blocker_type:b.type })
}
export async function toggleBlocker(id, resolved) {
  await supabase.from('blockers').update({ resolved, resolved_at: resolved ? new Date().toISOString() : null }).eq('id', id)
}

export async function getTasks() {
  const { data } = await supabase.from('tasks').select('*').order('sort_order', { ascending: true })
  return (data || []).map(t => ({ id:t.id, projectId:t.project_id, title:t.title, description:t.description, status:t.status, priority:t.priority, category:t.category, order:t.sort_order, created:t.created_at }))
}
export async function insertTask(t) {
  await supabase.from('tasks').insert({ project_id:t.projectId, title:t.title, description:t.description, status:'pending', priority:t.priority||'medium', category:t.category, sort_order:t.order||0 })
}
export async function insertTasksBatch(tasks) {
  const rows = tasks.map(t => ({ project_id:t.projectId, title:t.title, description:t.description, status:'pending', priority:t.priority||'medium', category:t.category, sort_order:t.order||0 }))
  await supabase.from('tasks').insert(rows)
}
export async function updateTaskStatus(id, status) {
  await supabase.from('tasks').update({ status, completed_at: status === 'done' ? new Date().toISOString() : null }).eq('id', id)
}
export async function deleteTask(id) {
  await supabase.from('tasks').delete().eq('id', id)
}
