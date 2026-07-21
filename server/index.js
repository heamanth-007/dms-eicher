import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './db.js';
import Customer from './models/Customer.js';
import Transaction from './models/Transaction.js';
import Vehicle from './models/Vehicle.js';
import Supplier from './models/Supplier.js';
import Part from './models/Part.js';
import Mechanic from './models/Mechanic.js';
import Sale from './models/Sale.js';
import JobCard from './models/JobCard.js';
import Setting from './models/Setting.js';

dotenv.config();
console.log("MONGO_URI =", process.env.MONGO_URI);


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

    const supplierCount = await Supplier.countDocuments();
    if (supplierCount === 0) {
      console.log('Seeding Suppliers...');
      await Supplier.insertMany([
        {
          id: 'SUP-9821',
          name: 'AutoParts Direct Ltd.',
          gstNumber: '27AADCA1234F1Z1',
          phone: '+1 202-555-0156',
          email: 'orders@autoparts.com',
          outstanding: '$12,450.00',
          isOutstandingPositive: true,
          status: 'ACTIVE'
        },
        {
          id: 'SUP-7742',
          name: 'Global Engine Spares',
          gstNumber: '19BBEDA4432A1Z9',
          phone: '+1 555-0198-2210',
          email: 'billing@globalspares.co',
          outstanding: '$0.00',
          isOutstandingPositive: false,
          status: 'ACTIVE'
        },
        {
          id: 'SUP-3321',
          name: 'Premium Lubricants Int.',
          gstNumber: '33CCDFA5567G2Z0',
          phone: '+1 212-701-0099',
          email: 'contact@premiumlubes.com',
          outstanding: '$4,200.00',
          isOutstandingPositive: true,
          status: 'INACTIVE'
        },
        {
          id: 'SUP-1102',
          name: 'Zenith Tire Solutions',
          gstNumber: '07AABBA9999K3Z2',
          phone: '+1 415-888-0123',
          email: 'zenith@tires.co',
          outstanding: '$26,200.00',
          isOutstandingPositive: true,
          status: 'ACTIVE'
        }
      ]);
      console.log('Suppliers seeded successfully!');
    }

    const partCount = await Part.countDocuments();
    if (partCount === 0) {
      console.log('Seeding Parts...');
      await Part.insertMany([
        {
          partNumber: 'SP-99231-A',
          partName: 'Oil Filter Premium',
          category: 'Consumables',
          brand: 'Bosch',
          hsnCode: '842123',
          gstPercent: '18%',
          purchasePrice: '$12.50',
          salePrice: '$24.99',
          stock: '1,240',
          stockStatus: 'normal'
        },
        {
          partNumber: 'BR-44102-X',
          partName: 'Ceramic Brake Pads Rear',
          category: 'Braking System',
          brand: 'Brembo',
          hsnCode: '870830',
          gstPercent: '12%',
          purchasePrice: '$85.00',
          salePrice: '$149.00',
          stock: '12',
          stockStatus: 'low'
        },
        {
          partNumber: 'EL-10552-C',
          partName: 'Iridium Spark Plug (Set of 4)',
          category: 'Electrical',
          brand: 'NGK',
          hsnCode: '851110',
          gstPercent: '18%',
          purchasePrice: '$42.20',
          salePrice: '$78.50',
          stock: '0',
          stockStatus: 'out'
        },
        {
          partNumber: 'SU-77021-M',
          partName: 'Front Shock Absorber',
          category: 'Suspension',
          brand: 'Monroe',
          hsnCode: '870880',
          gstPercent: '18%',
          purchasePrice: '$115.00',
          salePrice: '$195.00',
          stock: '45',
          stockStatus: 'normal'
        }
      ]);
      console.log('Parts seeded successfully!');
    }


    const saleCount = await Sale.countDocuments();
    if (saleCount === 0) {
      console.log('Seeding Sales...');
      await Sale.insertMany([
        {
          invoiceNo: '#INV-2023-0182',
          customerName: 'Aditya Khanna',
          vehicleModel: 'Eicher Pro 2049',
          status: 'DELIVERED',
          grandTotal: '₹17,43,450',
          district: 'Central Valley',
          deliveryDate: '24 Oct 2023',
          salesExecutive: 'Vikram Singh'
        },
        {
          invoiceNo: '#INV-2023-0180',
          customerName: 'Karthik Reddy',
          vehicleModel: 'Eicher Pro 3019',
          status: 'DELIVERED',
          grandTotal: '₹33,95,000',
          district: 'Coastal Plains',
          deliveryDate: '20 Oct 2023',
          salesExecutive: 'Vikram Singh'
        },
        {
          invoiceNo: '#INV-2023-0178',
          customerName: 'Omkar Logistics Ltd',
          vehicleModel: 'Eicher Pro 6028',
          status: 'DELIVERED',
          grandTotal: '₹54,25,000',
          district: 'Northern Hills',
          deliveryDate: '22 Oct 2023',
          salesExecutive: 'Rajesh Kumar'
        },
        {
          invoiceNo: '#INV-2023-0174',
          customerName: 'Tejas Transports',
          vehicleModel: 'Eicher Pro 6028',
          status: 'PENDING',
          grandTotal: '₹54,25,000',
          district: 'Central Valley',
          deliveryDate: 'Scheduled: 30 Oct 2023',
          salesExecutive: 'Amit Gupta'
        }
      ]);
      console.log('Sales seeded successfully!');
    }

    const mechanicCount = await Mechanic.countDocuments();
    if (mechanicCount === 0) {
      console.log('Seeding Mechanics...');
      await Mechanic.insertMany([
        {
          id: 'MEC-1001',
          name: 'Amit Singh',
          phone: '+91 98765 43210',
          initials: 'AS',
          avatarBg: 'bg-blue-100 text-blue-600',
          experience: '8 Years',
          status: 'Available',
          jobs: 24
        },
        {
          id: 'MEC-1002',
          name: 'Suresh Gupta',
          phone: '+91 87654 32109',
          initials: 'SG',
          avatarBg: 'bg-emerald-100 text-emerald-600',
          experience: '12 Years',
          status: 'Busy',
          jobs: 38
        },
        {
          id: 'MEC-1003',
          name: 'Abdul Rahman',
          phone: '+91 76543 21098',
          initials: 'AR',
          avatarBg: 'bg-orange-100 text-orange-600',
          experience: '5 Years',
          status: 'Available',
          jobs: 15
        },
        {
          id: 'MEC-1004',
          name: 'Vikram Sharma',
          phone: '+91 65432 10987',
          initials: 'VS',
          avatarBg: 'bg-rose-100 text-rose-600',
          experience: '10 Years',
          status: 'Busy',
          jobs: 31
        },
        {
          id: 'MEC-1005',
          name: 'Ravi Kumar',
          phone: '+91 54321 09876',
          initials: 'RK',
          avatarBg: 'bg-indigo-100 text-indigo-600',
          experience: '3 Years',
          status: 'Available',
          jobs: 8
        }
      ]);
      console.log('Mechanics seeded successfully!');
    }

    const jobCardCount = await JobCard.countDocuments();
    if (jobCardCount === 0) {
      console.log('Seeding Job Cards...');
      await JobCard.insertMany([
        {
          jcNumber: 'JC-2023-8841',
          inTime: '09:15 AM',
          customerName: 'Mohan Logistics',
          vehicleModel: 'Eicher Pro 3015',
          vehicleReg: 'MH-12-PQ-9042',
          complaintSummary: 'Brake liner replacement & general inspection',
          mechanicName: 'Amit S.',
          mechanicInitials: 'AM',
          status: 'WORKING',
          expectedDelivery: 'Today, 04:30 PM',
          isDelayed: false,
          readyForPickup: false
        },
        {
          jcNumber: 'JC-2023-8845',
          inTime: '10:30 AM',
          customerName: 'Raj Express',
          vehicleModel: 'Eicher Pro 2049',
          vehicleReg: 'DL-1C-AA-5582',
          complaintSummary: 'Periodic Maintenance Service (PMS-40k)',
          mechanicName: 'Suresh G.',
          mechanicInitials: 'SG',
          status: 'WAITING PARTS',
          expectedDelivery: 'Delayed: Oct 25',
          isDelayed: true,
          readyForPickup: false
        },
        {
          jcNumber: 'JC-2023-8848',
          inTime: '11:15 AM',
          customerName: 'Pooja Transports',
          vehicleModel: 'Eicher Skyline Pro',
          vehicleReg: 'UP-16-BT-0021',
          complaintSummary: 'Suspension noise & Steering alignment check',
          mechanicName: 'Abdul R.',
          mechanicInitials: 'AR',
          status: 'ASSIGNED',
          expectedDelivery: 'Oct 26, 11:00 AM',
          isDelayed: false,
          readyForPickup: false
        },
        {
          jcNumber: 'JC-2023-8839',
          inTime: '08:00 AM',
          customerName: 'Shiva Carriers',
          vehicleModel: 'Eicher Pro 6028',
          vehicleReg: 'KA-01-EE-1234',
          complaintSummary: 'Air conditioning service & cabin filter swap',
          mechanicName: 'Vikram S.',
          mechanicInitials: 'VS',
          status: 'COMPLETED',
          expectedDelivery: 'Today, 02:00 PM',
          isDelayed: false,
          readyForPickup: true
        }
      ]);
      console.log('Job cards seeded successfully!');
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

    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating transaction', error: error.message });
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

// Decoupled GET vehicles route
app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching vehicles' });
  }
});

