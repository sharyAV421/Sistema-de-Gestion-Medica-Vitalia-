import React, { useEffect, useMemo, useState } from 'react'
import {
  Activity, Bell, CalendarDays, Check, ChevronDown, ChevronRight, Clock3, FileHeart,
  FlaskConical, HeartPulse, Home, LogOut, Menu, Plus, Search, ShieldCheck, Stethoscope,
  UserRound, UsersRound, X, ArrowUpRight, AlertCircle, CircleCheck, CalendarCheck,
  ClipboardList, Sparkles, MapPin, Phone, Mail, LockKeyhole, Eye, EyeOff
} from 'lucide-react'
import { api, normalizeList } from './api'

const specialties = ['Medicina general', 'Pediatría', 'Cardiología', 'Dermatología', 'Ginecología']
const initialDoctors = [
  { id: 1, nombre: 'Dra. Laura Martínez', especialidad: 'Medicina general', horario: '08:00 - 12:00' },
  { id: 2, nombre: 'Dr. Andrés Castillo', especialidad: 'Medicina general', horario: '14:00 - 17:00' },
  { id: 3, nombre: 'Dra. Camila Rojas', especialidad: 'Pediatría', horario: '08:00 - 13:00' },
  { id: 4, nombre: 'Dr. Felipe Torres', especialidad: 'Pediatría', horario: '13:00 - 16:00' },
  { id: 5, nombre: 'Dra. Valentina Gómez', especialidad: 'Cardiología', horario: '09:00 - 15:00' },
  { id: 6, nombre: 'Dr. Nicolás Pérez', especialidad: 'Dermatología', horario: '08:00 - 14:00' },
  { id: 7, nombre: 'Dra. Mariana López', especialidad: 'Ginecología', horario: '10:00 - 16:00' }
]
const seed = {
  appointments: [
    { id: 'CIT-2048', especialidad: 'Medicina general', medico: 'Dra. Laura Martínez', fecha: futureDate(2), hora: '09:30', estado: 'Confirmada', lugar: 'Consultorio 204' },
    { id: 'CIT-2041', especialidad: 'Pediatría', medico: 'Dra. Camila Rojas', fecha: futureDate(-5), hora: '10:00', estado: 'Completada', lugar: 'Consultorio 105' }
  ],
  consultations: [
    { fecha: '2026-09-22', medico: 'Dra. Laura Martínez', especialidad: 'Medicina general', diagnostico: 'Control preventivo anual', notas: 'Signos vitales dentro de parámetros esperados.' },
    { fecha: '2026-07-08', medico: 'Dr. Andrés Castillo', especialidad: 'Medicina general', diagnostico: 'Rinitis alérgica estacional', notas: 'Se recomienda evitar alérgenos y mantener hidratación.' }
  ],
  prescriptions: [
    { fecha: '2026-09-22', medico: 'Dra. Laura Martínez', medicamentos: 'Loratadina 10 mg', dosis: '1 tableta al día', duracion: '5 días', estado: 'Vigente' }
  ],
  labs: [
    { nombre: 'Hemograma completo', fecha: '2026-09-22', valor: '14.2', unidad: 'g/dL', minimo: 12, maximo: 16, referencia: '12 – 16 g/dL', estado: 'Normal' },
    { nombre: 'Glicemia en ayunas', fecha: '2026-09-22', valor: '108', unidad: 'mg/dL', minimo: 70, maximo: 100, referencia: '70 – 100 mg/dL', estado: 'Alto' },
    { nombre: 'Perfil lipídico', fecha: '2026-08-15', valor: '172', unidad: 'mg/dL', minimo: 125, maximo: 200, referencia: '125 – 200 mg/dL', estado: 'Normal' }
  ]
}
function futureDate(offset) { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
function prettyDate(date) { if (!date) return 'Fecha por confirmar'; const d = new Date(`${date}T12:00:00`); return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) }
function initials(name='Paciente') { return name.split(' ').filter(Boolean).slice(0,2).map(p=>p[0]).join('').toUpperCase() }

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('dashboard')
  const [demo, setDemo] = useState(true)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [toast, setToast] = useState('')
  const [data, setData] = useState(seed)
  const [apiStatus, setApiStatus] = useState('demo')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 3600); return () => clearTimeout(t) } }, [toast])
  const navigate = v => { setView(v); setMobileMenu(false) }
  const login = (profile, demoMode=true) => { setUser(profile); setDemo(demoMode); setView('dashboard'); setApiStatus(demoMode ? 'demo' : 'connected'); setToast(`¡Bienvenido${profile.nombre ? ', ' + profile.nombre.split(' ')[0] : ''}!`) }
  const logout = () => { setUser(null); setView('dashboard'); setToast('Sesión cerrada correctamente') }
  const refreshHistory = async id => {
    if (demo) return
    try {
      setLoading(true)
      const result = await api.history(id)
      setData(old => ({
        ...old,
        consultations: result?.consultas || result?.citasPasadas || old.consultations,
        prescriptions: result?.prescripciones || old.prescriptions,
        labs: result?.laboratorios || result?.resultadosLaboratorio || old.labs
      }))
      setApiStatus('connected')
    } catch (e) { setApiStatus('error'); setToast(`No se pudo cargar la historia: ${e.message}`) }
    finally { setLoading(false) }
  }
  useEffect(() => { if (user && !demo && user.id) refreshHistory(user.id) }, [user, demo])
  if (!user) return <Login onLogin={login} onToast={setToast} />
  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-icon"><HeartPulse size={23}/></div><div><strong>vitalia</strong><span>PORTAL DE SALUD</span></div></div>
      <div className="profile-mini"><div className="avatar">{initials(user.nombre)}</div><div className="profile-copy"><strong>{user.nombre}</strong><span>Paciente</span></div><ChevronDown size={16}/></div>
      <div className="nav-label">MENÚ PRINCIPAL</div>
      <nav>
        <NavItem icon={<Home/>} label="Resumen" active={view==='dashboard'} onClick={()=>navigate('dashboard')}/>
        <NavItem icon={<CalendarDays/>} label="Mis citas" active={view==='appointments'} onClick={()=>navigate('appointments')} badge={data.appointments.filter(a=>a.estado==='Confirmada').length}/>
        <NavItem icon={<FileHeart/>} label="Historia clínica" active={view==='history'} onClick={()=>navigate('history')}/>
        <NavItem icon={<FlaskConical/>} label="Laboratorios" active={view==='labs'} onClick={()=>navigate('labs')}/>
      </nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><ShieldCheck size={19}/></div><strong>Tu salud, protegida</strong><p>Tu información personal se trata con privacidad.</p><span><LockKeyhole size={13}/> Entorno seguro</span></div><button className="nav-item logout" onClick={logout}><LogOut size={18}/> <span>Cerrar sesión</span></button><div className="version">VITALIA · PORTAL DEL PACIENTE</div></div>
    </aside>
    {mobileMenu && <div className="mobile-scrim" onClick={()=>setMobileMenu(false)} />}
    <main className="main-area">
      <header className="topbar"><button className="mobile-toggle icon-btn" onClick={()=>setMobileMenu(!mobileMenu)}><Menu/></button><div className="breadcrumb">Portal del paciente <ChevronRight size={14}/> <strong>{({dashboard:'Resumen',appointments:'Mis citas',history:'Historia clínica',labs:'Laboratorios'})[view]}</strong></div><div className="top-actions"><div className={`connection ${apiStatus}`}><span/>{apiStatus==='demo'?'Modo demostración':apiStatus==='connected'?'API conectada':apiStatus==='error'?'API sin conexión':'Conectando'}</div><button className="icon-btn notification" title="Notificaciones" onClick={()=>setToast('No tienes notificaciones nuevas')}><Bell size={19}/><i/></button><div className="top-user"><div className="avatar small">{initials(user.nombre)}</div><span>{user.nombre.split(' ')[0]}</span><ChevronDown size={14}/></div></div></header>
      <div className="content">
        {view==='dashboard' && <Dashboard user={user} data={data} navigate={navigate} setModal={setModal} />}
        {view==='appointments' && <Appointments data={data} setData={setData} setModal={setModal} demo={demo} setToast={setToast} loading={loading}/>}
        {view==='history' && <History data={data} search={search} setSearch={setSearch} loading={loading}/>}
        {view==='labs' && <Labs data={data} setModal={setModal} demo={demo} setToast={setToast}/>}
        <footer className="footer"><span>© 2026 Vitalia · Sistema de Gestión Médica</span><span><ShieldCheck size={13}/> Tu bienestar es nuestra prioridad</span></footer>
      </div>
    </main>
    {modal && <Modal type={modal} onClose={()=>setModal(null)} user={user} data={data} setData={setData} demo={demo} setToast={setToast}/>}
    {toast && <div className="toast"><CircleCheck size={19}/><span>{toast}</span><button onClick={()=>setToast('')}><X size={15}/></button></div>}
  </div>
}

