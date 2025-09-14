# Alfastack

## 🚀 Features
- User-friendly dashboard for managing products, suppliers, and transactions.
- Real-time updates with API integration between frontend and backend.
- Modular architecture for scalability.
- Modern UI built with React and Vite.
- RESTful API backend with Flask.
- Database integration for persistent storage.

---

## 🛠️ Tech Stack
**Frontend:**
- React
- Vite
- JavaScript (ES6+)

**Backend:**
- Python
- Flask

**Database:**
- MongoDB

---

## 🌐 Deployment Links
- **Frontend:** [Deployed Frontend Link](https://alfastack-ashen.vercel.app/)
- **Database:** Deployed via MongoDB Cluster

---

## ⚙️ Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/Alfastack.git
cd Alfastack-main
```

### 2. Setup Backend (Flask)
```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Backend will run on `http://localhost:5000`

### 3. Setup Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:5173`

### 4. Setup Database
- Launch a MongoDB Connection and then enter the MongoDB Conection String in the `app.py`.

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### **Products**
- `GET /api/products` → Fetch all products  
- `POST /api/products` → Add a new product  
- `PUT /api/products/<id>` → Update product by ID  
- `DELETE /api/products/<id>` → Delete product by ID  

#### **Suppliers**
- `GET /api/suppliers` → Fetch all suppliers  
- `POST /api/suppliers` → Add new supplier  
- `PUT /api/suppliers/<id>` → Update supplier by ID  
- `DELETE /api/suppliers/<id>` → Delete supplier by ID  

#### **Transactions**
- `GET /api/transactions` → Fetch all transactions  
- `POST /api/transactions` → Add new transaction  
- `PUT /api/transactions/<id>` → Update transaction by ID  
- `DELETE /api/transactions/<id>` → Delete transaction by ID  

---

## 📂 Project Structure
```
Alfastack-main/
│── backend/
│   ├── app.py
│   ├── requirements.txt
│── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│── .gitignore
```