// PUT for vehicles
app.put('/api/vehicles/:id', async (req, res) => {
  try {
    const updated = await Vehicle.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating vehicle', error: error.message });
  }
});

// DELETE for vehicles
app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const deleted = await Vehicle.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted successfully', vehicle: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting vehicle', error: error.message });
  }
});

// CRUD for Suppliers
app.get('/api/suppliers', async (req, res) => {
  try {
    const suppliers = await Supplier.find({});
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching suppliers' });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const newSupplier = new Supplier(req.body);
    const saved = await newSupplier.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating supplier', error: error.message });
  }
});

app.put('/api/suppliers/:id', async (req, res) => {
  try {
    const updated = await Supplier.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Supplier not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating supplier', error: error.message });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    const deleted = await Supplier.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier deleted successfully', supplier: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting supplier', error: error.message });
  }
});

// CRUD for Parts
app.get('/api/parts', async (req, res) => {
  try {
    const parts = await Part.find({});
    res.json(parts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching parts' });
  }
});

app.post('/api/parts', async (req, res) => {
  try {
    const newPart = new Part(req.body);
    const saved = await newPart.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating part', error: error.message });
  }
});

app.put('/api/parts/:partNumber', async (req, res) => {
  try {
    const updated = await Part.findOneAndUpdate({ partNumber: req.params.partNumber }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Part not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating part', error: error.message });
  }
});

app.delete('/api/parts/:partNumber', async (req, res) => {
  try {
    const deleted = await Part.findOneAndDelete({ partNumber: req.params.partNumber });
    if (!deleted) return res.status(404).json({ message: 'Part not found' });
    res.json({ message: 'Part deleted successfully', part: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting part', error: error.message });
  }
});

// CRUD for Mechanics
app.get('/api/mechanics', async (req, res) => {
  try {
    const mechanics = await Mechanic.find({});
    res.json(mechanics);
  } catch (error) {
    res.status(550).json({ message: 'Server Error fetching mechanics' });
  }
});

app.post('/api/mechanics', async (req, res) => {
  try {
    const newMechanic = new Mechanic(req.body);
    const saved = await newMechanic.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating mechanic', error: error.message });
  }
});

app.put('/api/mechanics/:id', async (req, res) => {
  try {
    const updated = await Mechanic.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Mechanic not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating mechanic', error: error.message });
  }
});

app.delete('/api/mechanics/:id', async (req, res) => {
  try {
    const deleted = await Mechanic.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ message: 'Mechanic not found' });
    res.json({ message: 'Mechanic deleted successfully', mechanic: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting mechanic', error: error.message });
  }
});

// CRUD for Sales
app.get('/api/sales', async (req, res) => {
  try {
    const sales = await Sale.find({});
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching sales' });
  }
});

app.post('/api/sales', async (req, res) => {
  try {
    const newSale = new Sale(req.body);
    const saved = await newSale.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating sale', error: error.message });
  }
});

app.put('/api/sales/:invoiceNo', async (req, res) => {
  try {
    const updated = await Sale.findOneAndUpdate({ invoiceNo: req.params.invoiceNo }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Sale record not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating sale', error: error.message });
  }
});

app.delete('/api/sales/:invoiceNo', async (req, res) => {
  try {
    const deleted = await Sale.findOneAndDelete({ invoiceNo: req.params.invoiceNo });
    if (!deleted) return res.status(404).json({ message: 'Sale record not found' });
    res.json({ message: 'Sale record deleted successfully', sale: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting sale', error: error.message });
  }
});

// CRUD for Job Cards
app.get('/api/jobcards', async (req, res) => {
  try {
    const jobcards = await JobCard.find({});
    res.json(jobcards);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching jobcards' });
  }
});

app.post('/api/jobcards', async (req, res) => {
  try {
    const newJc = new JobCard(req.body);
    const saved = await newJc.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating jobcard', error: error.message });
  }
});

app.put('/api/jobcards/:jcNumber', async (req, res) => {
  try {
    const updated = await JobCard.findOneAndUpdate({ jcNumber: req.params.jcNumber }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'JobCard not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating jobcard', error: error.message });
  }
});

app.delete('/api/jobcards/:jcNumber', async (req, res) => {
  try {
    const deleted = await JobCard.findOneAndDelete({ jcNumber: req.params.jcNumber });
    if (!deleted) return res.status(404).json({ message: 'JobCard not found' });
    res.json({ message: 'JobCard deleted successfully', jobcard: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting jobcard', error: error.message });
  }
});

// In-memory fallback for Settings
let settingsInMemory = {
  companyName: 'AutoPro Elite Motors',
  dealerName: 'Alexander Sterling',
  gstNumber: '22AAAAA0000A1Z5',
  panNumber: 'ABCDE1234F',
  streetAddress: 'Industrial Park West, Sector 12, Block C',
  city: 'Automotive City',
  stateName: 'California',
  pinCode: '90210',
  mobileNumber: '+1 (555) 012-3456',
  phoneNum: '+1 (555) 987-6543',
  emailAddress: 'contact@autopro-elite.com',
  websiteUrl: 'www.autopro-elite.com'
};

// CRUD for Settings
app.get('/api/settings', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let settings = await Setting.findOne({});
      if (!settings) {
        settings = await Setting.create(settingsInMemory);
      }
      return res.json(settings);
    }
  } catch (error) {
    console.warn('DB fetch warning for settings, using memory fallback:', error.message);
  }
  res.json(settingsInMemory);
});

app.put('/api/settings', async (req, res) => {
  try {
    settingsInMemory = { ...settingsInMemory, ...req.body };
    if (mongoose.connection.readyState === 1) {
      let settings = await Setting.findOne({});
      if (!settings) {
        settings = new Setting(req.body);
      } else {
        Object.assign(settings, req.body);
      }
      const updated = await settings.save();
      return res.json(updated);
    }
  } catch (error) {
    console.warn('DB update warning for settings, using memory fallback:', error.message);
  }
  res.json(settingsInMemory);
// ─── CRUD for Mechanics ───────────────────────────────────────────────────────

app.get('/api/mechanics', async (req, res) => {
  try {
    const mechanics = await Mechanic.find({});
    res.json(mechanics);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching mechanics' });
  }
});

app.post('/api/mechanics', async (req, res) => {
  try {
    const newMechanic = new Mechanic(req.body);
    const saved = await newMechanic.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating mechanic', error: error.message });
  }
});

app.put('/api/mechanics/:id', async (req, res) => {
  try {
    const updated = await Mechanic.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Mechanic not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating mechanic', error: error.message });
  }
});

// Assign a job to a mechanic — increments their job count and sets status Busy
app.put('/api/mechanics/:id/assign-job', async (req, res) => {
  try {
    const updated = await Mechanic.findOneAndUpdate(
      { id: req.params.id },
      { $inc: { jobs: 1 }, status: 'Busy' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Mechanic not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error assigning job to mechanic', error: error.message });
  }
});

// Mark mechanic available again
app.put('/api/mechanics/:id/free', async (req, res) => {
  try {
    const updated = await Mechanic.findOneAndUpdate(
      { id: req.params.id },
      { status: 'Available' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Mechanic not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error freeing mechanic', error: error.message });
  }
});

app.delete('/api/mechanics/:id', async (req, res) => {
  try {
    const deleted = await Mechanic.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ message: 'Mechanic not found' });
    res.json({ message: 'Mechanic deleted successfully', mechanic: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting mechanic', error: error.message });
  }
});

// Start Server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB(MONGO_URI);
});
