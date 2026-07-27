import React, { useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import QRCode from 'qrcode'
import { Html5QrcodeScanner } from 'html5-qrcode'
import {
  ShoppingBag, Shield, ScanLine, X, Plus, Trash2, CheckCircle2,
  Music, Ticket, PartyPopper, LogOut, Home, Search
} from 'lucide-react'
import './styles.css'

const seedCatalog = [
  {id:1,type:'track',title:'Midnight Myitkyina',price:5000,meta:'Future Bass • 128 BPM',image:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80'},
  {id:2,type:'track',title:'Dead With Ego',price:8000,meta:'Trap • 135 BPM',image:'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80'},
  {id:3,type:'event',title:'DJ PERFECT Neon Night',price:25000,meta:'Aug 15, 2026 • Myitkyina',image:'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80'},
  {id:4,type:'event',title:'45th Universe Opening',price:50000,meta:'Sep 5, 2026 • VIP Hall',image:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80'},
  {id:5,type:'private',title:'Birthday DJ Package',price:350000,meta:'Up to 5 Hours',image:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80'},
  {id:6,type:'private',title:'VIP Club Party Package',price:850000,meta:'Premium Setup',image:'https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?auto=format&fit=crop&w=900&q=80'}
]

const money = n => `${Number(n || 0).toLocaleString('en-US')} MMK`
const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value))

function App(){
  const [route,setRoute] = useState(location.hash.replace('#/','') || 'home')
  useEffect(()=>{
    const fn=()=>setRoute(location.hash.replace('#/','') || 'home')
    addEventListener('hashchange',fn)
    return()=>removeEventListener('hashchange',fn)
  },[])
  if(route==='admin') return <Admin/>
  if(route==='scanner') return <Scanner/>
  return <Store/>
}

function Shell({children}){
  return <div className="app">{children}</div>
}

function Store(){
  const [catalog,setCatalog] = useState(load('v2_catalog',seedCatalog))
  const [cart,setCart] = useState(load('v2_cart',[]))
  const [filter,setFilter] = useState('all')
  const [query,setQuery] = useState('')
  const [cartOpen,setCartOpen] = useState(false)
  const [bookingOpen,setBookingOpen] = useState(false)
  const [ticket,setTicket] = useState(null)

  useEffect(()=>save('v2_catalog',catalog),[catalog])
  useEffect(()=>save('v2_cart',cart),[cart])

  const visible = useMemo(()=>catalog.filter(x =>
    (filter==='all'||x.type===filter) &&
    (!query || `${x.title} ${x.meta}`.toLowerCase().includes(query.toLowerCase()))
  ),[catalog,filter,query])

  const addCart = item => {
    setCart(prev=>{
      const found = prev.find(x=>x.id===item.id)
      return found ? prev.map(x=>x.id===item.id?{...x,qty:x.qty+1}:x) : [...prev,{...item,qty:1}]
    })
  }

  return <Shell>
    <header className="topbar">
      <button className="brand" onClick={()=>{setFilter('all');scrollTo(0,0)}}>
        <div className="logo">DJ</div>
        <div><h1>DJ PERFECT EVENTS</h1><p>Northern Angel Organizer Group</p></div>
      </button>
      <div className="actions">
        <a className="iconbtn" href="#/scanner"><ScanLine size={18}/><span>Scanner</span></a>
        <a className="iconbtn" href="#/admin"><Shield size={18}/><span>Admin</span></a>
        <button className="cartbtn" onClick={()=>setCartOpen(true)}><ShoppingBag size={20}/>{cart.length>0&&<b>{cart.reduce((s,x)=>s+x.qty,0)}</b>}</button>
      </div>
    </header>

    <main className="container">
      <section className="hero">
        <div className="hero-inner">
          <span className="eyebrow">LIVE • MYITKYINA</span>
          <h2>Feel The Beat.<br/><em>Own The Night.</em></h2>
          <p>Event tickets, original tracks, private party booking နှင့် secure QR verification ကို တစ်နေရာတည်းမှာ အသုံးပြုနိုင်ပါသည်။</p>
          <div className="hero-buttons">
            <button className="primary" onClick={()=>setFilter('event')}>Event Tickets</button>
            <button className="secondary" onClick={()=>setBookingOpen(true)}>Private Party</button>
          </div>
        </div>
      </section>

      <section className="toolbar">
        <div className="filters">
          {['all','track','event','private'].map(t=><button key={t} className={filter===t?'active':''} onClick={()=>setFilter(t)}>{t}</button>)}
        </div>
        <div className="search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search..."/></div>
      </section>

      <section className="grid">
        {visible.map(item=><article className="card" key={item.id}>
          <div className="imagewrap">
            <img src={item.image} alt={item.title}/>
            <span>{item.type}</span>
            <div className="overlay"><h3>{item.title}</h3><p>{item.meta}</p><b>{money(item.price)}</b></div>
          </div>
          <button onClick={()=>item.type==='private'?setBookingOpen(true):addCart(item)}>
            {item.type==='private'?'Book Now':'Add to Cart'}
          </button>
        </article>)}
      </section>
    </main>

    {cartOpen && <CartModal cart={cart} setCart={setCart} close={()=>setCartOpen(false)} onTicket={setTicket}/>}
    {bookingOpen && <BookingModal close={()=>setBookingOpen(false)}/>}
    {ticket && <TicketModal ticket={ticket} close={()=>setTicket(null)}/>}
  </Shell>
}

function Modal({children,close}){
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&close()}>
    <div className="modal">{children}</div>
  </div>
}

function CartModal({cart,setCart,close,onTicket}){
  const [contact,setContact]=useState('')
  const [payment,setPayment]=useState('KBZPay')
  const total=cart.reduce((s,x)=>s+x.price*x.qty,0)
  const checkout=async()=>{
    if(!cart.length) return alert('Cart is empty')
    if(!contact.trim()) return alert('Phone or Email required')
    const order={id:'TKT-'+Date.now().toString().slice(-8),contact,payment,total,status:'Pending Verification',date:new Date().toISOString(),items:cart}
    const orders=load('v2_orders',[])
    save('v2_orders',[order,...orders])
    setCart([])
    close()
    onTicket(order)
  }
  return <Modal close={close}>
    <div className="modal-head"><h2>Your Cart</h2><button onClick={close}><X/></button></div>
    <div className="cart-list">{cart.length?cart.map(x=><div className="cart-row" key={x.id}><img src={x.image}/><div><b>{x.title}</b><p>{money(x.price)} × {x.qty}</p></div><button onClick={()=>setCart(cart.filter(i=>i.id!==x.id))}><Trash2 size={17}/></button></div>):<p className="empty">Cart is empty.</p>}</div>
    <div className="checkout">
      <div className="total"><span>Total</span><b>{money(total)}</b></div>
      <div className="payments">{['KBZPay','WavePay','CB Pay'].map(p=><label key={p}><input type="radio" checked={payment===p} onChange={()=>setPayment(p)}/>{p}</label>)}</div>
      <input value={contact} onChange={e=>setContact(e.target.value)} placeholder="Phone or Email"/>
      <button className="primary full" onClick={checkout}>Submit Payment</button>
    </div>
  </Modal>
}

function BookingModal({close}){
  const [form,setForm]=useState({name:'',phone:'',date:'',location:'',package:'Birthday Party',note:''})
  const submit=()=>{
    if(!form.name||!form.phone||!form.date||!form.location) return alert('Required fields missing')
    const list=load('v2_bookings',[])
    save('v2_bookings',[{...form,id:'BK-'+Date.now().toString().slice(-7),status:'Pending'},...list])
    close();alert('Booking request sent')
  }
  return <Modal close={close}>
    <div className="modal-head"><h2>Private Party Booking</h2><button onClick={close}><X/></button></div>
    <div className="formgrid">
      {['name','phone','date','location'].map(k=><input key={k} type={k==='date'?'date':'text'} placeholder={k} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>)}
      <select value={form.package} onChange={e=>setForm({...form,package:e.target.value})}><option>Birthday Party</option><option>Wedding</option><option>VIP Club Night</option><option>Corporate Event</option></select>
      <textarea placeholder="Requirements" value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/>
    </div>
    <button className="primary full" onClick={submit}>Send Booking Request</button>
  </Modal>
}

function TicketModal({ticket,close}){
  const [src,setSrc]=useState('')
  useEffect(()=>{QRCode.toDataURL(JSON.stringify({id:ticket.id,status:ticket.status}),{width:220}).then(setSrc)},[ticket])
  return <Modal close={close}>
    <div className="ticketbox"><CheckCircle2 size={48}/><h2>Ticket Created</h2><p>{ticket.id}</p>{src&&<img src={src}/>}<small>Admin verification ပြီးနောက် status ကို Confirmed ပြောင်းနိုင်ပါသည်။</small><button className="secondary full" onClick={close}>Close</button></div>
  </Modal>
}

function Admin(){
  const [ok,setOk]=useState(sessionStorage.getItem('v2_admin')==='1')
  const [pin,setPin]=useState('')
  const [catalog,setCatalog]=useState(load('v2_catalog',seedCatalog))
  const [orders,setOrders]=useState(load('v2_orders',[]))
  const [bookings,setBookings]=useState(load('v2_bookings',[]))
  const [form,setForm]=useState({title:'',type:'track',price:'',meta:'',image:''})

  useEffect(()=>save('v2_catalog',catalog),[catalog])
  useEffect(()=>save('v2_orders',orders),[orders])
  useEffect(()=>save('v2_bookings',bookings),[bookings])

  if(!ok) return <div className="login-page"><div className="login-card"><Shield size={42}/><h1>DJ Admin Portal</h1><input type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="Admin PIN"/><button className="primary full" onClick={()=>{if(pin!=='4545')return alert('Wrong PIN');sessionStorage.setItem('v2_admin','1');setOk(true)}}>Login</button><small>Demo PIN: 4545</small><a href="#/">← Customer Website</a></div></div>

  const revenue=orders.reduce((s,x)=>s+x.total,0)
  const add=()=>{
    if(!form.title||!form.price)return alert('Title and price required')
    setCatalog([{...form,id:Date.now(),price:Number(form.price),image:form.image||seedCatalog[0].image},...catalog])
    setForm({title:'',type:'track',price:'',meta:'',image:''})
  }
  return <div className="admin-page">
    <header className="topbar"><div className="brand"><div className="logo">DJ</div><div><h1>DJ PERFECT Admin</h1><p>Catalog • Orders • Bookings</p></div></div><div className="actions"><a className="iconbtn" href="#/"><Home size={18}/><span>Website</span></a><button className="iconbtn" onClick={()=>{sessionStorage.removeItem('v2_admin');setOk(false)}}><LogOut size={18}/><span>Logout</span></button></div></header>
    <main className="container">
      <section className="metrics">{[['Catalog',catalog.length],['Orders',orders.length],['Revenue',money(revenue)],['Bookings',bookings.length]].map(x=><div className="metric" key={x[0]}><small>{x[0]}</small><b>{x[1]}</b></div>)}</section>
      <section className="admin-grid">
        <div className="panel"><h2>Orders</h2>{orders.length?orders.map(o=><div className="row" key={o.id}><div><b>{o.id}</b><p>{o.contact} • {money(o.total)}</p></div><select value={o.status} onChange={e=>setOrders(orders.map(x=>x.id===o.id?{...x,status:e.target.value}:x))}><option>Pending Verification</option><option>Confirmed</option><option>Rejected</option></select></div>):<p className="empty">No orders.</p>}</div>
        <div className="panel"><h2>Bookings</h2>{bookings.length?bookings.map(b=><div className="row" key={b.id}><div><b>{b.name} • {b.package}</b><p>{b.date} • {b.location}</p></div><select value={b.status} onChange={e=>setBookings(bookings.map(x=>x.id===b.id?{...x,status:e.target.value}:x))}><option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option></select></div>):<p className="empty">No bookings.</p>}</div>
      </section>
      <section className="panel">
        <h2>Catalog Manager</h2>
        <div className="formgrid">
          <input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
          <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="track">Track</option><option value="event">Event</option><option value="private">Private</option></select>
          <input type="number" placeholder="Price" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
          <input placeholder="Meta / Date" value={form.meta} onChange={e=>setForm({...form,meta:e.target.value})}/>
          <input placeholder="Image URL" value={form.image} onChange={e=>setForm({...form,image:e.target.value})}/>
        </div>
        <button className="primary" onClick={add}><Plus size={17}/>Add Item</button>
        <div className="catalog-admin">{catalog.map(x=><div className="catalog-row" key={x.id}><img src={x.image}/><div><b>{x.title}</b><p>{x.type} • {money(x.price)}</p></div><button onClick={()=>setCatalog(catalog.filter(i=>i.id!==x.id))}><Trash2 size={17}/></button></div>)}</div>
      </section>
    </main>
  </div>
}

function Scanner(){
  const [result,setResult]=useState('Scan result will appear here.')
  useEffect(()=>{
    const scanner=new Html5QrcodeScanner('reader',{fps:10,qrbox:250},false)
    scanner.render(text=>{
      try{
        const data=JSON.parse(text)
        const orders=load('v2_orders',[])
        const found=orders.find(x=>x.id===data.id)
        setResult(found?`Valid Ticket — ${found.id} — ${found.status} — ${money(found.total)}`:'Ticket not found on this device')
      }catch{setResult(text)}
    },()=>{})
    return()=>scanner.clear().catch(()=>{})
  },[])
  return <div className="scanner-page"><main className="scanner-card"><a href="#/">← Back</a><h1>QR Ticket Scanner</h1><p>Camera ဖြင့် ticket QR ကို scan လုပ်ပါ။</p><div id="reader"></div><div className="scan-result">{result}</div></main></div>
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>)
