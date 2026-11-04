import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Users, Beer, Wallet, Package, ChartNoAxesCombined,
  Settings, LogOut, Search, Plus, Menu, X, ChevronRight, TrendingUp,
  TrendingDown, CircleDollarSign, UserRound, Clock3, ArrowUpRight,
  ArrowDownLeft, MoreHorizontal, Pencil, Ban, CheckCircle2, AlertTriangle,
  CalendarDays, Filter, Download, Eye, Trash2, CreditCard, Banknote,
  Smartphone, ReceiptText, ShieldCheck, LockKeyhole, ArrowLeft, Check,
  ShoppingCart, History, SlidersHorizontal, RefreshCw
} from 'lucide-react';

const STORAGE_KEY = 'lostbar-prototype-v1';
const money = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dateTime = (v) => new Date(v).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const today = () => new Date().toISOString().slice(0, 10);
const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const seed = {
  clients: [
    { id:'c1', name:'João da Silva', nickname:'João', phone:'(15) 99123-4567', cpf:'', limit:500, limitEnabled:true, notes:'Cliente frequente', active:true, createdAt:'2026-08-10T19:00:00' },
    { id:'c2', name:'Mariana Costa', nickname:'Mari', phone:'(15) 99234-5678', cpf:'', limit:300, limitEnabled:true, notes:'', active:true, createdAt:'2026-08-12T20:00:00' },
    { id:'c3', name:'Pedro Henrique', nickname:'PH', phone:'(15) 99345-6789', cpf:'', limit:0, limitEnabled:false, notes:'Limite não definido', active:true, createdAt:'2026-08-15T18:00:00' },
    { id:'c4', name:'Lucas Almeida', nickname:'Luquinhas', phone:'(15) 99456-7890', cpf:'', limit:200, limitEnabled:true, notes:'', active:false, createdAt:'2026-08-20T19:00:00' },
    { id:'c5', name:'Ana Paula Souza', nickname:'Ana', phone:'(15) 99567-8901', cpf:'', limit:400, limitEnabled:true, notes:'', active:true, createdAt:'2026-08-22T20:00:00' },
  ],
  products: [
    { id:'p1', name:'Cerveja long neck', category:'Bebidas', price:10, active:true },
    { id:'p2', name:'Refrigerante lata', category:'Bebidas', price:7, active:true },
    { id:'p3', name:'Dose', category:'Bebidas', price:8, active:true },
    { id:'p4', name:'Porção', category:'Comidas', price:35, active:true },
    { id:'p5', name:'Água', category:'Bebidas', price:5, active:true },
  ],
  movements: [
    { id:'m1', type:'consumption', clientId:'c1', date:'2026-11-02T20:15:00', amount:80, description:'8x Cerveja long neck', status:'confirmed', items:[{productId:'p1',name:'Cerveja long neck',qty:8,price:10}], mode:'items' },
    { id:'m2', type:'consumption', clientId:'c1', date:'2026-11-03T21:10:00', amount:50, description:'Consumo balcão', status:'confirmed', items:[], mode:'quick' },
    { id:'m3', type:'payment', clientId:'c1', date:'2026-11-04T14:00:00', amount:30, method:'PIX', description:'', status:'confirmed' },
    { id:'m4', type:'consumption', clientId:'c2', date:'2026-11-01T22:00:00', amount:65, description:'1x Porção + 3x Cerveja', status:'confirmed', items:[{productId:'p4',name:'Porção',qty:1,price:35},{productId:'p1',name:'Cerveja long neck',qty:3,price:10}], mode:'items' },
    { id:'m5', type:'payment', clientId:'c2', date:'2026-11-03T19:30:00', amount:20, method:'Dinheiro', description:'', status:'confirmed' },
    { id:'m6', type:'consumption', clientId:'c3', date:'2026-11-03T20:00:00', amount:42, description:'Pedido rápido', status:'confirmed', items:[], mode:'quick' },
    { id:'m7', type:'consumption', clientId:'c5', date:'2026-11-04T12:30:00', amount:28, description:'4x Refrigerante lata', status:'confirmed', items:[{productId:'p2',name:'Refrigerante lata',qty:4,price:7}], mode:'items' },
  ],
};

function loadData() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : seed; }
  catch { return seed; }
}
function getBalance(clientId, movements) {
  return movements.filter(m => m.clientId === clientId && m.status === 'confirmed')
    .reduce((sum, m) => sum + (m.type === 'consumption' ? Number(m.amount) : -Number(m.amount)), 0);
}
function IconButton({ children, onClick, title, danger=false }) {
  return <button className={`icon-btn ${danger?'danger':''}`} onClick={onClick} title={title}>{children}</button>;
}
function Modal({ title, subtitle, onClose, children, wide=false }) {
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <section className={`modal ${wide?'modal-wide':''}`}>
      <header className="modal-head"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div><IconButton onClick={onClose}><X size={19}/></IconButton></header>
      {children}
    </section>
  </div>;
}
function Field({ label, children, hint }) {
  return <label className="field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>;
}
function Empty({ title, text }) {
  return <div className="empty"><div className="empty-icon"><Search size={22}/></div><b>{title}</b><span>{text}</span></div>;
}