function NavItem({icon,label,active,onClick,badge}) { return <button className={`nav-item ${active?'active':''}`} onClick={onClick}>{icon}<span>{label}</span>{badge>0&&<em>{badge}</em>}</button> }

function Login({onLogin,onToast}) {
  const [mode,setMode] = useState('login')
  const [show,setShow] = useState(false)
  const [form,setForm] = useState({nombre:'Manuel Villarreal',documento:'1085321000',email:'manuel@email.com',password:'vitalia123'})
  const [busy,setBusy] = useState(false)
  const change = e => setForm({...form,[e.target.name]:e.target.value})
  async function submit(e) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.documento.trim() || !form.password.trim()) { onToast('Completa los campos obligatorios'); return }
    if (mode==='register' && !form.email.includes('@')) { onToast('Ingresa un correo electrónico válido'); return }
    if (mode==='register') {
      setBusy(true)
      try {
        const result = await api.register({nombre:form.nombre, documento:form.documento, email:form.email})
        onLogin({id:result?.id ?? result?.pacienteId ?? form.documento,nombre:form.nombre,email:form.email},false)
      } catch { onToast('No fue posible registrar en la API. Puedes explorar el modo demostración.'); }
      finally { setBusy(false) }
    } else {
      onLogin({id:form.documento,nombre:form.nombre,email:form.email},true)
    }
  }
  return <div className="login-screen"><div className="login-visual"><div className="visual-grid"/><div className="visual-brand"><div className="brand-icon"><HeartPulse size={24}/></div><strong>vitalia</strong></div><div className="visual-content"><div className="eyebrow"><span/> TU SALUD EN UN SOLO LUGAR</div><h1>Cuidarte<br/>nunca fue<br/><em>tan sencillo.</em></h1><p>Conecta con tu bienestar. Gestiona tus citas, consulta tus resultados y mantén tu salud siempre al día.</p><div className="visual-points"><span><Check/> Agenda tus citas en minutos</span><span><Check/> Tu historia clínica organizada</span><span><Check/> Resultados claros y accesibles</span></div></div><div className="visual-bottom"><span>Un cuidado más humano, contigo.</span><div className="decor-circle circle-one"/><div className="decor-circle circle-two"/></div></div>
    <div className="login-panel"><div className="login-mobile-brand"><div className="brand-icon"><HeartPulse/></div><strong>vitalia</strong></div><div className="login-form-wrap"><div className="login-kicker">BIENVENIDO A VITALIA</div><h2>{mode==='login'?'Tu salud, a un clic.':'Crea tu cuenta'}</h2><p className="login-sub">{mode==='login'?'Ingresa a tu espacio personal de salud.':'Regístrate para gestionar tu atención médica.'}</p><div className="auth-switch"><button className={mode==='login'?'selected':''} onClick={()=>setMode('login')}>Iniciar sesión</button><button className={mode==='register'?'selected':''} onClick={()=>setMode('register')}>Crear cuenta</button></div><form onSubmit={submit} className="login-form">
      <label>Nombre completo<div className="input-wrap"><UserRound/><input name="nombre" value={form.nombre} onChange={change} placeholder="Tu nombre completo" required/></div></label>
      <label>Número de documento<div className="input-wrap"><ClipboardList/><input name="documento" value={form.documento} onChange={change} placeholder="Número de identificación" required/></div></label>
      {mode==='register'&&<label>Correo electrónico<div className="input-wrap"><Mail/><input type="email" name="email" value={form.email} onChange={change} placeholder="nombre@correo.com" required/></div></label>}
      <label>Contraseña<div className="input-wrap"><LockKeyhole/><input type={show?'text':'password'} name="password" value={form.password} onChange={change} placeholder="Ingresa tu contraseña" required/><button type="button" className="field-action" onClick={()=>setShow(!show)}>{show?<EyeOff/>:<Eye/>}</button></div></label>
      {mode==='login'&&<div className="form-utility"><label className="check-label"><input type="checkbox" defaultChecked/> Recordarme</label><button type="button" className="text-button" onClick={()=>onToast('Contacta a la clínica para recuperar tu acceso.')}>¿Olvidaste tu contraseña?</button></div>}
      <button className="primary-btn full" disabled={busy}>{busy?'Procesando…':mode==='login'?'Ingresar a mi cuenta':'Crear cuenta'} <ChevronRight size={18}/></button>
    </form><div className="or-divider"><span/> o continúa <span/></div><button className="demo-btn" onClick={()=>onLogin({id:'demo-001',nombre:'Manuel Villarreal',email:'manuel@email.com'},true)}><Sparkles size={17}/> Explorar modo demostración</button><div className="login-privacy"><ShieldCheck size={15}/> Tus datos se mantienen protegidos y confidenciales.</div></div><div className="login-footer">© 2026 Vitalia <span>·</span> Atención centrada en ti</div></div>
  </div>
}

