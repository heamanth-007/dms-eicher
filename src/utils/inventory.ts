export interface PartType {
  partNumber: string;
  partName: string;
  category: string;
  brand: string;
  hsnCode: string;
  gstPercent: string;
  purchasePrice: string;
  salePrice: string;
  stock: string;
  stockStatus: 'normal' | 'low' | 'out';
}

export interface InventoryTxn {
  id: string;
  partNumber: string;
  partName: string;
  type: string;
  quantity: string;
  reference: string;
  date: string;
  amount: string;
}

export const defaultMockParts: PartType[] = [
  { partNumber: 'SP-10921', partName: 'Ceramic Brake Pads', category: 'Brake System', brand: 'Bosch', hsnCode: '870830', gstPercent: '18%', purchasePrice: '₹450.00', salePrice: '₹680.00', stock: '48', stockStatus: 'normal' },
  { partNumber: 'SP-22019', partName: 'Synthetic Oil 5W-30 (1L)', category: 'Lubricants & Fluids', brand: 'Castrol', hsnCode: '271019', gstPercent: '18%', purchasePrice: '₹320.00', salePrice: '₹490.00', stock: '340', stockStatus: 'normal' },
  { partNumber: 'SP-33821', partName: 'Heavy Duty Oil Filter', category: 'Consumables', brand: 'Eicher Genuine', hsnCode: '842123', gstPercent: '18%', purchasePrice: '₹140.00', salePrice: '₹220.00', stock: '8', stockStatus: 'low' },
  { partNumber: 'SP-44910', partName: 'NGK Platinum Spark Plug', category: 'Electrical', brand: 'NGK', hsnCode: '851110', gstPercent: '18%', purchasePrice: '₹180.00', salePrice: '₹290.00', stock: '86', stockStatus: 'normal' },
  { partNumber: 'SP-55012', partName: 'Commercial Truck Air Filter', category: 'Consumables', brand: 'Mann Filter', hsnCode: '842131', gstPercent: '18%', purchasePrice: '₹550.00', salePrice: '₹890.00', stock: '4', stockStatus: 'low' },
  { partNumber: 'SP-66124', partName: 'Eicher Diesel Fuel Injector Assembly', category: 'Engine Components', brand: 'Bosch', hsnCode: '841330', gstPercent: '28%', purchasePrice: '₹4,800.00', salePrice: '₹6,900.00', stock: '0', stockStatus: 'out' },
  { partNumber: 'SP-77235', partName: 'Heavy Duty Clutch Plate 380mm', category: 'Transmission & Clutch', brand: 'Valeo', hsnCode: '870893', gstPercent: '28%', purchasePrice: '₹3,400.00', salePrice: '₹5,200.00', stock: '11', stockStatus: 'low' },
  { partNumber: 'SP-88346', partName: 'Front Wheel Hub Bearing', category: 'Suspension & Steering', brand: 'SKF', hsnCode: '848210', gstPercent: '18%', purchasePrice: '₹1,250.00', salePrice: '₹1,950.00', stock: '0', stockStatus: 'out' },
  { partNumber: 'SP-99457', partName: 'Halogen Headlight Bulb H4 12V', category: 'Electrical', brand: 'Philips', hsnCode: '853921', gstPercent: '18%', purchasePrice: '₹95.00', salePrice: '₹160.00', stock: '150', stockStatus: 'normal' },
  { partNumber: 'SP-10568', partName: 'Hydraulic Steering Fluid 1L', category: 'Lubricants & Fluids', brand: 'Mobil', hsnCode: '271019', gstPercent: '18%', purchasePrice: '₹280.00', salePrice: '₹420.00', stock: '65', stockStatus: 'normal' },
  { partNumber: 'SP-11679', partName: 'Radiator Coolant Premix Green', category: 'Lubricants & Fluids', brand: 'Eicher Genuine', hsnCode: '382000', gstPercent: '18%', purchasePrice: '₹210.00', salePrice: '₹340.00', stock: '3', stockStatus: 'low' },
  { partNumber: 'SP-12780', partName: 'Front Brake Disc Rotor', category: 'Brake System', brand: 'TVS Girling', hsnCode: '870830', gstPercent: '18%', purchasePrice: '₹1,850.00', salePrice: '₹2,800.00', stock: '0', stockStatus: 'out' },
  { partNumber: 'SP-13891', partName: 'Heavy Duty Starter Motor 24V', category: 'Electrical', brand: 'Lucas TVS', hsnCode: '851140', gstPercent: '18%', purchasePrice: '₹3,200.00', salePrice: '₹4,600.00', stock: '5', stockStatus: 'low' },
  { partNumber: 'SP-14902', partName: 'Alternator Belt Heavy Duty', category: 'Consumables', brand: 'Gates', hsnCode: '401031', gstPercent: '18%', purchasePrice: '₹380.00', salePrice: '₹590.00', stock: '45', stockStatus: 'normal' },
  { partNumber: 'SP-15013', partName: 'Fuel Filter Water Separator', category: 'Consumables', brand: 'Fleetguard', hsnCode: '842123', gstPercent: '18%', purchasePrice: '₹420.00', salePrice: '₹650.00', stock: '10', stockStatus: 'low' },
  { partNumber: 'SP-16124', partName: 'Rear Shock Absorber Heavy Duty', category: 'Suspension & Steering', brand: 'Gabriel', hsnCode: '870880', gstPercent: '18%', purchasePrice: '₹1,450.00', salePrice: '₹2,200.00', stock: '18', stockStatus: 'normal' },
  { partNumber: 'SP-17235', partName: 'Wheel Cylinder Assembly', category: 'Brake System', brand: 'TVS Girling', hsnCode: '870830', gstPercent: '18%', purchasePrice: '₹520.00', salePrice: '₹780.00', stock: '7', stockStatus: 'low' },
  { partNumber: 'SP-18346', partName: 'Power Steering Pump Assembly', category: 'Suspension & Steering', brand: 'ZF Lenksysteme', hsnCode: '841360', gstPercent: '18%', purchasePrice: '₹4,100.00', salePrice: '₹5,900.00', stock: '2', stockStatus: 'low' },
  { partNumber: 'SP-19457', partName: 'Turbocharger Hose Pipe', category: 'Engine Components', brand: 'Eicher Genuine', hsnCode: '400931', gstPercent: '18%', purchasePrice: '₹680.00', salePrice: '₹1,050.00', stock: '0', stockStatus: 'out' },
  { partNumber: 'SP-20568', partName: 'Brake Drum Rear Heavy Duty', category: 'Brake System', brand: 'Knorr-Bremse', hsnCode: '870830', gstPercent: '18%', purchasePrice: '₹2,650.00', salePrice: '₹3,900.00', stock: '14', stockStatus: 'normal' }
];

