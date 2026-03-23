'use client'
import { useState, useEffect, useRef } from 'react'

const fmtDate=(d)=>{if(!d)return'—';return new Date(d).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}
const fmtTime=(d)=>{if(!d)return'';return new Date(d).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
const fmtDur=(min)=>{if(!min)return'0min';const h=Math.floor(min/60),m=min%60;return h>0?`${h}h${m>0?m+'m':''}`:`${m}min`}
const timeAgo=(d)=>{const diff=Date.now()-new Date(d).getTime();const mins=Math.floor(diff/60000);if(mins<60)return`${mins}min atrás`;const hrs=Math.floor(mins/60);if(hrs<24)return`${hrs}h atrás`;return`${Math.floor(hrs/24)}d atrás`}
const moodE=(m)=>['','😔','😐','🙂','😊','🔥'][m]||''
const PRI={urgent:{label:'URGENTE',color:'#f05a5a',bg:'rgba(240,90,90,0.1)',border:'#4a1a1a'},high:{label:'ALTA',color:'#f5c842',bg:'rgba(245,200,66,0.08)',border:'#3d3010'},medium:{label:'MÉDIA',color:'#6ea8ff',bg:'rgba(110,168,255,0.08)',border:'#1a2a4a'},low:{label:'BAIXA',color:'#5a6080',bg:'rgba(90,96,128,0.08)',border:'#2a2e3a'}}
const STA={pending:{icon:'○'},active:{icon:'◎'},done:{icon:'✓'}}

async function aiExtract(text,name){
  const key=process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;if(!key)return null
  try{const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:1000,messages:[{role:'user',content:`Extraia tarefas acionáveis do texto do projeto "${name}". Para cada: title, description, priority ("urgent"/"high"/"medium"/"low"), category. Retorne APENAS JSON: [{"title":"...","description":"...","priority":"...","category":"..."}]\n\nTexto:\n${text.slice(0,6000)}`}]})});const d=await r.json();return JSON.parse((d.content?.map(i=>i.text||'').join('')||'[]').replace(/```json|```/g,'').trim())}catch(e){return null}
}

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Share+Tech+Mono&family=Exo+2:wght@300;400;500;600;700&display=swap');
:root{--bg:#07080c;--sf:#0d0f15;--sf2:#12151e;--sf3:#181c28;--bd:#1e2235;--bdg:#2a3050;--am:#f5c842;--amd:#a3851f;--amg:rgba(245,200,66,0.15);--cy:#00e5ff;--cyd:#006e7a;--cyg:rgba(0,229,255,0.1);--gn:#3af0a2;--gnd:#1a6b4a;--gng:rgba(58,240,162,0.1);--rd:#f05a5a;--rdd:#7a2a2a;--rdg:rgba(240,90,90,0.1);--tx:#d0d4e0;--txd:#5a6080;--txb:#f0f2ff;--fd:'Orbitron',sans-serif;--fm:'Share Tech Mono',monospace;--fb:'Exo 2',sans-serif}
*{margin:0;padding:0;box-sizing:border-box}
.ck{background:var(--bg);min-height:100vh;color:var(--tx);font-family:var(--fb);position:relative;overflow-x:hidden}
.ck::before{content:'';position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,229,255,0.008) 2px,rgba(0,229,255,0.008) 4px);pointer-events:none;z-index:999}
.ck::after{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(30,34,53,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(30,34,53,0.3) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;z-index:0}
.in{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:24px 20px 80px}
.hdr{display:flex;align-items:center;justify-content:space-between;padding:20px 0 24px;border-bottom:1px solid var(--bd);margin-bottom:32px;flex-wrap:wrap;gap:16px}
.lg{display:flex;align-items:center;gap:14px}
.lg-i{width:42px;height:42px;border:2px solid var(--cy);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 0 20px var(--cyg),inset 0 0 10px var(--cyg);animation:pr 3s ease-in-out infinite}
@keyframes pr{0%,100%{box-shadow:0 0 20px var(--cyg),inset 0 0 10px var(--cyg)}50%{box-shadow:0 0 30px rgba(0,229,255,0.2),inset 0 0 15px rgba(0,229,255,0.15)}}
.lg h1{font-family:var(--fd);font-size:22px;font-weight:700;color:var(--cy);letter-spacing:4px;text-shadow:0 0 20px var(--cyg)}
.lg span{font-family:var(--fm);font-size:10px;color:var(--txd);letter-spacing:2px;text-transform:uppercase}
.hs{display:flex;align-items:center;gap:20px;font-family:var(--fm);font-size:11px;color:var(--txd)}.hs-i{display:flex;align-items:center;gap:6px}
.dt{width:6px;height:6px;border-radius:50%;animation:bl 2s ease-in-out infinite}@keyframes bl{0%,100%{opacity:1}50%{opacity:.3}}
.b{font-family:var(--fb);font-weight:600;font-size:13px;border:none;border-radius:6px;padding:10px 20px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px;letter-spacing:.5px}
.bp{background:linear-gradient(135deg,var(--cyd),rgba(0,229,255,.3));color:var(--cy);border:1px solid var(--cyd)}.bp:hover{box-shadow:0 0 20px var(--cyg)}
.ba{background:linear-gradient(135deg,rgba(245,200,66,.2),rgba(245,200,66,.1));color:var(--am);border:1px solid var(--amd)}.ba:hover{box-shadow:0 0 20px var(--amg)}
.bg{background:0;color:var(--txd);border:1px solid var(--bd)}.bg:hover{border-color:var(--bdg);color:var(--tx)}
.br{background:linear-gradient(135deg,rgba(240,90,90,.2),rgba(240,90,90,.1));color:var(--rd);border:1px solid var(--rdd)}
.bgr{background:linear-gradient(135deg,rgba(58,240,162,.2),rgba(58,240,162,.1));color:var(--gn);border:1px solid var(--gnd)}
.bs{font-size:11px;padding:6px 14px}.bx{font-size:10px;padding:4px 10px}
.pg{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}@media(max-width:700px){.pg{grid-template-columns:1fr}}
.pc{background:var(--sf);border:1px solid var(--bd);border-radius:10px;padding:20px;position:relative;overflow:hidden;cursor:pointer;transition:all .3s}.pc:hover{border-color:var(--bdg);transform:translateY(-2px)}
.pc h3{font-family:var(--fd);font-size:16px;font-weight:700;letter-spacing:1px;margin-bottom:4px}
.pc .ds{font-size:12px;color:var(--txd);margin-bottom:14px;line-height:1.5}
.pc .st{font-family:var(--fm);font-size:11px;padding:8px 12px;background:var(--sf2);border-radius:6px;border-left:2px solid;line-height:1.5;margin-bottom:14px}
.ls{background:var(--sf2);border-radius:6px;padding:12px;font-size:12px}
.ls-l{font-family:var(--fm);font-size:9px;letter-spacing:2px;color:var(--txd);margin-bottom:8px;text-transform:uppercase}
.ls .ns{color:var(--txb);font-weight:600;font-size:13px;margin-top:6px;line-height:1.5}
.ls .me{font-family:var(--fm);font-size:10px;color:var(--txd);margin-top:8px;display:flex;gap:12px;flex-wrap:wrap}
.pk{background:var(--sf);border:1px solid var(--bd);border-radius:8px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;opacity:.5;transition:opacity .2s;margin-bottom:8px}.pk:hover{opacity:.8}
.pk h4{font-family:var(--fd);font-size:12px;letter-spacing:1px}
.sa{background:var(--sf);border:1px solid var(--bd);border-radius:10px;padding:24px;margin-bottom:24px;position:relative}
.sa::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--gn),transparent)}
.tm{font-family:var(--fd);font-size:48px;font-weight:800;color:var(--gn);text-shadow:0 0 30px var(--gng);text-align:center;margin:16px 0;letter-spacing:4px}
.fg{margin-bottom:16px}.fl{display:block;font-family:var(--fm);font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--txd);margin-bottom:8px}
.fi,.ft,.fs{width:100%;background:var(--sf2);border:1px solid var(--bd);border-radius:6px;padding:10px 14px;color:var(--tx);font-family:var(--fb);font-size:14px;outline:0;transition:border-color .2s}
.fi:focus,.ft:focus,.fs:focus{border-color:var(--cyd)}.ft{resize:vertical;min-height:80px}.fs option{background:var(--sf)}
.mr{display:flex;gap:8px;align-items:center}
.mb{width:40px;height:40px;border-radius:8px;border:1px solid var(--bd);background:var(--sf2);font-size:18px;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center}.mb.on{border-color:var(--am);background:var(--amg);transform:scale(1.15)}
.di{background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:16px;margin-bottom:10px;border-left:3px solid}
.di h4{font-size:14px;font-weight:600;color:var(--txb);margin-bottom:6px}
.bli{background:linear-gradient(135deg,#1e0a0a,#150808);border:1px solid #3a1515;border-left:3px solid var(--rd);border-radius:8px;padding:14px 16px;margin-bottom:10px}
.bli p{font-size:13px;line-height:1.6}
.tabs{display:flex;gap:4px;margin-bottom:18px;overflow-x:auto}
.tab{font-family:var(--fm);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;padding:8px 16px;background:0;border:1px solid var(--bd);border-radius:6px;color:var(--txd);cursor:pointer;transition:all .2s;white-space:nowrap}.tab.on{background:var(--sf2);border-color:var(--cyd);color:var(--cy)}
.emp{text-align:center;padding:32px;color:var(--txd);font-size:13px}
.bk{display:inline-flex;align-items:center;gap:6px;font-family:var(--fm);font-size:11px;color:var(--txd);cursor:pointer;margin-bottom:20px;letter-spacing:1px;text-transform:uppercase;background:0;border:0}.bk:hover{color:var(--cy)}
.sc{background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:14px 16px;margin-bottom:10px}
.ov{position:fixed;inset:0;background:rgba(7,8,12,.85);backdrop-filter:blur(8px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px}
.oc{background:var(--sf);border:1px solid var(--bd);border-radius:12px;padding:28px;max-width:560px;width:100%;position:relative;max-height:90vh;overflow-y:auto}
.oc::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--cy),transparent)}
.hf{background:var(--sf);border:1px solid var(--bd);border-radius:8px;position:relative;overflow:hidden}
.hf::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--cyd),transparent)}
.hfh{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid var(--bd);gap:12px;flex-wrap:wrap}
.hft{font-family:var(--fd);font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--txd)}
.hfb{padding:18px}
.fb{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
.ti{background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:14px 16px;margin-bottom:8px;display:flex;gap:12px;align-items:flex-start;transition:all .2s}.ti:hover{border-color:var(--bdg)}.ti.dn{opacity:.4}
.tc{width:24px;height:24px;border-radius:6px;border:1.5px solid var(--bd);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;margin-top:2px;font-size:12px;font-family:var(--fm);transition:all .2s}
.tc.sp{border-color:var(--txd);color:var(--txd)}.tc.sac{border-color:var(--cy);color:var(--cy);background:var(--cyg)}.tc.sd{border-color:var(--gn);color:var(--gn);background:var(--gng)}
.tb{flex:1;min-width:0}.tt2{font-size:14px;font-weight:600;color:var(--txb);margin-bottom:3px;line-height:1.4}.ti.dn .tt2{text-decoration:line-through;color:var(--txd)}
.td2{font-size:12px;color:var(--txd);line-height:1.5}
.tgs{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
.tg{font-family:var(--fm);font-size:9px;letter-spacing:1px;padding:2px 8px;border-radius:4px;border:1px solid;text-transform:uppercase}
.tca{font-family:var(--fm);font-size:9px;padding:2px 8px;border-radius:4px;background:var(--sf3);color:var(--txd);border:1px solid var(--bd)}
.fr{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;align-items:center}
.fc{font-family:var(--fm);font-size:9px;letter-spacing:1px;padding:4px 10px;border-radius:4px;border:1px solid var(--bd);background:0;color:var(--txd);cursor:pointer;text-transform:uppercase;transition:all .2s}.fc.on{background:var(--sf2);border-color:var(--cyd);color:var(--cy)}
.tp{display:flex;align-items:center;gap:10px;margin-bottom:16px}.tpb{flex:1;height:4px;background:var(--bd);border-radius:99px;overflow:hidden}.tpf{height:100%;border-radius:99px;transition:width .5s ease}.tpl{font-family:var(--fm);font-size:11px;color:var(--txd);flex-shrink:0}
.atp{background:var(--sf3);border:1px solid var(--bd);border-radius:8px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:flex-start;gap:10px}
.ail{display:flex;align-items:center;justify-content:center;gap:12px;padding:24px;color:var(--cy);font-family:var(--fm);font-size:12px}
.ail .sp{width:20px;height:20px;border:2px solid var(--bd);border-top-color:var(--cy);border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
.g8{display:flex;gap:8px;flex-wrap:wrap}
`

export default function Cockpit({data,db,reload}){
  const [projects,setProjects]=useState(data.projects)
  const [sessions,setSessions]=useState(data.sessions)
  const [decisions,setDecisions]=useState(data.decisions)
  const [blockers,setBlockers]=useState(data.blockers)
  const [tasks,setTasks]=useState(data.tasks)
  const [view,setView]=useState('dash')
  const [pid,setPid]=useState(null)
  const [aSess,setASess]=useState(null)
  const [elapsed,setElapsed]=useState(0)
  const [ov,setOv]=useState(null)
  const [ptab,setPtab]=useState('tasks')
  const [tf,setTf]=useState('all')
  const [tcf,setTcf]=useState('all')
  const tmr=useRef(null)

  const [fW,sFW]=useState('');const [fN,sFN]=useState('');const [fM,sFM]=useState(3)
  const [fDT,sFDT]=useState('');const [fDD,sFDD]=useState('');const [fDR,sFDR]=useState('')
  const [fBl,sFBl]=useState('');const [fBT,sFBT]=useState('técnico')
  const [fPN,sFPN]=useState('');const [fPD,sFPD]=useState('');const [fPS,sFPS]=useState('');const [fPC,sFPC]=useState('#f5c842')
  const [fTT,sFTT]=useState('');const [fTD,sFTD]=useState('');const [fTP,sFTP]=useState('high');const [fTC,sFTC]=useState('')
  const [aiT,sAiT]=useState('');const [aiL,sAiL]=useState(false);const [aiP,sAiP]=useState(null);const [aiE,sAiE]=useState('')

  useEffect(()=>{setProjects(data.projects);setSessions(data.sessions);setDecisions(data.decisions);setBlockers(data.blockers);setTasks(data.tasks)},[data])

  useEffect(()=>{
    if(aSess){tmr.current=setInterval(()=>setElapsed(Math.floor((Date.now()-new Date(aSess.startTime).getTime())/1000)),1000)}
    else{clearInterval(tmr.current);setElapsed(0)}
    return()=>clearInterval(tmr.current)
  },[aSess])

  const fmtTm=(s)=>`${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const actP=projects.filter(p=>p.status==='active').sort((a,b)=>(a.priority||99)-(b.priority||99))
  const parkP=projects.filter(p=>p.status==='parked')
  const curP=projects.find(p=>p.id===pid)
  const pSess=(id)=>sessions.filter(s=>s.projectId===id).sort((a,b)=>new Date(b.startTime)-new Date(a.startTime))
  const pDec=(id)=>decisions.filter(d=>d.projectId===id).sort((a,b)=>new Date(b.date)-new Date(a.date))
  const pBlk=(id)=>blockers.filter(b=>b.projectId===id)
  const pTsk=(id)=>tasks.filter(t=>t.projectId===id).sort((a,b)=>{const so={active:0,pending:1,done:2},po={urgent:0,high:1,medium:2,low:3};return so[a.status]!==so[b.status]?so[a.status]-so[b.status]:(po[a.priority]||3)-(po[b.priority]||3)})
  const lSess=(id)=>pSess(id)[0]
  const getCats=(id)=>[...new Set(tasks.filter(t=>t.projectId===id&&t.category).map(t=>t.category))].sort()

  const R=async()=>await reload() // shorthand pra recarregar

  const startSess=(id)=>{setASess({projectId:id,startTime:new Date().toISOString()});setPid(id);setView('sess');setOv(null)}
  const endSess=async()=>{if(!aSess)return;const dur=Math.floor((Date.now()-new Date(aSess.startTime).getTime())/60000);await db.insertSession({projectId:aSess.projectId,startTime:aSess.startTime,endTime:new Date().toISOString(),whatDid:fW,nextStep:fN,mood:fM,duration:dur});setASess(null);sFW('');sFN('');sFM(3);setOv(null);setView('proj');await R()}
  const addDec=async()=>{if(!fDT)return;await db.insertDecision({projectId:pid,title:fDT,decided:fDD,reason:fDR});sFDT('');sFDD('');sFDR('');setOv(null);await R()}
  const addBlk=async()=>{if(!fBl)return;await db.insertBlocker({projectId:pid,description:fBl,type:fBT});sFBl('');setOv(null);await R()}
  const togBlk=async(id,cur)=>{await db.toggleBlocker(id,!cur);await R()}
  const addProj=async()=>{if(!fPN)return;await db.insertProject({name:fPN,description:fPD,star:fPS,status:actP.length<2?'active':'parked',color:fPC,priority:actP.length<2?actP.length+1:null});sFPN('');sFPD('');sFPS('');setOv(null);await R()}
  const parkProj=async(id)=>{await db.updateProject(id,{status:'parked',priority:null});await R()}
  const actProj=async(id)=>{if(actP.length>=2)return;await db.updateProject(id,{status:'active',priority:actP.length+1});await R()}
  const addTask=async()=>{if(!fTT)return;const mx=Math.max(0,...tasks.filter(t=>t.projectId===pid).map(t=>t.order||0));await db.insertTask({projectId:pid,title:fTT,description:fTD,priority:fTP,category:fTC,order:mx+1});sFTT('');sFTD('');sFTC('');setOv(null);await R()}
  const cycleTask=async(id,cur)=>{const o=['pending','active','done'];const ns=o[(o.indexOf(cur)+1)%3];await db.updateTaskStatus(id,ns);await R()}
  const delTask=async(id)=>{await db.deleteTask(id);await R()}

  const doAi=async()=>{if(!aiT.trim())return;sAiL(true);sAiE('');const r=await aiExtract(aiT,curP?.name||'');sAiL(false);if(!r||!Array.isArray(r)||!r.length){sAiE('Não encontrei tarefas acionáveis.');return}sAiP(r.map(t=>({...t,sel:true})))}
  const togAi=(i)=>sAiP(p=>p.map((t,j)=>j===i?{...t,sel:!t.sel}:t))
  const confirmAi=async()=>{const sel=aiP.filter(t=>t.sel);const mx=Math.max(0,...tasks.filter(t=>t.projectId===pid).map(t=>t.order||0));const nw=sel.map((t,i)=>({projectId:pid,title:t.title,description:t.description||'',priority:t.priority||'medium',category:t.category||'',order:mx+i+1}));await db.insertTasksBatch(nw);sAiP(null);sAiT('');setOv(null);await R()}
  const handleFile=(e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=(ev)=>sAiT(ev.target.result);r.readAsText(f)}

  const TI=({t})=>{const pr=PRI[t.priority]||PRI.medium;const st=STA[t.status]||STA.pending;return(
    <div className={`ti ${t.status==='done'?'dn':''}`}><div className={`tc ${t.status==='pending'?'sp':t.status==='active'?'sac':'sd'}`} onClick={()=>cycleTask(t.id,t.status)}>{st.icon}</div>
    <div className="tb"><div className="tt2">{t.title}</div>{t.description&&<div className="td2">{t.description}</div>}<div className="tgs"><span className="tg" style={{color:pr.color,borderColor:pr.border,background:pr.bg}}>{pr.label}</span>{t.category&&<span className="tca">{t.category}</span>}</div></div>
    <button className="b bx bg" onClick={()=>delTask(t.id)}>✕</button></div>)}

  const Prog=({id})=>{const pt=tasks.filter(t=>t.projectId===id);if(!pt.length)return null;const d=pt.filter(t=>t.status==='done').length;const pct=Math.round(d/pt.length*100);return(<div className="tp"><div className="tpb"><div className="tpf" style={{width:`${pct}%`,background:'linear-gradient(90deg,var(--gn),var(--cy))'}}/></div><span className="tpl">{d}/{pt.length} ({pct}%)</span></div>)}

  // ── SESSION VIEW ──
  if(view==='sess'&&aSess){const proj=projects.find(p=>p.id===aSess.projectId);const pending=tasks.filter(t=>t.projectId===aSess.projectId&&t.status!=='done').sort((a,b)=>{const p2={urgent:0,high:1,medium:2,low:3};return(p2[a.priority]||3)-(p2[b.priority]||3)})
  return(<><style>{CSS}</style><div className="ck"><div className="in">
    <div className="sa"><div className="fb" style={{marginBottom:16}}><div><span className="hft" style={{color:proj?.color}}>SESSÃO ATIVA</span><h2 style={{fontFamily:'var(--fd)',fontSize:20,color:proj?.color,marginTop:4,letterSpacing:2}}>{proj?.name}</h2></div><div style={{fontFamily:'var(--fm)',fontSize:10,color:'var(--txd)'}}>Início: {fmtTime(aSess.startTime)}</div></div>
    <div className="tm">{fmtTm(elapsed)}</div>
    <div style={{textAlign:'center',marginTop:8,fontFamily:'var(--fm)',fontSize:11,color:'var(--txd)'}}>{proj?.star&&<>★ {proj.star}</>}</div>
    {lSess(aSess.projectId)&&<div style={{marginTop:24,padding:16,background:'var(--sf2)',borderRadius:8,borderLeft:`2px solid ${proj?.color}`}}><div style={{fontFamily:'var(--fm)',fontSize:9,letterSpacing:2,color:'var(--txd)',marginBottom:8,textTransform:'uppercase'}}>Próximo passo da última sessão</div><div style={{fontSize:14,fontWeight:600,color:'var(--txb)'}}>{lSess(aSess.projectId).nextStep||'Nenhum'}</div></div>}
    <div style={{textAlign:'center',marginTop:28}}><button className="b br" onClick={()=>setOv('end')} style={{minWidth:200,justifyContent:'center'}}>■ Encerrar Sessão</button></div></div>
    {pending.length>0&&<div className="hf" style={{marginTop:16}}><div className="hfh"><span className="hft">Tarefas pendentes</span><span style={{fontFamily:'var(--fm)',fontSize:10,color:'var(--txd)'}}>{pending.length}</span></div><div className="hfb">{pending.slice(0,5).map(t=><TI key={t.id} t={t}/>)}{pending.length>5&&<div style={{textAlign:'center',fontSize:11,color:'var(--txd)',marginTop:8}}>+{pending.length-5} mais</div>}</div></div>}
  </div></div>
  {ov==='end'&&<div className="ov"><div className="oc"><h3 style={{fontFamily:'var(--fd)',fontSize:14,letterSpacing:2,color:'var(--am)',marginBottom:20}}>ENCERRAR — {fmtDur(Math.floor(elapsed/60))}</h3>
    <div className="fg"><label className="fl">O que você fez?</label><textarea className="ft" value={fW} onChange={e=>sFW(e.target.value)} placeholder="Em uma frase..."/></div>
    <div className="fg"><label className="fl">★ Próximo passo (pra você-do-amanhã)</label><input className="fi" value={fN} onChange={e=>sFN(e.target.value)} placeholder="A coisa mais importante..."/></div>
    <div className="fg"><label className="fl">Como está se sentindo?</label><div className="mr">{[1,2,3,4,5].map(m=><button key={m} className={`mb ${fM===m?'on':''}`} onClick={()=>sFM(m)}>{moodE(m)}</button>)}</div></div>
    <div className="g8" style={{marginTop:20}}><button className="b ba" onClick={endSess}>Salvar e encerrar</button><button className="b bg" onClick={()=>setOv(null)}>Voltar</button></div>
  </div></div>}</>)}

  // ── PROJECT VIEW ──
  if(view==='proj'&&pid){const proj=curP;if(!proj){setView('dash');return null}
  const ps=pSess(proj.id),pd=pDec(proj.id),pb=pBlk(proj.id),pt=pTsk(proj.id),cats=getCats(proj.id)
  let ft2=pt;if(tf!=='all')ft2=ft2.filter(t=>t.status===tf);if(tcf!=='all')ft2=ft2.filter(t=>t.category===tcf)
  return(<><style>{CSS}</style><div className="ck"><div className="in">
    <button className="bk" onClick={()=>{setView('dash');setPid(null)}}>← Dashboard</button>
    <div className="fb" style={{marginBottom:24}}><div><h2 style={{fontFamily:'var(--fd)',fontSize:24,color:proj.color,letterSpacing:2}}>{proj.name}</h2><p style={{fontSize:13,color:'var(--txd)',marginTop:4}}>{proj.description}</p>{proj.star&&<div style={{marginTop:10,fontFamily:'var(--fm)',fontSize:11,padding:'8px 12px',background:'var(--sf)',borderRadius:6,borderLeft:`2px solid ${proj.color}`}}>★ {proj.star}</div>}</div>
    <div className="g8"><button className="b bgr" onClick={()=>startSess(proj.id)}>▶ Iniciar Sessão</button>{proj.status==='active'&&<button className="b bs bg" onClick={()=>parkProj(proj.id)}>Estacionar</button>}</div></div>
    <div className="tabs"><button className={`tab ${ptab==='tasks'?'on':''}`} onClick={()=>setPtab('tasks')}>Tarefas ({pt.length})</button><button className={`tab ${ptab==='sessions'?'on':''}`} onClick={()=>setPtab('sessions')}>Sessões ({ps.length})</button><button className={`tab ${ptab==='decisions'?'on':''}`} onClick={()=>setPtab('decisions')}>Decisões ({pd.length})</button><button className={`tab ${ptab==='blockers'?'on':''}`} onClick={()=>setPtab('blockers')}>Bloqueios ({pb.filter(x=>!x.resolved).length})</button></div>

    {ptab==='tasks'&&<div>
      <div className="fb" style={{marginBottom:16}}><div className="g8"><button className="b bs bp" onClick={()=>setOv('task')}>+ Tarefa</button><button className="b bs ba" onClick={()=>{sAiT('');sAiP(null);sAiE('');setOv('ai')}}>⚡ Importar com IA</button></div></div>
      <Prog id={proj.id}/>
      <div className="fr"><span style={{fontFamily:'var(--fm)',fontSize:9,color:'var(--txd)',letterSpacing:1}}>STATUS:</span>{[['all','Todos'],['pending','Pendentes'],['active','Andamento'],['done','Concluídas']].map(([k,l])=><button key={k} className={`fc ${tf===k?'on':''}`} onClick={()=>setTf(k)}>{l}</button>)}
      {cats.length>0&&<><span style={{fontFamily:'var(--fm)',fontSize:9,color:'var(--txd)',letterSpacing:1,marginLeft:8}}>GRUPO:</span><button className={`fc ${tcf==='all'?'on':''}`} onClick={()=>setTcf('all')}>Todos</button>{cats.map(c=><button key={c} className={`fc ${tcf===c?'on':''}`} onClick={()=>setTcf(c)}>{c}</button>)}</>}</div>
      {ft2.length===0?<div className="emp">📋 Nenhuma tarefa {tf!=='all'?'com esse filtro':'ainda'}.</div>:ft2.map(t=><TI key={t.id} t={t}/>)}
    </div>}

    {ptab==='sessions'&&<div>{ps.length===0?<div className="emp">🛸 Nenhuma sessão.</div>:ps.map(s=><div key={s.id} className="sc"><div style={{fontFamily:'var(--fm)',fontSize:10,color:'var(--txd)',display:'flex',gap:14,marginBottom:8,flexWrap:'wrap'}}><span>{fmtDate(s.startTime)}</span><span>{fmtTime(s.startTime)}→{fmtTime(s.endTime)}</span><span>{fmtDur(s.duration)}</span><span>{moodE(s.mood)}</span></div>{s.whatDid&&<div style={{fontSize:13,lineHeight:1.5,marginBottom:6}}>{s.whatDid}</div>}{s.nextStep&&<div style={{fontSize:13,fontWeight:600,color:'var(--txb)',padding:'6px 10px',background:'var(--sf3)',borderRadius:4,borderLeft:'2px solid var(--am)'}}>→ {s.nextStep}</div>}</div>)}</div>}

    {ptab==='decisions'&&<div><button className="b bs bp" style={{marginBottom:16}} onClick={()=>setOv('dec')}>+ Nova Decisão</button>{pd.length===0?<div className="emp">⚖️ Nenhuma decisão.</div>:pd.map(d=><div key={d.id} className="di" style={{borderLeftColor:proj.color}}><h4>{d.title}</h4><div style={{fontSize:13,marginBottom:4}}>→ {d.decided}</div><div style={{fontSize:12,color:'var(--txd)',fontStyle:'italic',lineHeight:1.5}}>"{d.reason}"</div><div style={{fontFamily:'var(--fm)',fontSize:10,color:'var(--txd)',marginTop:8}}>{fmtDate(d.date)}</div></div>)}</div>}

    {ptab==='blockers'&&<div><button className="b bs br" style={{marginBottom:16}} onClick={()=>setOv('blk')}>+ Novo Bloqueio</button>{pb.length===0?<div className="emp">🔓 Nenhum bloqueio.</div>:pb.map(x=><div key={x.id} className="bli" style={{opacity:x.resolved?.4:1}}><div style={{fontFamily:'var(--fm)',fontSize:9,letterSpacing:1,textTransform:'uppercase',color:'var(--rd)',marginBottom:6}}>{x.resolved?'✓ resolvido':`● ${x.type}`}</div><p style={{textDecoration:x.resolved?'line-through':'none'}}>{x.description}</p><button className="b bs bg" style={{marginTop:12}} onClick={()=>togBlk(x.id,x.resolved)}>{x.resolved?'Reabrir':'Resolvido'}</button></div>)}</div>}
  </div></div>

  {ov==='task'&&<div className="ov"><div className="oc"><h3 style={{fontFamily:'var(--fd)',fontSize:14,letterSpacing:2,color:'var(--cy)',marginBottom:20}}>NOVA TAREFA</h3>
    <div className="fg"><label className="fl">O que precisa ser feito?</label><input className="fi" value={fTT} onChange={e=>sFTT(e.target.value)} placeholder="Frase curta e direta"/></div>
    <div className="fg"><label className="fl">Detalhe (opcional)</label><textarea className="ft" value={fTD} onChange={e=>sFTD(e.target.value)} style={{minHeight:60}} placeholder="Contexto..."/></div>
    <div className="fg"><label className="fl">Prioridade</label><select className="fs" value={fTP} onChange={e=>sFTP(e.target.value)}><option value="urgent">Urgente</option><option value="high">Alta</option><option value="medium">Média</option><option value="low">Baixa</option></select></div>
    <div className="fg"><label className="fl">Grupo</label><input className="fi" value={fTC} onChange={e=>sFTC(e.target.value)} placeholder="Ex: Mensageria, Pagamento..."/></div>
    <div className="g8" style={{marginTop:12}}><button className="b bp" onClick={addTask}>Adicionar</button><button className="b bg" onClick={()=>setOv(null)}>Cancelar</button></div>
  </div></div>}

  {ov==='ai'&&<div className="ov"><div className="oc"><h3 style={{fontFamily:'var(--fd)',fontSize:14,letterSpacing:2,color:'var(--am)',marginBottom:6}}>⚡ IMPORTAR COM IA</h3>
    <p style={{fontSize:12,color:'var(--txd)',marginBottom:20,lineHeight:1.6}}>Cole o texto de um documento. A IA extrai as tarefas pra você revisar.</p>
    {!aiP?<>
    <div className="fg"><label className="fl">Texto do documento</label><textarea className="ft" value={aiT} onChange={e=>sAiT(e.target.value)} placeholder="Cole aqui..." style={{minHeight:160,fontFamily:'var(--fm)',fontSize:12}}/></div>
    <div style={{marginBottom:16}}><label className="fl">Ou suba um .txt / .md</label><input type="file" accept=".txt,.md" onChange={handleFile} style={{fontFamily:'var(--fm)',fontSize:11,color:'var(--txd)'}}/></div>
    {aiE&&<div style={{padding:'10px 14px',background:'var(--rdg)',border:'1px solid var(--rdd)',borderRadius:6,fontSize:12,color:'var(--rd)',marginBottom:16}}>{aiE}</div>}
    {aiL?<div className="ail"><div className="sp"/>Analisando...</div>:<div className="g8"><button className="b ba" onClick={doAi} disabled={!aiT.trim()}>Extrair tarefas</button><button className="b bg" onClick={()=>setOv(null)}>Cancelar</button></div>}
    </>:<>
    <div style={{fontFamily:'var(--fm)',fontSize:10,color:'var(--gn)',letterSpacing:1,marginBottom:12}}>✓ {aiP.length} tarefas encontradas</div>
    {aiP.map((t,i)=>{const pr=PRI[t.priority]||PRI.medium;return(<div key={i} className="atp" style={{opacity:t.sel?1:.4}}><div style={{width:20,height:20,borderRadius:4,border:`1.5px solid ${t.sel?'var(--cy)':'var(--txd)'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:11,color:t.sel?'var(--cy)':'transparent',background:t.sel?'var(--cyg)':'transparent'}} onClick={()=>togAi(i)}>{t.sel?'✓':''}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:'var(--txb)'}}>{t.title}</div>{t.description&&<div style={{fontSize:11,color:'var(--txd)',marginTop:2}}>{t.description}</div>}<div style={{fontFamily:'var(--fm)',fontSize:9,color:'var(--txd)',marginTop:4,display:'flex',gap:8}}><span style={{color:pr.color}}>{pr.label}</span>{t.category&&<span>{t.category}</span>}</div></div></div>)})}
    <div className="g8" style={{marginTop:16}}><button className="b bgr" onClick={confirmAi}>Importar {aiP.filter(t=>t.sel).length}</button><button className="b bg" onClick={()=>sAiP(null)}>Voltar</button><button className="b bg" onClick={()=>{sAiP(null);sAiT('');setOv(null)}}>Cancelar</button></div>
    </>}
  </div></div>}

  {ov==='dec'&&<div className="ov"><div className="oc"><h3 style={{fontFamily:'var(--fd)',fontSize:14,letterSpacing:2,color:'var(--cy)',marginBottom:20}}>REGISTRAR DECISÃO</h3>
    <div className="fg"><label className="fl">Sobre o que?</label><input className="fi" value={fDT} onChange={e=>sFDT(e.target.value)}/></div>
    <div className="fg"><label className="fl">O que decidiu?</label><input className="fi" value={fDD} onChange={e=>sFDD(e.target.value)}/></div>
    <div className="fg"><label className="fl">Por quê?</label><textarea className="ft" value={fDR} onChange={e=>sFDR(e.target.value)}/></div>
    <div className="g8" style={{marginTop:12}}><button className="b bp" onClick={addDec}>Registrar</button><button className="b bg" onClick={()=>setOv(null)}>Cancelar</button></div>
  </div></div>}

  {ov==='blk'&&<div className="ov"><div className="oc"><h3 style={{fontFamily:'var(--fd)',fontSize:14,letterSpacing:2,color:'var(--rd)',marginBottom:20}}>REGISTRAR BLOQUEIO</h3>
    <div className="fg"><label className="fl">O que está travando?</label><textarea className="ft" value={fBl} onChange={e=>sFBl(e.target.value)}/></div>
    <div className="fg"><label className="fl">Tipo</label><select className="fs" value={fBT} onChange={e=>sFBT(e.target.value)}><option value="técnico">Técnico</option><option value="financeiro">Financeiro</option><option value="emocional">Emocional</option><option value="dependência">Dependência</option></select></div>
    <div className="g8" style={{marginTop:12}}><button className="b br" onClick={addBlk}>Registrar</button><button className="b bg" onClick={()=>setOv(null)}>Cancelar</button></div>
  </div></div>}
  </>)}

  // ── DASHBOARD ──
  const today=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
  return(<><style>{CSS}</style><div className="ck"><div className="in">
    <div className="hdr"><div className="lg"><div className="lg-i">◈</div><div><h1>COCKPIT</h1><span>Sistema de Reentrada · Piloto Automático</span></div></div>
    <div className="hs"><div className="hs-i"><div className="dt" style={{background:'var(--gn)'}}/>{actP.length}/2 ativos</div><div className="hs-i"><div className="dt" style={{background:'var(--am)'}}/>{sessions.length} sessões</div><div className="hs-i">{today}</div></div></div>

    {actP.length>0&&(()=>{const ls2=sessions[0];const lp=ls2?projects.find(p=>p.id===ls2.projectId):null;const ub=blockers.filter(x=>!x.resolved);if(!ls2)return null
    const nu=tasks.filter(t=>t.projectId===ls2.projectId&&t.status!=='done').sort((a,b)=>{const p2={urgent:0,high:1,medium:2,low:3};return(p2[a.priority]||3)-(p2[b.priority]||3)})[0]
    return(<div className="hf" style={{marginBottom:24}}><div className="hfh"><span className="hft" style={{color:'var(--am)'}}>★ Ponto de Reentrada</span><span style={{fontFamily:'var(--fm)',fontSize:10,color:'var(--txd)'}}>{timeAgo(ls2.startTime)}</span></div><div className="hfb">
      <div style={{display:'flex',gap:12,alignItems:'flex-start',flexWrap:'wrap'}}><div style={{flex:1,minWidth:250}}>
        <div style={{fontFamily:'var(--fm)',fontSize:10,color:'var(--txd)',letterSpacing:1,marginBottom:6}}>ÚLTIMO PROJETO: <span style={{color:lp?.color}}>{lp?.name}</span></div>
        <div style={{fontSize:13,color:'var(--txd)',marginBottom:10}}>{ls2.whatDid}</div>
        {ls2.nextStep&&<div style={{padding:'10px 14px',background:'var(--sf2)',borderRadius:6,borderLeft:`3px solid ${lp?.color||'var(--am)'}`}}><div style={{fontFamily:'var(--fm)',fontSize:9,color:'var(--txd)',letterSpacing:2,marginBottom:4}}>PRÓXIMO PASSO</div><div style={{fontSize:15,fontWeight:700,color:'var(--txb)'}}>{ls2.nextStep}</div></div>}
        {nu&&<div style={{marginTop:10,padding:'8px 12px',background:PRI[nu.priority]?.bg,borderRadius:6,borderLeft:`3px solid ${PRI[nu.priority]?.color}`,fontSize:12}}><span style={{fontFamily:'var(--fm)',fontSize:9,color:PRI[nu.priority]?.color,letterSpacing:1}}>TAREFA PRIORITÁRIA: </span><span style={{color:'var(--txb)',fontWeight:600}}>{nu.title}</span></div>}
      </div><div><button className="b bgr" onClick={()=>startSess(ls2.projectId)} style={{whiteSpace:'nowrap'}}>▶ Continuar {lp?.name}</button></div></div>
      {ub.length>0&&<div style={{marginTop:16,padding:'10px 14px',background:'rgba(240,90,90,.05)',borderRadius:6,border:'1px solid rgba(240,90,90,.15)'}}><span style={{fontFamily:'var(--fm)',fontSize:9,color:'var(--rd)',letterSpacing:2}}>⚠ {ub.length} BLOQUEIO{ub.length>1?'S':''}</span></div>}
    </div></div>)})()}

    <div className="fb" style={{marginBottom:16}}><span className="hft">Projetos Ativos</span><button className="b bs bg" onClick={()=>setOv('proj')}>+ Novo Projeto</button></div>
    <div className="pg">
      {actP.map(proj=>{const ls3=lSess(proj.id);const pt2=tasks.filter(t=>t.projectId===proj.id);const dn=pt2.filter(t=>t.status==='done').length;const pn=pt2.filter(t=>t.status!=='done').length;return(
        <div key={proj.id} className="pc" onClick={()=>{setPid(proj.id);setView('proj');setPtab('tasks');setTf('all');setTcf('all')}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:proj.color}}/>
          <div style={{position:'absolute',top:12,right:14,fontFamily:'var(--fm)',fontSize:9,letterSpacing:2,color:proj.color}}>P{proj.priority}</div>
          <h3 style={{color:proj.color}}>{proj.name}</h3><div className="ds">{proj.description}</div>
          {proj.star&&<div className="st" style={{borderLeftColor:proj.color,color:'var(--txd)'}}>★ {proj.star}</div>}
          {pt2.length>0&&<div style={{marginBottom:12}}><div style={{display:'flex',justifyContent:'space-between',fontFamily:'var(--fm)',fontSize:10,color:'var(--txd)',marginBottom:6}}><span>{dn}/{pt2.length} tarefas</span><span>{pn} pendentes</span></div><div style={{height:3,background:'var(--bd)',borderRadius:99,overflow:'hidden'}}><div style={{height:'100%',width:`${pt2.length?(dn/pt2.length)*100:0}%`,background:`linear-gradient(90deg,var(--gn),${proj.color})`,borderRadius:99,transition:'width .5s'}}/></div></div>}
          {ls3?<div className="ls"><div className="ls-l">Última sessão</div>{ls3.whatDid&&<div style={{color:'var(--txd)',fontSize:12}}>{ls3.whatDid}</div>}{ls3.nextStep&&<div className="ns">→ {ls3.nextStep}</div>}<div className="me"><span>{fmtDate(ls3.startTime)}</span><span>{fmtDur(ls3.duration)}</span><span>{moodE(ls3.mood)}</span></div></div>:<div className="ls" style={{color:'var(--txd)',fontSize:12}}>Nenhuma sessão ainda</div>}
          <div style={{marginTop:14}}><button className="b bs bp" onClick={e=>{e.stopPropagation();startSess(proj.id)}}>▶ Iniciar Sessão</button></div>
        </div>)})}
      {actP.length<2&&<div className="pc" style={{border:'1px dashed var(--bd)',display:'flex',alignItems:'center',justifyContent:'center',minHeight:200}} onClick={()=>setOv('proj')}><div className="emp"><div style={{fontSize:28,marginBottom:8,color:'var(--txd)'}}>+</div><div>Slot disponível</div><div style={{fontSize:11,marginTop:4}}>Máximo 2 projetos ativos</div></div></div>}
    </div>

    {parkP.length>0&&<div style={{marginTop:24}}><span className="hft" style={{display:'block',marginBottom:12}}>Estacionados</span>{parkP.map(p=><div key={p.id} className="pk"><div><h4 style={{color:p.color}}>{p.name}</h4><span style={{fontSize:11,color:'var(--txd)'}}>{p.description}</span></div>{actP.length<2&&<button className="b bs bg" onClick={()=>actProj(p.id)}>Ativar</button>}</div>)}</div>}
  </div></div>

  {ov==='proj'&&<div className="ov"><div className="oc"><h3 style={{fontFamily:'var(--fd)',fontSize:14,letterSpacing:2,color:'var(--cy)',marginBottom:20}}>NOVO PROJETO</h3>
    <div className="fg"><label className="fl">Nome</label><input className="fi" value={fPN} onChange={e=>sFPN(e.target.value)} placeholder="Ex: Meu SaaS"/></div>
    <div className="fg"><label className="fl">Descrição curta</label><input className="fi" value={fPD} onChange={e=>sFPD(e.target.value)}/></div>
    <div className="fg"><label className="fl">★ Estrela guia</label><textarea className="ft" value={fPS} onChange={e=>sFPS(e.target.value)} placeholder="Por que importa?" style={{minHeight:60}}/></div>
    <div className="fg"><label className="fl">Cor</label><div className="g8">{['#f5c842','#3af0a2','#6ea8ff','#f05a5a','#c77dff','#ff9e64'].map(c=><div key={c} onClick={()=>sFPC(c)} style={{width:32,height:32,borderRadius:6,background:c,cursor:'pointer',border:fPC===c?'2px solid white':'2px solid transparent'}}/>)}</div></div>
    <div className="g8" style={{marginTop:12}}><button className="b bp" onClick={addProj}>Criar{actP.length>=2?' (estacionamento)':''}</button><button className="b bg" onClick={()=>setOv(null)}>Cancelar</button></div>
  </div></div>}
  </>)
}
