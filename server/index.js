import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import Customer from './models/Customer.js';
import Transaction from './models/Transaction.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dms-eicher';

// Middlewares
app.use(cors());
app.use(express.json());

// Seeding function if DB is empty
const seedDatabase = async () => {
  try {
    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      console.log('Seeding Customers...');
      await Customer.insertMany([
        {
          id: '#CUST-8291',
          name: 'John Deere Farms Inc.',
          avatar: 'JD',
          avatarBg: 'bg-blue-100 text-blue-600',
          phone: '+1 (555) 012-3456',
          district: 'Central Valley',
          vehicles: 12,
          lastService: 'Oct 12, 2023',
          outstanding: '₹4,250.00',
          status: 'ACTIVE'
        },
        {
          id: '#CUST-7742',
          name: 'Miller & Sons Agri',
          avatar: 'MS',
          avatarBg: 'bg-orange-100 text-orange-600',
          phone: '+1 (555) 012-9876',
          district: 'Northern Hills',
          vehicles: 5,
          lastService: 'Sep 28, 2023',
          outstanding: '₹0.00',
          status: 'ACTIVE'
        },
        {
          id: '#CUST-4410',
          name: 'Blue Trucking Corp',
          avatar: 'BT',
          avatarBg: 'bg-indigo-100 text-indigo-600',
          phone: '+1 (555) 012-1122',
          district: 'Coastal Plains',
          vehicles: 28,
          lastService: 'Aug 15, 2023',
          outstanding: '₹12,840.00',
          status: 'INACTIVE'
        },
        {
          id: '#CUST-9103',
          name: 'Riverside Excavation',
          avatar: 'RE',
          avatarBg: 'bg-slate-100 text-slate-600',
          phone: '+1 (555) 012-3344',
          district: 'Northern Hills',
          vehicles: 7,
          lastService: 'Oct 05, 2023',
          outstanding: '₹1,200.00',
          status: 'ACTIVE'
        }
      ]);
      console.log('Customers seeded successfully!');
    }

    const transactionCount = await Transaction.countDocuments();
    if (transactionCount === 0) {
      console.log('Seeding Transactions...');
      await Transaction.insertMany([
        {
          refId: 'TRX-10294',
          payeeName: 'Metro Logistics',
          method: 'RTGS/Bank',
          vehicleJob: 'Eicher Pro 2055',
          date: 'Oct 14, 2023',
          amount: '₹1,45,000',
          status: 'Paid'
        },
        {
          refId: 'TRX-10295',
          payeeName: 'Kishan Singh',
          method: 'UPI/QR',
          vehicleJob: 'Eicher Skyline',
          date: 'Oct 14, 2023',
          amount: '₹12,400',
          status: 'Partially Paid'
        }
      ]);
      console.log('Transactions seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Connect to Database
connectDB(MONGO_URI).then(() => {
  seedDatabase();
});

// API Routes
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find({});
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching customers' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, phone, district, vehicles, lastService, outstanding, status } = req.body;
    const randomId = `#CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    
    // Choose a random color for avatar
    const colors = ['bg-blue-100 text-blue-600', 'bg-orange-100 text-orange-600', 'bg-indigo-100 text-indigo-600', 'bg-slate-100 text-slate-600'];
    const avatarBg = colors[Math.floor(Math.random() * colors.length)];

    const newCustomer = new Customer({
      id: randomId,
      name,
      avatar: initials,
      avatarBg,
      phone,
      district,
      vehicles: Number(vehicles) || 0,
      lastService: lastService || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      outstanding: outstanding ? `₹${outstanding}` : '₹0.00',
      status: status || 'ACTIVE'
    });

    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating customer', error: error.message });
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find({});
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching transactions' });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { payeeName, method, vehicleJob, amount, status } = req.body;
    const refId = `TRX-${Math.floor(10000 + Math.random() * 90000)}`;
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newTransaction = new Transaction({
      refId,
      payeeName,
      method,
      vehicleJob,
      date: dateStr,
      amount: amount ? `₹${amount}` : '₹0',
      status: status || 'Paid'
    });

    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating transaction', error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