export default function App() {
  const [data,setData] = useState(loadData);
  const [logged,setLogged] = useState(sessionStorage.getItem('lostbar-demo-auth') === 'yes');
  const [page,setPage] = useState('dashboard');
  const [query,setQuery] = useState('');
  const [mobileNav,setMobileNav] = useState(false);
  const [modal,setModal] = useState(null);
  const [toast,setToast] = useState('');
  const [period,setPeriod] = useState('month');
  const [reportFilter,setReportFilter] = useState('all');

  useEffect(()=>{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); },[data]);
  useEffect(()=>{ if(!toast)return; const t=setTimeout(()=>setToast(''),3000); return ()=>clearTimeout(t); },[toast]);

  const balances = useMemo(()=>Object.fromEntries(data.clients.map(c=>[c.id,getBalance(c.id,data.movements)])),[data]);
  const totalOpen = Object.values(balances).reduce((a,b)=>a+b,0);
  const now = new Date();
  const inPeriod = (m) => {
    const d = new Date(m.date);
    if(period==='today') return d.toDateString()===now.toDateString();
    if(period==='week') return (now-d)<=7*86400000 && d<=now;
    return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  };
  const confirmed = data.movements.filter(m=>m.status==='confirmed');
  const consumptionPeriod = confirmed.filter(m=>m.type==='consumption'&&inPeriod(m)).reduce((s,m)=>s+m.amount,0);
  const paymentsPeriod = confirmed.filter(m=>m.type==='payment'&&inPeriod(m)).reduce((s,m)=>s+m.amount,0);

  const notify = (msg) => setToast(msg);
  const navigate = (p) => { setPage(p); setQuery(''); setMobileNav(false); };
  const addMovement = (movement) => {
    setData(d=>({...d,movements:[{...movement,id:uid(),status:'confirmed',date:new Date().toISOString()},...d.movements]}));
  };
  const reverseMovement = (id) => {
    const m=data.movements.find(x=>x.id===id);
    if(!m || m.status!=='confirmed') return;
    const reason=window.prompt('Informe o motivo do estorno:');
    if(reason===null) return;
    if(!reason.trim()){notify('Informe um motivo para estornar.');return;}
    setData(d=>({...d,movements:d.movements.map(x=>x.id===id?{...x,status:'reversed',reversedAt:new Date().toISOString(),reason:reason.trim()}:x)}));
    notify('Movimentação estornada e mantida no histórico.');
  };
  const resetDemo = () => {
    if(window.confirm('Restaurar os dados demonstrativos originais? Todas as alterações deste navegador serão perdidas.')) {
      setData(seed); localStorage.setItem(STORAGE_KEY,JSON.stringify(seed)); notify('Dados demonstrativos restaurados.');
    }
  };
  const navItems = [
    ['dashboard','Dashboard',LayoutDashboard],['clients','Clientes',Users],['consumptions','Lançar consumo',Beer],
    ['payments','Lançar pagamento',Wallet],['products','Produtos',Package],['reports','Relatórios',ChartNoAxesCombined]
  ];
  const clientName = (id)=>data.clients.find(c=>c.id===id)?.name || 'Cliente removido';

  if(!logged) return <Login onLogin={()=>{sessionStorage.setItem('lostbar-demo-auth','yes');setLogged(true);}}/>;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?'open':''}`}>
      <div className="brand"><div className="brand-mark"><Beer size={22}/></div><div><strong>LOST BAR</strong><small>CONTROLE DE FIADO</small></div><button className="mobile-close" onClick={()=>setMobileNav(false)}><X/></button></div>
      <div className="nav-label">MENU PRINCIPAL</div>
      <nav>{navItems.map(([id,label,Icon])=><button key={id} className={`nav-item ${page===id?'active':''}`} onClick={()=>navigate(id)}><Icon size={18}/><span>{label}</span>{page===id&&<ChevronRight size={15} className="nav-arrow"/>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="admin-card"><div className="avatar">CM</div><div><b>Christian Moraes</b><small>Administrador</small></div><ShieldCheck size={16}/></div>
        <button className="nav-item" onClick={()=>setModal({type:'settings'})}><Settings size={18}/><span>Configurações</span></button>
        <button className="nav-item logout" onClick={()=>{sessionStorage.removeItem('lostbar-demo-auth');setLogged(false);}}><LogOut size={18}/><span>Sair</span></button>
      </div>
    </aside>
    {mobileNav&&<div className="mobile-scrim" onClick={()=>setMobileNav(false)} />}
    <main className="main">
      <header className="topbar"><button className="mobile-menu" onClick={()=>setMobileNav(true)}><Menu/></button><div className="breadcrumb">Lost Bar <span>/</span> <b>{navItems.find(x=>x[0]===page)?.[1]||'Configurações'}</b></div><div className="top-actions"><span className="demo-pill"><span/> AMBIENTE DE TESTES</span><div className="top-avatar">CM</div></div></header>
      <div className="content">
        {page==='dashboard'&&<Dashboard data={data} balances={balances} totalOpen={totalOpen} consumption={consumptionPeriod} payments={paymentsPeriod} period={period} setPeriod={setPeriod} clientName={clientName} onNavigate={navigate} onNewConsumption={()=>setModal({type:'consumption'})} onNewPayment={()=>setModal({type:'payment'})}/>}
        {page==='clients'&&<Clients data={data} balances={balances} query={query} setQuery={setQuery} onAdd={()=>setModal({type:'client'})} onEdit={c=>setModal({type:'client',client:c})} onDetails={c=>setModal({type:'clientDetails',client:c})} onToggle={c=>{setData(d=>({...d,clients:d.clients.map(x=>x.id===c.id?{...x,active:!x.active}:x)}));notify(c.active?'Cliente bloqueado.':'Cliente desbloqueado.');}}/>}
        {page==='products'&&<Products data={data} query={query} setQuery={setQuery} onAdd={()=>setModal({type:'product'})} onEdit={p=>setModal({type:'product',product:p})} onToggle={p=>{setData(d=>({...d,products:d.products.map(x=>x.id===p.id?{...x,active:!x.active}:x)}));notify(p.active?'Produto desativado.':'Produto ativado.');}}/>}
        {page==='consumptions'&&<MovementsPage type="consumption" data={data} query={query} setQuery={setQuery} clientName={clientName} onAdd={()=>setModal({type:'consumption'})} onReverse={reverseMovement}/>}
        {page==='payments'&&<MovementsPage type="payment" data={data} query={query} setQuery={setQuery} clientName={clientName} onAdd={()=>setModal({type:'payment'})} onReverse={reverseMovement}/>}
        {page==='reports'&&<Reports data={data} balances={balances} clientName={clientName} filter={reportFilter} setFilter={setReportFilter}/>}
      </div>
      <footer className="footer">LOST BAR © 2026 <span>Protótipo demonstrativo · Dados fictícios</span><button onClick={resetDemo}><RefreshCw size={13}/> Restaurar demonstração</button></footer>
    </main>
    {modal?.type==='client'&&<ClientModal client={modal.client} onClose={()=>setModal(null)} onSave={c=>{setData(d=>({...d,clients:modal.client?d.clients.map(x=>x.id===c.id?c:x):[{...c,id:uid(),createdAt:new Date().toISOString()},...d.clients]}));setModal(null);notify(modal.client?'Cliente atualizado.':'Cliente cadastrado.');}}/>}
    {modal?.type==='product'&&<ProductModal product={modal.product} onClose={()=>setModal(null)} onSave={p=>{setData(d=>({...d,products:modal.product?d.products.map(x=>x.id===p.id?p:x):[{...p,id:uid()},...d.products]}));setModal(null);notify(modal.product?'Produto atualizado.':'Produto cadastrado.');}}/>}
    {modal?.type==='consumption'&&<ConsumptionModal clients={data.clients} products={data.products} balances={balances} onClose={()=>setModal(null)} onSave={m=>{addMovement(m);setModal(null);notify('Consumo lançado com sucesso.');}}/>}
    {modal?.type==='payment'&&<PaymentModal clients={data.clients} balances={balances} onClose={()=>setModal(null)} onSave={m=>{addMovement(m);setModal(null);notify('Pagamento registrado com sucesso.');}}/>}
    {modal?.type==='clientDetails'&&<ClientDetails client={modal.client} data={data} balance={balances[modal.client.id]||0} onClose={()=>setModal(null)} clientName={clientName}/>}
    {modal?.type==='settings'&&<Modal title="Configurações" subtitle="Preferências desta demonstração" onClose={()=>setModal(null)}><div className="modal-body"><div className="setting-row"><div className="setting-icon"><ShieldCheck/></div><div><b>Usuário administrador</b><small>Christian Moraes</small></div></div><div className="setting-row"><div className="setting-icon"><DatabaseIcon/></div><div><b>Armazenamento</b><small>Dados salvos localmente neste navegador (localStorage).</small></div></div><div className="notice"><AlertTriangle size={17}/> Este protótipo não utiliza banco de dados online. Não insira dados reais de clientes.</div><button className="btn btn-secondary full" onClick={resetDemo}><RefreshCw size={16}/> Restaurar dados de demonstração</button></div></Modal>}
    {toast&&<div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
  </div>;
}

function DatabaseIcon(){return <CircleDollarSign/>}

function Login({onLogin}) {
  const [user,setUser]=useState('christian');
  const [pass,setPass]=useState('lostbar613');
  const [error,setError]=useState('');
  const submit=(e)=>{e.preventDefault();if(user.trim().toLowerCase()==='christian'&&pass==='lostbar613')onLogin();else setError('Usuário ou senha demonstrativos incorretos.');};
  return <div className="login-screen"><div className="login-panel"><div className="login-brand"><div className="brand-mark big"><Beer size={29}/></div><span>LOST BAR</span></div><div className="login-heading"><span className="eyebrow">ÁREA ADMINISTRATIVA</span><h1>Bem-vindo de volta.</h1><p>Acesse o painel de controle de fiado do Lost Bar.</p></div><form onSubmit={submit}><Field label="Usuário"><input value={user} onChange={e=>setUser(e.target.value)} autoComplete="username"/></Field><Field label="Senha"><input type="password" value={pass} onChange={e=>setPass(e.target.value)} autoComplete="current-password"/></Field>{error&&<div className="error-text">{error}</div>}<button className="btn btn-primary full" type="submit">Entrar no sistema <ChevronRight size={17}/></button></form><div className="demo-credentials"><div><LockKeyhole size={16}/><b>Acesso demonstrativo</b></div><span>Usuário: <b>christian</b> · Senha: <b>lostbar613</b></span></div><p className="login-foot">Protótipo de validação · Dados fictícios</p></div><div className="login-aside"><div className="aside-glow"/><div className="aside-content"><span className="eyebrow">GESTÃO SIMPLES, CONTROLE TOTAL</span><h2>O controle do<br/>fiado, em um só lugar.</h2><p>Acompanhe consumos, pagamentos e saldos dos clientes do Lost Bar com praticidade.</p><div className="aside-stats"><div><b>01</b><span>Administrador</span></div><div><b>24/7</b><span>Acesso demonstrativo</span></div><div><b>100%</b><span>Dados de teste</span></div></div></div></div></div>;
}

function PageTitle({eyebrow,title,description,action}) {
  return <div className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
function StatCard({label,value,caption,icon:Icon,tone='green',trend}) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-caption">{trend&&<span className="trend"><TrendingUp size={13}/>{trend}</span>}{caption}</div></div>;
}
function Dashboard({data,balances,totalOpen,consumption,payments,period,setPeriod,clientName,onNavigate,onNewConsumption,onNewPayment}) {
  const debtors=data.clients.map(c=>({...c,balance:balances[c.id]||0})).filter(c=>c.balance>0).sort((a,b)=>b.balance-a.balance).slice(0,5);
  const recent=data.movements.slice(0,5);
  return <>
    <PageTitle eyebrow="VISÃO GERAL" title="Bom dia, Christian." description="Aqui está o resumo financeiro do Lost Bar." action={<div className="period-select"><CalendarDays size={15}/><select value={period} onChange={e=>setPeriod(e.target.value)}><option value="today">Hoje</option><option value="week">Últimos 7 dias</option><option value="month">Este mês</option></select></div>}/>
    <div className="stats-grid"><StatCard label="Total a receber" value={money(totalOpen)} caption="Saldo em aberto de clientes" icon={Wallet} tone="green"/><StatCard label="Clientes cadastrados" value={data.clients.length} caption={`${data.clients.filter(c=>c.active).length} ativos`} icon={Users} tone="blue"/><StatCard label="Consumo no período" value={money(consumption)} caption="Consumos confirmados" icon={Beer} tone="amber"/><StatCard label="Pagamentos no período" value={money(payments)} caption="Valores recebidos" icon={TrendingDown} tone="purple"/></div>
    <div className="quick-actions"><button className="btn btn-primary" onClick={onNewConsumption}><Plus size={17}/> Lançar consumo</button><button className="btn btn-secondary" onClick={onNewPayment}><Wallet size={16}/> Registrar pagamento</button><button className="btn btn-ghost" onClick={()=>onNavigate('clients')}><UserRound size={16}/> Novo cliente</button></div>
    <div className="dashboard-grid">
      <section className="panel"><div className="panel-head"><div><h3>Clientes com saldo em aberto</h3><p>Quem possui valores pendentes</p></div><button className="text-link" onClick={()=>onNavigate('clients')}>Ver clientes <ChevronRight size={14}/></button></div>
        {debtors.length?<div className="debt-list">{debtors.map(c=><div className="debt-row" key={c.id}><div className="avatar small">{(c.nickname||c.name).slice(0,2).toUpperCase()}</div><div className="debt-person"><b>{c.name}</b><small>{c.nickname||'Cliente'}</small></div><div className="debt-amount"><b>{money(c.balance)}</b><small>{c.limitEnabled?`Limite ${money(c.limit)}`:'Sem limite definido'}</small></div><span className="status-dot warning"/></div>)}</div>:<Empty title="Tudo em dia" text="Nenhum cliente possui saldo em aberto."/>}
      </section>
      <section className="panel"><div className="panel-head"><div><h3>Movimentações recentes</h3><p>Últimos registros do sistema</p></div><span className="panel-tag">ATUALIZADO</span></div>
        <div className="activity-list">{recent.map(m=><div className="activity-row" key={m.id}><div className={`activity-icon ${m.type}`} >{m.type==='consumption'?<ArrowUpRight size={16}/>:<ArrowDownLeft size={16}/>}</div><div className="activity-info"><b>{clientName(m.clientId)}</b><small>{m.type==='consumption'?'Consumo':'Pagamento'} · {dateTime(m.date)}</small></div><b className={m.type==='consumption'?'amount-negative':'amount-positive'}>{m.type==='consumption'?'+':'−'} {money(m.amount)}</b></div>)}</div>
      </section>
    </div>
    <div className="tip-banner"><div className="tip-icon"><ShieldCheck size={20}/></div><div><b>Ambiente de demonstração</b><p>Os lançamentos ficam salvos neste navegador. Use dados fictícios durante a avaliação.</p></div><span className="demo-pill">TESTE</span></div>
  </>;
}

function SearchBar({value,onChange,placeholder='Buscar...'}) {
  return <div className="search-box"><Search size={17}/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>{value&&<button onClick={()=>onChange('')}><X size={15}/></button>}</div>;
}
function Clients({data,balances,query,setQuery,onAdd,onEdit,onDetails,onToggle}) {
  const filtered=data.clients.filter(c=>(c.name+' '+(c.nickname||'')+' '+(c.phone||'')).toLowerCase().includes(query.toLowerCase()));
  return <><PageTitle eyebrow="BASE DE CLIENTES" title="Clientes" description="Cadastre, consulte e gerencie os clientes do fiado." action={<button className="btn btn-primary" onClick={onAdd}><Plus size={17}/> Novo cliente</button>}/>
    <div className="toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Buscar por nome, apelido ou telefone"/><span className="results-count">{filtered.length} clientes</span></div>
    <div className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>CLIENTE</th><th>CONTATO</th><th>SALDO DEVEDOR</th><th>LIMITE</th><th>STATUS</th><th></th></tr></thead><tbody>{filtered.map(c=>{const b=balances[c.id]||0;return <tr key={c.id}><td><button className="person-cell" onClick={()=>onDetails(c)}><span className="avatar small">{(c.nickname||c.name).slice(0,2).toUpperCase()}</span><span><b>{c.name}</b><small>{c.nickname||'Sem apelido'}</small></span></button></td><td>{c.phone||'—'}</td><td><b className={b>0?'amount-negative':'amount-positive'}>{money(b)}</b></td><td>{c.limitEnabled?money(c.limit):<span className="muted">Não definido</span>}</td><td><span className={`badge ${c.active?'success':'danger'}`}>{c.active?'Ativo':'Bloqueado'}</span></td><td><div className="row-actions"><IconButton title="Ver extrato" onClick={()=>onDetails(c)}><Eye size={16}/></IconButton><IconButton title="Editar" onClick={()=>onEdit(c)}><Pencil size={16}/></IconButton><IconButton title={c.active?'Bloquear':'Desbloquear'} onClick={()=>onToggle(c)}>{c.active?<Ban size={16}/>:<CheckCircle2 size={16}/>}</IconButton></div></td></tr>})}</tbody></table>{!filtered.length&&<Empty title="Nenhum cliente encontrado" text="Tente outro termo ou cadastre um novo cliente."/>}</div></div>
  </>;
}
function Products({data,query,setQuery,onAdd,onEdit,onToggle}) {
  const filtered=data.products.filter(p=>(p.name+' '+p.category).toLowerCase().includes(query.toLowerCase()));
  return <>
    <PageTitle eyebrow="CATÁLOGO" title="Produtos" description="Gerencie os produtos e preços usados nos lançamentos." action={<button className="btn btn-primary" onClick={onAdd}><Plus size={17}/> Novo produto</button>}/>
    <div className="toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Buscar produto ou categoria"/><span className="results-count">{filtered.length} produtos</span></div>
    {filtered.length ? <div className="product-grid">{filtered.map(p=><div className="product-card" key={p.id}>
      <div className="product-top"><div className="product-icon"><Beer size={20}/></div><span className={`badge ${p.active?'success':'neutral'}`}>{p.active?'Ativo':'Inativo'}</span></div>
      <div><h3>{p.name}</h3><small>{p.category}</small></div>
      <div className="product-bottom"><b>{money(p.price)}</b><div className="row-actions"><IconButton title="Editar" onClick={()=>onEdit(p)}><Pencil size={16}/></IconButton><IconButton title={p.active?'Desativar':'Ativar'} onClick={()=>onToggle(p)}>{p.active?<Ban size={16}/>:<CheckCircle2 size={16}/>}</IconButton></div></div>
    </div>)}</div> : <div className="panel"><Empty title="Nenhum produto encontrado" text="Cadastre um produto para começar."/></div>}
  </>;
}

function MovementsPage({type,data,query,setQuery,clientName,onAdd,onReverse}) {
  const isConsumption=type==='consumption';
  const rows=data.movements.filter(m=>m.type===type).filter(m=>(clientName(m.clientId)+' '+(m.description||'')+' '+(m.method||'')).toLowerCase().includes(query.toLowerCase()));
  return <><PageTitle eyebrow={isConsumption?'OPERAÇÃO DE VENDA':'CONTROLE DE RECEBIMENTOS'} title={isConsumption?'Lançamentos de consumo':'Pagamentos'} description={isConsumption?'Registre os consumos realizados pelos clientes.':'Registre pagamentos parciais ou quitações.'} action={<button className="btn btn-primary" onClick={onAdd}><Plus size={17}/>{isConsumption?'Novo consumo':'Novo pagamento'}</button>}/><div className="toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Buscar por cliente ou descrição"/><span className="results-count">{rows.length} registros</span></div><div className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>CLIENTE</th><th>DATA</th><th>DESCRIÇÃO / FORMA</th><th>VALOR</th><th>SITUAÇÃO</th><th></th></tr></thead><tbody>{rows.map(m=><tr key={m.id}><td><b>{clientName(m.clientId)}</b></td><td>{dateTime(m.date)}</td><td>{m.type==='payment'?(m.method||'Pagamento'):(m.description|| (m.mode==='quick'?'Consumo rápido':'Consumo por itens'))}</td><td><b className={isConsumption?'amount-negative':'amount-positive'}>{isConsumption?'+':'−'} {money(m.amount)}</b></td><td><span className={`badge ${m.status==='confirmed'?'success':'danger'}`}>{m.status==='confirmed'?'Confirmado':'Estornado'}</span></td><td>{m.status==='confirmed'&&<IconButton title="Estornar lançamento" danger onClick={()=>onReverse(m.id)}><RefreshCw size={16}/></IconButton>}</td></tr>)}</tbody></table>{!rows.length&&<Empty title="Nenhuma movimentação encontrada" text="Os novos lançamentos aparecerão aqui."/>}</div></div></>;
}

function Reports({data,balances,clientName,filter,setFilter}) {
  const rows=data.movements.filter(m=>filter==='all'||m.status===filter);
  const consumption=rows.filter(m=>m.type==='consumption'&&m.status==='confirmed').reduce((s,m)=>s+m.amount,0);
  const payments=rows.filter(m=>m.type==='payment'&&m.status==='confirmed').reduce((s,m)=>s+m.amount,0);
  const debtors=data.clients.map(c=>({...c,balance:balances[c.id]||0})).filter(c=>c.balance>0).sort((a,b)=>b.balance-a.balance);
  const exportCsv=()=>{
    const lines=[['Tipo','Cliente','Data','Valor','Descrição','Status'],...rows.map(m=>[m.type==='consumption'?'Consumo':'Pagamento',clientName(m.clientId),dateTime(m.date),m.amount,m.description||m.method||'',m.status==='confirmed'?'Confirmado':'Estornado'])];
    const csv='\\ufeff'+lines.map(r=>r.map(x=>`"${String(x??'').replaceAll('"','""')}"`).join(';')).join('\\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));a.download='relatorio-lost-bar.csv';a.click();URL.revokeObjectURL(a.href);
  };
  return <><PageTitle eyebrow="ANÁLISE FINANCEIRA" title="Relatórios" description="Acompanhe os números e consulte as movimentações do Lost Bar." action={<button className="btn btn-secondary" onClick={exportCsv}><Download size={16}/> Exportar CSV</button>}/><div className="report-filter"><SlidersHorizontal size={16}/><span>Exibir movimentações:</span><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Todas</option><option value="confirmed">Confirmadas</option><option value="reversed">Estornadas</option></select></div><div className="stats-grid three"><StatCard label="Consumos confirmados" value={money(consumption)} caption="Total das movimentações listadas" icon={Beer} tone="amber"/><StatCard label="Pagamentos confirmados" value={money(payments)} caption="Total recebido" icon={Wallet} tone="green"/><StatCard label="Saldo em aberto" value={money(Object.values(balances).reduce((a,b)=>a+b,0))} caption="Posição atual dos clientes" icon={CircleDollarSign} tone="blue"/></div><div className="dashboard-grid"><section className="panel"><div className="panel-head"><div><h3>Maiores saldos devedores</h3><p>Clientes com valores pendentes</p></div></div><div className="debt-list">{debtors.map(c=><div className="debt-row" key={c.id}><div className="avatar small">{c.name.slice(0,2).toUpperCase()}</div><div className="debt-person"><b>{c.name}</b><small>{c.active?'Ativo':'Bloqueado'}</small></div><div className="debt-amount"><b>{money(c.balance)}</b><small>{c.limitEnabled?`Limite ${money(c.limit)}`:'Sem limite'}</small></div></div>)}</div></section><section className="panel"><div className="panel-head"><div><h3>Resumo por forma de pagamento</h3><p>Valores confirmados</p></div></div>{['PIX','Dinheiro','Cartão de débito','Cartão de crédito','Outros'].map(method=>{const value=data.movements.filter(m=>m.type==='payment'&&m.status==='confirmed'&&m.method===method).reduce((s,m)=>s+m.amount,0);return <div className="method-row" key={method}><span>{method}</span><b>{money(value)}</b></div>})}</section></div><section className="panel table-panel report-table"><div className="panel-head"><div><h3>Movimentações</h3><p>Registros para conferência</p></div><span className="panel-tag">{rows.length} REGISTROS</span></div><div className="table-wrap"><table><thead><tr><th>TIPO</th><th>CLIENTE</th><th>DATA</th><th>VALOR</th><th>STATUS</th></tr></thead><tbody>{rows.map(m=><tr key={m.id}><td>{m.type==='consumption'?'Consumo':'Pagamento'}</td><td>{clientName(m.clientId)}</td><td>{dateTime(m.date)}</td><td>{money(m.amount)}</td><td><span className={`badge ${m.status==='confirmed'?'success':'danger'}`}>{m.status==='confirmed'?'Confirmado':'Estornado'}</span></td></tr>)}</tbody></table></div></section></>;
}

