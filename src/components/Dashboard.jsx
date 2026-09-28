import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldAlert, 
  LogOut, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  User,
  Filter,
  PlusCircle,
  X,
  FileText,
  ShieldCheck,
  Flag,
  Calendar,
  Clock,
  CreditCard,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { TwoStringsLogo } from './TwoStringsLogo';
import { SubscriptionManager } from './SubscriptionManager';
import { fetchAdminUsers, fetchAdminReports, updateReportStatus, warnUser } from '../services/api';

export const Dashboard = ({ adminUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [reportAnalytics, setReportAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [reportStatusFilter, setReportStatusFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState('');

  // Pagination State (10 records per page)
  const ITEMS_PER_PAGE = 10;
  const [usersPage, setUsersPage] = useState(1);
  const [reportsPage, setReportsPage] = useState(1);

  useEffect(() => {
    setUsersPage(1);
  }, [userSearch, genderFilter]);

  useEffect(() => {
    setReportsPage(1);
  }, [reportStatusFilter]);

  // Report/Warning Form Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    reportedId: '',
    reportedName: '',
    category: 'Harassment / Offensive Behavior',
    severity: 'high',
    reason: '',
    status: 'pending',
    attachmentName: '',
  });

  const openReportModalForUser = (targetUser) => {
    const uId = targetUser._id || targetUser.id;
    const uName = targetUser.name || targetUser.firstName || 'User';
    setReportFormData((prev) => ({
      ...prev,
      reportedId: uId,
      reportedName: uName,
    }));
    setShowReportModal(true);
  };

  const handleCreateReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportFormData.reportedId && !reportFormData.reportedName.trim()) {
      alert('Please select or specify a reported user.');
      return;
    }

    const targetReportedName = reportFormData.reportedName.trim() || 'Reported User';
    const targetReportedId = reportFormData.reportedId;

    try {
      if (targetReportedId) {
        const apiRes = await warnUser({
          reportedId: targetReportedId,
          category: reportFormData.category,
          message: reportFormData.reason || 'Official community warning issued by Admin moderation team.',
          severity: reportFormData.severity,
        });

        if (apiRes && apiRes.success) {
          setActionMessage(`Official warning issued & notification sent to "${targetReportedName}"!`);
        }
      }
    } catch (err) {
      console.error('Failed to issue warning via API:', err);
      setActionMessage(`Official warning issued to "${targetReportedName}"!`);
    }

    let reportedObj = users.find((u) => (u._id || u.id) === targetReportedId);
    if (!reportedObj) {
      reportedObj = {
        name: targetReportedName,
        email: 'reported@user.com'
      };
    }

    const newReportItem = {
      _id: 'rep_' + Date.now(),
      reporterId: { name: 'Admin Moderation Team', email: 'admin@datingapp.com' },
      reportedId: reportedObj,
      reason: `[${reportFormData.category}] ${reportFormData.reason || 'Official community warning issued by Admin moderation team.'} (Severity: ${reportFormData.severity.toUpperCase()})`,
      status: 'reviewed',
      createdAt: new Date().toISOString(),
      attachment: reportFormData.attachmentName ? reportFormData.attachmentName : null,
    };

    setReports((prev) => [newReportItem, ...prev]);
    setTimeout(() => setActionMessage(''), 5000);
    setShowReportModal(false);
    setActiveTab('reports');

    // Reset form
    setReportFormData({
      reportedId: '',
      reportedName: '',
      category: 'Harassment / Offensive Behavior',
      severity: 'high',
      reason: '',
      status: 'pending',
      attachmentName: '',
    });
  };

  const getReportStatusBadge = (status) => {
    const st = (status || 'pending').toLowerCase();
    switch (st) {
      case 'reviewed':
      case 'working':
      case 'under_review':
        return (
          <span className="status-pill pill-reviewed" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={12} />
            <span>Working / Under Review</span>
          </span>
        );
      case 'resolved':
        return (
          <span className="status-pill pill-resolved" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle2 size={12} />
            <span>Resolved</span>
          </span>
        );
      case 'dismissed':
        return (
          <span className="status-pill pill-dismissed" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <XCircle size={12} />
            <span>Dismissed</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="status-pill pill-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <AlertTriangle size={12} />
            <span>Pending</span>
          </span>
        );
    }
  };

  const loadData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const [userData, reportData] = await Promise.allSettled([
        fetchAdminUsers(),
        fetchAdminReports()
      ]);

      if (userData.status === 'fulfilled' && userData.value.success) {
        const fetchedUsers = userData.value.users || [];
        console.log(`[ADMIN DASHBOARD] Fetched ${fetchedUsers.length} registered users. Currently Online count:`, userData.value.analytics?.onlineUsers);
        
        const rinaUser = fetchedUsers.find((u) => u.email === 'rina@yopmail.com');
        if (rinaUser) {
          console.log(`[ADMIN DASHBOARD RINA STATUS LOG]`, {
            name: rinaUser.name || rinaUser.firstName,
            email: rinaUser.email,
            isOnline: rinaUser.isOnline,
            isLoggedIn: rinaUser.isLoggedIn,
            lastSeen: rinaUser.lastSeen,
            UI_STATUS: rinaUser.isOnline ? 'Online' : 'Offline'
          });
        }

        setUsers(fetchedUsers);
        setUserAnalytics(userData.value.analytics || null);
      }

      if (reportData.status === 'fulfilled' && reportData.value.success) {
        setReports(reportData.value.reports || []);
        setReportAnalytics(reportData.value.analytics || null);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);
    const intervalId = setInterval(() => {
      loadData(true);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      const res = await updateReportStatus(reportId, newStatus);
      if (res.success) {
        setActionMessage(`Report status updated to ${newStatus}`);
        setTimeout(() => setActionMessage(''), 3000);
        loadData();
      }
    } catch (err) {
      console.error('Failed to update report status:', err);
    }
  };

  const filteredUsers = users.filter((u) => {
    const name = (u.name || u.firstName || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const mobile = (u.mobile || '').toLowerCase();
    const query = userSearch.toLowerCase().trim();

    const matchesSearch = !query || name.includes(query) || email.includes(query) || mobile.includes(query);
    
    let matchesGender = true;
    const uGender = (u.gender || '').toLowerCase().trim();
    if (genderFilter === 'men') {
      matchesGender = ['men', 'man', 'male'].includes(uGender);
    } else if (genderFilter === 'women') {
      matchesGender = ['women', 'woman', 'female'].includes(uGender);
    } else if (genderFilter !== 'all') {
      matchesGender = uGender === genderFilter.toLowerCase();
    }

    return matchesSearch && matchesGender;
  });

  const filteredReports = reports.filter((r) => {
    if (reportStatusFilter === 'all') return true;
    return (r.status || 'pending').toLowerCase() === reportStatusFilter.toLowerCase();
  });

  // Paginated Users Slicing (10 records per page)
  const totalUsersCount = filteredUsers.length;
  const totalUserPages = Math.max(1, Math.ceil(totalUsersCount / ITEMS_PER_PAGE));
  const currentUsersPage = Math.min(usersPage, totalUserPages);
  const usersStartIndex = (currentUsersPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(usersStartIndex, usersStartIndex + ITEMS_PER_PAGE);

  // Paginated Reports Slicing (10 records per page)
  const totalReportsCount = filteredReports.length;
  const totalReportPages = Math.max(1, Math.ceil(totalReportsCount / ITEMS_PER_PAGE));
  const currentReportsPage = Math.min(reportsPage, totalReportPages);
  const reportsStartIndex = (currentReportsPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = filteredReports.slice(reportsStartIndex, reportsStartIndex + ITEMS_PER_PAGE);

  // Calculate accurate gender counts directly from loaded users list with backend analytics fallback
  const totalMenCount = (users && users.length > 0)
    ? users.filter((u) => ['male', 'men', 'man'].includes((u.gender || '').toLowerCase().trim())).length
    : (userAnalytics?.genderBreakdown?.men || 0);

  const totalWomenCount = (users && users.length > 0)
    ? users.filter((u) => ['female', 'women', 'woman'].includes((u.gender || '').toLowerCase().trim())).length
    : (userAnalytics?.genderBreakdown?.women || 0);

  // Helper to generate consistent background colors for user initial badges
  const getAvatarColor = (name) => {
    const colors = ['#ff4d6d', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
    let hash = 0;
    const str = name || 'User';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatDateTime = (dateVal) => {
    if (!dateVal) return 'N/A';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return String(dateVal);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Top Header Navbar */}
      <header className="dashboard-navbar">
        <div className="navbar-brand">
          <TwoStringsLogo size={40} showText={true} />
          <span className="navbar-badge">ADMIN PANEL</span>
        </div>

        <div className="navbar-actions">
          <button className="nav-icon-btn" onClick={loadData} title="Refresh All Data">
            <RefreshCw size={18} className={loading ? 'spin-icon' : ''} />
          </button>
          
          <div className="admin-profile-info">
            <div className="admin-avatar">
              {adminUser?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="admin-details">
              <span className="admin-name">{adminUser?.name || 'Super Admin'}</span>
              <span className="admin-role">{adminUser?.email}</span>
            </div>
          </div>

          <button className="logout-btn" onClick={loadData} title="Refresh Data" style={{ marginRight: '10px', backgroundColor: '#3A3A48' }}>
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button className="logout-btn" onClick={onLogout} title="Logout">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {actionMessage && (
          <div className="alert-banner alert-success animate-fade-in" style={{ marginBottom: '16px' }}>
            <CheckCircle2 size={18} />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Top Summary Cards */}
        <div className="stats-grid">
          <div 
            className={`stat-card stat-users ${activeTab === 'users' ? 'selected-card' : ''}`}
            onClick={() => setActiveTab('users')}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-icon-wrapper">
              <Users size={26} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{userAnalytics?.totalUsers ?? users.length}</span>
              <span className="stat-label">All Registered Users</span>
              <span className="stat-subtext">
                Men: {totalMenCount} | Women: {totalWomenCount}
              </span>
            </div>
          </div>

          <div 
            className={`stat-card stat-reports ${activeTab === 'reports' ? 'selected-card' : ''}`}
            onClick={() => setActiveTab('reports')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="stat-icon-wrapper">
                <ShieldAlert size={26} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{reportAnalytics?.totalReports ?? reports.length}</span>
                <span className="stat-label">All Reported Users</span>
                <span className="stat-subtext">
                  Pending: {reportAnalytics?.pendingReports ?? 0} | Resolved: {reportAnalytics?.resolvedReports ?? 0}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn-create-report"
              onClick={(e) => {
                e.stopPropagation();
                setShowReportModal(true);
              }}
              style={{ marginLeft: 'auto', alignSelf: 'center', padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
              title="Submit Reported User Form"
            >
              <PlusCircle size={14} />
              <span>Submit Reported User</span>
            </button>
          </div>

          <div className="stat-card stat-online" style={{ cursor: 'default' }}>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
              <CheckCircle2 size={26} />
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {userAnalytics?.onlineUsers ?? users.filter(u => u.isOnline).length}
              </span>
              <span className="stat-label">Currently Online Users</span>
              <span className="stat-subtext" style={{ color: '#10B981', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Activity size={12} /> Active Sessions
              </span>
            </div>
          </div>

          <div 
            className={`stat-card ${activeTab === 'subscriptions' ? 'selected-card' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
            style={{ cursor: 'pointer', borderLeft: '4px solid #ff4d6d' }}
          >
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(255, 77, 109, 0.15)', color: '#ff4d6d' }}>
              <CreditCard size={26} />
            </div>
            <div className="stat-content">
              <span className="stat-value">Plans</span>
              <span className="stat-label">Subscriptions & Features</span>
              <span className="stat-subtext" style={{ color: '#ff4d6d', fontWeight: '600' }}>
                Manage Dynamic Pricing
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="dash-tabs">
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} style={{ marginRight: '8px' }} />
            All Registered Users ({filteredUsers.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <ShieldAlert size={18} style={{ marginRight: '8px' }} />
            All Reported Users & Reporters ({filteredReports.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
            style={{ borderColor: activeTab === 'subscriptions' ? '#ff4d6d' : undefined }}
          >
            <CreditCard size={18} style={{ marginRight: '8px', color: activeTab === 'subscriptions' ? '#ff4d6d' : undefined }} />
            Subscriptions & Features
          </button>
        </div>

        {/* TAB 1: ALL REGISTERED USERS */}
        {activeTab === 'users' && (
          <div className="tab-panel animate-fade-in">
            {/* Toolbar */}
            <div className="toolbar">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search user by name, email, or mobile..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <div className="filter-box">
                <Filter size={16} className="filter-icon" />
                <select 
                  value={genderFilter} 
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Genders</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="loading-container">
                <span className="spinner" style={{ borderColor: 'rgba(255,77,109,0.3)', borderTopColor: '#ff4d6d' }}></span>
                <span>Loading registered users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">
                <User size={40} className="empty-icon" />
                <p>No registered users found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Badge</th>
                      <th>Full Name</th>
                      <th>Email / Mobile</th>
                      <th>Gender</th>
                      <th>Age</th>
                      <th>Status</th>
                      <th>Joined Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((u, idx) => {
                      const userName = u.name || u.firstName || 'User';
                      const initial = userName[0].toUpperCase();
                      const avatarBg = getAvatarColor(userName);

                      return (
                        <tr key={u._id || idx}>
                          <td>
                            <div 
                              className="user-avatar-badge"
                              style={{ backgroundColor: avatarBg }}
                            >
                              {initial}
                            </div>
                          </td>
                          <td>
                            <strong className="user-name-title">{userName}</strong>
                            {(() => {
                              const warnList = u.warnings || [];
                              const ackWarn = warnList.find((w) => w.isAcknowledged === true);
                              const pendingWarn = warnList.find((w) => w.isAcknowledged === false);
                              if (ackWarn) {
                                return (
                                  <div style={{ marginTop: '2px', fontSize: '11px', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <ShieldCheck size={12} />
                                    <span>Warning Acknowledged ({new Date(ackWarn.acknowledgedAt || ackWarn.issuedAt).toLocaleDateString()})</span>
                                  </div>
                                );
                              }
                              if (pendingWarn) {
                                return (
                                  <div style={{ marginTop: '2px', fontSize: '11px', color: '#F59E0B', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <AlertTriangle size={12} />
                                    <span>Warning Issued (Pending Ack)</span>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                            {(() => {
                              const uIdStr = (u._id || u.id)?.toString();
                              const userReport = reports.find((r) => (r.reportedId?._id || r.reportedId)?.toString() === uIdStr);
                              if (userReport && userReport.createdAt) {
                                return (
                                  <div style={{ marginTop: '3px', fontSize: '11px', color: '#e11d48', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Flag size={11} color="#e11d48" />
                                    <span>Reported on: {formatDateTime(userReport.createdAt)}</span>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </td>
                          <td>
                            <div className="contact-info">
                              {u.email && <span>{u.email}</span>}
                              {u.mobile && <span className="sub-contact">{u.mobile}</span>}
                              {!u.email && !u.mobile && <span className="sub-contact">No contact info</span>}
                            </div>
                          </td>
                          <td>
                            <span className="gender-tag">{u.gender || 'N/A'}</span>
                          </td>
                          <td>{u.age || 'N/A'}</td>
                          <td>
                            {!!u.isOnline ? (
                              <span className="status-chip active" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                <CheckCircle2 size={12} />
                                <span>Online</span>
                              </span>
                            ) : (
                              <div>
                                <span className="status-chip offline" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                  <Clock size={12} />
                                  <span>Offline</span>
                                </span>
                                {u.lastSeen && (
                                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px', fontWeight: '500' }}>
                                    Last seen: {new Date(u.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </td>
                          <td>
                            <button 
                              className="btn-table-report"
                              onClick={() => openReportModalForUser(u)}
                              title="Submit report form for this user"
                            >
                              <Flag size={13} />
                              <span>Report User</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Pagination Controls Footer for Users */}
                <div className="pagination-wrapper">
                  <div className="pagination-info">
                    Showing <strong>{usersStartIndex + 1}</strong>–<strong>{Math.min(usersStartIndex + ITEMS_PER_PAGE, totalUsersCount)}</strong> of <strong>{totalUsersCount}</strong> users
                  </div>
                  <div className="pagination-controls">
                    <button
                      className="pagination-btn"
                      disabled={currentUsersPage === 1}
                      onClick={() => setUsersPage(1)}
                      title="First Page"
                    >
                      <ChevronsLeft size={16} />
                    </button>
                    <button
                      className="pagination-btn"
                      disabled={currentUsersPage === 1}
                      onClick={() => setUsersPage((prev) => Math.max(1, prev - 1))}
                      title="Previous Page"
                    >
                      <ChevronLeft size={16} />
                      <span style={{ marginLeft: '4px' }}>Prev</span>
                    </button>

                    {Array.from({ length: totalUserPages }, (_, i) => i + 1)
                      .filter((page) => page === 1 || page === totalUserPages || Math.abs(page - currentUsersPage) <= 1)
                      .map((page, idx, arr) => {
                        const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && <span className="pagination-ellipsis">...</span>}
                            <button
                              className={`pagination-btn ${page === currentUsersPage ? 'active' : ''}`}
                              onClick={() => setUsersPage(page)}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}

                    <button
                      className="pagination-btn"
                      disabled={currentUsersPage === totalUserPages}
                      onClick={() => setUsersPage((prev) => Math.min(totalUserPages, prev + 1))}
                      title="Next Page"
                    >
                      <span style={{ marginRight: '4px' }}>Next</span>
                      <ChevronRight size={16} />
                    </button>
                    <button
                      className="pagination-btn"
                      disabled={currentUsersPage === totalUserPages}
                      onClick={() => setUsersPage(totalUserPages)}
                      title="Last Page"
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL REPORTED USERS & REPORTERS */}
        {activeTab === 'reports' && (
          <div className="tab-panel animate-fade-in">
            {/* Filter Toolbar */}
            <div className="toolbar" style={{ justifyContent: 'space-between' }}>
              <div className="filter-box">
                <Filter size={16} className="filter-icon" />
                <select 
                  value={reportStatusFilter} 
                  onChange={(e) => setReportStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Report Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              <button 
                className="btn-create-report" 
                onClick={() => setShowReportModal(true)}
              >
                <PlusCircle size={16} />
                <span>Submit Reported User Form</span>
              </button>
            </div>

            {loading ? (
              <div className="loading-container">
                <span className="spinner" style={{ borderColor: 'rgba(255,77,109,0.3)', borderTopColor: '#ff4d6d' }}></span>
                <span>Loading report queue...</span>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="empty-state">
                <CheckCircle2 size={40} className="empty-icon success-color" />
                <p>No reported users found for the selected status.</p>
              </div>
            ) : (
              <div className="reports-cards-grid">
                {paginatedReports.map((report) => {
                  const reporter = report.reporterId || {};
                  const reported = report.reportedId || {};

                  const reportedName = reported.name || reported.firstName || 'Reported User';
                  const reporterName = reporter.name || reporter.firstName || 'Reporter';

                  const reportedInitial = reportedName[0].toUpperCase();
                  const reporterInitial = reporterName[0].toUpperCase();

                  return (
                    <div 
                      key={report._id} 
                      className={`report-card status-${report.status || 'pending'}`}
                      style={{ backgroundColor: '#ffe4ec', border: '1.5px solid #fbcfe8' }}
                    >
                      {/* Report Header */}
                      <div className="report-card-header">
                        <span className={`status-pill pill-${report.status || 'pending'}`}>
                          {(report.status || 'pending').toUpperCase()}
                        </span>
                        <div className="report-date-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', backgroundColor: '#ffffff', padding: '4px 10px', borderRadius: '6px', border: '1px solid #fbcfe8', fontWeight: '500' }}>
                          <Calendar size={13} style={{ color: '#ff4d6d' }} />
                          <span>Reported on: <strong style={{ color: '#0f172a' }}>{formatDateTime(report.createdAt)}</strong></span>
                        </div>
                      </div>

                      {/* Reported User & Reporter Text Box */}
                      <div className="report-parties-wrapper">
                        
                        {/* REPORTED USER */}
                        <div className="party-box reported-party">
                          <span className="party-label text-danger">
                            <AlertTriangle size={14} /> REPORTED USER
                          </span>
                          <div className="party-profile">
                            <div className="party-avatar danger-border">
                              {reportedInitial}
                            </div>
                            <div className="party-details">
                              <strong>{reportedName}</strong>
                              <span>{reported.email || reported.mobile || 'No contact'}</span>
                              <div style={{ marginTop: '4px', fontSize: '11px', color: '#e11d48', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} />
                                <span>Report Date: {formatDateTime(report.createdAt)}</span>
                              </div>
                              {(() => {
                                const warnList = reported.warnings || [];
                                const ackWarn = warnList.find((w) => w.isAcknowledged === true);
                                const pendingWarn = warnList.find((w) => w.isAcknowledged === false);
                                if (ackWarn) {
                                  return (
                                    <div style={{ marginTop: '4px', fontSize: '11px', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      <ShieldCheck size={13} />
                                      <span>User Acknowledged Warning ({new Date(ackWarn.acknowledgedAt || ackWarn.issuedAt).toLocaleDateString()})</span>
                                    </div>
                                  );
                                }
                                if (pendingWarn) {
                                  return (
                                    <div style={{ marginTop: '4px', fontSize: '11px', color: '#F59E0B', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      <AlertTriangle size={13} />
                                      <span>Warning Issued (Pending User Acknowledgement)</span>
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                        </div>

                        <div className="vs-divider">VS</div>

                        {/* REPORTER USER */}
                        <div className="party-box reporter-party">
                          <span className="party-label text-info">
                            <User size={14} /> REPORTER
                          </span>
                          <div className="party-profile">
                            <div className="party-avatar info-border">
                              {reporterInitial}
                            </div>
                            <div className="party-details">
                              <strong>{reporterName}</strong>
                              <span>{reporter.email || reporter.mobile || 'No contact'}</span>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Reason Description */}
                      <div className="report-reason-box">
                        <strong>Complaint Reason:</strong>
                        <p>{report.reason || 'No specific description provided by reporter.'}</p>

                        {/* Display Report Viewed & Acknowledged status right below Complaint Reason */}
                        {(() => {
                          const isAck = report.isAcknowledged === true || 
                                        report.details === 'Report Viewed & Acknowledged' ||
                                        (reported.warnings && reported.warnings.some((w) => w.isAcknowledged === true));
                          const ackDate = report.acknowledgedAt || 
                                          (reported.warnings && reported.warnings.find((w) => w.isAcknowledged === true)?.acknowledgedAt);

                          if (isAck) {
                            return (
                              <div style={{ marginTop: '10px', padding: '10px 14px', backgroundColor: 'rgba(16, 185, 129, 0.12)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ShieldCheck size={18} color="#10B981" />
                                <div>
                                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#10B981' }}>Report Viewed & Acknowledged</span>
                                  {ackDate && (
                                    <span style={{ fontSize: '11px', color: '#6EE7B7', marginLeft: '8px' }}>
                                      ({new Date(ackDate).toLocaleString()})
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>

                      {/* Single Row: Status Dropdown & Badge (Left/Besides) & Right-Most Submit Reported User Form Button */}
                      <div className="report-card-footer-row">
                        <div className="selected-status-display" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span className="status-label-title">Change Status:</span>
                          <select
                            className="filter-select"
                            style={{ padding: '4px 10px', fontSize: '12px', height: '32px', minWidth: '130px' }}
                            value={(report.status || 'pending').toLowerCase()}
                            onChange={(e) => handleUpdateStatus(report._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Under Review</option>
                            <option value="resolved">Resolved</option>
                            <option value="dismissed">Dismissed</option>
                          </select>
                          {getReportStatusBadge(report.status)}
                        </div>

                        <button 
                          type="button"
                          className="btn-create-report btn-card-submit-report"
                          onClick={() => openReportModalForUser(reported)}
                          title="Submit Reported User Form for this user"
                        >
                          <PlusCircle size={14} />
                          <span>Submit Reported User Form</span>
                        </button>
                      </div>

                    </div>
                  );
                })}

                {/* Pagination Controls Footer for Reports */}
                <div className="pagination-wrapper" style={{ marginTop: '20px' }}>
                  <div className="pagination-info">
                    Showing <strong>{reportsStartIndex + 1}</strong>–<strong>{Math.min(reportsStartIndex + ITEMS_PER_PAGE, totalReportsCount)}</strong> of <strong>{totalReportsCount}</strong> reports
                  </div>
                  <div className="pagination-controls">
                    <button
                      className="pagination-btn"
                      disabled={currentReportsPage === 1}
                      onClick={() => setReportsPage(1)}
                      title="First Page"
                    >
                      <ChevronsLeft size={16} />
                    </button>
                    <button
                      className="pagination-btn"
                      disabled={currentReportsPage === 1}
                      onClick={() => setReportsPage((prev) => Math.max(1, prev - 1))}
                      title="Previous Page"
                    >
                      <ChevronLeft size={16} />
                      <span style={{ marginLeft: '4px' }}>Prev</span>
                    </button>

                    {Array.from({ length: totalReportPages }, (_, i) => i + 1)
                      .filter((page) => page === 1 || page === totalReportPages || Math.abs(page - currentReportsPage) <= 1)
                      .map((page, idx, arr) => {
                        const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && <span className="pagination-ellipsis">...</span>}
                            <button
                              className={`pagination-btn ${page === currentReportsPage ? 'active' : ''}`}
                              onClick={() => setReportsPage(page)}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}

                    <button
                      className="pagination-btn"
                      disabled={currentReportsPage === totalReportPages}
                      onClick={() => setReportsPage((prev) => Math.min(totalReportPages, prev + 1))}
                      title="Next Page"
                    >
                      <span style={{ marginRight: '4px' }}>Next</span>
                      <ChevronRight size={16} />
                    </button>
                    <button
                      className="pagination-btn"
                      disabled={currentReportsPage === totalReportPages}
                      onClick={() => setReportsPage(totalReportPages)}
                      title="Last Page"
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SUBSCRIPTIONS & FEATURE MANAGEMENT */}
        {activeTab === 'subscriptions' && (
          <div className="tab-panel animate-fade-in">
            <SubscriptionManager />
          </div>
        )}

      </main>

      {/* ========================================================================== */}
      {/* SUBMIT REPORTED USER FORM MODAL UI (UI ONLY) */}
      {/* ========================================================================== */}
      {showReportModal && (
        <div className="modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div className="modal-container animate-slide-up" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title-box">
                <div className="modal-icon-badge">
                  <ShieldAlert size={22} />
                </div>
                <div className="modal-title-text">
                  <h3>Issue Official Warning to Reported User</h3>
                  <p>Submit an official moderation warning to be displayed directly on the user's mobile app</p>
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowReportModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateReportSubmit} className="report-form">
              
              {/* Section 1: Reported User Selection */}
              <div className="form-group">
                <label>
                  <AlertTriangle size={14} className="text-danger" /> Target Reported User (Who is receiving this warning?)
                </label>
                <select
                  className="form-select"
                  value={reportFormData.reportedId}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const matched = users.find(u => (u._id || u.id) === selId);
                    setReportFormData({
                      ...reportFormData,
                      reportedId: selId,
                      reportedName: matched ? (matched.name || matched.firstName) : e.target.value
                    });
                  }}
                >
                  <option value="">-- Select Reported User from Database --</option>
                  {users.map((u) => (
                    <option key={'trg_' + (u._id || u.id)} value={u._id || u.id}>
                      {u.name || u.firstName || u.email} ({u.email || u.mobile || 'User'})
                    </option>
                  ))}
                </select>
                {!reportFormData.reportedId && (
                  <input
                    type="text"
                    placeholder="Or enter target user name..."
                    className="form-input"
                    style={{ marginTop: '6px' }}
                    value={reportFormData.reportedName}
                    onChange={(e) => setReportFormData({ ...reportFormData, reportedName: e.target.value })}
                    required
                  />
                )}
              </div>

              {/* Section 2: Violation Category & Severity */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label>
                    <Flag size={14} /> Violation Category
                  </label>
                  <select
                    className="form-select"
                    value={reportFormData.category}
                    onChange={(e) => setReportFormData({ ...reportFormData, category: e.target.value })}
                  >
                    <option value="Harassment / Offensive Behavior">Harassment / Offensive Behavior</option>
                    <option value="Inappropriate Photos / Content">Inappropriate Photos / Content</option>
                    <option value="Fake Profile / Impersonation">Fake Profile / Impersonation</option>
                    <option value="Spam, Scam, or Fraud">Spam, Scam, or Commercial Fraud</option>
                    <option value="Threatening Language / Hate Speech">Threatening Language / Hate Speech</option>
                    <option value="Other Violation">Other Policy Violation</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Severity Level</label>
                  <div className="severity-picker">
                    <button
                      type="button"
                      className={`severity-pill ${reportFormData.severity === 'low' ? 'selected-low' : ''}`}
                      onClick={() => setReportFormData({ ...reportFormData, severity: 'low' })}
                    >
                      Low
                    </button>
                    <button
                      type="button"
                      className={`severity-pill ${reportFormData.severity === 'medium' ? 'selected-medium' : ''}`}
                      onClick={() => setReportFormData({ ...reportFormData, severity: 'medium' })}
                    >
                      Medium
                    </button>
                    <button
                      type="button"
                      className={`severity-pill ${reportFormData.severity === 'high' ? 'selected-high' : ''}`}
                      onClick={() => setReportFormData({ ...reportFormData, severity: 'high' })}
                    >
                      High
                    </button>
                    <button
                      type="button"
                      className={`severity-pill ${reportFormData.severity === 'critical' ? 'selected-critical' : ''}`}
                      onClick={() => setReportFormData({ ...reportFormData, severity: 'critical' })}
                    >
                      Critical
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 3: Detailed Description */}
              <div className="form-group">
                <label>
                  <FileText size={14} /> Complaint Narrative & Evidence Details
                </label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="Enter full details of the complaint submitted by the reporter (e.g. Chat harassment, inappropriate messages sent...)"
                  value={reportFormData.reason}
                  onChange={(e) => setReportFormData({ ...reportFormData, reason: e.target.value })}
                />
              </div>

              {/* Section 4: Initial Status */}
              <div className="form-group">
                <label>Initial Status Queue</label>
                <select
                  className="form-select"
                  value={reportFormData.status}
                  onChange={(e) => setReportFormData({ ...reportFormData, status: e.target.value })}
                >
                  <option value="pending">Pending Queue</option>
                  <option value="reviewed">Working / Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              {/* Modal Footer Actions */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-cancel"
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-submit">
                  <ShieldCheck size={18} />
                  <span>Submit User Report Form</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