export function getStoredInventory(): PartType[] {
  try {
    const saved = localStorage.getItem('dms_spare_parts_inventory');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return defaultMockParts;
}

export function saveStoredInventory(inventory: PartType[]) {
  try {
    localStorage.setItem('dms_spare_parts_inventory', JSON.stringify(inventory));
    window.dispatchEvent(new Event('dms_inventory_updated'));
  } catch (e) {}
}

export function deductInventoryStock(
  items: Array<{ name: string; code?: string; partNo?: string; qty: number; unitPrice?: number; price?: number }>,
  referenceNo: string,
  sourceType: 'Counter Sales' | 'Service Billing'
) {
  try {
    let inventory = getStoredInventory();
    let updatedTxns: InventoryTxn[] = [];

    try {
      const existingTxns = localStorage.getItem('dms_spare_parts_transactions');
      if (existingTxns) updatedTxns = JSON.parse(existingTxns);
    } catch (e) {}

    let modified = false;

    items.forEach(item => {
      const itemCode = (item.code || item.partNo || '').toLowerCase();
      const itemNameClean = (item.name || '').split('|')[0].trim().toLowerCase();
      const soldQty = Number(item.qty) || 1;

      // Find matching part in inventory by partNumber or partName
      let targetPart = inventory.find(p =>
        (itemCode && p.partNumber.toLowerCase() === itemCode) ||
        (itemNameClean && (
          p.partName.toLowerCase() === itemNameClean ||
          itemNameClean.includes(p.partName.toLowerCase()) ||
          p.partName.toLowerCase().includes(itemNameClean)
        ))
      );

      if (targetPart) {
        const currStock = parseInt(targetPart.stock.replace(/[^0-9]/g, ''), 10) || 0;
        const newStock = Math.max(0, currStock - soldQty);
        targetPart.stock = newStock.toString();
        targetPart.stockStatus = newStock === 0 ? 'out' : newStock < 12 ? 'low' : 'normal';
        modified = true;

        const itemPrice = item.unitPrice || item.price || parseFloat(targetPart.salePrice?.replace(/[^0-9.]/g, '') || '0');
        updatedTxns.unshift({
          id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          partNumber: targetPart.partNumber,
          partName: targetPart.partName,
          type: 'Outward (Sale)',
          quantity: `-${soldQty} Units`,
          reference: `${sourceType} #${referenceNo}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          amount: `₹${(soldQty * itemPrice).toFixed(2)}`
        });
      } else {
        // If spare part not yet in inventory list, automatically add it with stock deducted!
        const generatedNum = item.code || item.partNo || `SP-${Math.floor(10000 + Math.random() * 90000)}`;
        const cleanName = (item.name || 'Spare Part').split('|')[0].trim();
        const priceVal = item.unitPrice || item.price || 500;
        const initialStock = 20;
        const newStock = Math.max(0, initialStock - soldQty);

        const newCreatedPart: PartType = {
          partNumber: generatedNum,
          partName: cleanName,
          category: 'Consumables',
          brand: 'Eicher Genuine',
          hsnCode: '842123',
          gstPercent: '18%',
          purchasePrice: `₹${(priceVal * 0.7).toFixed(2)}`,
          salePrice: `₹${priceVal.toFixed(2)}`,
          stock: newStock.toString(),
          stockStatus: newStock === 0 ? 'out' : newStock < 12 ? 'low' : 'normal'
        };

        inventory.unshift(newCreatedPart);
        modified = true;

        updatedTxns.unshift({
          id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          partNumber: generatedNum,
          partName: cleanName,
          type: 'Outward (Sale)',
          quantity: `-${soldQty} Units`,
          reference: `${sourceType} #${referenceNo}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          amount: `₹${(soldQty * priceVal).toFixed(2)}`
        });
      }
    });

    if (modified) {
      localStorage.setItem('dms_spare_parts_inventory', JSON.stringify(inventory));
      localStorage.setItem('dms_spare_parts_transactions', JSON.stringify(updatedTxns));
      window.dispatchEvent(new Event('dms_inventory_updated'));
    }
  } catch (err) {
    console.error('Error deducting inventory stock:', err);
  }
}

export function addInventoryStockFromPurchase(
  items: Array<{ productName: string; qty: number; rate: number; gstPercent: number; partNumber?: string }>,
  poReferenceNo: string
) {
  try {
    let inventory = getStoredInventory();
    let updatedTxns: InventoryTxn[] = [];

    try {
      const existingTxns = localStorage.getItem('dms_spare_parts_transactions');
      if (existingTxns) updatedTxns = JSON.parse(existingTxns);
    } catch (e) {}

    let modified = false;

    items.forEach(item => {
      if (!item.productName || !item.productName.trim()) return;
      const itemNameClean = item.productName.trim().toLowerCase();
      const addedQty = Math.max(1, Number(item.qty) || 1);
      const purchaseRate = Number(item.rate) || 0;
      const gstVal = Number(item.gstPercent) || 18;

      let targetPart = inventory.find(p =>
        (item.partNumber && p.partNumber.toLowerCase() === item.partNumber.toLowerCase()) ||
        p.partName.toLowerCase() === itemNameClean ||
        itemNameClean.includes(p.partName.toLowerCase()) ||
        p.partName.toLowerCase().includes(itemNameClean)
      );

      if (targetPart) {
        const currStock = parseInt(targetPart.stock.replace(/[^0-9]/g, ''), 10) || 0;
        const newStock = currStock + addedQty;
        targetPart.stock = newStock.toString();
        targetPart.stockStatus = newStock === 0 ? 'out' : newStock < 12 ? 'low' : 'normal';

        if (purchaseRate > 0) {
          targetPart.purchasePrice = `₹${purchaseRate.toFixed(2)}`;
          const currentSale = parseFloat(targetPart.salePrice?.replace(/[^0-9.]/g, '') || '0');
          if (currentSale < purchaseRate) {
            targetPart.salePrice = `₹${(purchaseRate * 1.3).toFixed(2)}`;
          }
        }
        modified = true;

        updatedTxns.unshift({
          id: `txn-in-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          partNumber: targetPart.partNumber,
          partName: targetPart.partName,
          type: 'Inward (Purchase)',
          quantity: `+${addedQty} Units`,
          reference: `Purchase Order #${poReferenceNo}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          amount: `₹${(addedQty * purchaseRate * (1 + gstVal / 100)).toFixed(2)}`
        });
      } else {
        const generatedNum = item.partNumber || `SP-${Math.floor(10000 + Math.random() * 90000)}`;
        const cleanName = item.productName.trim();
        const salePriceVal = purchaseRate > 0 ? purchaseRate * 1.3 : 500;

        const newCreatedPart: PartType = {
          partNumber: generatedNum,
          partName: cleanName,
          category: 'Consumables',
          brand: 'Eicher Genuine',
          hsnCode: '842123',
          gstPercent: `${gstVal}%`,
          purchasePrice: `₹${purchaseRate.toFixed(2)}`,
          salePrice: `₹${salePriceVal.toFixed(2)}`,
          stock: addedQty.toString(),
          stockStatus: addedQty < 12 ? 'low' : 'normal'
        };

        inventory.unshift(newCreatedPart);
        modified = true;

        updatedTxns.unshift({
          id: `txn-in-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          partNumber: generatedNum,
          partName: cleanName,
          type: 'Inward (Purchase)',
          quantity: `+${addedQty} Units`,
          reference: `Purchase Order #${poReferenceNo}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          amount: `₹${(addedQty * purchaseRate * (1 + gstVal / 100)).toFixed(2)}`
        });
      }
    });

    if (modified) {
      localStorage.setItem('dms_spare_parts_inventory', JSON.stringify(inventory));
      localStorage.setItem('dms_spare_parts_transactions', JSON.stringify(updatedTxns));
      window.dispatchEvent(new Event('dms_inventory_updated'));
    }
  } catch (err) {
    console.error('Error adding purchase stock to inventory:', err);
  }
}
