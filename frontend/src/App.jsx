import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Suppliers from './pages/Suppliers'
import Transactions from './pages/Transactions'

export default function App(){
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand" to="/">Mini ERP Lite</Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto">
              <li className="nav-item"><Link className="nav-link" to="/">Dashboard</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/products">Products</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/suppliers">Suppliers</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/transactions">Transactions</Link></li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="container my-4">
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/products" element={<Products/>} />
          <Route path="/suppliers" element={<Suppliers/>} />
          <Route path="/transactions" element={<Transactions/>} />
        </Routes>
      </div>
    </div>
  )
}
