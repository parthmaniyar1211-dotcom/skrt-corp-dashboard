const Invoice = require('./model');
const SummaryRegister = require('../summary/model');
const DeliveryStatement = require('../delivery-statement/model');
const Client = require('../clients/model');
const sendResponse = require('../../utils/response');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('shipment')
      .populate('client');
    return sendResponse(res, 200, true, 'Invoices fetched successfully', invoices);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private/Operator
exports.createInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.create(req.body);
    return sendResponse(res, 201, true, 'Invoice created successfully', invoice);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

// @desc    Get Summary invoice data filtered by date range
// @route   GET /api/invoices/summary-bill?startDate=&endDate=&transportName=
// @access  Private
exports.getSummaryBill = async (req, res) => {
  try {
    const { startDate, endDate, transportName } = req.query;

    let summaries = await SummaryRegister.find().sort({ date: 1 }).lean();

    // Filter by date range
    if (startDate || endDate) {
      summaries = summaries.filter(reg => {
        const d = reg.date || '';
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
      });
    }

    // Build grouped data
    const rows = [];
    let totalCredit = 0;
    let totalDebit = 0;

    for (const reg of summaries) {
      for (const entry of (reg.entries || [])) {
        // Filter by transportName if provided
        if (transportName && transportName !== 'all' &&
            (entry.transportName || '').toLowerCase() !== transportName.toLowerCase()) {
          continue;
        }

        const credit = parseFloat(entry.credit) || 0;
        const debit = parseFloat(entry.debit) || 0;
        totalCredit += credit;
        totalDebit += debit;

        rows.push({
          date: reg.date,
          summaryNo: entry.sno,
          transportName: entry.transportName,
          driverName: entry.driverName,
          challanNo: entry.challanNo,
          credit,
          debit,
          note: entry.note,
          registerId: reg._id
        });
      }
    }

    return sendResponse(res, 200, true, 'Summary bill fetched', {
      rows,
      totalCredit,
      totalDebit,
      netBalance: totalCredit - totalDebit
    });
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get Delivery Statement invoice data filtered by date range
// @route   GET /api/invoices/ds-bill?startDate=&endDate=
// @access  Private
exports.getDsBill = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let statements = await DeliveryStatement.find().sort({ dateSearch: 1 }).lean();

    // Filter by date range
    if (startDate || endDate) {
      statements = statements.filter(reg => {
        const d = reg.dateSearch || '';
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
      });
    }

    const rows = [];
    let totalFreight = 0;
    let totalLabour = 0;
    let totalStationery = 0;
    let totalCommission = 0;
    let totalAoc = 0;
    let grandTotal = 0;

    for (const reg of statements) {
      for (const entry of (reg.entries || [])) {
        const freight = parseFloat(entry.freight) || 0;
        const labour = parseFloat(entry.labour) || 0;
        const stationery = parseFloat(entry.receiptCh) || 0;
        const commission = parseFloat(entry.dCom) || 0;
        const aoc = parseFloat(entry.demurage) || 0;
        const total = freight + labour + stationery + commission + aoc;

        totalFreight += freight;
        totalLabour += labour;
        totalStationery += stationery;
        totalCommission += commission;
        totalAoc += aoc;
        grandTotal += total;

        rows.push({
          date: reg.dateSearch,
          pageNo: reg.pageNo,
          drNo: entry.drNo,
          freight,
          labour,
          stationery,
          commission,
          aoc,
          total,
          registerId: reg._id
        });
      }
    }

    const totalCredit = totalFreight; // Freight is credit side
    const totalDebit = totalLabour + totalStationery + totalCommission + totalAoc;
    const netAmount = totalCredit - totalDebit;

    return sendResponse(res, 200, true, 'DS bill fetched', {
      rows,
      totals: {
        freight: totalFreight,
        labour: totalLabour,
        stationery: totalStationery,
        commission: totalCommission,
        aoc: totalAoc,
        grandTotal
      },
      totalCredit,
      totalDebit,
      netAmount
    });
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get Combined bill (Summary + DS) for a date range
// @route   GET /api/invoices/combined-bill?startDate=&endDate=&transportName=
// @access  Private
exports.getCombinedBill = async (req, res) => {
  try {
    const { startDate, endDate, transportName } = req.query;

    // Fetch summary data
    let summaries = await SummaryRegister.find().sort({ date: 1 }).lean();
    if (startDate || endDate) {
      summaries = summaries.filter(reg => {
        const d = reg.date || '';
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
      });
    }

    let summaryCredit = 0;
    let summaryDebit = 0;
    const summaryRows = [];

    for (const reg of summaries) {
      for (const entry of (reg.entries || [])) {
        if (transportName && transportName !== 'all' &&
            (entry.transportName || '').toLowerCase() !== transportName.toLowerCase()) {
          continue;
        }
        const credit = parseFloat(entry.credit) || 0;
        const debit = parseFloat(entry.debit) || 0;
        summaryCredit += credit;
        summaryDebit += debit;
        summaryRows.push({
          date: reg.date,
          summaryNo: entry.sno,
          transportName: entry.transportName,
          driverName: entry.driverName,
          challanNo: entry.challanNo,
          credit,
          debit,
          note: entry.note
        });
      }
    }

    // Fetch DS data
    let statements = await DeliveryStatement.find().sort({ dateSearch: 1 }).lean();
    if (startDate || endDate) {
      statements = statements.filter(reg => {
        const d = reg.dateSearch || '';
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
      });
    }

    let dsFreight = 0;
    let dsLabour = 0;
    let dsStationery = 0;
    let dsCommission = 0;
    let dsAoc = 0;
    const dsRows = [];

    for (const reg of statements) {
      for (const entry of (reg.entries || [])) {
        const freight = parseFloat(entry.freight) || 0;
        const labour = parseFloat(entry.labour) || 0;
        const stationery = parseFloat(entry.receiptCh) || 0;
        const commission = parseFloat(entry.dCom) || 0;
        const aoc = parseFloat(entry.demurage) || 0;
        const total = freight + labour + stationery + commission + aoc;

        dsFreight += freight;
        dsLabour += labour;
        dsStationery += stationery;
        dsCommission += commission;
        dsAoc += aoc;

        dsRows.push({
          date: reg.dateSearch,
          pageNo: reg.pageNo,
          drNo: entry.drNo,
          freight,
          labour,
          stationery,
          commission,
          aoc,
          total
        });
      }
    }

    const summaryNet = summaryCredit - summaryDebit;
    const dsTotalCredit = dsFreight;
    const dsTotalDebit = dsLabour + dsStationery + dsCommission + dsAoc;
    const dsNet = dsTotalCredit - dsTotalDebit;
    const grandTotal = summaryNet + dsNet;

    return sendResponse(res, 200, true, 'Combined bill fetched', {
      summary: {
        rows: summaryRows,
        totalCredit: summaryCredit,
        totalDebit: summaryDebit,
        netBalance: summaryNet
      },
      deliveryStatement: {
        rows: dsRows,
        totals: { freight: dsFreight, labour: dsLabour, stationery: dsStationery, commission: dsCommission, aoc: dsAoc },
        totalCredit: dsTotalCredit,
        totalDebit: dsTotalDebit,
        netAmount: dsNet
      },
      grandTotal,
      startDate,
      endDate,
      transportName: transportName || 'All'
    });
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};
