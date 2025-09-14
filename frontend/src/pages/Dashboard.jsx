import React, { useEffect, useState } from 'react'

export default function Dashboard(){
  const [products, setProducts] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [inventoryValue, setInventoryValue] = useState(0)

  useEffect(()=> {
    fetch(`${import.meta.env.VITE_API_URL}/api/products`).then(r=>r.json()).then(setProducts)
    fetch(`${import.meta.env.VITE_API_URL}/api/reports/low-stock`).then(r=>r.json()).then(setLowStock)
    fetch(`${import.meta.env.VITE_API_URL}/api/reports/inventory-value`).then(r=>r.json()).then(data=>setInventoryValue(data.total_value))
  },[])

  return (
    <div>
      <h2 className="mb-3">Dashboard</h2>
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="p-3 card-ghost">
            <h5>Total Products</h5>
            <h2>{products.length}</h2>
            <div className="small-muted">Distinct products in catalog</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 card-ghost">
            <h5>Low Stock Alerts</h5>
            <h2>{lowStock.length}</h2>
            <div className="small-muted">Products at or below threshold</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 card-ghost">
            <h5>Total Inventory Value</h5>
            <h2>₹{inventoryValue.toFixed(2)}</h2>
            <div className="small-muted">Sum of (price × qty)</div>
          </div>
        </div>
      </div>

      <div className="card p-3">
        <h5>Products Snapshot</h5>
        <div className="table-responsive">
          <table className="table table-hover mt-2">
            <thead><tr><th>Name</th><th>SKU</th><th>Price</th><th>Qty</th><th>Supplier</th></tr></thead>
            <tbody>
              {products.map(p=>(
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>₹{p.price}</td>
                  <td>{p.quantity}</td>
                  <td>{p.supplier_name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
