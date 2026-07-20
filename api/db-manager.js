const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from local .env if present
require('dotenv').config({ path: path.join(__dirname, '.env') });

const DB_PATH = path.join(__dirname, 'database.json');
const BACKUP_PATH = path.join(__dirname, 'database.backup.json');

// Shared Supabase client instance
let supabaseClient = null;

// Standard seed data
const SEED_CLIENTS = [
  {
    id: "client_1",
    name: "Sarah Jenkins",
    agencyName: "Apex Realty Group",
    phone: "555-0192",
    email: "sarah@apexrealty.com",
    city: "Austin",
    status: "Interested",
    notes: "Very interested in TrackerX's automation features. Requested a callback next week.",
    dateAdded: new Date().toISOString(),
    calls: [
      {
        id: "call_1",
        timestamp: new Date(Date.now() - 86400000).toISOString(), // yesterday
        status: "Interested",
        notes: "Had a great 15-minute call. Showed her the dashboard features. She wants to see if we can integrate custom logo.",
        callbackDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]
      }
    ]
  },
  {
    id: "client_2",
    name: "Michael Chang",
    agencyName: "Vanguard Properties",
    phone: "555-0143",
    email: "mchang@vanguard.org",
    city: "San Francisco",
    status: "Callback Scheduled",
    notes: "Called him while he was driving. Asked to call back on Thursday at 2 PM.",
    dateAdded: new Date().toISOString(),
    calls: [
      {
        id: "call_2",
        timestamp: new Date().toISOString(),
        status: "Callback Scheduled",
        notes: "Agent requested callback. Scheduled for next week.",
        callbackDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
      }
    ]
  },
  {
    id: "client_3",
    name: "Jessica Taylor",
    agencyName: "Blue Ocean Homes",
    phone: "555-0177",
    email: "jessica@blueoceanhomes.com",
    city: "Miami",
    status: "No Answer",
    notes: "Sent cold email, called once. Voicemail left.",
    dateAdded: new Date().toISOString(),
    calls: [
      {
        id: "call_3",
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        status: "No Answer",
        notes: "Called but went straight to voicemail. Left a brief message about TrackerX.",
        callbackDate: ""
      }
    ]
  }
];

// Helper to initialize and share the Supabase Client
function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn(`⚠️ Supabase credentials missing in process.env! Detected: URL=${!!url}, KEY=${!!key}`);
    return null;
  }

  if (supabaseClient) return supabaseClient;

  try {
    supabaseClient = createClient(url, key);
    console.log("🔌 Connected to remote Supabase database");
    return supabaseClient;
  } catch (error) {
    console.error("❌ Failed to initialize Supabase client:", error);
    return null;
  }
}

class DbManager {
  constructor() {
    this.initLocalDatabase();
  }

  // Initialize Local JSON DB file if not exists
  initLocalDatabase() {
    try {
      if (!fs.existsSync(DB_PATH)) {
        const initialData = { clients: SEED_CLIENTS };
        fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf8');
      }
    } catch (error) {
      console.error("Error initializing local database:", error);
    }
  }

  // Read entire local database
  readLocal() {
    try {
      this.initLocalDatabase();
      const rawData = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(rawData);
    } catch (error) {
      console.error("Error reading local database:", error);
      if (fs.existsSync(BACKUP_PATH)) {
        const backupData = fs.readFileSync(BACKUP_PATH, 'utf8');
        fs.writeFileSync(DB_PATH, backupData, 'utf8');
        return JSON.parse(backupData);
      }
      return { clients: [] };
    }
  }

  // Write to local database
  writeLocal(data) {
    try {
      if (fs.existsSync(DB_PATH)) {
        fs.copyFileSync(DB_PATH, BACKUP_PATH);
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error("Error writing to local database:", error);
      return false;
    }
  }

  // GET ALL CLIENTS
  async getClients() {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('clients')
        .select('*');

      if (error) {
        console.error("Supabase select error:", error);
        throw error;
      }

      // Auto-seed empty cloud table if it contains 0 records
      if (!data || data.length === 0) {
        const { error: seedError } = await supabase
          .from('clients')
          .insert(SEED_CLIENTS);

        if (seedError) throw seedError;
        console.log("🌱 Seeded Supabase database table with demo agents");
        return SEED_CLIENTS;
      }

      return data.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    } else {
      // Local fallback
      return this.readLocal().clients;
    }
  }

  // ADD NEW CLIENT
  async addClient(client) {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from('clients')
        .insert(client);

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }
      return client;
    } else {
      const clients = this.readLocal().clients;
      clients.unshift(client);
      this.writeLocal({ clients });
      return client;
    }
  }

  // UPDATE EXISTING CLIENT
  async updateClient(id, updates) {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }
      if (!data || data.length === 0) {
        throw new Error("Client not found in Supabase");
      }
      return data[0];
    } else {
      const clients = this.readLocal().clients;
      const index = clients.findIndex(c => c.id === id);
      if (index !== -1) {
        clients[index] = { ...clients[index], ...updates };
        this.writeLocal({ clients });
        return clients[index];
      }
      throw new Error("Client not found locally");
    }
  }

  // DELETE CLIENT
  async deleteClient(id) {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Supabase delete error:", error);
        throw error;
      }
      return true;
    } else {
      const clients = this.readLocal().clients;
      const filtered = clients.filter(c => c.id !== id);
      this.writeLocal({ clients: filtered });
      return true;
    }
  }

  // LOG OUTBOUND CALL
  async logCall(clientId, call) {
    const supabase = getSupabase();
    if (supabase) {
      // 1. Fetch current calls array
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('calls')
        .eq('id', clientId)
        .single();

      if (fetchError) {
        console.error("Supabase fetch calls error:", fetchError);
        throw fetchError;
      }

      const currentCalls = data.calls || [];
      const updatedCalls = [call, ...currentCalls];

      // 2. Prepend call and update status
      const { data: updatedData, error: updateError } = await supabase
        .from('clients')
        .update({ calls: updatedCalls, status: call.status })
        .eq('id', clientId)
        .select();

      if (updateError) {
        console.error("Supabase log call update error:", updateError);
        throw updateError;
      }
      if (!updatedData || updatedData.length === 0) {
        throw new Error("Failed to return updated client after logging call");
      }
      return updatedData[0];
    } else {
      const clients = this.readLocal().clients;
      const index = clients.findIndex(c => c.id === clientId);
      if (index !== -1) {
        const currentCalls = clients[index].calls || [];
        clients[index].calls = [call, ...currentCalls];
        clients[index].status = call.status;
        this.writeLocal({ clients });
        return clients[index];
      }
      throw new Error("Client not found locally");
    }
  }

  // BULK IMPORT
  async importClients(importedClients) {
    const supabase = getSupabase();
    if (supabase) {
      // Delete all records
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .neq('id', '');

      if (deleteError) {
        console.error("Supabase import clear error:", deleteError);
        throw deleteError;
      }

      // Insert new records
      if (importedClients.length > 0) {
        const { error: insertError } = await supabase
          .from('clients')
          .insert(importedClients);

        if (insertError) {
          console.error("Supabase import insert error:", insertError);
          throw insertError;
        }
      }
      return true;
    } else {
      this.writeLocal({ clients: importedClients });
      return true;
    }
  }
}

module.exports = new DbManager();