function PageHeading({eyebrow,title,description,action}) { return <div className="page-heading"><div><div className="section-kicker">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div> }
function Dashboard({user,data,navigate,setModal}) {
  const upcoming=data.appointments.filter(a=>a.estado==='Confirmada').sort((a,b)=>a.fecha.localeCompare(b.fecha))[0]
  const latest=data.labs[0]
  return <><PageHeading eyebrow="TU ESPACIO PERSONAL" title={`Hola, ${user.nombre.split(' ')[0]} 👋`} description="Aquí tienes un resumen de tu salud y tus próximas actividades." action={<button className="primary-btn" onClick={()=>setModal('appointment')}><Plus size={18}/> Agendar cita</button>}/>
    <div className="welcome-banner"><div className="welcome-text"><div className="welcome-pill"><HeartPulse size={14}/> BIENESTAR EN EQUILIBRIO</div><h2>Un pequeño paso hoy,<br/><em>una vida más saludable.</em></h2><p>Cuida de ti con información clara y atención oportuna.</p><button className="banner-link" onClick={()=>navigate('history')}>Ver mi historia clínica <ArrowUpRight size={16}/></button></div><div className="welcome-art"><div className="art-orbit orbit-a"/><div className="art-orbit orbit-b"/><div className="art-cross"><HeartPulse size={62}/></div><div className="floating-card float-one"><span className="float-icon"><CalendarCheck/></span><div><strong>Tu salud al día</strong><small>Todo en orden</small></div><Check size={17}/></div><div className="floating-card float-two"><span className="float-icon peach"><Activity/></span><div><strong>Bienestar</strong><small>Empieza contigo</small></div></div></div></div>
    <div className="stats-grid"><StatCard icon={<CalendarDays/>} tone="teal" label="Citas programadas" value={data.appointments.filter(a=>a.estado==='Confirmada').length.toString().padStart(2,'0')} note="Próximas atenciones" onClick={()=>navigate('appointments')}/><StatCard icon={<FileHeart/>} tone="blue" label="Consultas registradas" value={data.consultations.length.toString().padStart(2,'0')} note="En tu historia clínica" onClick={()=>navigate('history')}/><StatCard icon={<FlaskConical/>} tone="purple" label="Resultados disponibles" value={data.labs.length.toString().padStart(2,'0')} note="Exámenes de laboratorio" onClick={()=>navigate('labs')}/><StatCard icon={<ShieldCheck/>} tone="orange" label="Perfil de salud" value="Activo" note="Información organizada" onClick={()=>navigate('history')}/></div>
    <div className="dashboard-columns"><section className="panel upcoming-panel"><div className="panel-heading"><div><span className="section-kicker">NO LO OLVIDES</span><h3>Tu próxima cita</h3></div><button className="link-button" onClick={()=>navigate('appointments')}>Ver todas <ChevronRight size={15}/></button></div>{upcoming?<div className="appointment-highlight"><div className="date-tile"><span>{new Date(`${upcoming.fecha}T12:00:00`).toLocaleDateString('es-CO',{month:'short'}).toUpperCase()}</span><strong>{new Date(`${upcoming.fecha}T12:00:00`).getDate()}</strong><small>{new Date(`${upcoming.fecha}T12:00:00`).toLocaleDateString('es-CO',{weekday:'long'}).split(',')[0]}</small></div><div className="appointment-info"><span className="status-chip confirmed"><i/>{upcoming.estado}</span><h4>{upcoming.especialidad}</h4><p><Stethoscope size={14}/>{upcoming.medico}</p><p><Clock3 size={14}/>{upcoming.hora} · {upcoming.lugar||'Clínica Vitalia'}</p></div><button className="round-arrow" onClick={()=>navigate('appointments')}><ChevronRight/></button></div>:<EmptyState title="No tienes citas próximas" text="Agenda tu siguiente consulta cuando lo necesites." action={()=>setModal('appointment')}/>}<div className="panel-footnote"><ShieldCheck size={14}/> Recuerda llegar 15 minutos antes de tu cita.</div></section>
      <section className="panel lab-summary"><div className="panel-heading"><div><span className="section-kicker">TUS EXÁMENES</span><h3>Últimos resultados</h3></div><button className="link-button" onClick={()=>navigate('labs')}>Ver todos <ChevronRight size={15}/></button></div>{data.labs.slice(0,2).map((lab,i)=><div className="lab-row" key={lab.nombre}><div className={`lab-icon ${i?'lavender':''}`}><FlaskConical size={19}/></div><div className="lab-row-main"><strong>{lab.nombre}</strong><small>{prettyDate(lab.fecha)}</small></div><span className={`result-chip ${lab.estado==='Normal'?'normal':'high'}`}>{lab.estado==='Normal'?'En rango':'Revisar'}</span></div>)}</section></div>
    <div className="bottom-tip"><div className="tip-icon"><Sparkles/></div><div><strong>Un consejo para ti</strong><p>Mantén tus controles preventivos al día. La prevención es una de las mejores formas de cuidar tu bienestar.</p></div><span className="tip-decoration">✳</span></div>
  </>
}
function StatCard({icon,tone,label,value,note,onClick}) { return <button className="stat-card" onClick={onClick}><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}<ArrowUpRight size={13}/></div></button> }
function EmptyState({title,text,action}) { return <div className="empty-state"><CalendarDays size={28}/><strong>{title}</strong><p>{text}</p>{action&&<button className="text-button" onClick={action}>Agendar ahora</button>}</div> }

