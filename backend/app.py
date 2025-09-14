from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from bson.json_util import dumps
from flask_cors import CORS
from bson.errors import InvalidId
import datetime
import os

app = Flask(__name__)
mongo_uri = os.environ.get('MONGO_URI', 'YOUR_CONNECTION_STRING_HERE')
app.config['MONGO_URI'] = mongo_uri
mongo = PyMongo(app)
CORS(app)

def oid_to_str(d):
    if not d:
        return d
    d = dict(d)
    if '_id' in d:
        d['id'] = str(d['_id'])
        del d['_id']
    if 'supplier_id' in d and isinstance(d['supplier_id'], ObjectId):
        d['supplier_id'] = str(d['supplier_id'])
    if 'product_id' in d and isinstance(d['product_id'], ObjectId):
        d['product_id'] = str(d['product_id'])
    for k, v in d.items():
        if isinstance(v, datetime.datetime):
            d[k] = v.isoformat()
    return d


def seed_data():
    db = mongo.db
    if db.suppliers.count_documents({}) == 0:
        s1 = {'name':'Acme Supplies','contact':'acme@example.com'}
        s2 = {'name':'Beta Distributors','contact':'beta@example.com'}
        r1 = db.suppliers.insert_one(s1)
        r2 = db.suppliers.insert_one(s2)
        p1 = {'name':'Blue T-Shirt','sku':'TSHIRT-BLU','price':15.0,'quantity':30,'supplier_id':r1.inserted_id}
        p2 = {'name':'Red Mug','sku':'MUG-RED','price':8.5,'quantity':12,'supplier_id':r2.inserted_id}
        p3 = {'name':'Notebook','sku':'NOTE-A5','price':3.0,'quantity':5}
        db.products.insert_many([p1,p2,p3])

with app.app_context():
    seed_data()

# Suppliers
@app.route('/api/suppliers', methods=['GET'])
def list_suppliers():
    db = mongo.db
    docs = list(db.suppliers.find())
    out = [oid_to_str(d) for d in docs]
    return jsonify(out)

@app.route('/api/suppliers', methods=['POST'])
def create_supplier():
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({'error':'name is required'}), 400
    db = mongo.db
    res = db.suppliers.insert_one({'name':name,'contact':data.get('contact')})
    doc = db.suppliers.find_one({'_id':res.inserted_id})
    return jsonify(oid_to_str(doc)), 201

@app.route('/api/suppliers/<supplier_id>', methods=['PUT'])
def update_supplier(supplier_id):
    data = request.get_json() or {}
    db = mongo.db
    db.suppliers.update_one({'_id':ObjectId(supplier_id)}, {'$set':{'name':data.get('name'),'contact':data.get('contact')}})
    doc = db.suppliers.find_one({'_id':ObjectId(supplier_id)})
    return jsonify(oid_to_str(doc))

@app.route('/api/suppliers/<supplier_id>', methods=['DELETE'])
def delete_supplier(supplier_id):
    db = mongo.db
    db.products.update_many({'supplier_id':ObjectId(supplier_id)}, {'$unset':{'supplier_id':""}})
    db.suppliers.delete_one({'_id':ObjectId(supplier_id)})
    return jsonify({'status':'deleted'})

# Products
@app.route('/api/products', methods=['GET'])
def list_products():
    db = mongo.db
    prods = []
    for p in db.products.find():
        p = oid_to_str(p)
        if 'supplier_id' in p and p['supplier_id']:
            try:
                sup = db.suppliers.find_one({'_id':ObjectId(p['supplier_id'])})
                p['supplier_name'] = sup['name'] if sup else None
            except:
                p['supplier_name'] = None
        prods.append(p)
    return jsonify(prods)

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    db = mongo.db
    p = db.products.find_one({'_id':ObjectId(product_id)})
    if not p:
        return jsonify({'error':'not found'}), 404
    p = oid_to_str(p)
    if 'supplier_id' in p and p['supplier_id']:
        try:
            sup = db.suppliers.find_one({'_id':ObjectId(p['supplier_id'])})
            p['supplier_name'] = sup['name'] if sup else None
        except:
            p['supplier_name'] = None
    return jsonify(p)

@app.route('/api/products', methods=['POST'])
def create_product():
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({'error':'name is required'}), 400
    db = mongo.db
    doc = {
        'name': name,
        'sku': data.get('sku'),
        'price': float(data.get('price') or 0),
        'quantity': int(data.get('quantity') or 0)
    }
    sup_id = data.get('supplier_id')
    if sup_id:
        try:
            doc['supplier_id'] = ObjectId(sup_id)
        except:
            pass
    res = db.products.insert_one(doc)
    p = db.products.find_one({'_id':res.inserted_id})
    return jsonify(oid_to_str(p)), 201

