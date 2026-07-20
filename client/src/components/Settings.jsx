import React, { useRef } from 'react'
import { Download, Upload, RefreshCw, Trash2, Database, ShieldAlert } from 'lucide-react'

function Settings({ clients, onImportSuccess, onResetSuccess, showToast }) {
  const fileInputRef = useRef(null)

  // Export Data to JSON File
  const handleExport = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ clients }, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute("href", dataStr)
      downloadAnchor.setAttribute("download", `trackerx_crm_backup_${new Date().toISOString().split('T')[0]}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
      showToast("Data backup file generated and downloaded successfully!")
    } catch (error) {
      showToast("Failed to export data", "error")
    }
  }

  // Import Data from JSON File
  const handleImportClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const jsonData = JSON.parse(event.target.result)
        if (!jsonData.clients || !Array.isArray(jsonData.clients)) {
          throw new Error("Backup file must contain a 'clients' array.")
        }

        const response = await fetch('/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clients: jsonData.clients })
        })

        if (!response.ok) {
          const errData = await response.json()
          throw new Error(errData.error || "Failed to import data to database")
        }

        onImportSuccess(jsonData.clients.length)
      } catch (error) {
        showToast(`Import failed: ${error.message}`, "error")
      }
    }
    reader.readAsText(file)
  }

  // Reset to Demo Data
  const handleResetDemo = async () => {
    if (!window.confirm("Are you sure you want to reset the CRM to demo data? This will overwrite your current records.")) return

    try {
      // We will trigger a reset by sending an empty body to import or sending a specific mock payload
      const initialDemoData = [
        {
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
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              status: "Interested",
              notes: "Had a great 15-minute call. Showed her the dashboard features. She wants to see if we can integrate custom logo.",
              callbackDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]
            }
          ]
        },
        {
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
              timestamp: new Date().toISOString(),
              status: "Callback Scheduled",
              notes: "Agent requested callback. Scheduled for next week.",
              callbackDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
            }
          ]
        },
        {
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
              timestamp: new Date(Date.now() - 172800000).toISOString(),
              status: "No Answer",
              notes: "Called but went straight to voicemail. Left a brief message about TrackerX.",
              callbackDate: ""
            }
          ]
        }
      ]

      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clients: initialDemoData })
      })

      if (!response.ok) throw new Error("Failed to load demo data")
      onResetSuccess()
    } catch (error) {
      showToast(error.message, "error")
    }
  }

  // Clear All Data
  const handleClearAll = async () => {
    if (!window.confirm("WARNING: You are about to DELETE ALL AGENT RECORDS and Call History. This action is permanent and cannot be undone unless you have a JSON backup file. Proceed?")) return

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clients: [] })
      })

      if (!response.ok) throw new Error("Failed to clear database")
      onResetSuccess()
      showToast("CRM Database completely cleared.")
    } catch (error) {
      showToast(error.message, "error")
    }
  }

  return (
    <div className="settings-grid fade-in">
      
      {/* Backup and Restore */}
      <section className="card settings-card">
        <h2 className="dashboard-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={18} className="text-primary" />
          Backup & Restore CRM Data
        </h2>
        <p className="settings-description">
          All client files and interaction timelines are stored locally in the server's project folder. You can export a snapshot backup to your computer or restore a previous snapshot below.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button className="btn btn-primary" onClick={handleExport}>
            <Download size={16} /> Export Backup (JSON)
          </button>
          
          <button className="btn btn-secondary" onClick={handleImportClick}>
            <Upload size={16} /> Import Backup (JSON)
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            style={{ display: 'none' }} 
          />
        </div>
      </section>

      {/* Database Maintenance and Reset */}
      <section className="card settings-card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <h2 className="dashboard-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171' }}>
          <ShieldAlert size={18} />
          Danger Zone
        </h2>
        <p className="settings-description">
          Perform administrative database actions. Overwriting or clearing data is permanent. Make sure you back up your configurations first.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleResetDemo}>
            <RefreshCw size={16} style={{ marginRight: '4px' }} /> Reset to Demo Data
          </button>

          <button className="btn btn-danger" onClick={handleClearAll}>
            <Trash2 size={16} style={{ marginRight: '4px' }} /> Clear All Data
          </button>
        </div>
      </section>

    </div>
  )
}

export default Settings
