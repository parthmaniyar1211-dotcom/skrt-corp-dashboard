const Client = require('./model');
const sendResponse = require('../../utils/response');

exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find();
    return sendResponse(res, 200, true, 'Clients fetched successfully', clients);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

exports.createClient = async (req, res) => {
  try {
    const client = await Client.create(req.body);
    return sendResponse(res, 201, true, 'Client created successfully', client);
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (client) {
      return sendResponse(res, 200, true, 'Client updated successfully', client);
    } else {
      return sendResponse(res, 404, false, 'Client not found');
    }
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};
