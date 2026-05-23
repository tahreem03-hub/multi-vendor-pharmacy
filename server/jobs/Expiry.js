import cron from "node-cron";
import Stock from "../models/Stock.js";
import ThreePot from "../models/ThreePort.js";

// ─────────────────────────────────────────────────────────────
// EXPIRY ALERT JOB
// Runs every night at midnight
// 1. Re-checks all stock expiry dates
// 2. Updates expiryAlert flag on each Stock document
// 3. Pushes unread alerts into the prescriber's ThreePot alerts
// ─────────────────────────────────────────────────────────────

const runExpiryCheck = async () => {
  console.log("[ExpiryJob] Running expiry check...", new Date().toISOString());

  try {
    const allStock = await Stock.find({ quantityAvailable: { $gt: 0 } });
    let flagged60 = 0;
    let flagged30 = 0;
    let expired   = 0;

    for (const stock of allStock) {
      const previousAlert = stock.expiryAlert;

      // Saving triggers the pre-save hook which recalculates expiryAlert
      await stock.save();

      const newAlert = stock.expiryAlert;

      // Only push a ThreePot alert if the flag changed (avoid duplicate alerts)
      if (newAlert !== "none" && newAlert !== previousAlert) {
        const pot = await ThreePot.findOne({ prescriberId: stock.prescriberId });
        if (pot) {
          // Check if an unread alert for this stock already exists
          const alreadyAlerted = pot.alerts.some(
            (a) =>
              !a.isRead &&
              a.message.includes(stock.productName) &&
              a.type === "expiry"
          );

          if (!alreadyAlerted) {
            const daysLeft = Math.ceil(
              (stock.expiryDate - Date.now()) / (1000 * 60 * 60 * 24)
            );

            const message =
              newAlert === "expired"
                ? `EXPIRED: ${stock.productName} (Batch: ${stock.batchNumber || "N/A"}) expired on ${stock.expiryDate.toDateString()}`
                : `Expiry warning: ${stock.productName} (Batch: ${stock.batchNumber || "N/A"}) expires in ${daysLeft} days on ${stock.expiryDate.toDateString()}`;

            pot.alerts.push({ type: "expiry", message });
            await pot.save();
          }
        }

        if (newAlert === "expired")  expired++;
        if (newAlert === "30_days")  flagged30++;
        if (newAlert === "60_days")  flagged60++;
      }
    }

    console.log(
      `[ExpiryJob] Done. Expired: ${expired}, 30-day: ${flagged30}, 60-day: ${flagged60}`
    );
  } catch (err) {
    console.error("[ExpiryJob] Error:", err.message);
  }
};

// ─────────────────────────────────────────────────────────────
// LOW STOCK CHECK
// Also runs nightly — pushes low stock alerts into ThreePot
// ─────────────────────────────────────────────────────────────
const runLowStockCheck = async () => {
  console.log("[LowStockJob] Running low stock check...");

  try {
    const lowStock = await Stock.find({ isLowStock: true });

    for (const stock of lowStock) {
      const pot = await ThreePot.findOne({ prescriberId: stock.prescriberId });
      if (!pot) continue;

      const alreadyAlerted = pot.alerts.some(
        (a) =>
          !a.isRead &&
          a.message.includes(stock.productName) &&
          a.type === "low_stock"
      );

      if (!alreadyAlerted) {
        pot.alerts.push({
          type:    "low_stock",
          message: `Low stock: ${stock.productName} has only ${stock.quantityAvailable} units remaining (threshold: ${stock.lowStockThreshold})`,
        });
        await pot.save();
      }
    }

    console.log(`[LowStockJob] Done. ${lowStock.length} low stock items checked.`);
  } catch (err) {
    console.error("[LowStockJob] Error:", err.message);
  }
};

// ─────────────────────────────────────────────────────────────
// SCHEDULE
// Runs every night at 00:00 server time
// ─────────────────────────────────────────────────────────────
export const startJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    await runExpiryCheck();
    await runLowStockCheck();
  });

  console.log("[Jobs] Nightly expiry + low stock jobs scheduled (00:00 daily)");
};