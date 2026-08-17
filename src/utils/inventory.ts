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

export interface PendingPurchasedPart {
  id: string;
  poRef: string;
  date: string;
  partName: string;
  partNumber: string;
  qty: number;
  purchasePrice: string;
  salePrice: string;
  gstPercent: string;
  brand?: string;
  category?: string;
}

export function getPendingPurchasedParts(): PendingPurchasedPart[] {
  try {
    const saved = localStorage.getItem('dms_pending_purchased_parts');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function savePendingPurchasedParts(list: PendingPurchasedPart[]) {
  try {
    localStorage.setItem('dms_pending_purchased_parts', JSON.stringify(list));
    window.dispatchEvent(new Event('dms_pending_purchases_updated'));
  } catch (e) {}
}

export function addPendingPurchaseItems(
  items: Array<{ productName: string; qty: number; rate?: number; gstPercent?: number; partNumber?: string }>,
  poReferenceNo: string
) {
  try {
    let pendingList = getPendingPurchasedParts();
    let inventory = getStoredInventory();

    items.forEach(item => {
      if (!item.productName || !item.productName.trim()) return;
      const cleanName = item.productName.trim();
      const addedQty = Math.max(1, Number(item.qty) || 1);
      const generatedNum = item.partNumber || `SP-${Math.floor(10000 + Math.random() * 90000)}`;

      const pendingItem: PendingPurchasedPart = {
        id: `purch-pending-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        poRef: poReferenceNo,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        partName: cleanName,
        partNumber: generatedNum,
        qty: addedQty,
        purchasePrice: '₹0',
        salePrice: '₹0',
        gstPercent: `${item.gstPercent || 18}%`,
        brand: 'Eicher Genuine',
        category: 'Spare Parts'
      };
      pendingList.unshift(pendingItem);

      // Also ensure part is added to spare parts without price (or zero price) if not already present
      let existingPart = inventory.find(p =>
        p.partNumber.toLowerCase() === generatedNum.toLowerCase() ||
        p.partName.toLowerCase() === cleanName.toLowerCase()
      );

      if (!existingPart) {
        inventory.unshift({
          partNumber: generatedNum,
          partName: cleanName,
          category: 'Spare Parts',
          brand: 'Eicher Genuine',
          hsnCode: '842123',
          gstPercent: `${item.gstPercent || 18}%`,
          purchasePrice: '₹0',
          salePrice: '₹0',
          stock: '0',
          stockStatus: 'out'
        });
      }
    });

    localStorage.setItem('dms_spare_parts_inventory', JSON.stringify(inventory));
    savePendingPurchasedParts(pendingList);
    window.dispatchEvent(new Event('dms_inventory_updated'));
  } catch (err) {
    console.error('Error adding pending purchase items:', err);
  }
}

export function approvePendingPurchasedPart(
  pendingId: string,
  purchasePriceVal: number,
  salePriceVal: number,
  gstPercentVal: string = '18%'
) {
  try {
    let pendingList = getPendingPurchasedParts();
    const targetPending = pendingList.find(p => p.id === pendingId);
    if (!targetPending) return;

    let inventory = getStoredInventory();
    let updatedTxns: InventoryTxn[] = [];
    try {
      const existingTxns = localStorage.getItem('dms_spare_parts_transactions');
      if (existingTxns) updatedTxns = JSON.parse(existingTxns);
    } catch (e) {}

    let targetPart = inventory.find(p =>
      p.partNumber.toLowerCase() === targetPending.partNumber.toLowerCase() ||
      p.partName.toLowerCase() === targetPending.partName.toLowerCase()
    );

    const addedQty = targetPending.qty || 1;
    const purPriceStr = `₹${purchasePriceVal.toFixed(2)}`;
    const salePriceStr = `₹${salePriceVal.toFixed(2)}`;

    if (targetPart) {
      const currStock = parseInt(targetPart.stock.replace(/[^0-9]/g, ''), 10) || 0;
      const newStock = currStock + addedQty;
      targetPart.stock = newStock.toString();
      targetPart.purchasePrice = purPriceStr;
      targetPart.salePrice = salePriceStr;
      targetPart.gstPercent = gstPercentVal;
      targetPart.stockStatus = newStock === 0 ? 'out' : newStock < 12 ? 'low' : 'normal';
    } else {
      const newCreatedPart: PartType = {
        partNumber: targetPending.partNumber,
        partName: targetPending.partName,
        category: targetPending.category || 'Spare Parts',
        brand: targetPending.brand || 'Eicher Genuine',
        hsnCode: '842123',
        gstPercent: gstPercentVal,
        purchasePrice: purPriceStr,
        salePrice: salePriceStr,
        stock: addedQty.toString(),
        stockStatus: addedQty < 12 ? 'low' : 'normal'
      };
      inventory.unshift(newCreatedPart);
    }

    updatedTxns.unshift({
      id: `txn-in-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      partNumber: targetPending.partNumber,
      partName: targetPending.partName,
      type: 'Inward (Purchase Approved)',
      quantity: `+${addedQty} Units`,
      reference: `PO #${targetPending.poRef}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: `₹${(addedQty * salePriceVal).toFixed(2)}`
    });

    // Remove from pending list
    pendingList = pendingList.filter(p => p.id !== pendingId);

    localStorage.setItem('dms_spare_parts_inventory', JSON.stringify(inventory));
    localStorage.setItem('dms_spare_parts_transactions', JSON.stringify(updatedTxns));
    savePendingPurchasedParts(pendingList);
    window.dispatchEvent(new Event('dms_inventory_updated'));
  } catch (err) {
    console.error('Error approving pending purchased part:', err);
  }
}
