import React, { useEffect, useState } from 'react'

export default function Suppliers(){
  const [list, setList] = useState([])
  const [form, setForm] = useState({name:'',contact:''})
  const [editing, setEditing] = useState(null)
  const load = ()=> fetch(`${import.meta.env.VITE_API_URL}/api/suppliers`).then(r=>r.json()).then(setList)
  useEffect(() => {
    load()
  }, [])

  const save = async (e) => {
    e.preventDefault()
    if(editing){
      await fetch(`${import.meta.env.VITE_API_URL}/api/suppliers/`+editing.id, {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form)})
      setEditing(null)
    } else {
      await fetch(`${import.meta.env.VITE_API_URL}/api/suppliers`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form)})
    }
    setForm({name:'',contact:''})
    load()
  }
  const remove = async (id) => {
    if(!confirm('Delete supplier? This will disassociate products.')) return;
    await fetch(`${import.meta.env.VITE_API_URL}/api/suppliers/`+id, {method:'DELETE'})
    load()
  }
  const startEdit = (s)=> { setEditing(s); setForm({name:s.name, contact:s.contact}) }

  return (
    <div>
      <h2 className="mb-3">Suppliers</h2>
      <div className="row">
        <div className="col-md-4">
          <div className="card p-3 mb-3">
            <h5>{editing ? 'Edit supplier' : 'Add supplier'}</h5>
            <form onSubmit={save}>
              <input className="form-control mb-2" required placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
              <input className="form-control mb-2" placeholder="Contact (email/phone)" value={form.contact} onChange={e=>setForm({...form, contact:e.target.value})}/>
              <div>
                <button className="btn btn-primary me-2" type="submit">Save</button>
                {editing && <button type="button" className="btn btn-secondary" onClick={()=>{setEditing(null); setForm({name:'',contact:''})}}>Cancel</button>}
              </div>
            </form>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card p-3">
            <h5>All suppliers</h5>
            <table className="table mt-2">
              <thead><tr><th>Name</th><th>Contact</th><th></th></tr></thead>
              <tbody>
                {list.map(s=>(
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.contact}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-secondary me-2" onClick={()=>startEdit(s)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={()=>remove(s.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
