const express = require('express');
const cors = require('cors');
const dbManager = require('./db-manager');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Helper to generate IDs
const generateId = (prefix) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// GET: All clients
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await dbManager.getClients();
    res.json(clients);
  } catch (error) {
    console.error("Error in GET /api/clients:", error);
    res.status(500).json({ error: error.message || "Failed to fetch clients" });
  }
});

// POST: Add new client
app.post('/api/clients', async (req, res) => {
  try {
    const { name, agencyName, phone, email, city, status, notes } = req.body;
    
    if (!name || !agencyName) {
      return res.status(400).json({ error: "Name and Agency Name are required" });
    }

    const newClient = {
      id: generateId('client'),
      name,
      agencyName,
      phone: phone || '',
      email: email || '',
      city: city || '',
      status: status || 'New',
      notes: notes || '',
      dateAdded: new Date().toISOString(),
      calls: []
    };

    const savedClient = await dbManager.addClient(newClient);
    res.status(201).json(savedClient);
  } catch (error) {
    console.error("Error in POST /api/clients:", error);
    res.status(500).json({ error: error.message || "Failed to create client" });
  }
});

// PUT: Update client details
app.put('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, agencyName, phone, email, city, status, notes } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (agencyName !== undefined) updates.agencyName = agencyName;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (city !== undefined) updates.city = city;
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const updatedClient = await dbManager.updateClient(id, updates);
    res.json(updatedClient);
  } catch (error) {
    console.error("Error in PUT /api/clients/:id:", error);
    res.status(500).json({ error: error.message || "Failed to update client" });
  }
});

// DELETE: Remove a client
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbManager.deleteClient(id);
    res.json({ success: true, message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/clients/:id:", error);
    res.status(500).json({ error: error.message || "Failed to delete client" });
  }
});

// POST: Log a call for a specific client
app.post('/api/clients/:id/calls', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, callbackDate } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Call status/outcome is required" });
    }

    const newCall = {
      id: generateId('call'),
      timestamp: new Date().toISOString(),
      status,
      notes: notes || '',
      callbackDate: callbackDate || ''
    };

    const updatedClient = await dbManager.logCall(id, newCall);
    res.status(201).json(updatedClient);
  } catch (error) {
    console.error("Error in POST /api/clients/:id/calls:", error);
    res.status(500).json({ error: error.message || "Failed to log call" });
  }
});

// POST: Bulk Import clients/data
app.post('/api/import', async (req, res) => {
  try {
    const { clients } = req.body;
    if (!clients || !Array.isArray(clients)) {
      return res.status(400).json({ error: "Invalid data format. Must contain a 'clients' array." });
    }

    const formattedClients = clients.map(client => ({
      id: client.id || generateId('client'),
      name: client.name || "Unnamed Client",
      agencyName: client.agencyName || "Unknown Agency",
      phone: client.phone || "",
      email: client.email || "",
      city: client.city || "",
      status: client.status || "New",
      notes: client.notes || "",
      dateAdded: client.dateAdded || new Date().toISOString(),
      calls: Array.isArray(client.calls) ? client.calls.map(call => ({
        id: call.id || generateId('call'),
        timestamp: call.timestamp || new Date().toISOString(),
        status: call.status || "Contacted",
        notes: call.notes || "",
        callbackDate: call.callbackDate || ""
      })) : []
    }));

    await dbManager.importClients(formattedClients);
    res.json({ success: true, count: formattedClients.length });
  } catch (error) {
    console.error("Error in POST /api/import:", error);
    res.status(500).json({ error: error.message || "Failed to import data" });
  }
});

// Start local dev server if run directly (not loaded by Vercel serverless helper)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Call CRM Server running on port ${PORT}`);
  });
}

// Export Express app for Vercel Serverless Function runtime
module.exports = app;
