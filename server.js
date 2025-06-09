// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 4000;
const JWT_SECRET = 'your_jwt_secret_here'; // Replace with env var in production

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/inventory_manager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(console.error);

// Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: String,
});
const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  orderId: String,
  productId: String,
  orderDate: Date,
  quantity: Number,
  price: Number,
});
const Product = mongoose.model('Product', productSchema);

// Middleware - auth check
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  if(!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Signup
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ message: 'Email and password required' });

  try {
    const existing = await User.findOne({ email });
    if(existing) return res.status(400).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ email, passwordHash });
    await user.save();
    res.json({ message: 'User created' });
  } catch(e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ message: 'Email and password required' });

  try {
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if(!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch(e) {
    res.status(500).json({ message: 'Server error' });
  }
});

//filtering and sorting (based on parameters)
app.get('/api/products', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const {
    sortBy,
    order,
    minQuantity,
    maxQuantity,
    minPrice,
    maxPrice,
  } = req.query;

  let filter = { userId };
  if(minQuantity) filter.quantity = { ...filter.quantity, $gte: Number(minQuantity) };
  if(maxQuantity) filter.quantity = { ...filter.quantity, $lte: Number(maxQuantity) };
  if(minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
  if(maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };

  let sort = {};
  if(sortBy){
    sort[sortBy] = order === 'desc' ? -1 : 1;
  }

  try {
    const products = await Product.find(filter).sort(sort);
    res.json({ products });
  } catch(e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new product
app.post('/api/products', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { orderId, productId, orderDate, quantity, price } = req.body;
  if(!orderId || !productId || !orderDate || !quantity || !price) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const product = new Product({ userId, orderId, productId, orderDate, quantity, price });
    await product.save();
    res.json({ message: 'Product added', product });
  } catch(e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product by id
app.put('/api/products/:id', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  const { orderId, productId, orderDate, quantity, price } = req.body;

  if(!orderId || !productId || !orderDate || !quantity || !price) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const product = await Product.findOne({ _id: id, userId });
    if(!product) return res.status(404).json({ message: 'Product not found' });

    product.orderId = orderId;
    product.productId = productId;
    product.orderDate = orderDate;
    product.quantity = quantity;
    product.price = price;
    await product.save();

    res.json({ message: 'Product updated', product });
  } catch(e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product by id
app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  try {
    const product = await Product.findOneAndDelete({ _id: id, userId });
    if(!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted' });
  } catch(e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
