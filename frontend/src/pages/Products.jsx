import React, { useEffect, useState } from 'react'

function ProductForm({onSave, suppliers, initial}) {
  const [form, setForm] = useState(initial || {name:'',sku:'',price:'',quantity:'',supplier_id:''})
  useEffect(() => setForm(initial || {name:'',sku:'',price:'',quantity:'',supplier_id:''}), [initial])
  const handle = (e)=> setForm({...form, [e.target.name]: e.target.value})
  return (
    <form onSubmit={e=>{e.preventDefault(); onSave({...form, price: parseFloat(form.price||0), quantity: parseInt(form.quantity||0)})}}>
      <div className="mb-2">
        <input name="name" required className="form-control" placeholder="Product name" value={form.name} onChange={handle}/>
      </div>
      <div className="mb-2 row">
        <div className="col">
          <input name="sku" className="form-control" placeholder="SKU" value={form.sku} onChange={handle}/>
        </div>
        <div className="col">
          <input name="price" type="number" step="0.01" className="form-control" placeholder="Price" value={form.price} onChange={handle}/>
        </div>
        <div className="col">
          <input name="quantity" type="number" className="form-control" placeholder="Quantity" value={form.quantity} onChange={handle}/>
        </div>
      </div>
      <div className="mb-2">
        <select name="supplier_id" className="form-select" value={form.supplier_id||''} onChange={handle}>
          <option value=''>-- Select supplier (optional) --</option>
          {suppliers.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div><button className="btn btn-primary me-2" type="submit">Save</button></div>
    </form>
  )
}

export default function Products(){
  const [list, setList] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState('')

  const load = ()=> {
    fetch(`${import.meta.env.VITE_API_URL}/api/products`).then(r=>r.json()).then(setList)
    fetch(`${import.meta.env.VITE_API_URL}/api/suppliers`).then(r=>r.json()).then(setSuppliers)
  }
  useEffect(()=>load(),[])

  const create = async (data) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)})
    if(res.ok){ setMessage('Created'); load(); } else { const err = await res.json(); setMessage(err.error || 'Error') }
  }
  const update = async (id, data) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/`+id, {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)})
    if(res.ok){ setMessage('Updated'); setEditing(null); load(); } else { const err = await res.json(); setMessage(err.error || 'Error') }
  }
  const remove = async (id) => {
    if(!confirm('Delete product?')) return;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/`+id, {method:'DELETE'})
    if(res.ok){ setMessage('Deleted'); load(); } else { setMessage('Failed to delete') }
  }

  return (
    <div>
      <h2 className="mb-3">Products</h2>
      <div className="row">
        <div className="col-md-5">
          <div className="card p-3 mb-3">
            <h5>{editing ? 'Edit product' : 'Add product'}</h5>
            <ProductForm initial={editing || undefined} suppliers={suppliers} onSave={(data)=> editing ? update(editing.id, data) : create(data)} />
            <div className="small text-success mt-2">{message}</div>
          </div>
        </div>
        <div className="col-md-7">
          <div className="card p-3">
            <h5>All products</h5>
            <div className="table-responsive">
              <table className="table table-hover mt-2">
                <thead><tr><th>Name</th><th>SKU</th><th>Price</th><th>Qty</th><th>Supplier</th><th></th></tr></thead>
                <tbody>
                  {list.map(p=>(
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.sku}</td>
                      <td>₹{p.price}</td>
                      <td>{p.quantity}</td>
                      <td>{p.supplier_name || '-'}</td>
                      <td style={{width:180}}>
                        <button className="btn btn-sm btn-outline-secondary me-1" onClick={()=>setEditing(p)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={()=>remove(p.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