function Appointments({data,setData,setModal,demo,setToast,loading}) {
  const [filter,setFilter]=useState('Todas')
  const list=data.appointments.filter(a=>filter==='Todas'||(filter==='Próximas'?a.estado==='Confirmada':a.estado==='Completada'))
  async function cancel(appointment) {
    if (!window.confirm(`¿Deseas cancelar la cita de ${appointment.especialidad} del ${prettyDate(appointment.fecha)}?`)) return
    // El taller no define endpoint para cancelar citas; la acción queda local hasta que el backend lo implemente.
    setData(d=>({...d,appointments:d.appointments.map(a=>a.id===appointment.id?{...a,estado:'Cancelada'}:a)}))
    setToast(demo?'Cita cancelada en modo demostración':'Cita marcada como cancelada localmente. El backend debe implementar el endpoint de cancelación.')
  }
  return <><PageHeading eyebrow="ORGANIZA TU ATENCIÓN" title="Mis citas" description="Administra tus citas médicas y mantén tus controles al día." action={<button className="primary-btn" onClick={()=>setModal('appointment')}><Plus size={18}/> Nueva cita</button>}/><div className="page-tools"><div className="filter-tabs">{['Todas','Próximas','Completadas'].map(f=><button className={filter===f?'selected':''} key={f} onClick={()=>setFilter(f)}>{f}</button>)}</div><span className="muted-caption">{list.length} citas</span></div><div className="appointment-list">{list.length?list.map(a=><article className="appointment-card" key={a.id}><div className="appointment-date-block"><span>{new Date(`${a.fecha}T12:00:00`).toLocaleDateString('es-CO',{month:'short'}).toUpperCase()}</span><strong>{new Date(`${a.fecha}T12:00:00`).getDate()}</strong><small>{new Date(`${a.fecha}T12:00:00`).toLocaleDateString('es-CO',{weekday:'short'}).replace('.','')}</small></div><div className="appointment-card-main"><div className="appointment-card-top"><span className="id-label">{a.id}</span><span className={`status-chip ${a.estado==='Confirmada'?'confirmed':a.estado==='Completada'?'completed':'cancelled'}`}><i/>{a.estado}</span></div><h3>{a.especialidad}</h3><p><Stethoscope size={15}/>{a.medico}</p><div className="appointment-meta"><span><Clock3 size={15}/>{a.hora}</span><span><MapPin size={15}/>{a.lugar||'Clínica Vitalia'}</span></div></div>{a.estado==='Confirmada'&&<button className="outline-danger" onClick={()=>cancel(a)}>Cancelar cita</button>}</article>):<div className="panel"><EmptyState title="No encontramos citas" text="Prueba otro filtro o agenda una nueva cita." action={()=>setModal('appointment')}/></div>}</div><div className="info-strip"><AlertCircle size={18}/><div><strong>¿Necesitas cambiar tus planes?</strong><p>Si no puedes asistir, cancela tu cita con anticipación para liberar el horario.</p></div></div></>
}

