import React, { useState } from 'react'
import { Users, PhoneCall, HeartHandshake, CalendarClock, BellRing, ChevronRight, MessageSquareCode } from 'lucide-react'
import CallLogModal from './CallLogModal'

function Dashboard({ clients, onViewClient, onLogCall }) {
  const [quickLogClientId, setQuickLogClientId] = useState(null)

  // Calculations
  const totalClients = clients.length
  
  const totalCalls = clients.reduce((acc, client) => acc + (client.calls ? client.calls.length : 0), 0)
  
  const interestedClients = clients.filter(c => c.status === 'Interested').length
  
  // Callback dates
  const todayStr = new Date().toISOString().split('T')[0]
  
  const pendingCallbacks = clients.filter(c => {
    // Find the latest call callbackDate if any
    const latestCall = c.calls && c.calls[0]
    return latestCall && latestCall.callbackDate
  })

  // Group clients by status
  const statusCounts = {
    'New': 0,
    'Interested': 0,
    'Callback Scheduled': 0,
    'No Answer': 0,
    'Busy': 0,
    'Not Interested': 0,
    'Wrong Number': 0
  }
  
  clients.forEach(c => {
    if (statusCounts[c.status] !== undefined) {
      statusCounts[c.status]++
    } else {
      statusCounts['New']++
    }
  })

  // Calculate percentages for bars
  const getPercentage = (count) => {
    if (totalClients === 0) return 0
    return Math.round((count / totalClients) * 100)
  }

  // Get callback status class
  const getCallbackDateStatus = (dateStr) => {
    if (!dateStr) return ''
    if (dateStr === todayStr) return { class: 'date-today', text: 'TODAY' }
    if (dateStr < todayStr) return { class: 'date-past', text: 'OVERDUE' }
    return { class: 'date-future', text: dateStr }
  }

  // Get latest 5 calls across all clients
  const allCalls = []
  clients.forEach(c => {
    if (c.calls) {
      c.calls.forEach(call => {
        allCalls.push({
          ...call,
          clientName: c.name,
          agencyName: c.agencyName,
          clientId: c.id
        })
      })
    }
  })
  
  // Sort calls by timestamp descending
  const recentCalls = allCalls
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5)

  return (
    <div className="dashboard-container">
      {/* 4 Cards Grid */}
      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-icon-box primary">
            <Users size={22} />
          </div>
          <div className="metric-info">
            <h3>Total Agents</h3>
            <div className="metric-value">{totalClients}</div>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-box accent">
            <PhoneCall size={22} />
          </div>
          <div className="metric-info">
            <h3>Calls Logged</h3>
            <div className="metric-value">{totalCalls}</div>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-box success">
            <HeartHandshake size={22} />
          </div>
          <div className="metric-info">
            <h3>Interested</h3>
            <div className="metric-value">{interestedClients}</div>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-box warning">
            <CalendarClock size={22} />
          </div>
          <div className="metric-info">
            <h3>Reminders</h3>
            <div className="metric-value">{pendingCallbacks.length}</div>
          </div>
        </div>
      </div>

      {/* Main Panels */}
      <div className="dashboard-layout">
        
        {/* Left Column: Reminders / Active Callbacks & Recent Call Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Reminders / Callbacks Checklist */}
          <section className="card">
            <h2 className="dashboard-panel-title">
              <BellRing size={18} className="status-callback-text" />
              Follow-up Callbacks
            </h2>
            
            {pendingCallbacks.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <div className="empty-state-icon"><CalendarClock size={24} /></div>
                <p style={{ fontSize: '0.85rem' }}>No callbacks scheduled. Add reminders when logging calls.</p>
              </div>
            ) : (
              <div className="reminders-list">
                {pendingCallbacks.map(client => {
                  const latestCall = client.calls[0]
                  const cbStatus = getCallbackDateStatus(latestCall.callbackDate)
                  return (
                    <div key={client.id} className="reminder-item">
                      <div className="reminder-info">
                        <span className="reminder-name">{client.name}</span>
                        <span className="reminder-agency">{client.agencyName} ({client.city || 'Unknown Location'})</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Last note: {latestCall.notes || 'None'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className={`reminder-date ${cbStatus.class}`}>
                          {cbStatus.text}
                        </span>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => setQuickLogClientId(client.id)}
                        >
                          Log Call
                        </button>
                        <button 
                          className="btn-icon-only"
                          onClick={() => onViewClient(client.id)}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Recent Activity Timeline */}
          <section className="card">
            <h2 className="dashboard-panel-title">
              <MessageSquareCode size={18} className="text-secondary" />
              Recent Calls Logged
            </h2>

            {recentCalls.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <div className="empty-state-icon"><PhoneCall size={24} /></div>
                <p style={{ fontSize: '0.85rem' }}>No calls logged yet. Start calling real estate agents!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentCalls.map(call => (
                  <div key={call.id} className="reminder-item" style={{ alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span className="reminder-name" style={{ color: 'var(--text-primary)' }}>{call.clientName}</span>
                        <span className="timeline-date-time">{new Date(call.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="reminder-agency" style={{ marginBottom: '0.5rem' }}>{call.agencyName}</p>
                      <div className="timeline-body" style={{ margin: 0, padding: '0.5rem 0.75rem' }}>
                        <span className="timeline-notes" style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>
                          &ldquo;{call.notes || 'No call summary provided.'}&rdquo;
                        </span>
                      </div>
                    </div>
                    <div style={{ marginLeft: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <span className={`status-tag tag-${call.status.toLowerCase().replace(' ', '-')}`}>
                        {call.status}
                      </span>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                        onClick={() => onViewClient(call.clientId)}
                      >
                        View File
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Status distribution progress bars */}
        <div>
          <section className="card" style={{ height: '100%' }}>
            <h2 className="dashboard-panel-title">Agent Status Metrics</h2>
            
            <div className="status-chart-container">
              {/* New */}
              <div className="status-bar-row">
                <div className="status-bar-label">
                  <span className="status-bar-name">
                    <span className="status-dot tag-new" style={{ backgroundColor: 'var(--status-new-text)' }}></span>
                    New Leads
                  </span>
                  <span>{statusCounts['New']} ({getPercentage(statusCounts['New'])}%)</span>
                </div>
                <div className="status-bar-track">
                  <div className="status-bar-fill tag-new" style={{ width: `${getPercentage(statusCounts['New'])}%`, backgroundColor: 'var(--status-new-text)' }}></div>
                </div>
              </div>

              {/* Interested */}
              <div className="status-bar-row">
                <div className="status-bar-label">
                  <span className="status-bar-name">
                    <span className="status-dot tag-interested" style={{ backgroundColor: 'var(--status-interested-text)' }}></span>
                    Interested
                  </span>
                  <span>{statusCounts['Interested']} ({getPercentage(statusCounts['Interested'])}%)</span>
                </div>
                <div className="status-bar-track">
                  <div className="status-bar-fill tag-interested" style={{ width: `${getPercentage(statusCounts['Interested'])}%`, backgroundColor: 'var(--status-interested-text)' }}></div>
                </div>
              </div>

              {/* Callback Scheduled */}
              <div className="status-bar-row">
                <div className="status-bar-label">
                  <span className="status-bar-name">
                    <span className="status-dot tag-callback-scheduled" style={{ backgroundColor: 'var(--status-callback-text)' }}></span>
                    Callback Scheduled
                  </span>
                  <span>{statusCounts['Callback Scheduled']} ({getPercentage(statusCounts['Callback Scheduled'])}%)</span>
                </div>
                <div className="status-bar-track">
                  <div className="status-bar-fill tag-callback-scheduled" style={{ width: `${getPercentage(statusCounts['Callback Scheduled'])}%`, backgroundColor: 'var(--status-callback-text)' }}></div>
                </div>
              </div>

              {/* No Answer */}
              <div className="status-bar-row">
                <div className="status-bar-label">
                  <span className="status-bar-name">
                    <span className="status-dot tag-no-answer" style={{ backgroundColor: 'var(--status-no-answer-text)' }}></span>
                    No Answer
                  </span>
                  <span>{statusCounts['No Answer']} ({getPercentage(statusCounts['No Answer'])}%)</span>
                </div>
                <div className="status-bar-track">
                  <div className="status-bar-fill tag-no-answer" style={{ width: `${getPercentage(statusCounts['No Answer'])}%`, backgroundColor: 'var(--status-no-answer-text)' }}></div>
                </div>
              </div>

              {/* Busy */}
              <div className="status-bar-row">
                <div className="status-bar-label">
                  <span className="status-bar-name">
                    <span className="status-dot tag-busy" style={{ backgroundColor: 'var(--status-busy-text)' }}></span>
                    Line Busy
                  </span>
                  <span>{statusCounts['Busy']} ({getPercentage(statusCounts['Busy'])}%)</span>
                </div>
                <div className="status-bar-track">
                  <div className="status-bar-fill tag-busy" style={{ width: `${getPercentage(statusCounts['Busy'])}%`, backgroundColor: 'var(--status-busy-text)' }}></div>
                </div>
              </div>

              {/* Not Interested */}
              <div className="status-bar-row">
                <div className="status-bar-label">
                  <span className="status-bar-name">
                    <span className="status-dot tag-not-interested" style={{ backgroundColor: 'var(--status-not-interested-text)' }}></span>
                    Not Interested
                  </span>
                  <span>{statusCounts['Not Interested']} ({getPercentage(statusCounts['Not Interested'])}%)</span>
                </div>
                <div className="status-bar-track">
                  <div className="status-bar-fill tag-not-interested" style={{ width: `${getPercentage(statusCounts['Not Interested'])}%`, backgroundColor: 'var(--status-not-interested-text)' }}></div>
                </div>
              </div>

              {/* Wrong Number */}
              <div className="status-bar-row">
                <div className="status-bar-label">
                  <span className="status-bar-name">
                    <span className="status-dot tag-wrong-number" style={{ backgroundColor: 'var(--status-wrong-text)' }}></span>
                    Wrong Number
                  </span>
                  <span>{statusCounts['Wrong Number']} ({getPercentage(statusCounts['Wrong Number'])}%)</span>
                </div>
                <div className="status-bar-track">
                  <div className="status-bar-fill tag-wrong-number" style={{ width: `${getPercentage(statusCounts['Wrong Number'])}%`, backgroundColor: 'var(--status-wrong-text)' }}></div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2.5rem', padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>TrackerX Outreach Tip</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Real estate agents value speed and efficiency. Emphasize how TrackerX reduces lead response times down to under 60 seconds and boosts conversions automatically.
              </p>
            </div>
          </section>
        </div>

      </div>

      {/* Quick Log Call Modal */}
      {quickLogClientId && (
        <CallLogModal 
          clientId={quickLogClientId}
          onSave={(callData) => {
            onLogCall(quickLogClientId, callData)
            setQuickLogClientId(null)
          }}
          onClose={() => setQuickLogClientId(null)}
        />
      )}
    </div>
  )
}

export default Dashboard
