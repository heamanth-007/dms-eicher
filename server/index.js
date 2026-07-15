import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import Customer from './models/Customer.js';
import Transaction from './models/Transaction.js';
import Vehicle from './models/Vehicle.js';

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

    const rajesh = await Customer.findOne({ id: 'CUST-1024' });
    if (!rajesh) {
      console.log('Adding Rajesh Kumar seed customer...');
      await Customer.create({
        id: 'CUST-1024',
        name: 'Rajesh Kumar',
        avatar: 'RK',
        avatarBg: 'bg-blue-100 text-blue-600',
        phone: '+91 98765 43210',
        district: 'Pune',
        vehicles: 3,
        lastService: 'Jul 14, 2026',
        outstanding: '₹4,500.00',
        status: 'ACTIVE'
      });
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

    const vehicleCount = await Vehicle.countDocuments();
    if (vehicleCount === 0) {
      console.log('Seeding Vehicles...');
      await Vehicle.insertMany([
        {
          id: '#VEH-8921',
          modelName: 'Eicher Pro 6028',
          type: 'Heavy Duty Truck',
          condition: 'Brand New',
          engineNo: 'E694-TIC-12',
          chassisNo: 'MC26028X1Y0034',
          colorName: 'Arctic White',
          colorHex: '#ffffff',
          price: 42500,
          sellPrice: 48200,
          status: 'Available',
          imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400'
        },
        {
          id: '#VEH-7742',
          modelName: 'Volvo 9400 B11R',
          type: 'Coach Bus',
          condition: 'Pre-booked',
          engineNo: 'D11C-410-EU5',
          chassisNo: 'VLB11R4X2Y8822',
          colorName: 'Midnight Blue',
          colorHex: '#1d4ed8',
          price: 185000,
          sellPrice: 210000,
          status: 'Reserved',
          imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400'
        },
        {
          id: '#VEH-4410',
          modelName: 'Eicher Pro 2049',
          type: 'LCV',
          condition: 'Service Mode',
          engineNo: 'E366-2L-BS6',
          chassisNo: 'EC2049L3M9102',
          colorName: 'Silver Metallic',
          colorHex: '#94a3b8',
          price: 22400,
          sellPrice: 26100,
          status: 'In Service',
          imageUrl: 'https://images.unsplash.com/photo-1516576885230-101c434d6849?auto=format&fit=crop&q=80&w=400'
        },
        {
          id: '#VEH-1109',
          modelName: 'Eicher Pro 8031XM',
          type: 'Tipper Truck',
          condition: 'Sold Out',
          engineNo: 'VEDX8-BS6-350',
          chassisNo: 'T8031XM9Z2200',
          colorName: 'Traffic Yellow',
          colorHex: '#eab308',
          price: 98000,
          sellPrice: 112000,
          status: 'Sold',
          imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400'
        }
      ]);
      console.log('Vehicles seeded successfully!');
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

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { name, phone, district, vehicles, lastService, outstanding, status } = req.body;
    const updatedCustomer = await Customer.findOneAndUpdate(
      { id: req.params.id },
      { name, phone, district, vehicles: Number(vehicles), lastService, outstanding, status },
      { new: true }
    );
    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating customer', error: error.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const deletedCustomer = await Customer.findOneAndDelete({ id: req.params.id });
    if (!deletedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully', customer: deletedCustomer });
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting customer', error: error.message });
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

app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching vehicles' });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const { modelName, type, condition, engineNo, chassisNo, colorName, colorHex, price, sellPrice, status, imageUrl } = req.body;
    const randomId = `#VEH-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newVehicle = new Vehicle({
      id: randomId,
      modelName,
      type,
      condition: condition || 'Brand New',
      engineNo: engineNo || `ENG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      chassisNo: chassisNo || `CHS-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      colorName: colorName || 'Arctic White',
      colorHex: colorHex || '#ffffff',
      price: Number(price) || 0,
      sellPrice: Number(sellPrice) || 0,
      status: status || 'Available',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400'
    });

    const savedVehicle = await newVehicle.save();
    res.status(201).json(savedVehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating vehicle', error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
