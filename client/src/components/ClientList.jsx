import React, { useState } from 'react'
import { Search, Phone, Mail, MapPin, Eye, Edit, Trash2, PhoneCall, ListFilter, SlidersHorizontal } from 'lucide-react'
import CallLogModal from './CallLogModal'

function ClientList({ clients, loading, onSelectClient, onEditClient, onDeleteClient, onLogCall }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [cityFilter, setCityFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [activeLogClientId, setActiveLogClientId] = useState(null)

  // Extract list of cities for dropdown
  const uniqueCities = Array.from(new Set(clients.map(c => c.city).filter(Boolean)))

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'All' || client.status === statusFilter
    const matchesCity = cityFilter === 'All' || client.city === cityFilter

    return matchesSearch && matchesStatus && matchesCity
  })

  // Sort clients
  const sortedClients = [...filteredClients].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.dateAdded) - new Date(a.dateAdded)
    }
    if (sortBy === 'oldest') {
      return new Date(a.dateAdded) - new Date(b.dateAdded)
    }
    if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name)
    }
    if (sortBy === 'name-desc') {
      return b.name.localeCompare(a.name)
    }
    return 0
  })

  return (
    <div className="client-list-container">
      {/* Filtering and Actions Bar */}
      <div className="card list-actions">
        {/* Search */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search agents by name, agency, phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Interested">Interested</option>
            <option value="Callback Scheduled">Callback Scheduled</option>
            <option value="No Answer">No Answer</option>
            <option value="Busy">Line Busy</option>
            <option value="Not Interested">Not Interested</option>
            <option value="Wrong Number">Wrong Number</option>
          </select>

          {/* City Filter */}
          <select 
            className="filter-select"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="All">All Locations</option>
            {uniqueCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          {/* Sort Control */}
          <select 
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Added (Newest)</option>
            <option value="oldest">Added (Oldest)</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Main Table view */}
      {loading ? (
        <div className="card empty-state">
          <div style={{ border: '4px solid rgba(255,255,255,0.05)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }} />
          <p>Loading agent records...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : sortedClients.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <Search size={32} />
          </div>
          <h2>No matching agent records</h2>
          <p>Try adjusting your search keywords, status filters, or add a new realtor to get started.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Agent & Agency</th>
                <th>Contact Info</th>
                <th>Outreach Status</th>
                <th>Last Interaction / Callback</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedClients.map(client => {
                const latestCall = client.calls && client.calls[0]
                const callbackText = latestCall && latestCall.callbackDate 
                  ? latestCall.callbackDate 
                  : 'None scheduled'
                
                return (
                  <tr key={client.id} onClick={() => onSelectClient(client.id)}>
                    {/* Agent name & Agency */}
                    <td>
                      <div className="client-name-cell">
                        <span className="client-name-main">{client.name}</span>
                        <span className="client-agency-sub">{client.agencyName}</span>
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td>
                      <div className="contact-info-cell" onClick={(e) => e.stopPropagation()}>
                        {client.phone && (
                          <span className="contact-item">
                            <Phone size={12} /> {client.phone}
                          </span>
                        )}
                        {client.email && (
                          <span className="contact-item">
                            <Mail size={12} /> {client.email}
                          </span>
                        )}
                        {client.city && (
                          <span className="contact-item">
                            <MapPin size={12} /> {client.city}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Tag */}
                    <td>
                      <span className={`status-tag tag-${client.status.toLowerCase().replace(' ', '-')}`}>
                        {client.status}
                      </span>
                    </td>

                    {/* Last call details / scheduled callback */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {latestCall ? `${latestCall.status} (${new Date(latestCall.timestamp).toLocaleDateString()})` : 'No calls made'}
                        </span>
                        {latestCall && latestCall.callbackDate && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--status-callback-text)', fontWeight: 600 }}>
                            📞 Follow-up: {callbackText}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td>
                      <div className="actions-cell" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                          title="Log Outbound Call"
                          onClick={() => setActiveLogClientId(client.id)}
                        >
                          <PhoneCall size={14} style={{ marginRight: '4px' }} /> Log Call
                        </button>
                        
                        <button 
                          className="btn-icon-only" 
                          title="View Details"
                          onClick={() => onSelectClient(client.id)}
                        >
                          <Eye size={14} />
                        </button>
                        
                        <button 
                          className="btn-icon-only" 
                          title="Edit Agent"
                          onClick={() => onEditClient(client)}
                        >
                          <Edit size={14} />
                        </button>
                        
                        <button 
                          className="btn-icon-only" 
                          title="Delete Agent"
                          style={{ color: 'rgba(239, 68, 68, 0.8)' }}
                          onClick={() => onDeleteClient(client.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Inline Log Call Modal */}
      {activeLogClientId && (
        <CallLogModal 
          clientId={activeLogClientId}
          onSave={(callData) => {
            onLogCall(activeLogClientId, callData)
            setActiveLogClientId(null)
          }}
          onClose={() => setActiveLogClientId(null)}
        />
      )}
    </div>
  )
}

export default ClientList
