const Challan = require('../challan/model');
const EntryRegister = require('../entry/model');
const CashMemo = require('../cash-memo/model');
const SummaryRegister = require('../summary/model');
const DeliveryStatement = require('../delivery-statement/model');
const Shipment = require('../shipments/model');
const Invoice = require('../invoices/model');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const fmtNum = (n) => {
  const parsed = parseFloat(n) || 0;
  return parsed.toFixed(2);
};

// Build HTML for each record type
function buildChallanHtml(record) {
  const rows = (record.entries || []).map(e => `
    <tr>
      <td>${e.grNo || '—'}</td>
      <td>${e.pkg || '—'}</td>
      <td>${e.dest || '—'}</td>
      <td>${e.content || '—'}</td>
      <td>${e.consignor || '—'}</td>
      <td>${e.consignee || '—'}</td>
      <td style="text-align:right">${e.total || '—'}</td>
      <td style="text-align:right">${e.wt || '—'}</td>
    </tr>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Challan ${record.challanNo}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 30px; color: #111; }
    h1 { text-align: center; font-size: 22px; text-transform: uppercase; color: #1a3a6b; }
    h2 { text-align: center; font-size: 16px; margin: 4px 0; }
    .meta { display: flex; justify-content: space-between; margin: 18px 0 10px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; }
    th { background: #e8ecf0; font-weight: bold; text-transform: uppercase; }
    .totals { margin-top: 16px; font-size: 13px; }
    .totals div { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dotted #ccc; }
    .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; }
  </style></head><body>
  <h1>Sant Kanwar Ram Transport Corporation</h1>
  <h2>Bhilwara (Raj.) — Challan</h2>
  <div class="meta">
    <div><strong>Challan No:</strong> ${record.challanNo || '—'}</div>
    <div><strong>Date:</strong> ${record.date || '—'}</div>
    <div><strong>Vehicle No:</strong> ${record.vehicleNo || '—'}</div>
    <div><strong>Driver:</strong> ${record.driverName || '—'}</div>
  </div>
  <table>
    <thead><tr><th>G.R. No.</th><th>Pkg</th><th>Destination</th><th>Content</th><th>Consignor</th><th>Consignee</th><th>Total</th><th>Wt.</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div><span>Truck Freight:</span><span>₹ ${record.truckFreight || '0'}</span></div>
    <div><span>Commission:</span><span>₹ ${record.commission || '0'}</span></div>
    <div><span>Labour:</span><span>₹ ${record.labour || '0'}</span></div>
    <div><span>Advance:</span><span>₹ ${record.advance || '0'}</span></div>
    <div><span><strong>Total to Pay:</strong></span><span><strong>₹ ${record.totalToPay || '0'}</strong></span></div>
  </div>
  <div class="footer">
    <div>Driver Signature: _________________</div>
    <div>For Sant Kanwar Ram Transport Corp.</div>
  </div>
  </body></html>`;
}

function buildCashMemoHtml(record) {
  const total = (parseFloat(record.freight) || 0) + (parseFloat(record.freightPaise || 0) / 100)
    + (parseFloat(record.labour) || 0) + (parseFloat(record.labourPaise || 0) / 100)
    + (parseFloat(record.stationery) || 0) + (parseFloat(record.stationeryPaise || 0) / 100)
    + (parseFloat(record.commission) || 0) + (parseFloat(record.commissionPaise || 0) / 100)
    + (parseFloat(record.aoc) || 0) + (parseFloat(record.aocPaise || 0) / 100);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Cash Memo ${record.drNo}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 30px; color: #111; max-width: 500px; margin: auto; }
    h1 { text-align: center; font-size: 20px; text-transform: uppercase; color: #1a3a6b; }
    h2 { text-align: center; font-size: 14px; margin: 4px 0; }
    .field { display: flex; align-items: center; padding: 5px 0; border-bottom: 1px dotted #ccc; font-size: 13px; }
    .label { font-weight: bold; min-width: 130px; color: #444; }
    .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; margin-top: 20px; padding-top: 10px; border-top: 2px solid #1a3a6b; }
  </style></head><body>
  <h1>Sant Kanwar Ram Transport Corporation</h1>
  <h2>Cash Memo (Delivery Receipt)</h2>
  <div class="field"><span class="label">D.R. No.:</span><span>${record.drNo || '—'}</span></div>
  <div class="field"><span class="label">G.R. No.:</span><span>${record.grNo || '—'}</span></div>
  <div class="field"><span class="label">Date:</span><span>${fmtDate(record.date)}</span></div>
  <div class="field"><span class="label">From:</span><span>${record.from || '—'}</span></div>
  <div class="field"><span class="label">Consignee:</span><span>${record.consignee || '—'}</span></div>
  <div class="field"><span class="label">Through:</span><span>${record.through || '—'}</span></div>
  <div class="field"><span class="label">Freight:</span><span>₹ ${fmtNum(record.freight)}</span></div>
  <div class="field"><span class="label">Labour:</span><span>₹ ${fmtNum(record.labour)}</span></div>
  <div class="field"><span class="label">Stationery:</span><span>₹ ${fmtNum(record.stationery)}</span></div>
  <div class="field"><span class="label">Commission:</span><span>₹ ${fmtNum(record.commission)}</span></div>
  <div class="field"><span class="label">A.O.C.:</span><span>₹ ${fmtNum(record.aoc)}</span></div>
  <div class="total-row"><span>TOTAL AMOUNT:</span><span>₹ ${total.toFixed(2)}</span></div>
  </body></html>`;
}

function buildSummaryHtml(record) {
  const rows = (record.entries || []).map(e => `
    <tr>
      <td>${e.sno || '—'}</td>
      <td>${e.truckNo || '—'}</td>
      <td>${e.driverName || '—'}</td>
      <td>${e.transportName || '—'}</td>
      <td>${e.challanNo || '—'}</td>
      <td style="text-align:right">₹ ${fmtNum(e.credit)}</td>
      <td style="text-align:right">₹ ${fmtNum(e.debit)}</td>
      <td>${e.note || '—'}</td>
    </tr>`).join('');

  const totalCredit = (record.entries || []).reduce((a, e) => a + (parseFloat(e.credit) || 0), 0);
  const totalDebit = (record.entries || []).reduce((a, e) => a + (parseFloat(e.debit) || 0), 0);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Summary ${record.date}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 30px; color: #111; }
    h1 { text-align: center; font-size: 20px; text-transform: uppercase; color: #1a3a6b; }
    h2 { text-align: center; font-size: 14px; margin: 4px 0; }
    .meta { margin: 14px 0 8px; font-size: 13px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; }
    th { background: #e8ecf0; font-weight: bold; text-transform: uppercase; }
    .totals-row td { background: #f5f5f5; font-weight: bold; }
  </style></head><body>
  <h1>Sant Kanwar Ram Transport Corporation</h1>
  <h2>Summary Register</h2>
  <div class="meta">Date: ${record.date || '—'}</div>
  <table>
    <thead><tr><th>S.No.</th><th>Truck No.</th><th>Driver</th><th>Transport</th><th>Challan No.</th><th>Credit</th><th>Debit</th><th>Note</th></tr></thead>
    <tbody>${rows}
      <tr class="totals-row">
        <td colspan="5" style="text-align:right">TOTALS:</td>
        <td style="text-align:right">₹ ${totalCredit.toFixed(2)}</td>
        <td style="text-align:right">₹ ${totalDebit.toFixed(2)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>
  <div style="margin-top:16px;font-size:14px;font-weight:bold;text-align:right">
    Net Balance: ₹ ${(totalCredit - totalDebit).toFixed(2)}
  </div>
  </body></html>`;
}

function buildDeliveryStatementHtml(record) {
  const val = (s) => parseFloat(s) || 0;
  const total = (r) => val(r.freight) + val(r.labour) + val(r.receiptCh) + val(r.dCom) + val(r.demurage);

  const rows = (record.entries || []).map(e => `
    <tr>
      <td>${e.sno || '—'}</td>
      <td>${e.drNo || '—'}</td>
      <td style="text-align:right">${e.freight || '—'}</td>
      <td style="text-align:right">${e.labour || '—'}</td>
      <td style="text-align:right">${e.receiptCh || '—'}</td>
      <td style="text-align:right">${e.dCom || '—'}</td>
      <td style="text-align:right">${e.demurage || '—'}</td>
      <td style="text-align:right">${total(e).toFixed(2)}</td>
    </tr>`).join('');

  const totals = record.totals || {};

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Delivery Statement Page ${record.pageNo}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 30px; color: #111; }
    h1 { text-align: center; font-size: 20px; text-transform: uppercase; color: #1a3a6b; }
    h2 { text-align: center; font-size: 14px; margin: 4px 0; }
    .meta { display: flex; justify-content: space-between; margin: 14px 0 8px; font-size: 13px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; }
    th { background: #e8ecf0; font-weight: bold; text-transform: uppercase; }
    .totals-row td { background: #f5f5f5; font-weight: bold; }
  </style></head><body>
  <h1>Sant Kanwar Ram Transport Corporation</h1>
  <h2>Delivery Statement</h2>
  <div class="meta"><span>Date: ${record.dateSearch || '—'}</span><span>Page No.: ${record.pageNo || '—'}</span></div>
  <table>
    <thead><tr><th>S.No.</th><th>D.R. No.</th><th>Freight</th><th>Labour</th><th>Stationery</th><th>Commission</th><th>A.O.C.</th><th>Total</th></tr></thead>
    <tbody>${rows}
      <tr class="totals-row">
        <td colspan="2" style="text-align:right">TOTALS:</td>
        <td style="text-align:right">${(totals.freight || 0).toFixed(2)}</td>
        <td style="text-align:right">${(totals.labour || 0).toFixed(2)}</td>
        <td style="text-align:right">${(totals.receiptCh || 0).toFixed(2)}</td>
        <td style="text-align:right">${(totals.dCom || 0).toFixed(2)}</td>
        <td style="text-align:right">${(totals.demurage || 0).toFixed(2)}</td>
        <td style="text-align:right">${(totals.total || 0).toFixed(2)}</td>
      </tr>
    </tbody>
  </table>
  </body></html>`;
}

function buildShipmentHtml(record) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Shipment ${record.consignmentNumber || record._id}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 30px; color: #111; max-width: 600px; margin: auto; }
    h1 { text-align: center; font-size: 20px; text-transform: uppercase; color: #1a3a6b; }
    .field { display: flex; padding: 5px 0; border-bottom: 1px dotted #ccc; font-size: 13px; }
    .label { font-weight: bold; min-width: 160px; color: #444; }
    .status { display: inline-block; padding: 3px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; background: #e8ecf0; }
  </style></head><body>
  <h1>Sant Kanwar Ram Transport Corporation</h1>
  <h2 style="text-align:center;font-size:14px">Shipment Details</h2>
  <div class="field"><span class="label">Consignment No.:</span><span>${record.consignmentNumber || '—'}</span></div>
  <div class="field"><span class="label">Vehicle No.:</span><span>${record.vehicleNumber || '—'}</span></div>
  <div class="field"><span class="label">Status:</span><span class="status">${record.status || '—'}</span></div>
  <div class="field"><span class="label">Consignor:</span><span>${record.consignor?.name || '—'}</span></div>
  <div class="field"><span class="label">Consignee:</span><span>${record.consignee?.name || '—'}</span></div>
  <div class="field"><span class="label">Origin:</span><span>${record.origin || '—'}</span></div>
  <div class="field"><span class="label">Destination:</span><span>${record.destination || '—'}</span></div>
  <div class="field"><span class="label">Created:</span><span>${fmtDate(record.createdAt)}</span></div>
  </body></html>`;
}

function buildEntryHtml(record) {
  const rows = (record.entries || []).map(e => `
    <tr>
      <td>${e.sno || '—'}</td>
      <td>${e.grNo || '—'}</td>
      <td>${e.consignor || '—'}</td>
      <td>${e.consignee || '—'}</td>
      <td>${e.from || '—'} → ${e.to || '—'}</td>
      <td>${e.noOfPackages || '—'}</td>
      <td style="text-align:right">${e.freight || '—'}</td>
      <td>${e.deliveryReceiptNo || '—'}</td>
      <td>${e.deliveryStatus || '—'}</td>
    </tr>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Entry Register Page ${record.pageNo}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 30px; color: #111; }
    h1 { text-align: center; font-size: 20px; text-transform: uppercase; color: #1a3a6b; }
    .meta { display: flex; justify-content: space-between; margin: 14px 0 8px; font-size: 13px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
    th, td { border: 1px solid #ccc; padding: 5px 7px; }
    th { background: #e8ecf0; font-weight: bold; text-transform: uppercase; }
  </style></head><body>
  <h1>Sant Kanwar Ram Transport Corporation</h1>
  <h2 style="text-align:center;font-size:14px">Entry Register (Delivery Register)</h2>
  <div class="meta">
    <span>Page No.: ${record.pageNo || '—'}</span>
    <span>Date: ${record.dateSearch || '—'}</span>
    <span>Challan No.: ${record.challanNo || '—'}</span>
    <span>Vehicle: ${record.vehicleNo || '—'}</span>
    <span>Driver: ${record.driverName || '—'}</span>
  </div>
  <table>
    <thead><tr><th>S.No.</th><th>G.R. No.</th><th>Consignor</th><th>Consignee</th><th>Route</th><th>Pkgs</th><th>Freight</th><th>D.R. No.</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  </body></html>`;
}

function buildInvoiceHtml(record) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Invoice ${record.invoiceNo}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 30px; color: #111; max-width: 650px; margin: auto; }
    h1 { text-align: center; font-size: 22px; text-transform: uppercase; color: #1a3a6b; }
    .meta { display: flex; justify-content: space-between; margin: 18px 0 10px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #ccc; padding: 8px 10px; }
    th { background: #e8ecf0; font-weight: bold; }
    .total { text-align: right; font-weight: bold; font-size: 16px; margin-top: 20px; }
  </style></head><body>
  <h1>Sant Kanwar Ram Transport Corporation</h1>
  <h2 style="text-align:center;font-size:14px">Invoice</h2>
  <div class="meta">
    <div><strong>Invoice No.:</strong> ${record.invoiceNo || '—'}</div>
    <div><strong>Date:</strong> ${fmtDate(record.createdAt)}</div>
    <div><strong>Status:</strong> ${record.status || '—'}</div>
  </div>
  <div style="font-size:13px;margin-bottom:14px"><strong>Bill To:</strong> ${record.client?.name || '—'}</div>
  <table>
    <thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>
      <tr><td>Transport Services</td><td style="text-align:right">₹ ${fmtNum(record.amount)}</td></tr>
      <tr><td>Tax</td><td style="text-align:right">₹ ${fmtNum(record.tax)}</td></tr>
    </tbody>
  </table>
  <div class="total">Total: ₹ ${fmtNum(record.total)}</div>
  </body></html>`;
}

// Upload HTML to Cloudinary as a raw file and return public URL
async function uploadHtmlToCloudinary(html, publicId) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        public_id: publicId,
        format: 'html',
        overwrite: true,
        type: 'upload'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    const { Readable } = require('stream');
    const stream = Readable.from([html]);
    stream.pipe(uploadStream);
  });
}

// @desc    Generate share link for any record type
// @route   POST /api/share/generate-link
// @access  Private
exports.generateShareLink = async (req, res) => {
  try {
    const { recordType, recordId } = req.body;

    if (!recordType || !recordId) {
      return res.status(400).json({ success: false, message: 'recordType and recordId are required' });
    }

    let record = null;
    let html = '';
    let docNumber = '';
    let docDate = '';

    switch (recordType) {
      case 'challan':
        record = await Challan.findById(recordId).lean();
        if (!record) return res.status(404).json({ success: false, message: 'Challan not found' });
        html = buildChallanHtml(record);
        docNumber = record.challanNo || recordId;
        docDate = record.date || '';
        break;

      case 'cash-memo':
        record = await CashMemo.findById(recordId).lean();
        if (!record) return res.status(404).json({ success: false, message: 'Cash Memo not found' });
        html = buildCashMemoHtml(record);
        docNumber = record.drNo || recordId;
        docDate = fmtDate(record.date);
        break;

      case 'entry':
        record = await EntryRegister.findById(recordId).lean();
        if (!record) return res.status(404).json({ success: false, message: 'Entry not found' });
        html = buildEntryHtml(record);
        docNumber = `Page ${record.pageNo || recordId}`;
        docDate = record.dateSearch || '';
        break;

      case 'summary':
        record = await SummaryRegister.findById(recordId).lean();
        if (!record) return res.status(404).json({ success: false, message: 'Summary not found' });
        html = buildSummaryHtml(record);
        docNumber = `Summary ${record.date || recordId}`;
        docDate = record.date || '';
        break;

      case 'delivery-statement':
        record = await DeliveryStatement.findById(recordId).lean();
        if (!record) return res.status(404).json({ success: false, message: 'Delivery Statement not found' });
        html = buildDeliveryStatementHtml(record);
        docNumber = `Page ${record.pageNo || recordId}`;
        docDate = record.dateSearch || '';
        break;

      case 'shipment':
        record = await Shipment.findById(recordId).lean();
        if (!record) return res.status(404).json({ success: false, message: 'Shipment not found' });
        html = buildShipmentHtml(record);
        docNumber = record.consignmentNumber || recordId;
        docDate = fmtDate(record.createdAt);
        break;

      case 'invoice':
        record = await Invoice.findById(recordId).lean();
        if (!record) return res.status(404).json({ success: false, message: 'Invoice not found' });
        html = buildInvoiceHtml(record);
        docNumber = record.invoiceNo || recordId;
        docDate = fmtDate(record.createdAt);
        break;

      default:
        return res.status(400).json({ success: false, message: `Unknown record type: ${recordType}` });
    }

    // Upload to Cloudinary
    const publicId = `skrt-docs/${recordType}/${recordId}-${Date.now()}`;
    const publicUrl = await uploadHtmlToCloudinary(html, publicId);

    const docTypeLabel = {
      challan: 'Challan',
      'cash-memo': 'Cash Memo',
      entry: 'Entry Register',
      summary: 'Summary Register',
      'delivery-statement': 'Delivery Statement',
      shipment: 'Shipment',
      invoice: 'Invoice'
    }[recordType] || recordType;

    const message = `Hello,

Please find your SKRT document.

Document Type: ${docTypeLabel}
Document Number: ${docNumber}
Date: ${docDate}
Download Link: ${publicUrl}

Regards,
Sant Kanwar Ram Transport Corporation`;

    res.json({
      success: true,
      data: {
        publicUrl,
        message,
        docNumber,
        docDate,
        docType: docTypeLabel
      }
    });
  } catch (error) {
    console.error('Share link error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
