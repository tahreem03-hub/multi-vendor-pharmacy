// controllers/helpers/syncPot1.js
import OnePot from "../../models/OnePort.js";
import Stock from "../../models/Stock.js";

export const syncPot1 = async (prescriberId) => {
  // Sum all available stock for this prescriber
  const stocks = await Stock.find({
    prescriberId,
    quantityAvailable: { $gt: 0 },
  });

  const totalStockValue = stocks.reduce((sum, s) => {
    return sum + (s.quantityAvailable * (s.costPriceExVat || 0));
  }, 0);

  const pot = await OnePot.findOne({ prescriberId });
  if (!pot) return null;

  // Record ledger entry only if value changed
  const delta = totalStockValue - pot.stockValue;
  if (delta !== 0) {
    pot.addLedgerEntry({
      type: "STOCK_PURCHASE",
      amount: Math.abs(delta),
      stockDelta: delta,
      description: `Stock sync — ${delta > 0 ? 'stock increased' : 'stock decreased'} by £${Math.abs(delta).toFixed(2)}`,
    });
  }

  pot.stockValue = totalStockValue;
  pot.lastSyncedAt = new Date();
  await pot.save();

  return pot;
};