@app.route('/api/products/<product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.get_json() or {}
    db = mongo.db
    update = {}
    for k in ('name','sku'):
        if k in data:
            update[k] = data.get(k)
    if 'price' in data:
        update['price'] = float(data.get('price') or 0)
    if 'quantity' in data:
        update['quantity'] = int(data.get('quantity') or 0)
    if 'supplier_id' in data:
        sid = data.get('supplier_id')
        if sid:
            try:
                update['supplier_id'] = ObjectId(sid)
            except:
                pass
        else:
            update['supplier_id'] = None
    db.products.update_one({'_id':ObjectId(product_id)}, {'$set':update})
    p = db.products.find_one({'_id':ObjectId(product_id)})
    return jsonify(oid_to_str(p))

@app.route('/api/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    db = mongo.db
    db.products.delete_one({'_id':ObjectId(product_id)})
    return jsonify({'status':'deleted'})

# Transactions
@app.route('/api/transactions', methods=['GET'])
def list_transactions():
    db = mongo.db
    docs = list(db.transactions.find().sort('timestamp', -1).limit(200))
    out = []
    for t in docs:
        t = oid_to_str(t)
        # attach product name
        try:
            prod = db.products.find_one({'_id':ObjectId(t.get('product_id'))})
            t['product_name'] = prod['name'] if prod else None
        except:
            t['product_name'] = None
        out.append(t)
    return jsonify(out)

@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    data = request.get_json() or {}
    product_id = data.get('product_id')
    tx_type = data.get('transaction_type')
    quantity = data.get('quantity')
    supplier_id = data.get('supplier_id')

    if not product_id or not tx_type or quantity is None:
        return jsonify({'error':'product_id, transaction_type and quantity are required'}), 400

    db = mongo.db
    try:
        prod_oid = ObjectId(product_id)
    except (InvalidId, TypeError):
        return jsonify({'error': 'invalid product id'}), 400

    prod = db.products.find_one({'_id': prod_oid})
    if not prod:
        return jsonify({'error':'product not found'}), 404

    quantity = int(quantity)
    if tx_type == 'purchase':
        if not supplier_id:
            return jsonify({'error': 'supplier_id required for purchase'}), 400
        try:
            sup_oid = ObjectId(supplier_id)
        except (InvalidId, TypeError):
            return jsonify({'error': 'invalid supplier id'}), 400
        if prod.get('supplier_id') != sup_oid:
            return jsonify({'error': 'this supplier does not supply the selected product'}), 400
    elif tx_type == 'sale':
        # supplier_id is ignored for sales
        supplier_id = None
    else:
        return jsonify({'error': 'transaction_type must be purchase or sale'}), 400
    
    if tx_type == 'sale' and prod.get('quantity',0) < quantity:
        return jsonify({'error':'insufficient stock'}), 400

    # stock update
    if tx_type == 'sale':
        db.products.update_one({'_id': prod_oid}, {'$inc': {'quantity': -quantity}})
    elif tx_type == 'purchase':
        db.products.update_one({'_id': prod_oid}, {'$inc': {'quantity': quantity}})
    else:
        return jsonify({'error':'transaction_type must be purchase or sale'}), 400

    tx_doc = {
        'product_id': prod_oid,
        'transaction_type': tx_type,
        'quantity': quantity,
        'supplier_id': ObjectId(supplier_id) if supplier_id else None,
        'timestamp': datetime.datetime.utcnow()
    }
    res = db.transactions.insert_one(tx_doc)
    t = db.transactions.find_one({'_id': res.inserted_id})
    t = oid_to_str(t)
    t['product_name'] = prod.get('name')
    return jsonify(t), 201

# Reports
@app.route('/api/reports/low-stock', methods=['GET'])
def low_stock():
    db = mongo.db
    try:
        threshold = int(request.args.get('threshold', 10))
    except:
        threshold = 10
    docs = list(db.products.find({'quantity': {'$lte': threshold}}))
    out = [oid_to_str(d) for d in docs]
    return jsonify(out)

@app.route('/api/reports/inventory-value', methods=['GET'])
def inventory_value():
    db = mongo.db
    total = 0.0
    prods = []
    for p in db.products.find():
        total += p.get('quantity',0) * p.get('price',0.0)
        prods.append(oid_to_str(p))
    return jsonify({'total_value': total, 'products': prods})

@app.route('/api/reports/products-by-supplier', methods=['GET'])
def products_by_supplier():
    db = mongo.db
    result = []
    for s in db.suppliers.find():
        prods = list(db.products.find({'supplier_id': s['_id']}))
        result.append({'supplier': oid_to_str(s), 'products': [oid_to_str(p) for p in prods]})
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
