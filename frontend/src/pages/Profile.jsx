import React, { useState, useEffect } from 'react';
import { Mail, MapPin, User, Save, Edit, RefreshCw } from 'lucide-react';

export default function Profile({ backendUrl, triggerNotification }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', address: '' });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/profile`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({ name: data.name, email: data.email, address: data.address });
      } else {
        triggerNotification('Error fetching profile from database', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Connection to database profile api failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendUrl}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setProfile(data.user);
        setIsEditing(false);
        triggerNotification('Profile updated successfully in MySQL Database!');
      } else {
        triggerNotification(data.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Database connection error during update', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 0', gap: '0.75rem', color: 'var(--text-secondary)' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite' }} />
        <span>Loading profile data from database...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>Failed to load user profile.</h3>
        <p>Ensure the MySQL database is running and user table is seeded.</p>
      </div>
    );
  }

  const initialLetter = profile.name ? profile.name.charAt(0).toUpperCase() : 'B';

  return (
    <div className="profile-container glass-panel">
      <div className="profile-header">
        <div className="profile-avatar-placeholder">
          {initialLetter}
        </div>
        <div>
          <h2>User Profile</h2>
          <p>Database Row ID: {profile.id}</p>
        </div>
      </div>

      {!isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <User size={20} style={{ color: 'var(--text-muted)' }} />
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Full Name</span>
              <h3 style={{ marginTop: '0.15rem' }}>{profile.name}</h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Mail size={20} style={{ color: 'var(--text-muted)' }} />
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email Address</span>
              <h3 style={{ marginTop: '0.15rem' }}>{profile.email}</h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <MapPin size={20} style={{ color: 'var(--text-muted)' }} />
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Shipping Address</span>
              <p style={{ marginTop: '0.15rem', color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 600 }}>{profile.address}</p>
            </div>
          </div>

          <button className="btn btn-secondary" style={{ marginTop: '1.5rem', width: 'fit-content' }} onClick={() => setIsEditing(true)}>
            <Edit size={16} /> Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="profile-form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="input-field"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="input-field"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor="address">Shipping Address</label>
            <textarea
              id="address"
              name="address"
              className="input-field"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              style={{ resize: 'none', fontFamily: 'inherit' }}
              required
            />
          </div>

          <div className="profile-form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setIsEditing(false); setFormData({ name: profile.name, email: profile.email, address: profile.address }); }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
