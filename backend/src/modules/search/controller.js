const Shipment = require('../shipments/model');
const Invoice = require('../invoices/model');
const Vehicle = require('../vehicles/model');
const Client = require('../clients/model');
const Inventory = require('../inventory/model');
const Tracking = require('../tracking/model');
const sendResponse = require('../../utils/response');

exports.globalSearch = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim() === '') {
      return sendResponse(res, 200, true, 'Empty query', {
        shipments: [], invoices: [], vehicles: [], clients: [],
        inventory: [], tracking: []
      });
    }

    const regex = new RegExp(query, 'i');

    const [shipments, invoices, vehicles, clients, inventory, tracking] = await Promise.all([
      Shipment.find({
        $or: [
          { consignmentNumber: regex },
          { vehicleNumber: regex },
          { 'consignor.name': regex },
          { 'consignee.name': regex },
        ]
      }).limit(5).select('consignmentNumber vehicleNumber status outgoingStatus consignor consignee').lean(),

      Invoice.find({
        $or: [
          { invoiceNo: regex },
          { 'client.name': regex }
        ]
      }).limit(5).select('invoiceNo client amount status createdAt').lean(),

      Vehicle.find({
        $or: [
          { vehicleNo: regex },
          { model: regex }
        ]
      }).limit(5).select('vehicleNo type status model capacity').lean(),

      Client.find({
        $or: [
          { name: regex },
          { gstin: regex },
          { phone: regex }
        ]
      }).limit(5).select('name gstin phone email status').lean(),

      Inventory.find({
        $or: [
          { inventoryId: regex },
          { lrNo: regex },
          { cargoName: regex },
          { senderName: regex },
          { receiverName: regex }
        ]
      }).limit(5).select('inventoryId lrNo cargoName senderName receiverName paymentMode').lean(),

      Tracking.find({
        'currentLocation.address': regex
      }).limit(5).populate('vehicle', 'vehicleNo').select('currentLocation vehicle lastUpdate').lean()
    ]);

    return sendResponse(res, 200, true, 'Search results fetched', {
      shipments,
      invoices,
      vehicles,
      clients,
      inventory,
      tracking
    });
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};
