import React, { useState } from 'react'
import { Phone, Mail, MapPin, Building2, Calendar, FileText, PhoneCall, CheckSquare } from 'lucide-react'

function ClientDetail({ client, onLogCall }) {
  // Inline call log states
  const [outcome, setOutcome] = useState('Interested')
  const [notes, setNotes] = useState('')
  const [callbackDate, setCallbackDate] = useState('')

  const handleInlineSubmit = (e) => {
    e.preventDefault()
    onLogCall({
      status: outcome,
      notes,
      callbackDate: outcome === 'Callback Scheduled' || callbackDate ? callbackDate : ''
    })
    // Reset states
    setNotes('')
    setCallbackDate('')
  }

  return (
    <div className="detail-layout fade-in">
      
      {/* Left Column: Agent Profile Summary Card */}
      <section className="card detail-info-card">
        <div className="detail-header">
          <div className="detail-name">{client.name}</div>
          <div className="detail-agency" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Building2 size={16} style={{ color: 'var(--text-muted)' }} />
            {client.agencyName}
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <span className={`status-tag tag-${client.status.toLowerCase().replace(' ', '-')}`}>
              Current status: {client.status}
            </span>
          </div>
        </div>

        <div className="detail-items">
          <div className="detail-field">
            <div className="detail-label">Phone Number</div>
            <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={14} style={{ color: 'var(--text-muted)' }} />
              {client.phone || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}
            </div>
          </div>

          <div className="detail-field">
            <div className="detail-label">Email Address</div>
            <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={14} style={{ color: 'var(--text-muted)' }} />
              {client.email || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}
            </div>
          </div>

          <div className="detail-field">
            <div className="detail-label">City/Region</div>
            <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
              {client.city || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}
            </div>
          </div>

          <div className="detail-field">
            <div className="detail-label">Date Added to CRM</div>
            <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
              {new Date(client.dateAdded).toLocaleDateString()}
            </div>
          </div>

          <div className="detail-field" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div className="detail-label">General Description / Bio Notes</div>
            <div className="detail-value" style={{ display: 'flex', gap: '0.5rem', lineHeight: '1.4', fontSize: '0.85rem' }}>
              <FileText size={16} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
              <p>{client.notes || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No general notes saved. Click Edit to add some context about this agency.</span>}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Interaction History Timeline */}
      <section className="card timeline-card">
        <h2 className="timeline-section-title">
          <PhoneCall size={18} className="text-accent" />
          Call History Timeline
        </h2>

        {/* Inline Call Logger Form */}
        <div className="log-call-container">
          <h3 className="log-call-title">
            <PhoneCall size={14} className="status-interested-text" />
            Quick-Log a New Outbound Call
          </h3>
          <form onSubmit={handleInlineSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Outcome / Status</label>
                <select 
                  className="filter-select"
                  style={{ width: '100%', padding: '0.5rem 2rem 0.5rem 0.75rem', fontSize: '0.8rem' }}
                  value={outcome}
                  onChange={(e) => {
                    setOutcome(e.target.value)
                    if (e.target.value === 'Callback Scheduled' && !callbackDate) {
                      const tomorrow = new Date()
                      tomorrow.setDate(tomorrow.getDate() + 1)
                      setCallbackDate(tomorrow.toISOString().split('T')[0])
                    }
                  }}
                  required
                >
                  <option value="Interested">Interested</option>
                  <option value="Callback Scheduled">Callback Scheduled</option>
                  <option value="No Answer">No Answer</option>
                  <option value="Busy">Line Busy</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Wrong Number">Wrong Number</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Follow-up Date</label>
                <input 
                  type="date"
                  className="form-input"
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                  value={callbackDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCallbackDate(e.target.value)}
                  disabled={outcome !== 'Callback Scheduled' && outcome !== 'Interested'}
                  required={outcome === 'Callback Scheduled'}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Call Notes</label>
              <textarea 
                className="form-input"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', minHeight: '60px' }}
                placeholder="Log notes about agent objections, demo details, next steps..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                Log Call & Update Status
              </button>
            </div>
          </form>
        </div>

        {/* Timeline Flow */}
        {!client.calls || client.calls.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <div className="empty-state-icon"><PhoneCall size={20} /></div>
            <p style={{ fontSize: '0.85rem' }}>No calls have been logged for this agent. Log your first call above!</p>
          </div>
        ) : (
          <div className="timeline-flow">
            {client.calls.map((call, idx) => (
              <div key={call.id || idx} className="timeline-item">
                {/* Visual marker line node */}
                <div className={`timeline-indicator tag-${call.status.toLowerCase().replace(' ', '-')}`}></div>
                
                <div className="timeline-header">
                  <span className={`status-tag tag-${call.status.toLowerCase().replace(' ', '-')}`}>
                    {call.status}
                  </span>
                  <span className="timeline-date-time">
                    {new Date(call.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="timeline-body">
                  <p className="timeline-notes">{call.notes || 'No details provided.'}</p>
                  
                  {call.callbackDate && (
                    <div className="timeline-callback">
                      <CheckSquare size={12} />
                      Scheduled Callback: {call.callbackDate}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}

export default ClientDetail
