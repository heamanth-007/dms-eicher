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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Seeding function (Disabled - No sample data populated)
const seedDatabase = async () => {
  // Database seed functionality disabled to keep database clean of sample data
};

// Connect to Database
connectDB(MONGO_URI).then(() => {
  seedDatabase();
});

// Endpoint to clear sample/all database records
app.post('/api/clear-sample-data', async (req, res) => {
  try {
    await Promise.all([
      Customer.deleteMany({}),
      Transaction.deleteMany({}),
      Vehicle.deleteMany({}),
      Supplier.deleteMany({}),
      Part.deleteMany({}),
      Mechanic.deleteMany({}),
      Sale.deleteMany({}),
      JobCard.deleteMany({})
    ]);
    res.json({ success: true, message: 'All database records cleared successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error clearing database', error: err.message });
  }
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
    const { modelName, type, condition, engineNo, chassisNo, colorName, colorHex, price, sellPrice, status, imageUrl, stock, accessoriesKit, accessoriesTotal } = req.body;
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
      stock: Number(stock) || 1,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400',
      accessoriesKit: Array.isArray(accessoriesKit) ? accessoriesKit : [],
      accessoriesTotal: Number(accessoriesTotal) || 0
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
    let updateData = { ...req.body };
    if (!updateData.status && updateData.stock !== undefined) {
      const currentStock = Number(updateData.stock);
      if (currentStock <= 0) {
        updateData.status = 'Out of Stock';
      } else {
        updateData.status = 'Available';
      }
    }

    const updated = await Vehicle.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
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

    // Sync Customer
    const customerName = saleData.customerName;
    if (customerName) {
      let existingCustomer = await Customer.findOne({ name: customerName });
      if (existingCustomer) {
        existingCustomer.vehicles = (existingCustomer.vehicles || 0) + 1;
        existingCustomer.lastService = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        await existingCustomer.save();
      } else {
        const randomId = `#CUST-${Math.floor(1000 + Math.random() * 9000)}`;
        const initials = customerName.split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2) || 'C';
        const colors = ['bg-blue-100 text-blue-600', 'bg-orange-100 text-orange-600', 'bg-indigo-100 text-indigo-600', 'bg-slate-100 text-slate-600'];
        const avatarBg = colors[Math.floor(Math.random() * colors.length)];

        await Customer.create({
          id: randomId,
          name: customerName,
          avatar: initials,
          avatarBg,
          phone: customerPhone || '',
          district: customerDistrict || '',
          vehicles: 1,
          lastService: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          outstanding: '₹0.00',
          status: 'ACTIVE'
        });
      }
    }

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

    // Auto-release the mechanic if job is completed
    if (updated.status === 'COMPLETED' && updated.mechanicName) {
      await Mechanic.findOneAndUpdate(
        { name: updated.mechanicName },
        { status: 'Available' }
      );
    }

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
});

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
