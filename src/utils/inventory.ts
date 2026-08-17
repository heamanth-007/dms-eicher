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

export const defaultMockParts: PartType[] = [];

export function getStoredInventory(): PartType[] {
  try {
    const saved = localStorage.getItem('dms_spare_parts_inventory');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
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
