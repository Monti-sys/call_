import React, { useState } from 'react'
import { X, PhoneCall } from 'lucide-react'

function CallLogModal({ clientId, onSave, onClose }) {
  const [status, setStatus] = useState('Interested')
  const [notes, setNotes] = useState('')
  const [callbackDate, setCallbackDate] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      status,
      notes,
      callbackDate: status === 'Callback Scheduled' || callbackDate ? callbackDate : ''
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PhoneCall size={18} className="text-primary" />
            Log Call Activity
          </h3>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            <div className="form-group">
              <label className="form-label">Call Outcome / Status</label>
              <select 
                className="filter-select" 
                style={{ width: '100%', paddingRight: '2rem' }}
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  // Auto set a tomorrow date if callback is selected and empty
                  if (e.target.value === 'Callback Scheduled' && !callbackDate) {
                    const tomorrow = new Date()
                    tomorrow.setDate(tomorrow.getDate() + 1)
                    setCallbackDate(tomorrow.toISOString().split('T')[0])
                  }
                }}
                required
              >
                <option value="Interested">Interested (Highly Interested / Demo requested)</option>
                <option value="Callback Scheduled">Callback Scheduled (Follow-up needed)</option>
                <option value="No Answer">No Answer / Left Voicemail</option>
                <option value="Busy">Busy / Line Busy</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Wrong Number">Wrong Number / Invalid Contact</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Call Notes / Details</label>
              <textarea 
                className="form-input" 
                placeholder="Detail what was discussed, objections raised, agent sentiment..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
              />
            </div>

            {(status === 'Callback Scheduled' || status === 'Interested') && (
              <div className="form-group fade-in">
                <label className="form-label">
                  Scheduled Follow-up Callback Date
                </label>
                <input 
                  type="date" 
                  className="form-input"
                  value={callbackDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCallbackDate(e.target.value)}
                  required={status === 'Callback Scheduled'}
                />
              </div>
            )}

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Log & Save Call
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CallLogModal
