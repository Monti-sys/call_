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

  // GET ALL CLIENTS (asynchronous)
  async getClients() {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*');

        if (error) throw error;

        // Auto-seed empty cloud table if it contains 0 records
        if (!data || data.length === 0) {
          const { error: seedError } = await supabase
            .from('clients')
            .insert(SEED_CLIENTS);

          if (seedError) throw seedError;
          console.log("🌱 Seeded Supabase database table with demo agents");
          return SEED_CLIENTS;
        }

        // Sort data by dateAdded descending in code or rely on SQL
        return data.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      } catch (error) {
        console.error("Error fetching from Supabase, falling back to local JSON:", error);
        return this.readLocal().clients;
      }
    } else {
      // Local fallback
      return this.readLocal().clients;
    }
  }

  // SAVE ALL CLIENTS (asynchronous)
  async saveClients(clients) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        // Clear all current records from Supabase table
        const { error: deleteError } = await supabase
          .from('clients')
          .delete()
          .neq('id', ''); // Delete all rows where id is not empty (clears table)

        if (deleteError) throw deleteError;

        // Bulk insert updated state array
        if (clients.length > 0) {
          const { error: insertError } = await supabase
            .from('clients')
            .insert(clients);

          if (insertError) throw insertError;
        }
        return true;
      } catch (error) {
        console.error("Error saving to Supabase, falling back to local JSON:", error);
        const dbLocal = this.readLocal();
        dbLocal.clients = clients;
        return this.writeLocal(dbLocal);
      }
    } else {
      // Local fallback
      const dbLocal = this.readLocal();
      dbLocal.clients = clients;
      return this.writeLocal(dbLocal);
    }
  }
}

module.exports = new DbManager();
