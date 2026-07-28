import mongoose from "mongoose";
import Order from "../models/Order.js";
import Medicine from "../models/medicines.js";
import Stock from "../models/Stock.js";
import OnePort from "../models/OnePort.js";
import Prescription from "../models/Prescription.js";
import { syncPot1 } from "./helpers/syncPot1.js";

const CONFIG = {
  PACKAGING_COST_EX_VAT: 2.50,
  DELIVERY_COST_EX_VAT:  5.00,
  PAYMENT_FEE_RATE:      0.015,
  VAT_RATE_STANDARD:     0.20,
  VAT_RATE_POM:          0.00,
};

const calculateCommission = (revenueExVat, cogsExVat, totalIncVat) => {
  const packaging  = CONFIG.PACKAGING_COST_EX_VAT;
  const delivery   = CONFIG.DELIVERY_COST_EX_VAT;
  const paymentFee = parseFloat((totalIncVat * CONFIG.PAYMENT_FEE_RATE).toFixed(2));
  const commission = parseFloat(
    Math.max(0, revenueExVat - cogsExVat - packaging - delivery - paymentFee).toFixed(2)
  );
  return { packaging, delivery, paymentFee, commission };
};

// ─────────────────────────────────────────────────────────────
// POST /api/prescriptions/issue
// Prescriber only — creates Prescription + Order together
// ─────────────────────────────────────────────────────────────
export const issuePrescription = async (req, res) => {
  try {
    // ── 1. Access control ──────────────────────────────────────
    if (req.user.role !== "prescriber") {
      return res.status(403).json({
        message: "Only verified prescribers can issue prescriptions directly.",
      });
    }

    const prescriber = req.user;

    const {
      patientDetails,
      medications,
      items,
      clinicalNotes,
      fulfillmentMethod,
      prescriptionValidity,
      deliveryAddress,
      deliveryMethod,
      paymentMethod,
      saveAsDraft,        // true = draft, false = issue & order
    } = req.body;

    // ── 2. Validation ──────────────────────────────────────────
    if (!patientDetails?.firstName || !patientDetails?.lastName) {
      return res.status(400).json({ message: "Patient details are required." });
    }
    if (!medications || medications.length === 0) {
      return res.status(400).json({ message: "Add at least one medication." });
    }

    // ── 3. Fetch medicine docs ─────────────────────────────────
    const medicineDocs = await Medicine.find({ _id: { $in: medications } });

    // ── 4. Cold chain guard ────────────────────────────────────
    const requiresColdChain = medicineDocs.some(m =>
      m.category === "Botulinum Toxins" || m.category === "Injectables"
    );
    if (requiresColdChain && !saveAsDraft && deliveryMethod !== "Cold-Chain Express") {
      return res.status(400).json({
        message: "Botulinum toxins & GLP-1 items require Cold-Chain Express delivery.",
      });
    }

    // ── 5. If saveAsDraft — just save prescription, no order ──
    if (saveAsDraft) {
      const draft = await Prescription.create({
        user:                prescriber._id,
        patientDetails,
        prescriber:          prescriber._id,
        prescriberId:        prescriber.prescriberId,
        medications,
        status:              "pending",
        method:              "direct",
        fulfillmentMethod:   fulfillmentMethod || "Ship to patient",
        prescriptionValidity: prescriptionValidity || "28 days",
        pharmacistNote:      clinicalNotes || "",
      });

      return res.status(201).json({
        message: "Prescription saved as draft.",
        prescriptionId: draft._id,
      });
    }

    // ── 6. Issue & Order — build order items ──────────────────
    const orderItemsList = items || medications.map(id => ({ medicineId: id, quantity: 1 }));

    let revenueExVat = 0;
    let cogsExVat    = 0;
    let outputVat    = 0;
    let inputVat     = 0;
    const orderItems   = [];
    const stockUpdates = [];

    for (const item of orderItemsList) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) {
        return res.status(404).json({ message: `Medicine not found: ${item.medicineId}` });
      }

      // Stock check — prescriber specific first, then general
      let stockEntry    = null;
      let isGeneralStock = false;

      if (prescriber.prescriberId) {
        stockEntry = await Stock.findOne({
          product:           new mongoose.Types.ObjectId(item.medicineId),
          prescriberId:      prescriber.prescriberId,
          quantityAvailable: { $gte: item.quantity },
        });
      }

      if (!stockEntry) {
        if (medicine.stock >= item.quantity) {
          isGeneralStock = true;
        } else {
          return res.status(400).json({ message: `Insufficient stock for: ${medicine.name}` });
        }
      }

      const isPOM         = medicine.prescriptionRequired;
      const vatRate       = isPOM ? CONFIG.VAT_RATE_POM : CONFIG.VAT_RATE_STANDARD;
      const lineRevExVat  = medicine.sellingPrice * item.quantity;
      const lineCostExVat = medicine.buyingPrice  * item.quantity;

      revenueExVat += lineRevExVat;
      cogsExVat    += lineCostExVat;
      outputVat    += lineRevExVat  * vatRate;
      inputVat     += lineCostExVat * CONFIG.VAT_RATE_STANDARD;

      orderItems.push({
        product:          medicine._id,
        productName:      medicine.name,
        quantity:         item.quantity,
        isPOM,
        unitCostExVat:    medicine.buyingPrice,
        unitRevenueExVat: medicine.sellingPrice,
        vatRate,
      });

      stockUpdates.push(
        isGeneralStock
          ? { medicineId: medicine._id, quantity: item.quantity, isGeneral: true }
          : { stockEntry, quantity: item.quantity, isGeneral: false }
      );
    }

    // ── 7. Financial calculations ──────────────────────────────
    const totalIncVat = parseFloat((revenueExVat + outputVat).toFixed(2));
    const { packaging, delivery, paymentFee, commission } =
      calculateCommission(revenueExVat, cogsExVat, totalIncVat);

    const vatPositionImpact   = parseFloat((inputVat - outputVat).toFixed(2));
    const immediateCashImpact = parseFloat((totalIncVat - paymentFee - packaging - delivery).toFixed(2));
    const trueProfitImpact    = parseFloat((immediateCashImpact + vatPositionImpact).toFixed(2));

    // ── 8. Create Order ────────────────────────────────────────
    const order = await Order.create({
      customer:     prescriber._id,
      prescriber:   prescriber._id,
      prescriberId: prescriber.prescriberId,
      items:        orderItems,
      deliveryMethod:  deliveryMethod  || "Standard",
      paymentMethod:   paymentMethod   || "Card",
      deliveryAddress: deliveryAddress || {},
      financials: {
        revenueExVat,
        cogsExVat,
        packagingCostExVat:  packaging,
        deliveryCostExVat:   delivery,
        paymentFee,
        commissionExVat:     commission,
        outputVat:           parseFloat(outputVat.toFixed(2)),
        inputVat:            parseFloat(inputVat.toFixed(2)),
        vatPositionImpact,
        immediateCashImpact,
        trueProfitImpact,
      },
      status: "verified", // no Rx-pending — prescriber already issued
    });

    // ── 9. Create Prescription ─────────────────────────────────
    const prescription = await Prescription.create({
      user:                prescriber._id,
      patientDetails,
      prescriber:          prescriber._id,
      prescriberId:        prescriber.prescriberId,
      medications,
      status:              "issued",
      method:              "direct",
      fulfillmentMethod:   fulfillmentMethod   || "Ship to patient",
      prescriptionValidity: prescriptionValidity || "28 days",
      order:               order._id,
      pharmacistNote:      clinicalNotes || "",
    });

    // Link prescription to order
    order.prescription = prescription._id;
    await order.save();

    // ── 10. Deduct stock ───────────────────────────────────────
    for (const update of stockUpdates) {
      if (update.isGeneral) {
        await Medicine.findByIdAndUpdate(update.medicineId, {
          $inc: { stock: -update.quantity },
        });
      } else {
        update.stockEntry.quantityAvailable -= update.quantity;
        await update.stockEntry.save();
      }
    }

    // ── 11. Pot sync ───────────────────────────────────────────
    let pot = await OnePort.findOne({ prescriberId: prescriber.prescriberId });
    if (!pot) {
      pot = await OnePort.create({
        prescriber:   prescriber._id,
        prescriberId: prescriber.prescriberId,
      });
    }

    const pot1Before = pot.stockValue || 0;
    await syncPot1(prescriber.prescriberId);
    const freshPot = await OnePort.findOne({ prescriberId: prescriber.prescriberId });

    order.potSnapshot = {
      pot1StockBefore: pot1Before,
      pot1StockAfter:  freshPot?.stockValue    || 0,
      pot2Deposit:     freshPot?.cashBalance   || 0,
      pot3Running:     (freshPot?.earnedProfit || 0) + commission,
    };
    await order.save();

    // ── 12. Ledger entries ─────────────────────────────────────
    if (freshPot) {
      freshPot.addLedgerEntry({
        type: "PATIENT_PAYMENT_RECEIVED", orderId: order._id,
        amount: totalIncVat, vatAmount: outputVat, cashDelta: totalIncVat,
        description: `Order #${order.orderReference} — payment received`,
      });
      freshPot.addLedgerEntry({
        type: "CARD_FEE_DEDUCTED", orderId: order._id,
        amount: paymentFee, cashDelta: -paymentFee,
        description: `Order #${order.orderReference} — payment fee`,
      });
      freshPot.addLedgerEntry({
        type: "STOCK_ALLOCATED_TO_ORDER", orderId: order._id,
        amount: cogsExVat, stockDelta: -cogsExVat,
        description: `Order #${order.orderReference} — stock allocated`,
      });
      freshPot.addLedgerEntry({
        type: "PACKAGING_REIMBURSEMENT", orderId: order._id,
        amount: packaging, cashDelta: -packaging,
        description: `Order #${order.orderReference} — packaging`,
      });
      freshPot.addLedgerEntry({
        type: "DELIVERY_REIMBURSEMENT", orderId: order._id,
        amount: delivery, cashDelta: -delivery,
        description: `Order #${order.orderReference} — delivery`,
      });
      if (outputVat > 0) {
        freshPot.addLedgerEntry({
          type: "VAT_OUTPUT_RECORDED", orderId: order._id,
          amount: outputVat, vatAmount: outputVat,
          vatPositionDelta: -outputVat, restrictedDelta: outputVat,
          description: `Order #${order.orderReference} — output VAT`,
        });
      }
      if (inputVat > 0) {
        freshPot.addLedgerEntry({
          type: "VAT_INPUT_RECORDED", orderId: order._id,
          amount: inputVat, vatAmount: inputVat,
          vatPositionDelta: inputVat,
          description: `Order #${order.orderReference} — input VAT reclaimable`,
        });
      }
      if (commission > 0) {
        freshPot.addLedgerEntry({
          type: "COMMISSION_EARNED", orderId: order._id,
          amount: commission, profitDelta: commission,
          description: `Order #${order.orderReference} — commission earned`,
        });
      }
      await freshPot.save();
    }

    // ── 13. Response ───────────────────────────────────────────
    res.status(201).json({
      message:        "Prescription issued and order created successfully.",
      prescriptionId: prescription._id,
      orderId:        order._id,
      orderReference: order.orderReference,
      financialSummary: {
        revenueExVat:        revenueExVat.toFixed(2),
        commission:          commission.toFixed(2),
        vatPositionImpact:   vatPositionImpact.toFixed(2),
        immediateCashImpact: immediateCashImpact.toFixed(2),
        trueProfitImpact:    trueProfitImpact.toFixed(2),
        totalIncVat:         totalIncVat.toFixed(2),
      },
    });

  } catch (err) {
    console.error("❌ issuePrescription error:", err);
    res.status(500).json({ message: err.message });
  }
};