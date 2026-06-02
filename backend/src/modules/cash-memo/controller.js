const CashMemo = require('./model');
const EntryRegister = require('../entry/model');
const sendResponse = require('../../utils/response');

// @desc    Create new cash memo
// @route   POST /api/cash-memo
// @access  Private
exports.createCashMemo = async (req, res) => {
  try {
    const memo = await CashMemo.create({
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : Date.now(),
      updatedAt: Date.now()
    });

    // If grNo is provided, mark the matching entry as Complete
    if (req.body.grNo) {
      const grNo = req.body.grNo.trim();
      const registers = await EntryRegister.find({ 'entries.grNo': grNo });
      for (const reg of registers) {
        let modified = false;
        for (const entry of reg.entries) {
          if (entry.grNo === grNo && entry.deliveryStatus !== 'Complete') {
            entry.deliveryStatus = 'Complete';
            modified = true;
          }
        }
        if (modified) await reg.save();
      }
    }

    return sendResponse(res, 201, true, 'Cash memo created successfully', memo);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

// @desc    Get all cash memos
// @route   GET /api/cash-memo
// @access  Private
exports.getCashMemos = async (req, res) => {
  try {
    const memos = await CashMemo.find().sort({ createdAt: -1 });
    return sendResponse(res, 200, true, 'Cash memos fetched successfully', memos);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get single cash memo
// @route   GET /api/cash-memo/:id
// @access  Private
exports.getCashMemoById = async (req, res) => {
  try {
    const memo = await CashMemo.findById(req.params.id);
    if (!memo) return sendResponse(res, 404, false, 'Cash memo not found');
    return sendResponse(res, 200, true, 'Cash memo fetched', memo);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc    Update cash memo
// @route   PUT /api/cash-memo/:id
// @access  Private
exports.updateCashMemo = async (req, res) => {
  try {
    const memo = await CashMemo.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!memo) return sendResponse(res, 404, false, 'Cash memo not found');
    return sendResponse(res, 200, true, 'Cash memo updated successfully', memo);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get cash memo by GR No.
// @route   GET /api/cash-memo/grno/:grNo
// @access  Private
exports.getCashMemoByGrNo = async (req, res) => {
  try {
    const memo = await CashMemo.findOne({ grNo: req.params.grNo }).sort({ createdAt: -1 });
    if (!memo) return sendResponse(res, 404, false, 'Cash memo not found for this GR No.');
    return sendResponse(res, 200, true, 'Cash memo fetched', memo);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get cash memo by DR No.
// @route   GET /api/cash-memo/drno/:drNo
// @access  Private
exports.getCashMemoByDrNo = async (req, res) => {
  try {
    const memo = await CashMemo.findOne({ drNo: req.params.drNo }).sort({ createdAt: -1 });
    if (!memo) return sendResponse(res, 404, false, 'Cash memo not found for this DR No.');
    return sendResponse(res, 200, true, 'Cash memo fetched', memo);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc    Delete cash memo
// @route   DELETE /api/cash-memo/:id
// @access  Private
exports.deleteCashMemo = async (req, res) => {
  try {
    const memo = await CashMemo.findByIdAndDelete(req.params.id);
    if (!memo) return sendResponse(res, 404, false, 'Cash memo not found');
    return sendResponse(res, 200, true, 'Cash memo deleted successfully', null);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};
