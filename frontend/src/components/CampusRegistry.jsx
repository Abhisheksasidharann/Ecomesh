import React, { useState } from 'react';
import { EMISSION_FACTORS } from '../lib/constants';
import { Search, Filter, Download, CheckCircle, Clock, XCircle, Hash, MapPin, Eye } from 'lucide-react';

export default function CampusRegistry({ submissions = [], onExportCSV }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const filtered = submissions.filter((sub) => {
    const matchesSearch =
      sub.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.student_email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || sub.activity === categoryFilter;
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
            School Green Activity Feed
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '4px' }}>
            Browse verified green actions, student contributions, and real climate impact across our school
          </p>
        </div>

        <button onClick={onExportCSV} className="btn-primary">
          <Download size={18} />
          Download School Report (CSV)
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="cs-card" style={{ marginBottom: '24px', padding: '20px 24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          {/* Search Box */}
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, email, or action ID..."
              className="form-input"
              style={{ height: '46px', paddingLeft: '40px' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
          </div>

          {/* Category Filter */}
          <div style={{ minWidth: '180px' }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-input"
              style={{ height: '46px', padding: '0 14px', cursor: 'pointer' }}
            >
              <option value="all">All Categories</option>
              {Object.keys(EMISSION_FACTORS).map((key) => (
                <option key={key} value={key}>
                  {EMISSION_FACTORS[key].name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '160px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ height: '46px', padding: '0 14px', cursor: 'pointer' }}
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified Only</option>
              <option value="review">In Review Only</option>
              <option value="rejected">Rejected Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="cs-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}>
              No matching records found
            </p>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              Try adjusting your search query or filter criteria
            </p>
          </div>
        ) : (
          <div className="cs-table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="cs-table">
              <thead>
                <tr>
                  <th>Action ID</th>
                  <th>Student</th>
                  <th>Activity</th>
                  <th>Amount</th>
                  <th>CO₂ Saved</th>
                  <th>EcoPoints</th>
                  <th>Location</th>
                  <th>Photo Evidence</th>
                  <th>Confidence</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => {
                  const factor = EMISSION_FACTORS[sub.activity] || {};
                  return (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                        {sub.id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{sub.student_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{sub.student_email}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: factor.color || '#334155' }}>
                          {factor.name || sub.activity}
                        </span>
                      </td>
                      <td>
                        {sub.quantity} {sub.unit}
                      </td>
                      <td style={{ fontWeight: 700, color: '#059669' }}>
                        {sub.co2_saved} kg
                      </td>
                      <td style={{ fontWeight: 700, color: '#d97706' }}>
                        +{sub.points}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#334155' }}>
                          {sub.location_type === 'school' ? 'On Campus' : 'At Home'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {sub.distance_meters} m from school
                        </div>
                      </td>
                      <td>
                        {sub.photo_url ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              onClick={() => setSelectedPhoto(sub.photo_url)}
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: '1px solid #cbd5e1',
                                flexShrink: 0,
                              }}
                            >
                              <img
                                src={sub.photo_url}
                                alt="thumb"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                            <code style={{ fontSize: '0.7rem', color: '#64748b' }}>
                              {sub.photo_hash?.slice(0, 10)}...
                            </code>
                          </div>
                        ) : (
                          <code style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {sub.photo_hash?.slice(0, 12)}...
                          </code>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: Number(sub.trust_score) >= 0.7 ? '#059669' : '#ea580c' }}>
                          {Number(sub.trust_score).toFixed(2)}
                        </div>
                      </td>
                      <td>
                        {sub.status === 'verified' && (
                          <span className="status-badge verified">
                            <CheckCircle size={13} />
                            Verified
                          </span>
                        )}
                        {sub.status === 'review' && (
                          <span className="status-badge review">
                            <Clock size={13} />
                            In Review
                          </span>
                        )}
                        {sub.status === 'rejected' && (
                          <span className="status-badge rejected">
                            <XCircle size={13} />
                            Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Photo Enlarge Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '24px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '800px',
              maxHeight: '90vh',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <img
              src={selectedPhoto}
              alt="Enlarged evidence"
              style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain' }}
            />
            <div style={{ padding: '14px', textAlign: 'right', backgroundColor: '#f8fafc' }}>
              <button onClick={() => setSelectedPhoto(null)} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
