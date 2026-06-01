import Stock from "../../models/Stock.js";
import OnePort from "../../models/OnePort.js";

export const syncPot1 = async (prescriberId) => {
  const stocks = await Stock.find({ prescriberId });
  const pot1Value = stocks.reduce((sum, s) => sum + s.pot1Value, 0);

  const pot = await OnePort.findOne({ prescriberId });
  if (!pot) return null;

  pot.pot1.stockValueExVat = pot1Value;
  pot.pot1.lastSyncedAt    = new Date();
  await pot.save();
  return pot;
};