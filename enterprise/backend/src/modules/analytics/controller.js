const Shipment = require('../shipments/model');
const Invoice = require('../invoices/model');
const Vehicle = require('../vehicles/model');
const Expense = require('../expenses/model');
const sendResponse = require('../../utils/response');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalShipments = await Shipment.countDocuments();
    const activeTrips = await Shipment.countDocuments({ status: 'in-transit' });
    const availableVehicles = await Vehicle.countDocuments({ status: 'available' });
    
    const revenue = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const expenses = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    return sendResponse(res, 200, true, 'Dashboard stats fetched successfully', {
      totalShipments,
      activeTrips,
      availableVehicles,
      totalRevenue: revenue.length > 0 ? revenue[0].total : 0,
      totalExpenses: expenses.length > 0 ? expenses[0].total : 0
    });
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

exports.getDetailedAnalytics = async (req, res) => {
  try {
    // Monthly Revenue and Cost
    const monthlyData = await Invoice.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$total" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Top Routes
    const topRoutes = await Shipment.aggregate([
      { $group: { _id: "$destination", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    return sendResponse(res, 200, true, 'Detailed analytics fetched successfully', {
      monthlyData,
      topRoutes
    });
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};