function ClientModal({client,onClose,onSave}) {
  const [form,setForm]=useState(client||{name:'',nickname:'',phone:'',cpf:'',limit:0,limitEnabled:false,notes:'',active:true});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=e=>{e.preventDefault();if(!form.name.trim())return;onSave({...form,limit:Number(form.limit)||0});};
  return <Modal title={client?'Editar cliente':'Novo cliente'} subtitle="Preencha os dados para manter o cadastro atualizado." onClose={onClose}><form className="modal-body" onSubmit={submit}><div className="form-grid"><Field label="Nome completo *"><input required value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Ex.: João da Silva"/></Field><Field label="Apelido"><input value={form.nickname||''} onChange={e=>set('nickname',e.target.value)} placeholder="Como é conhecido no bar"/></Field><Field label="Telefone"><input value={form.phone||''} onChange={e=>set('phone',e.target.value)} placeholder="(15) 99999-9999"/></Field><Field label="CPF (opcional)"><input value={form.cpf||''} onChange={e=>set('cpf',e.target.value)} placeholder="000.000.000-00"/></Field></div><div className="toggle-line"><div><b>Definir limite de crédito</b><small>Se desativado, o cliente ficará sem limite definido.</small></div><input type="checkbox" checked={!!form.limitEnabled} onChange={e=>set('limitEnabled',e.target.checked)}/></div>{form.limitEnabled&&<Field label="Limite de crédito (R$)"><input type="number" min="0" step="0.01" value={form.limit} onChange={e=>set('limit',e.target.value)}/></Field>}<Field label="Observações"><textarea rows="3" value={form.notes||''} onChange={e=>set('notes',e.target.value)} placeholder="Anotações internas..."/></Field><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button><button className="btn btn-primary" type="submit"><Check size={16}/> Salvar cliente</button></div></form></Modal>;
}
function ProductModal({product,onClose,onSave}) {
  const [form,setForm]=useState(product||{name:'',category:'Bebidas',price:'',active:true});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=e=>{e.preventDefault();if(!form.name.trim()||Number(form.price)<0)return;onSave({...form,price:Number(form.price)});};
  return <Modal title={product?'Editar produto':'Novo produto'} subtitle="Cadastre um item que poderá ser utilizado nos consumos." onClose={onClose}><form className="modal-body" onSubmit={submit}><Field label="Nome do produto *"><input required value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Ex.: Cerveja pilsen"/></Field><div className="form-grid"><Field label="Categoria"><select value={form.category} onChange={e=>set('category',e.target.value)}><option>Bebidas</option><option>Comidas</option><option>Outros</option></select></Field><Field label="Preço unitário (R$)"><input required type="number" min="0" step="0.01" value={form.price} onChange={e=>set('price',e.target.value)}/></Field></div><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button><button className="btn btn-primary" type="submit"><Check size={16}/> Salvar produto</button></div></form></Modal>;
}
function ConsumptionModal({clients,products,balances,onClose,onSave}) {
  const [clientId,setClientId]=useState(clients.find(c=>c.active)?.id||'');
  const [mode,setMode]=useState('items');
  const [quickAmount,setQuickAmount]=useState('');
  const [description,setDescription]=useState('');
  const [items,setItems]=useState([]);
  const [selected,setSelected]=useState('');
  const [qty,setQty]=useState(1);
  const [override,setOverride]=useState(false);
  const activeClients=clients.filter(c=>c.active);
  const client=clients.find(c=>c.id===clientId);
  const total=mode==='quick'?Number(quickAmount)||0:items.reduce((s,i)=>s+i.qty*i.price,0);
  const currentBalance=balances[clientId]||0;
  const exceeds=client?.limitEnabled&&currentBalance+total>Number(client.limit);
  const addItem=()=>{const p=products.find(x=>x.id===selected&&x.active);if(!p)return;setItems(old=>{const found=old.find(x=>x.productId===p.id);return found?old.map(x=>x.productId===p.id?{...x,qty:x.qty+Number(qty)}:x):[...old,{productId:p.id,name:p.name,qty:Number(qty),price:p.price}];});setSelected('');setQty(1);};
  const submit=e=>{e.preventDefault();if(!clientId||total<=0)return;if(exceeds&&!override)return;const desc=mode==='quick'?(description||'Consumo rápido'):items.map(i=>`${i.qty}x ${i.name}`).join(', ');onSave({type:'consumption',clientId,amount:total,description:desc,items:mode==='items'?items:[],mode});};
  return <Modal title="Lançar consumo" subtitle="Adicione um consumo à conta do cliente." onClose={onClose} wide><form className="modal-body" onSubmit={submit}><Field label="Cliente *"><select required value={clientId} onChange={e=>{setClientId(e.target.value);setOverride(false);}}><option value="">Selecione um cliente</option>{activeClients.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></Field>{client&&<div className="client-balance-strip"><div><small>Saldo atual</small><b>{money(currentBalance)}</b></div><div><small>Limite</small><b>{client.limitEnabled?money(client.limit):'Não definido'}</b></div><div><small>Disponível</small><b>{client.limitEnabled?money(Math.max(0,client.limit-currentBalance)):'—'}</b></div></div>}<div className="segmented"><button type="button" className={mode==='items'?'selected':''} onClick={()=>setMode('items')}><ShoppingCart size={15}/> Por produto</button><button type="button" className={mode==='quick'?'selected':''} onClick={()=>setMode('quick')}><CircleDollarSign size={15}/> Valor total</button></div>{mode==='items'?<><div className="add-product-row"><Field label="Produto"><select value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Selecione...</option>{products.filter(p=>p.active).map(p=><option key={p.id} value={p.id}>{p.name} — {money(p.price)}</option>)}</select></Field><Field label="Qtd."><input type="number" min="1" step="1" value={qty} onChange={e=>setQty(e.target.value)}/></Field><button type="button" className="btn btn-secondary add-item-btn" onClick={addItem} disabled={!selected}><Plus size={16}/> Adicionar</button></div><div className="cart-list">{items.length?items.map(i=><div className="cart-row" key={i.productId}><div><b>{i.name}</b><small>{i.qty} × {money(i.price)}</small></div><b>{money(i.qty*i.price)}</b><button type="button" onClick={()=>setItems(old=>old.filter(x=>x.productId!==i.productId))}><X size={15}/></button></div>):<p className="muted center">Adicione produtos ao consumo.</p>}</div></>:<><Field label="Valor total (R$) *"><input type="number" required min="0.01" step="0.01" value={quickAmount} onChange={e=>setQuickAmount(e.target.value)} placeholder="0,00"/></Field><Field label="Descrição (opcional)"><input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Ex.: Consumo no balcão"/></Field></>}{exceeds&&<div className="notice warning"><AlertTriangle size={17}/><div><b>Limite de crédito ultrapassado</b><small>Este consumo deixará o saldo em {money(currentBalance+total)}, acima do limite de {money(client.limit)}.</small><label className="override-check"><input type="checkbox" checked={override} onChange={e=>setOverride(e.target.checked)}/> Autorizar excepcionalmente este lançamento</label></div></div>}<div className="total-box"><span>Total do consumo</span><b>{money(total)}</b></div><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button><button className="btn btn-primary" type="submit" disabled={!clientId||total<=0||(exceeds&&!override)}>Confirmar consumo</button></div></form></Modal>;
}
function PaymentModal({clients,balances,onClose,onSave}) {
  const [clientId,setClientId]=useState(clients.find(c=>(balances[c.id]||0)>0)?.id||clients[0]?.id||'');
  const [amount,setAmount]=useState('');
  const [method,setMethod]=useState('PIX');
  const [description,setDescription]=useState('');
  const client=clients.find(c=>c.id===clientId);
  const balance=balances[clientId]||0;
  const submit=e=>{e.preventDefault();if(!clientId||Number(amount)<=0||Number(amount)>balance)return;onSave({type:'payment',clientId,amount:Number(amount),method,description});};
  return <Modal title="Registrar pagamento" subtitle="Registre um valor recebido do cliente." onClose={onClose}><form className="modal-body" onSubmit={submit}><Field label="Cliente *"><select value={clientId} onChange={e=>setClientId(e.target.value)}>{clients.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></Field><div className="payment-balance"><small>Saldo devedor atual</small><b>{money(balance)}</b></div><Field label="Valor recebido (R$) *"><input required type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0,00"/></Field><div className="quick-values"><button type="button" onClick={()=>setAmount(String(balance.toFixed(2)))}>Quitar saldo</button><button type="button" disabled={balance<=0} onClick={()=>setAmount(String(Math.min(balance,50).toFixed(2)))}>Até R$ 50</button><button type="button" disabled={balance<=0} onClick={()=>setAmount(String(Math.min(balance,100).toFixed(2)))}>Até R$ 100</button></div><Field label="Forma de pagamento"><select value={method} onChange={e=>setMethod(e.target.value)}><option>PIX</option><option>Dinheiro</option><option>Cartão de débito</option><option>Cartão de crédito</option><option>Outros</option></select></Field><Field label="Observação (opcional)"><input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Informação adicional"/></Field>{Number(amount)>balance&&<div className="notice warning"><AlertTriangle size={16}/> O pagamento não pode ultrapassar o saldo devedor atual.</div>}<div className="total-box"><span>Valor a registrar</span><b>{money(amount)}</b></div><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button><button className="btn btn-primary" type="submit" disabled={!clientId||Number(amount)<=0||Number(amount)>balance}>Confirmar pagamento</button></div></form></Modal>;
}
function ClientDetails({client,data,balance,onClose,clientName}) {
  const rows=data.movements.filter(m=>m.clientId===client.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
  return <Modal title={client.name} subtitle="Extrato e informações do cliente" onClose={onClose} wide><div className="modal-body"><div className="detail-summary"><div><small>Saldo devedor</small><b>{money(balance)}</b></div><div><small>Limite de crédito</small><b>{client.limitEnabled?money(client.limit):'Não definido'}</b></div><div><small>Status</small><b>{client.active?'Ativo':'Bloqueado'}</b></div></div><div className="detail-contact"><span>{client.phone||'Telefone não informado'}</span><span>{client.nickname||'Sem apelido'}</span></div><h3 className="section-mini-title">Histórico de movimentações</h3>{rows.length?<div className="detail-history">{rows.map(m=><div className="activity-row" key={m.id}><div className={`activity-icon ${m.type}`}>{m.type==='consumption'?<ArrowUpRight size={16}/>:<ArrowDownLeft size={16}/>}</div><div className="activity-info"><b>{m.type==='consumption'?'Consumo':'Pagamento'}{m.status==='reversed'?' · Estornado':''}</b><small>{dateTime(m.date)} · {m.description||m.method||'—'}</small></div><b className={m.type==='consumption'?'amount-negative':'amount-positive'}>{m.type==='consumption'?'+':'−'} {money(m.amount)}</b></div>)}</div>:<Empty title="Sem movimentações" text="Este cliente ainda não possui lançamentos."/>}</div></Modal>;
}
