import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Users, Settings as SettingsIcon, AlertCircle, CheckCircle2, PhoneCall, X } from 'lucide-react'
import Dashboard from './components/Dashboard'
import ClientList from './components/ClientList'
import ClientDetail from './components/ClientDetail'
import ClientForm from './components/ClientForm'
import Settings from './components/Settings'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [toasts, setToasts] = useState([])

  // Toast helper
  const showToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  // Fetch clients from API
  const fetchClients = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/clients')
      if (!response.ok) throw new Error('Failed to load clients data')
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error(error)
      showToast('Could not connect to database server. Make sure the backend is running.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  // Add Client
  const handleAddClient = async (clientData) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      })
      if (!response.ok) throw new Error('Failed to save client')
      const newClient = await response.json()
      setClients(prev => [newClient, ...prev])
      showToast(`Agent ${newClient.name} added successfully!`)
      setIsClientModalOpen(false)
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  // Edit Client
  const handleEditClient = async (clientData) => {
    try {
      const response = await fetch(`/api/clients/${editingClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      })
      if (!response.ok) throw new Error('Failed to update client')
      const updatedClient = await response.json()
      setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c))
      showToast(`Agent ${updatedClient.name} updated successfully!`)
      setIsClientModalOpen(false)
      setEditingClient(null)
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  // Delete Client
  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client and all their call history?')) return
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete client')
      setClients(prev => prev.filter(c => c.id !== clientId))
      showToast('Client deleted successfully')
      if (selectedClientId === clientId) setSelectedClientId(null)
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  // Log Call
  const handleLogCall = async (clientId, callData) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/calls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callData)
      })
      if (!response.ok) throw new Error('Failed to save call log')
      const updatedClient = await response.json()
      setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c))
      showToast(`Call logged. Status updated to: ${callData.status}`)
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  // Open Edit Client Modal
  const openEditModal = (client) => {
    setEditingClient(client)
    setIsClientModalOpen(true)
  }

  // View Client Details
  const viewClientDetails = (clientId) => {
    setSelectedClientId(clientId)
    setActiveTab('clients')
  }

  const selectedClient = clients.find(c => c.id === selectedClientId)

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">TX</div>
          <span className="brand-name">TrackerX CRM</span>
        </div>
        
        <nav>
          <ul className="nav-links">
            <li className="nav-item">
              <button 
                id="nav-dashboard"
                className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => { setActiveTab('dashboard'); setSelectedClientId(null); }}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button 
                id="nav-clients"
                className={`nav-btn ${activeTab === 'clients' ? 'active' : ''}`}
                onClick={() => setActiveTab('clients')}
              >
                <Users size={18} />
                Real Estate Agents
              </button>
            </li>
            <li className="nav-item">
              <button 
                id="nav-settings"
                className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => { setActiveTab('settings'); setSelectedClientId(null); }}
              >
                <SettingsIcon size={18} />
                CRM Settings
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <p>TrackerX Outcall CRM v1.0.0</p>
        </div>
      </aside>

      {/* Main workspace */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <div className="header-section">
              <div className="header-title">
                <h1>Overview Dashboard</h1>
                <p>Call metrics, sentiment analysis, and pending callbacks.</p>
              </div>
              <button 
                id="dashboard-new-client-btn"
                className="btn btn-primary"
                onClick={() => { setEditingClient(null); setIsClientModalOpen(true); }}
              >
                + Add Agent
              </button>
            </div>
            <Dashboard 
              clients={clients} 
              onViewClient={viewClientDetails}
              onLogCall={handleLogCall}
            />
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="fade-in">
            {selectedClient ? (
              <div>
                <div className="header-section">
                  <div className="header-title">
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setSelectedClientId(null)}
                      style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      ← Back to Agent List
                    </button>
                    <h1>Agent Details</h1>
                  </div>
                  <div className="actions-cell">
                    <button className="btn btn-secondary" onClick={() => openEditModal(selectedClient)}>Edit Details</button>
                    <button className="btn btn-danger" onClick={() => handleDeleteClient(selectedClient.id)}>Delete Agent</button>
                  </div>
                </div>
                <ClientDetail 
                  client={selectedClient} 
                  onLogCall={(callData) => handleLogCall(selectedClient.id, callData)}
                />
              </div>
            ) : (
              <div>
                <div className="header-section">
                  <div className="header-title">
                    <h1>Real Estate Agents</h1>
                    <p>Manage list of realtors, contact details, and follow-ups.</p>
                  </div>
                  <button 
                    id="list-new-client-btn"
                    className="btn btn-primary"
                    onClick={() => { setEditingClient(null); setIsClientModalOpen(true); }}
                  >
                    + Add Agent
                  </button>
                </div>
                <ClientList 
                  clients={clients} 
                  loading={loading}
                  onSelectClient={setSelectedClientId}
                  onEditClient={openEditModal}
                  onDeleteClient={handleDeleteClient}
                  onLogCall={handleLogCall}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="fade-in">
            <div className="header-section">
              <div className="header-title">
                <h1>CRM Settings</h1>
                <p>Manage data backups, CSV/JSON transfers, and system options.</p>
              </div>
            </div>
            <Settings 
              clients={clients} 
              onImportSuccess={(count) => {
                fetchClients()
                showToast(`Successfully imported ${count} client records!`)
              }}
              onResetSuccess={() => {
                fetchClients()
                showToast('Database reset to defaults successfully!')
              }}
              showToast={showToast}
            />
          </div>
        )}
      </main>

      {/* Add / Edit Client Modal */}
      {isClientModalOpen && (
        <ClientForm 
          client={editingClient}
          onSave={editingClient ? handleEditClient : handleAddClient}
          onClose={() => { setIsClientModalOpen(false); setEditingClient(null); }}
        />
      )}

      {/* Toast Alert Box */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type === 'error' ? 'toast-error' : toast.type === 'warning' ? 'toast-warning' : 'toast-success'}`}>
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