function History({data,search,setSearch,loading}) {
  const [tab,setTab]=useState('consultations')
  const filtered=data.consultations.filter(c=>`${c.medico} ${c.especialidad} ${c.diagnostico}`.toLowerCase().includes(search.toLowerCase()))
  return <><PageHeading eyebrow="TU INFORMACIÓN DE SALUD" title="Historia clínica" description="Consulta tus atenciones, prescripciones y resultados en un solo lugar."/><div className="history-banner"><div className="history-shield"><FileHeart size={27}/></div><div><strong>Tu historia, siempre organizada</strong><p>Revisa la información registrada por tus profesionales de salud.</p></div><span className="secure-tag"><LockKeyhole size={13}/> Privada</span></div><div className="history-tabs">{[{id:'consultations',label:'Consultas',icon:<Stethoscope/>},{id:'prescriptions',label:'Prescripciones',icon:<ClipboardList/>},{id:'labs',label:'Laboratorios',icon:<FlaskConical/>}].map(t=><button className={tab===t.id?'active':''} onClick={()=>setTab(t.id)} key={t.id}>{t.icon}{t.label}<span>{data[t.id].length}</span></button>)}</div>{tab==='consultations'&&<><div className="section-inline"><h3>Registro de consultas</h3><div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar consulta…"/></div></div><div className="timeline">{filtered.map((c,i)=><article className="timeline-item" key={`${c.fecha}-${i}`}><div className="timeline-dot"><Stethoscope size={16}/></div><div className="timeline-card"><div className="timeline-date">{prettyDate(c.fecha)} <span>·</span> {c.especialidad}</div><h3>{c.diagnostico||c.motivo||'Consulta médica'}</h3><p className="doctor-line"><UserRound size={14}/>{c.medico||c.doctor||'Profesional de salud'}</p>{c.notas&&<p className="clinical-note">{c.notas}</p>}</div></article>)}{!filtered.length&&<div className="empty-inline">No hay consultas que coincidan con la búsqueda.</div>}</div></>}
    {tab==='prescriptions'&&<div className="records-grid">{data.prescriptions.map((p,i)=><article className="record-card" key={i}><div className="record-card-head"><div className="record-icon"><ClipboardList/></div><span className={`status-chip ${p.estado==='Vigente'?'confirmed':'completed'}`}><i/>{p.estado||'Registrada'}</span></div><h3>{p.medicamentos||p.medication||'Prescripción médica'}</h3><p className="record-date">{prettyDate(p.fecha)}</p><div className="record-details"><div><span>Dosis</span><strong>{p.dosis||'Consultar indicación médica'}</strong></div><div><span>Duración</span><strong>{p.duracion||'Según indicación'}</strong></div></div><div className="record-doctor"><Stethoscope size={14}/>{p.medico||'Profesional tratante'}</div></article>)}{!data.prescriptions.length&&<div className="empty-inline">No hay prescripciones registradas.</div>}</div>}
    {tab==='labs'&&<Labs data={data} embedded/>}<div className="privacy-note"><ShieldCheck size={15}/> La información de esta sección es confidencial. Ante dudas sobre un diagnóstico o medicamento, consulta con tu profesional de salud.</div></>
}

function Labs({data,setModal,embedded=false}) {
  return <>{!embedded&&<PageHeading eyebrow="SEGUIMIENTO CLÍNICO" title="Laboratorios" description="Entiende tus resultados y revisa los rangos de referencia de cada examen." action={<button className="primary-btn" onClick={()=>setModal('labs')}><Plus size={18}/> Solicitar exámenes</button>}/>}<div className="lab-explainer"><div className="explainer-icon"><Activity/></div><div><strong>¿Cómo leer tus resultados?</strong><p>Los valores de referencia ayudan a interpretar el resultado. Un valor fuera de rango no confirma por sí solo una enfermedad; revisa tus resultados con un profesional.</p></div><div className="legend"><span><i className="legend-dot green"/> En rango</span><span><i className="legend-dot amber"/> Fuera de rango</span></div></div><div className="labs-list">{data.labs.map((lab,i)=>{const low=Number(lab.valor)<Number(lab.minimo),high=Number(lab.valor)>Number(lab.maximo),normal=lab.estado==='Normal'||(!low&&!high);return <article className="lab-card" key={`${lab.nombre}-${i}`}><div className={`lab-card-icon ${normal?'green':'amber'}`}><FlaskConical/></div><div className="lab-card-info"><div className="lab-title-row"><h3>{lab.nombre}</h3><span className={`result-chip ${normal?'normal':'high'}`}><i/>{normal?'Dentro del rango':'Fuera del rango'}</span></div><p>Fecha del examen: {prettyDate(lab.fecha)}</p><div className="result-measure"><div><span>Resultado</span><strong>{lab.valor} <small>{lab.unidad}</small></strong></div><div><span>Rango de referencia</span><strong className="reference">{lab.referencia||`${lab.minimo} – ${lab.maximo} ${lab.unidad||''}`}</strong></div></div><div className="range-track"><div className="range-normal"/><div className={`range-marker ${normal?'marker-normal':'marker-high'}`} style={{left:normal?'48%':high?'87%':'12%'}}/></div>{!normal&&<div className="result-alert"><AlertCircle size={14}/> Este valor requiere interpretación clínica. No te automediques.</div>}</div><button className="lab-detail-btn" title="Ver información del resultado" onClick={()=>window.alert(`${lab.nombre}\nResultado: ${lab.valor} ${lab.unidad}\nReferencia: ${lab.referencia}\n\nEste resultado debe ser interpretado por un profesional de salud.`)}><ChevronRight/></button></article>})}{!data.labs.length&&<div className="panel"><EmptyState title="Aún no tienes resultados" text="Cuando estén disponibles, aparecerán en esta sección."/></div>}</div>{!embedded&&<div className="info-strip"><FlaskConical size={18}/><div><strong>¿Necesitas un examen?</strong><p>Solicita exámenes disponibles desde el portal y consulta sus resultados cuando estén listos.</p></div><button className="text-button" onClick={()=>setModal('labs')}>Solicitar ahora <ChevronRight size={15}/></button></div>}</>
}

function Modal({type,onClose,user,data,setData,demo,setToast}) {
  const [form,setForm]=useState({especialidad:specialties[0],medico:'',fecha:futureDate(1),hora:'09:00',examenes:['Hemograma'],motivo:''})
  const [doctors,setDoctors]=useState(initialDoctors)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  useEffect(()=>{if(type==='appointment'&&!demo){api.doctors(form.especialidad).then(r=>setDoctors(normalizeList(r))).catch(()=>setDoctors(initialDoctors))}},[type,demo,form.especialidad])
  useEffect(()=>{if(!form.medico){const d=doctors.find(d=>(d.especialidad||d.especialidadMedica)===form.especialidad);if(d)setForm(f=>({...f,medico:d.nombre||d.nombreCompleto||d.medico||''}))}},[doctors,form.especialidad,form.medico])
  const change=e=>setForm({...form,[e.target.name]:e.target.value})
  async function book(e) {
    e.preventDefault();setError('')
    if(!form.medico||!form.fecha||!form.hora){setError('Selecciona médico, fecha y horario.');return}
    setBusy(true)
    const payload={pacienteId:user.id,especialidad:form.especialidad,medico:form.medico,fecha:form.fecha,hora:form.hora,motivo:form.motivo}
    try {
      let result=null
      if(!demo) result=await api.bookAppointment(payload)
      const appointment={id:result?.id||result?.citaId||`CIT-${Math.floor(2000+Math.random()*7999)}`,especialidad:form.especialidad,medico:form.medico,fecha:form.fecha,hora:form.hora,estado:'Confirmada',lugar:'Clínica Vitalia'}
      setData(d=>({...d,appointments:[appointment,...d.appointments]}));setToast(demo?'Cita creada en modo demostración':'Cita agendada correctamente');onClose()
    } catch(err){setError(`No se pudo agendar: ${err.message}. Verifica que el backend esté disponible.`)}
    finally{setBusy(false)}
  }
  async function requestLabs(e) {
    e.preventDefault();setError('');setBusy(true)
    try {
      if(!demo) await api.requestLabs({pacienteId:user.id,examenes:form.examenes})
      setToast(demo?'Solicitud de exámenes simulada':'Solicitud de exámenes enviada');onClose()
    } catch(err){setError(`No se pudo solicitar: ${err.message}`)}
    finally{setBusy(false)}
  }
  const toggleExam=exam=>setForm(f=>({...f,examenes:f.examenes.includes(exam)?f.examenes.filter(x=>x!==exam):[...f.examenes,exam]}))
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="modal-card"><div className="modal-heading"><div><span className="section-kicker">{type==='appointment'?'NUEVA RESERVA':'SOLICITUD CLÍNICA'}</span><h2>{type==='appointment'?'Agenda tu cita':'Solicitar exámenes'}</h2><p>{type==='appointment'?'Elige el profesional y horario que mejor se adapte a ti.':'Selecciona los exámenes que necesitas solicitar.'}</p></div><button className="icon-btn" onClick={onClose}><X/></button></div>{type==='appointment'?<form onSubmit={book} className="modal-form"><label>Especialidad<select name="especialidad" value={form.especialidad} onChange={e=>setForm({...form,especialidad:e.target.value,medico:''})}>{specialties.map(s=><option key={s}>{s}</option>)}</select></label><label>Profesional<select name="medico" value={form.medico} onChange={change} required><option value="">Selecciona un profesional</option>{doctors.filter(d=>(d.especialidad||d.especialidadMedica)===form.especialidad).map((d,i)=><option key={d.id||i} value={d.nombre||d.nombreCompleto||d.medico}>{d.nombre||d.nombreCompleto||d.medico} {d.horario?`· ${d.horario}`:''}</option>)}</select></label><div className="form-row"><label>Fecha<input type="date" name="fecha" min={futureDate(0)} value={form.fecha} onChange={change} required/></label><label>Hora<select name="hora" value={form.hora} onChange={change}>{['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00'].map(h=><option key={h}>{h}</option>)}</select></label></div><label>Motivo de consulta <span className="optional">(opcional)</span><textarea name="motivo" value={form.motivo} onChange={change} placeholder="Cuéntanos brevemente el motivo de tu consulta…" rows="3"/></label>{error&&<div className="form-error"><AlertCircle size={16}/>{error}</div>}<div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Volver</button><button className="primary-btn" disabled={busy}>{busy?'Procesando…':'Confirmar cita'} <ChevronRight size={17}/></button></div></form>:<form onSubmit={requestLabs} className="modal-form"><p className="form-intro">Selecciona uno o varios exámenes. La solicitud queda sujeta a validación clínica.</p>{['Hemograma','Glicemia','Perfil lipídico'].map(ex=><label className="exam-option" key={ex}><input type="checkbox" checked={form.examenes.includes(ex)} onChange={()=>toggleExam(ex)}/><span className="exam-check"><Check size={14}/></span><span><strong>{ex}</strong><small>{ex==='Hemograma'?'Evaluación de células sanguíneas':ex==='Glicemia'?'Medición de glucosa en sangre':'Medición de colesterol y triglicéridos'}</small></span></label>)}{error&&<div className="form-error"><AlertCircle size={16}/>{error}</div>}<div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancelar</button><button className="primary-btn" disabled={busy||!form.examenes.length}>{busy?'Enviando…':'Enviar solicitud'} <ChevronRight size={17}/></button></div></form>}</section></div>
}