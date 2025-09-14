import React, { useEffect, useState } from 'react'

export default function Transactions(){
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [txs, setTxs] = useState([])
  const [form, setForm] = useState({product_id:'', transaction_type:'sale', quantity:1, supplier_id:''})

  const load = ()=> {
    fetch(`${import.meta.env.VITE_API_URL}/api/products`).then(r=>r.json()).then(setProducts)
    fetch(`${import.meta.env.VITE_API_URL}/api/suppliers`).then(r=>r.json()).then(setSuppliers)
    fetch(`${import.meta.env.VITE_API_URL}/api/transactions`).then(r=>r.json()).then(setTxs)
  }
  useEffect(()=>load(),[])

  const submit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      product_id: form.product_id, 
      quantity: parseInt(form.quantity),
      supplier_id: form.supplier_id || null
    }
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)})
    if(res.ok){ setForm({product_id:'', transaction_type:'sale', quantity:1, supplier_id:''}); load() } else {
      const err = await res.json(); alert(err.error || 'Failed')
    }
  }

  return (
    <div>
      <h2 className="mb-3">Transactions</h2>
      <div className="row">
        <div className="col-md-5">
          <div className="card p-3 mb-3">
            <h5>Record Transaction</h5>
            <form onSubmit={submit}>
              <select required className="form-select mb-2" value={form.product_id} onChange={e=>setForm({...form, product_id:e.target.value})}>
                <option value=''>-- select product --</option>
                {products.map(p=> <option key={p.id} value={p.id}>{p.name} (Qty: {p.quantity})</option>)}
              </select>
              <select className="form-select mb-2" value={form.transaction_type} onChange={e=>setForm({...form, transaction_type:e.target.value})}>
                <option value="sale">Sale (reduce stock)</option>
                <option value="purchase">Purchase (increase stock)</option>
              </select>
              <input className="form-control mb-2" type="number" min="1" value={form.quantity} onChange={e=>setForm({...form, quantity:e.target.value})}/>
              <select className="form-select mb-2" value={form.supplier_id} onChange={e=>setForm({...form, supplier_id: e.target.value})}>
                <option value=''>-- supplier (optional) --</option>
                {suppliers.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button className="btn btn-success" type="submit">Record</button>
            </form>
          </div>
        </div>
        <div className="col-md-7">
          <div className="card p-3">
            <h5>Recent transactions</h5>
            <table className="table mt-2">
              <thead><tr><th>Time</th><th>Product</th><th>Type</th><th>Qty</th><th>Supplier</th></tr></thead>
              <tbody>
                {txs.map(t=>(
                  <tr key={t.id}>
                    <td>{new Date(t.timestamp).toLocaleString()}</td>
                    <td>{t.product_name}</td>
                    <td>{t.transaction_type}</td>
                    <td>{t.quantity}</td>
                    <td>{t.supplier_id || '-'}</td>
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
