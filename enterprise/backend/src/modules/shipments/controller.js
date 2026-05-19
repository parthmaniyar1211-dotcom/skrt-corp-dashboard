const Shipment = require('./model');
const sendResponse = require('../../utils/response');

// @desc    Create new shipment
// @route   POST /api/shipments
// @access  Private/Operator
exports.createShipment = async (req, res) => {
  try {
    const shipment = await Shipment.create({
      ...req.body,
      createdBy: req.user._id
    });
    return sendResponse(res, 201, true, 'Shipment created successfully', shipment);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

// @desc    Get all shipments
// @route   GET /api/shipments
// @access  Private
exports.getShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find().populate('createdBy', 'name');
    return sendResponse(res, 200, true, 'Shipments fetched successfully', shipments);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get single shipment
// @route   GET /api/shipments/:id
// @access  Private
exports.getShipmentById = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (shipment) {
      return sendResponse(res, 200, true, 'Shipment fetched successfully', shipment);
    } else {
      return sendResponse(res, 404, false, 'Shipment not found');
    }
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc    Update shipment status
// @route   PATCH /api/shipments/:id/status
// @access  Private/Operator
exports.updateStatus = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (shipment) {
      shipment.status = req.body.status || shipment.status;
      shipment.updatedAt = Date.now();
      const updatedShipment = await shipment.save();
      return sendResponse(res, 200, true, 'Status updated successfully', updatedShipment);
    } else {
      return sendResponse(res, 404, false, 'Shipment not found');
    }
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};
