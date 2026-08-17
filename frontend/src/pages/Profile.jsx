import React, { useState, useEffect } from 'react';
import { Mail, MapPin, User, Save, Edit, RefreshCw, UserPlus, Plus, Check, Users } from 'lucide-react';

export default function Profile({ backendUrl, triggerNotification, activeProfile, setActiveProfile }) {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(activeProfile?.id || 1);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [formData, setFormData] = useState({ 
    name: activeProfile?.name || '', 
    email: activeProfile?.email || '', 
    address: activeProfile?.address || '' 
  });

  // New profile form state
  const [newProfileData, setNewProfileData] = useState({
    name: '',
    email: '',
    address: ''
  });

  // Fetch all profiles from MySQL database
  const fetchAllProfiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/profiles`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setProfiles(data);
          const current = data.find(p => p.id === (activeProfile?.id || selectedProfileId)) || data[0];
          setSelectedProfileId(current.id);
          setFormData({ name: current.name, email: current.email, address: current.address });
          if (setActiveProfile) {
            setActiveProfile(current);
          }
        }
      } else {
        // Fallback to single profile endpoint
        const singleRes = await fetch(`${backendUrl}/api/profile`);
        if (singleRes.ok) {
          const singleData = await singleRes.json();
          setProfiles([singleData]);
          setSelectedProfileId(singleData.id);
          setFormData({ name: singleData.name, email: singleData.email, address: singleData.address });
          if (setActiveProfile) setActiveProfile(singleData);
        }
      }
    } catch (err) {
      console.error('Error fetching profiles:', err);
      triggerNotification('Connection to database profiles API failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProfiles();
  }, []);

  // Handle switching active profile
  const handleSelectProfile = (p) => {
    setSelectedProfileId(p.id);
    setFormData({ name: p.name, email: p.email, address: p.address });
    setIsEditing(false);
    setIsAddingNew(false);
    if (setActiveProfile) {
      setActiveProfile(p);
    }
    triggerNotification(`Switched active profile to ${p.name}`);
  };

  // Handle input changes
  const handleEditChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNewChange = (e) => {
    setNewProfileData({ ...newProfileData, [e.target.name]: e.target.value });
  };

  // Submit Edit Existing Profile
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendUrl}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedProfileId, ...formData })
      });
      const data = await response.json();
      if (response.ok) {
        const updated = data.user || { id: selectedProfileId, ...formData };
        setProfiles(prev => prev.map(p => (p.id === selectedProfileId ? updated : p)));
        if (setActiveProfile) setActiveProfile(updated);
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

  // Submit Add New Profile
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newProfileData.name || !newProfileData.email || !newProfileData.address) {
      triggerNotification('Please fill in all profile fields', 'error');
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfileData)
      });
      const data = await response.json();
      if (response.ok) {
        const newUser = data.user;
        setProfiles(prev => [...prev, newUser]);
        setSelectedProfileId(newUser.id);
        setFormData({ name: newUser.name, email: newUser.email, address: newUser.address });
        if (setActiveProfile) setActiveProfile(newUser);
        setNewProfileData({ name: '', email: '', address: '' });
        setIsAddingNew(false);
        triggerNotification(`New profile "${newUser.name}" added successfully!`);
      } else {
        triggerNotification(data.error || 'Failed to create new profile', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Database connection error during profile creation', 'error');
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

  const currentProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0] || activeProfile;
  const initialLetter = currentProfile?.name ? currentProfile.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="profile-container glass-panel">
      {/* Profile Switcher & Add Bar */}
      <div className="profile-switcher-bar">
        <div className="profile-switcher-title">
          <Users size={18} />
          <span>Active Profiles ({profiles.length})</span>
        </div>
        <div className="profile-chips">
          {profiles.map(p => (
            <button
              key={p.id}
              className={`profile-chip ${p.id === selectedProfileId && !isAddingNew ? 'active' : ''}`}
              onClick={() => handleSelectProfile(p)}
              type="button"
            >
              <span className="chip-avatar">{p.name.charAt(0).toUpperCase()}</span>
              <span>{p.name}</span>
              {p.id === selectedProfileId && !isAddingNew && <Check size={14} className="chip-check" />}
            </button>
          ))}
          <button
            className={`btn-add-profile-chip ${isAddingNew ? 'active' : ''}`}
            onClick={() => {
              setIsAddingNew(true);
              setIsEditing(false);
            }}
            type="button"
          >
            <Plus size={16} /> Add Profile
          </button>
        </div>
      </div>

      {/* Mode 1: Add New Profile Mode */}
      {isAddingNew ? (
        <div>
          <div className="profile-header">
            <div className="profile-avatar-placeholder new-avatar">
              <UserPlus size={32} />
            </div>
            <div>
              <h2>Create New Profile</h2>
              <p>Fill details to add a new profile to the database</p>
            </div>
          </div>

          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="profile-form-group">
              <label htmlFor="newName">Full Name</label>
              <input
                type="text"
                id="newName"
                name="name"
                className="input-field"
                placeholder="e.g. Priya Sharma"
                value={newProfileData.name}
                onChange={handleNewChange}
                required
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="newEmail">Email Address</label>
              <input
                type="email"
                id="newEmail"
                name="email"
                className="input-field"
                placeholder="e.g. priya@example.com"
                value={newProfileData.email}
                onChange={handleNewChange}
                required
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="newAddress">Shipping Address</label>
              <textarea
                id="newAddress"
                name="address"
                className="input-field"
                rows={3}
                placeholder="e.g. 45 Park Avenue, Bangalore, KA - 560001"
                value={newProfileData.address}
                onChange={handleNewChange}
                style={{ resize: 'none', fontFamily: 'inherit' }}
                required
              />
            </div>

            <div className="profile-form-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsAddingNew(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <UserPlus size={16} /> Save New Profile
              </button>
            </div>
          </form>
        </div>
      ) : !currentProfile ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>No profiles available.</h3>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setIsAddingNew(true)}>
            <Plus size={16} /> Create First Profile
          </button>
        </div>
      ) : (
        /* Mode 2: View or Edit Current Profile */
        <div>
          <div className="profile-header">
            <div className="profile-avatar-placeholder">
              {initialLetter}
            </div>
            <div>
              <h2>{currentProfile.name}</h2>
              <p>Database Profile ID: #{currentProfile.id}</p>
            </div>
          </div>

          {!isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <User size={20} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Full Name</span>
                  <h3 style={{ marginTop: '0.15rem' }}>{currentProfile.name}</h3>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Mail size={20} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email Address</span>
                  <h3 style={{ marginTop: '0.15rem' }}>{currentProfile.email}</h3>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <MapPin size={20} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Shipping Address</span>
                  <p style={{ marginTop: '0.15rem', color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 600 }}>{currentProfile.address}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setFormData({ name: currentProfile.name, email: currentProfile.email, address: currentProfile.address });
                    setIsEditing(true);
                  }}
                >
                  <Edit size={16} /> Edit Profile
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setIsAddingNew(true)}
                >
                  <UserPlus size={16} /> Add Another Profile
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="profile-form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="input-field"
                  value={formData.name}
                  onChange={handleEditChange}
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
                  onChange={handleEditChange}
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
                  onChange={handleEditChange}
                  style={{ resize: 'none', fontFamily: 'inherit' }}
                  required
                />
              </div>

              <div className="profile-form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ name: currentProfile.name, email: currentProfile.email, address: currentProfile.address });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
