import React, { useState, useEffect } from 'react'
import { X, UserPlus, Save } from 'lucide-react'

function ClientForm({ client, onSave, onClose }) {
  const [name, setName] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [status, setStatus] = useState('New')
  const [notes, setNotes] = useState('')

  // Load client data if editing
  useEffect(() => {
    if (client) {
      setName(client.name || '')
      setAgencyName(client.agencyName || '')
      setPhone(client.phone || '')
      setEmail(client.email || '')
      setCity(client.city || '')
      setStatus(client.status || 'New')
      setNotes(client.notes || '')
    }
  }, [client])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      name,
      agencyName,
      phone,
      email,
      city,
      status,
      notes
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={18} className="text-primary" />
            {client ? 'Edit Realtor Profile' : 'Register New Real Estate Agent'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Agent Full Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Real Estate Agency *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Century 21"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="e.g. 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="e.g. agent@agency.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City/Region</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Los Angeles"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lead Status</label>
                <select 
                  className="filter-select"
                  style={{ width: '100%', paddingRight: '2rem' }}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={!!client} // Status should be changed by logging calls if client exists
                >
                  <option value="New">New Lead</option>
                  <option value="Interested">Interested</option>
                  <option value="Callback Scheduled">Callback Scheduled</option>
                  <option value="No Answer">No Answer</option>
                  <option value="Busy">Line Busy</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Wrong Number">Wrong Number</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio / Agency Notes / Target Focus</label>
              <textarea 
                className="form-input" 
                placeholder="Details about their listings, property focus, market presence, or personal notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} style={{ marginRight: '4px' }} />
              {client ? 'Update Agent' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClientForm
