'use client'
import { useState, useEffect, useCallback } from 'react'
import * as db from '@/lib/db'
import Cockpit from '@/components/Cockpit'

export default function Home() {
  const [data, setData] = useState(null)

  const load = useCallback(async () => {
    const [projects, sessions, decisions, blockers, tasks] = await Promise.all([
      db.getProjects(), db.getSessions(), db.getDecisions(), db.getBlockers(), db.getTasks()
    ])
    setData({ projects, sessions, decisions, blockers, tasks })
  }, [])

  useEffect(() => { load() }, [load])

  if (!data) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Orbitron',sans-serif", fontSize:18, color:'#00e5ff', letterSpacing:4, background:'#07080c' }}>
      CARREGANDO SISTEMAS...
    </div>
  )

  return <Cockpit data={data} db={db} reload={load} />
}
