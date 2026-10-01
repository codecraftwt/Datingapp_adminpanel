import React, { useState, useEffect } from 'react';
import ResponsiveSelect from './ResponsiveSelect';
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
  ChevronsRight,
  UserCheck,
  UserX,
  Menu,
  Crown,
  Sparkles,
  Award,
  Zap,
  DollarSign,
  Package,
  MessageSquare,
  Mail,
  Trash2,
  HelpCircle,
  Eye,
  Copy,
  Check,
  Phone,
  Save,
} from 'lucide-react';
import { TwoStringsLogo } from './TwoStringsLogo';
import { SubscriptionManager } from './SubscriptionManager';
import { 
  fetchAdminUsers, 
  fetchAdminReports, 
  updateReportStatus, 
  warnUser, 
  updateUserStatus, 
  fetchUserSubscription,
  fetchContactReports,
  updateContactReportStatus as updateContactStatusApi,
  deleteContactReport as deleteContactReportApi,
} from '../services/api';

export const Dashboard = ({ adminUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [contactReports, setContactReports] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [reportAnalytics, setReportAnalytics] = useState(null);
  const [contactAnalytics, setContactAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshPage = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [accountStatusFilter, setAccountStatusFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [reportStatusFilter, setReportStatusFilter] = useState('all');
  const [contactSearch, setContactSearch] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState('');

  // User Activate/Deactivate Status Modal State
  const [statusModal, setStatusModal] = useState({
    open: false,
    user: null,
    newStatus: false,
    reason: '',
    submitting: false,
  });

  // User Subscription Details Modal State
  const [subscriptionModal, setSubscriptionModal] = useState({
    open: false,
    user: null,
    loading: false,
    details: null,
  });

  const handleViewUserSubscription = async (targetUser) => {
    const uId = targetUser._id || targetUser.id;
    setSubscriptionModal({
      open: true,
      user: targetUser,
      loading: true,
      details: null,
    });
    try {
      const res = await fetchUserSubscription(uId);
      setSubscriptionModal((prev) => ({
        ...prev,
        loading: false,
        details: res,
      }));
    } catch (e) {
      console.error('Failed to fetch user subscription details:', e);
      setSubscriptionModal((prev) => ({
        ...prev,
        loading: false,
        details: null,
      }));
    }
  };

  // Pagination State (10 records per page)
  const ITEMS_PER_PAGE = 10;
  const [usersPage, setUsersPage] = useState(1);
  const [reportsPage, setReportsPage] = useState(1);
  const [contactReportsPage, setContactReportsPage] = useState(1);

  useEffect(() => {
    setUsersPage(1);
  }, [userSearch, genderFilter, accountStatusFilter, subscriptionFilter]);

  useEffect(() => {
    setReportsPage(1);
  }, [reportStatusFilter]);

  useEffect(() => {
    setContactReportsPage(1);
  }, [contactSearch, contactStatusFilter]);

  // Contact Us Report View Details Modal State
  const [viewContactModal, setViewContactModal] = useState({
    open: false,
    report: null,
    adminNotes: '',
    savingNotes: false,
  });

  const [copiedField, setCopiedField] = useState('');

  const handleOpenContactModal = (report) => {
    setViewContactModal({
      open: true,
      report,
      adminNotes: report.adminNotes || '',
      savingNotes: false,
    });
  };

  const handleCopyText = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleSaveContactNotes = async () => {
    if (!viewContactModal.report) return;
    setViewContactModal((prev) => ({ ...prev, savingNotes: true }));
    try {
      const reportId = viewContactModal.report._id;
      const currentStatus = viewContactModal.report.status || 'pending';
      const res = await updateContactStatusApi(reportId, currentStatus, viewContactModal.adminNotes);
      if (res.success) {
        setActionMessage('Admin notes saved successfully!');
        setTimeout(() => setActionMessage(''), 3500);
        setContactReports((prev) =>
          prev.map((item) => (item._id === reportId ? { ...item, adminNotes: viewContactModal.adminNotes } : item))
        );
        setViewContactModal((prev) => ({
          ...prev,
          report: { ...prev.report, adminNotes: prev.adminNotes },
          savingNotes: false,
        }));
      }
    } catch (err) {
      console.error('Failed to save admin notes:', err);
      alert('Failed to save admin notes.');
      setViewContactModal((prev) => ({ ...prev, savingNotes: false }));
    }
  };

  const handleModalStatusChange = async (newStatus) => {
    if (!viewContactModal.report) return;
    try {
      const reportId = viewContactModal.report._id;
      const res = await updateContactStatusApi(reportId, newStatus, viewContactModal.adminNotes);
      if (res.success) {
        setActionMessage(`Status updated to ${newStatus}!`);
        setTimeout(() => setActionMessage(''), 3500);
        setContactReports((prev) =>
          prev.map((item) => (item._id === reportId ? { ...item, status: newStatus } : item))
        );
        setViewContactModal((prev) => ({
          ...prev,
          report: { ...prev.report, status: newStatus },
        }));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status.');
    }
  };

  // Report/Warning Form Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    reportedId: '',
    reportedName: '',
    category: 'Harassment / Offensive Behavior',
    severity: 'high',
    reportId: null,
    reason: '',
    status: 'pending',
    attachmentName: '',
  });

  const handleOpenStatusModal = (targetUser, newStatus) => {
    setStatusModal({
      open: true,
      user: targetUser,
      newStatus,
      reason: newStatus ? '' : 'Account deactivated by admin moderation team',
      submitting: false,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusModal.user) return;
    const uId = statusModal.user._id || statusModal.user.id;
    const uName = statusModal.user.name || statusModal.user.firstName || 'User';
    setStatusModal((prev) => ({ ...prev, submitting: true }));
    try {
      await updateUserStatus(uId, statusModal.newStatus, statusModal.reason);
      setUsers((prev) =>
        prev.map((u) => {
          const currentId = (u._id || u.id)?.toString();
          if (currentId === uId.toString()) {
            return {
              ...u,
              isActive: statusModal.newStatus,
              deactivatedAt: statusModal.newStatus ? null : new Date(),
              deactivationReason: statusModal.newStatus ? null : statusModal.reason,
            };
          }
          return u;
        })
      );
      setActionMessage(
        statusModal.newStatus
          ? `User ${uName} has been activated successfully.`
          : `User ${uName} has been deactivated and blocked from exploring the app.`
      );
      setTimeout(() => setActionMessage(''), 4500);
      setStatusModal({ open: false, user: null, newStatus: false, reason: '', submitting: false });
    } catch (err) {
      console.error('Failed to update user status:', err);
      alert(err.response?.data?.message || 'Failed to update user status.');
      setStatusModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const openReportModalForUser = (targetUser, existingReportId = null) => {
    const uId = targetUser._id || targetUser.id;
    const uName = targetUser.name || targetUser.firstName || 'User';
    setReportFormData((prev) => ({
      ...prev,
      reportedId: uId,
      reportedName: uName,
      reportId: existingReportId || null,
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
          reportId: reportFormData.reportId || undefined,
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

    // Check if an existing report card exists for this reported user
    const targetReportId = reportFormData.reportId || reports.find((r) => {
      const rRepId = r.reportedId?._id || r.reportedId?.id || r.reportedId;
      return rRepId && rRepId.toString() === targetReportedId.toString();
    })?._id;

    if (targetReportId) {
      // Update existing card in-place (no duplicate card)
      setReports((prev) => prev.map((rep) => {
        if (rep._id === targetReportId) {
          return {
            ...rep,
            reason: `[${reportFormData.category}] ${reportFormData.reason || 'Official community warning issued by Admin moderation team.'} (Severity: ${reportFormData.severity.toUpperCase()})`,
            details: `Severity: ${reportFormData.severity.toUpperCase()} | Issued by Admin Moderation Team`,
            status: 'reviewed',
            attachment: reportFormData.attachmentName ? reportFormData.attachmentName : rep.attachment,
            warningIssuedAt: new Date().toISOString(),
          };
        }
        return rep;
      }));
    } else {
      // Create new report only if no existing report card exists
      const newReportItem = {
        _id: 'rep_' + Date.now(),
        reporterId: { name: 'Admin Moderation Team', email: 'admin@datingapp.com' },
        reportedId: reportedObj,
        reason: `[${reportFormData.category}] ${reportFormData.reason || 'Official community warning issued by Admin moderation team.'} (Severity: ${reportFormData.severity.toUpperCase()})`,
        details: `Severity: ${reportFormData.severity.toUpperCase()} | Issued by Admin Moderation Team`,
        status: 'reviewed',
        createdAt: new Date().toISOString(),
        attachment: reportFormData.attachmentName ? reportFormData.attachmentName : null,
      };

      setReports((prev) => [newReportItem, ...prev]);
    }

    setTimeout(() => setActionMessage(''), 5000);
    setShowReportModal(false);
    setActiveTab('reports');

    // Reset form
    setReportFormData({
      reportedId: '',
      reportedName: '',
      reportId: null,
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
      const [userData, reportData, contactData] = await Promise.allSettled([
        fetchAdminUsers(),
        fetchAdminReports(),
        fetchContactReports(),
      ]);

      if (userData.status === 'fulfilled' && userData.value.success) {
        const fetchedUsers = userData.value.users || [];
        setUsers(fetchedUsers);
        setUserAnalytics(userData.value.analytics || null);
      }

      if (reportData.status === 'fulfilled' && reportData.value.success) {
        setReports(reportData.value.reports || []);
        setReportAnalytics(reportData.value.analytics || null);
      }

      if (contactData.status === 'fulfilled' && contactData.value.success) {
        setContactReports(contactData.value.reports || []);
        setContactAnalytics(contactData.value.analytics || null);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleUpdateContactStatus = async (contactId, newStatus) => {
    try {
      const res = await updateContactStatusApi(contactId, newStatus);
      if (res.success) {
        setActionMessage(`Contact report status updated to ${newStatus}!`);
        setTimeout(() => setActionMessage(''), 3500);
        loadData(true);
      }
    } catch (err) {
      console.error('Failed to update contact report status:', err);
      alert('Failed to update status.');
    }
  };

  const handleDeleteContactReport = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact report?')) return;
    try {
      const res = await deleteContactReportApi(contactId);
      if (res.success) {
        setActionMessage('Contact report deleted successfully.');
        setTimeout(() => setActionMessage(''), 3500);
        loadData(true);
      }
    } catch (err) {
      console.error('Failed to delete contact report:', err);
      alert('Failed to delete report.');
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

    let matchesAccountStatus = true;
    if (accountStatusFilter === 'active') {
      matchesAccountStatus = u.isActive !== false;
    } else if (accountStatusFilter === 'inactive') {
      matchesAccountStatus = u.isActive === false;
    }

    let matchesSubscription = true;
    const rawTier = (u.subscriptionTier || u.subscriptionPlanName || u.subscription?.planType || 'Free').toLowerCase();
    const status = (u.subscriptionStatus || u.subscription?.status || 'inactive').toLowerCase();
    const isPaid = rawTier !== 'free' && rawTier !== 'none';
    const isActivePaid = isPaid && (status === 'active' || (status !== 'canceled' && status !== 'cancelled' && status !== 'expired'));

    if (subscriptionFilter === 'paid') {
      matchesSubscription = isActivePaid;
    } else if (subscriptionFilter === 'free') {
      matchesSubscription = !isActivePaid;
    } else if (subscriptionFilter !== 'all') {
      matchesSubscription = rawTier.includes(subscriptionFilter.toLowerCase());
    }

    return matchesSearch && matchesGender && matchesAccountStatus && matchesSubscription;
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
    <div className="pink-dashboard-wrapper">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Left Pink Sidebar Navigation */}
      <aside className={`pink-admin-sidebar ${mobileSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header" style={{ position: 'relative' }}>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={() => setMobileSidebarOpen(false)}
            title="Close Navigation Menu"
          >
            <X size={20} />
          </button>
          <TwoStringsLogo size={42} color="#ffffff" textColor="#ffffff" showText={true} />
          <span className="sidebar-badge">ADMIN PANEL</span>
        </div>

        <div className="sidebar-nav-section">
          <span className="sidebar-section-title">ADMIN NAVIGATION</span>
          <nav className="sidebar-menu">
            <button
              className={`sidebar-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('users');
                setMobileSidebarOpen(false);
              }}
            >
              <div className="nav-item-icon">
                <Users size={20} />
              </div>
              <span className="nav-item-label">All Registered Users</span>
              {filteredUsers.length > 0 && (
                <span className="nav-count-badge">{filteredUsers.length}</span>
              )}
            </button>

            <button
              className={`sidebar-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('reports');
                setMobileSidebarOpen(false);
              }}
            >
              <div className="nav-item-icon">
                <ShieldAlert size={20} />
              </div>
              <span className="nav-item-label">Reported users and reporters</span>
              {filteredReports.length > 0 && (
                <span className="nav-count-badge badge-warning">{filteredReports.length}</span>
              )}
            </button>

            <button
              className={`sidebar-nav-item ${activeTab === 'contact-reports' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('contact-reports');
                setMobileSidebarOpen(false);
              }}
            >
              <div className="nav-item-icon">
                <MessageSquare size={20} />
              </div>
              <span className="nav-item-label">User Reports (Contact-Us)</span>
              {contactReports.filter(c => c.status === 'pending').length > 0 && (
                <span className="nav-count-badge badge-warning">
                  {contactReports.filter(c => c.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              className={`sidebar-nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('subscriptions');
                setMobileSidebarOpen(false);
              }}
            >
              <div className="nav-item-icon">
                <CreditCard size={20} />
              </div>
              <span className="nav-item-label">Subscription features</span>
              <span className="nav-count-badge badge-premium">VIP</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button className="sidebar-logout-full-btn" onClick={onLogout} title="Logout">
            <LogOut size={16} />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Right Content Body Area */}
      <div className="pink-admin-main-area">
        {/* Top Header Bar */}
        <header className="pink-top-header">
          <div className="header-left">
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              title="Toggle Navigation Menu"
            >
              <Menu size={22} />
            </button>

            <div className="header-title-box">
              <h1 className="header-page-title">
                {activeTab === 'users' && 'All Registered Users'}
                {activeTab === 'reports' && 'Reported Users & Reporters'}
                {activeTab === 'contact-reports' && 'User Support Reports (Contact Us)'}
                {activeTab === 'subscriptions' && 'Subscription Features & Dynamic Pricing'}
              </h1>
              <p className="header-page-sub">
                {activeTab === 'users' && 'Manage user accounts, active status, search filters, and profile details'}
                {activeTab === 'reports' && 'Review user complaints, issue official warnings, and manage moderation reports'}
                {activeTab === 'contact-reports' && 'Review user support tickets submitted from app login page'}
                {activeTab === 'subscriptions' && 'Manage VIP plans, dynamic pricing, and feature access permissions'}
              </p>
            </div>
          </div>

          <div className="header-right">
            {/* Refresh Button */}
            <button 
              type="button" 
              className="header-refresh-btn" 
              onClick={handleRefreshPage} 
              title="Refresh Page & Reload All Data"
            >
              <RefreshCw size={15} className={isRefreshing || loading ? 'spin-icon' : ''} />
              <span>Refresh</span>
            </button>

            {/* Super Admin & Email Profile Card */}
            <div className="header-admin-profile">
              <div className="header-admin-avatar">
                {adminUser?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="header-admin-details">
                <span className="header-admin-name">{adminUser?.name || 'Super Admin'}</span>
                <span className="header-admin-email">{adminUser?.email}</span>
              </div>
            </div>

            {/* Topbar Logout Button */}
            <button className="header-logout-btn" onClick={onLogout} title="Logout">
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Inner Content Panel */}
        <main className="dashboard-content-panel">
          {actionMessage && (
            <div className="alert-banner alert-success animate-fade-in" style={{ marginBottom: '20px' }}>
              <CheckCircle2 size={18} />
              <span>{actionMessage}</span>
            </div>
          )}

          {/* Top Summary Analytics Cards */}
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
                  Active: {userAnalytics?.activeUsers ?? users.filter(u => u.isActive !== false).length} | Inactive: {userAnalytics?.inactiveUsers ?? users.filter(u => u.isActive === false).length}
                </span>
              </div>
            </div>

            <div 
              className={`stat-card stat-reports ${activeTab === 'reports' ? 'selected-card' : ''}`}
              onClick={() => setActiveTab('reports')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '180px' }}>
                <div className="stat-icon-wrapper">
                  <ShieldAlert size={26} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{reportAnalytics?.totalReports ?? reports.length}</span>
                  <span className="stat-label">Reported Users & Reporters</span>
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
                style={{ padding: '7px 14px', fontSize: '12px', whiteSpace: 'nowrap', backgroundColor: '#FE3C72', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Submit Reported User Form"
              >
                <PlusCircle size={14} color="#ffffff" />
                <span style={{ color: '#ffffff' }}>Submit Report</span>
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
              style={{ cursor: 'pointer', borderLeft: '4px solid #fe3c72' }}
            >
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(254, 60, 114, 0.15)', color: '#fe3c72' }}>
                <CreditCard size={26} />
              </div>
              <div className="stat-content">
                <span className="stat-value">Plans</span>
                <span className="stat-label">Subscription Features</span>
                <span className="stat-subtext" style={{ color: '#fe3c72', fontWeight: '600' }}>
                  Dynamic Pricing
                </span>
              </div>
            </div>
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
                <ResponsiveSelect
                  hasLeftIcon={true}
                  options={[
                    { value: 'all', label: 'All Genders' },
                    { value: 'men', label: 'Men' },
                    { value: 'women', label: 'Women' },
                  ]}
                  value={genderFilter}
                  onChange={(val) => setGenderFilter(val)}
                  style={{ minWidth: '150px' }}
                />
              </div>

              <div className="filter-box">
                <ShieldCheck size={16} className="filter-icon" />
                <ResponsiveSelect
                  hasLeftIcon={true}
                  options={[
                    { value: 'all', label: 'All Accounts (Active & Inactive)' },
                    { value: 'active', label: 'Active Accounts Only' },
                    { value: 'inactive', label: 'Inactive / Blocked Accounts Only' },
                  ]}
                  value={accountStatusFilter}
                  onChange={(val) => setAccountStatusFilter(val)}
                  style={{ minWidth: '220px' }}
                />
              </div>

              <div className="filter-box">
                <CreditCard size={16} className="filter-icon" />
                <ResponsiveSelect
                  hasLeftIcon={true}
                  options={[
                    { value: 'all', label: 'All Subscriptions (Paid & Free)' },
                    { value: 'paid', label: 'Paid Subscribers Only' },
                    { value: 'free', label: 'Free Tier Only' },
                    { value: 'gold', label: 'Gold Plans' },
                    { value: 'platinum', label: 'Platinum / VIP' },
                    { value: 'silver', label: 'Silver Plans' },
                  ]}
                  value={subscriptionFilter}
                  onChange={(val) => setSubscriptionFilter(val)}
                  style={{ minWidth: '220px' }}
                />
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
              <>
                <div className="table-scroll-hint">
                  <ChevronRight size={14} style={{ color: '#ff4d6d' }} />
                  <span>Swipe horizontally to view all columns &amp; actions</span>
                </div>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: '56px' }}>Badge</th>
                        <th style={{ minWidth: '160px' }}>Full Name</th>
                        <th style={{ minWidth: '170px' }}>Email / Mobile</th>
                        <th style={{ minWidth: '90px' }}>Gender</th>
                        <th style={{ minWidth: '70px' }}>Age</th>
                        <th style={{ minWidth: '150px' }}>Subscription</th>
                        <th style={{ minWidth: '110px' }}>Presence</th>
                        <th style={{ minWidth: '130px' }}>Account Status</th>
                        <th style={{ minWidth: '120px' }}>Joined Date</th>
                        <th className="actions-header-cell">Actions</th>
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
                            {(() => {
                              const rawTier = u.subscriptionPlanName || u.subscriptionTier || u.subscription?.planName || u.subscription?.planType || 'Free';
                              const status = (u.subscriptionStatus || u.subscription?.status || 'inactive').toLowerCase();
                              const isPaid = rawTier && rawTier.toLowerCase() !== 'free' && rawTier.toLowerCase() !== 'none';
                              const isActive = status === 'active' || (isPaid && status !== 'canceled' && status !== 'cancelled' && status !== 'expired');
                              const planDisplayName = rawTier.charAt(0).toUpperCase() + rawTier.slice(1);
                              const periodEnd = u.subscription?.currentPeriodEnd;

                              let badgeBg = 'rgba(100, 116, 139, 0.12)';
                              let badgeColor = '#64748b';
                              let badgeBorder = 'rgba(100, 116, 139, 0.25)';
                              let icon = <CreditCard size={13} color="#64748b" />;

                              if (rawTier.toLowerCase().includes('gold')) {
                                badgeBg = 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.26) 100%)';
                                badgeColor = '#D97706';
                                badgeBorder = 'rgba(245, 158, 11, 0.45)';
                                icon = <Crown size={13} color="#D97706" />;
                              } else if (rawTier.toLowerCase().includes('platinum') || rawTier.toLowerCase().includes('vip')) {
                                badgeBg = 'linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(99, 102, 241, 0.26) 100%)';
                                badgeColor = '#8B5CF6';
                                badgeBorder = 'rgba(139, 92, 246, 0.45)';
                                icon = <Sparkles size={13} color="#8B5CF6" />;
                              } else if (rawTier.toLowerCase().includes('silver')) {
                                badgeBg = 'linear-gradient(135deg, rgba(148, 163, 184, 0.18) 0%, rgba(100, 116, 139, 0.26) 100%)';
                                badgeColor = '#64748B';
                                badgeBorder = 'rgba(148, 163, 184, 0.45)';
                                icon = <Award size={13} color="#64748B" />;
                              } else if (isPaid) {
                                badgeBg = 'linear-gradient(135deg, rgba(254, 60, 114, 0.15) 0%, rgba(225, 29, 72, 0.25) 100%)';
                                badgeColor = '#fe3c72';
                                badgeBorder = 'rgba(254, 60, 114, 0.4)';
                                icon = <Zap size={13} color="#fe3c72" />;
                              }

                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  <div
                                    onClick={() => handleViewUserSubscription(u)}
                                    title="Click to view subscription details"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '4px 10px',
                                      borderRadius: '20px',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      background: badgeBg,
                                      color: badgeColor,
                                      border: `1px solid ${badgeBorder}`,
                                      cursor: 'pointer',
                                      width: 'fit-content',
                                      transition: 'all 0.2s ease',
                                    }}
                                  >
                                    {icon}
                                    <span>{planDisplayName}</span>
                                    {isPaid && (
                                      <span
                                        style={{
                                          width: '7px',
                                          height: '7px',
                                          borderRadius: '50%',
                                          backgroundColor: isActive ? '#10B981' : '#EF4444',
                                          display: 'inline-block',
                                          marginLeft: '2px',
                                        }}
                                        title={isActive ? 'Active subscription' : `Status: ${status}`}
                                      />
                                    )}
                                  </div>

                                  <div style={{ fontSize: '11px', color: isPaid ? (isActive ? '#10B981' : '#94a3b8') : '#94a3b8', fontWeight: '500' }}>
                                    {isPaid ? (
                                      <>
                                        <span>{isActive ? '● Active' : `● ${status}`}</span>
                                        {periodEnd && (
                                          <span style={{ color: '#64748b', marginLeft: '4px' }}>
                                            (Exp: {new Date(periodEnd).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })})
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span>Free Tier</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                          </td>
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
                            {u.isActive !== false ? (
                              <span className="status-chip active" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                                <CheckCircle2 size={12} />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="status-chip offline" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                                <XCircle size={12} />
                                <span>Inactive</span>
                              </span>
                            )}
                          </td>
                          <td>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </td>
                          <td className="actions-table-cell">
                            <div className="table-actions-group">
                              {u.isActive !== false ? (
                                <button 
                                  type="button"
                                  className="btn-table-action btn-table-deactivate"
                                  onClick={() => handleOpenStatusModal(u, false)}
                                  title="Deactivate user and block from exploring the app"
                                >
                                  <UserX size={14} className="action-btn-icon" />
                                  <span>Deactivate</span>
                                </button>
                              ) : (
                                <button 
                                  type="button"
                                  className="btn-table-action btn-table-activate"
                                  onClick={() => handleOpenStatusModal(u, true)}
                                  title="Activate this user account to allow app access"
                                >
                                  <UserCheck size={14} className="action-btn-icon" />
                                  <span>Activate</span>
                                </button>
                              )}

                              <button 
                                type="button"
                                className="btn-table-action btn-table-report"
                                onClick={() => openReportModalForUser(u)}
                                title="Submit report form for this user"
                              >
                                <Flag size={14} className="action-btn-icon" />
                                <span>Report</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

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
            </>
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
                <ResponsiveSelect
                  hasLeftIcon={true}
                  options={[
                    { value: 'all', label: 'All Report Statuses' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'reviewed', label: 'Reviewed' },
                    { value: 'resolved', label: 'Resolved' },
                    { value: 'dismissed', label: 'Dismissed' },
                  ]}
                  value={reportStatusFilter}
                  onChange={(val) => setReportStatusFilter(val)}
                  style={{ minWidth: '180px' }}
                />
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
                          <ResponsiveSelect
                            options={[
                              { value: 'pending', label: 'Pending' },
                              { value: 'reviewed', label: 'Under Review' },
                              { value: 'resolved', label: 'Resolved' },
                              { value: 'dismissed', label: 'Dismissed' },
                            ]}
                            value={(report.status || 'pending').toLowerCase()}
                            onChange={(val) => handleUpdateStatus(report._id, val)}
                            compact
                            style={{ minWidth: '135px' }}
                          />
                          {getReportStatusBadge(report.status)}
                        </div>

                        <button 
                          type="button"
                          className="btn-create-report btn-card-submit-report"
                          onClick={() => openReportModalForUser(reported, report._id)}
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

        {/* TAB 4: USER SUPPORT & CONTACT-US REPORTS */}
        {activeTab === 'contact-reports' && (
          <div className="tab-panel animate-fade-in">
            {/* Top Metric Summary Cards */}
            {(() => {
              const totalCount = contactReports.length;
              const pendingCount = contactReports.filter((c) => (c.status || 'pending') === 'pending').length;
              const inProgressCount = contactReports.filter((c) => c.status === 'in-progress').length;
              const resolvedCount = contactReports.filter((c) => c.status === 'resolved').length;

              return (
                <div className="stats-grid contact-reports-stats-grid" style={{ marginBottom: '20px' }}>
                  <div
                    className={`stat-card stat-users ${contactStatusFilter === 'all' ? 'selected-card' : ''}`}
                    onClick={() => setContactStatusFilter('all')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="stat-icon-wrapper" style={{ backgroundColor: '#fff0f5', color: '#FE3C72' }}>
                      <HelpCircle size={24} />
                    </div>
                    <div className="stat-content">
                      <span className="stat-value">{totalCount}</span>
                      <span className="stat-label">Total Support Tickets</span>
                      <span className="stat-subtext">Submitted from Contact-Us form</span>
                    </div>
                  </div>

                  <div
                    className={`stat-card ${contactStatusFilter === 'pending' ? 'selected-card' : ''}`}
                    onClick={() => setContactStatusFilter('pending')}
                    style={{ cursor: 'pointer', borderLeft: '4px solid #f59e0b' }}
                  >
                    <div className="stat-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                      <Clock size={24} />
                    </div>
                    <div className="stat-content">
                      <span className="stat-value" style={{ color: '#d97706' }}>{pendingCount}</span>
                      <span className="stat-label">Pending Action</span>
                      <span className="stat-subtext">Awaiting admin review</span>
                    </div>
                  </div>

                  <div
                    className={`stat-card ${contactStatusFilter === 'in-progress' ? 'selected-card' : ''}`}
                    onClick={() => setContactStatusFilter('in-progress')}
                    style={{ cursor: 'pointer', borderLeft: '4px solid #3b82f6' }}
                  >
                    <div className="stat-icon-wrapper" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
                      <RefreshCw size={24} />
                    </div>
                    <div className="stat-content">
                      <span className="stat-value" style={{ color: '#2563eb' }}>{inProgressCount}</span>
                      <span className="stat-label">In Progress</span>
                      <span className="stat-subtext">Currently being handled</span>
                    </div>
                  </div>

                  <div
                    className={`stat-card ${contactStatusFilter === 'resolved' ? 'selected-card' : ''}`}
                    onClick={() => setContactStatusFilter('resolved')}
                    style={{ cursor: 'pointer', borderLeft: '4px solid #10b981' }}
                  >
                    <div className="stat-icon-wrapper" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="stat-content">
                      <span className="stat-value" style={{ color: '#059669' }}>{resolvedCount}</span>
                      <span className="stat-label">Resolved Tickets</span>
                      <span className="stat-subtext">Successfully completed</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Filter and Search Bar */}
            <div className="table-filter-bar contact-filter-bar">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="table-search-input"
                  placeholder="Search by name, email, phone, subject or message..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                />
                {contactSearch && (
                  <button className="clear-search-btn" onClick={() => setContactSearch('')}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="filter-controls-group">
                {/* Quick Status Pills */}
                <div className="contact-quick-status-pills">
                  <button
                    type="button"
                    className={`status-pill-btn ${contactStatusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setContactStatusFilter('all')}
                  >
                    All ({contactReports.length})
                  </button>
                  <button
                    type="button"
                    className={`status-pill-btn pending ${contactStatusFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setContactStatusFilter('pending')}
                  >
                    Pending ({contactReports.filter((c) => (c.status || 'pending') === 'pending').length})
                  </button>
                  <button
                    type="button"
                    className={`status-pill-btn in-progress ${contactStatusFilter === 'in-progress' ? 'active' : ''}`}
                    onClick={() => setContactStatusFilter('in-progress')}
                  >
                    In Progress ({contactReports.filter((c) => c.status === 'in-progress').length})
                  </button>
                  <button
                    type="button"
                    className={`status-pill-btn resolved ${contactStatusFilter === 'resolved' ? 'active' : ''}`}
                    onClick={() => setContactStatusFilter('resolved')}
                  >
                    Resolved ({contactReports.filter((c) => c.status === 'resolved').length})
                  </button>
                </div>

                <div className="filter-select-wrapper">
                  <Filter size={16} className="filter-icon" />
                  <ResponsiveSelect
                    hasLeftIcon={true}
                    options={[
                      { value: 'all', label: 'All Statuses' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'in-progress', label: 'In Progress' },
                      { value: 'resolved', label: 'Resolved' },
                    ]}
                    value={contactStatusFilter}
                    onChange={(val) => setContactStatusFilter(val)}
                    style={{ minWidth: '160px' }}
                  />
                </div>
              </div>
            </div>

            {/* Filtered Data List Calculation */}
            {(() => {
              const filtered = contactReports.filter((item) => {
                const q = contactSearch.toLowerCase().trim();
                const matchesSearch =
                  !q ||
                  (item.name || '').toLowerCase().includes(q) ||
                  (item.email || '').toLowerCase().includes(q) ||
                  (item.phone || '').toLowerCase().includes(q) ||
                  (item.subject || '').toLowerCase().includes(q) ||
                  (item.message || '').toLowerCase().includes(q);

                const matchesStatus =
                  contactStatusFilter === 'all' || (item.status || 'pending') === contactStatusFilter;

                return matchesSearch && matchesStatus;
              });

              const totalContactCount = filtered.length;
              const totalContactPages = Math.max(1, Math.ceil(totalContactCount / ITEMS_PER_PAGE));
              const currentContactPage = Math.min(contactReportsPage, totalContactPages);
              const contactStartIndex = (currentContactPage - 1) * ITEMS_PER_PAGE;
              const paginatedContactReports = filtered.slice(contactStartIndex, contactStartIndex + ITEMS_PER_PAGE);

              if (filtered.length === 0) {
                return (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '50px 20px',
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      marginTop: '16px',
                      color: '#64748b',
                    }}
                  >
                    <MessageSquare size={44} style={{ marginBottom: '12px', opacity: 0.4, color: '#FE3C72' }} />
                    <h4 style={{ margin: '0 0 6px 0', color: '#0f172a', fontWeight: '700' }}>No support reports found</h4>
                    <p style={{ margin: 0, fontSize: '13px' }}>
                      {contactSearch || contactStatusFilter !== 'all'
                        ? 'Try adjusting your search query or status filter.'
                        : 'No user reports have been submitted yet.'}
                    </p>
                  </div>
                );
              }

              return (
                <>
                  {/* Desktop & Tablet Data Table */}
                  <div className="table-responsive-wrapper contact-desktop-table-wrapper">
                    <table className="pink-data-table contact-reports-table">
                      <thead>
                        <tr>
                          <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                          <th style={{ width: '130px' }}>Date & Time</th>
                          <th style={{ width: '160px' }}>Sender Name</th>
                          <th style={{ width: '190px' }}>Contact Info</th>
                          <th style={{ width: '160px' }}>Subject / Topic</th>
                          <th style={{ minWidth: '200px' }}>Problem Description</th>
                          <th style={{ width: '110px' }}>Status</th>
                          <th style={{ width: '195px', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedContactReports.map((report, idx) => {
                          const globalIndex = contactStartIndex + idx + 1;
                          const messageSnippet =
                            report.message && report.message.length > 65
                              ? report.message.substring(0, 65) + '...'
                              : report.message;

                          return (
                            <tr key={report._id}>
                              <td style={{ textAlign: 'center', fontWeight: '700', color: '#94a3b8', fontSize: '12px' }}>
                                {globalIndex}
                              </td>
                              <td>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                                  {new Date(report.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <Clock size={11} color="#94a3b8" />
                                  <span>{new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                                  <div
                                    style={{
                                      width: '30px',
                                      height: '30px',
                                      borderRadius: '50%',
                                      backgroundColor: getAvatarColor(report.name),
                                      color: '#ffffff',
                                      fontWeight: '800',
                                      fontSize: '12px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {(report.name || 'G')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>
                                      {report.name || 'Guest User'}
                                    </div>
                                    {!report.email && !report.phone && (
                                      <span style={{ fontSize: '10.5px', color: '#94a3b8', fontStyle: 'italic' }}>Guest</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  {report.email ? (
                                    <a
                                      href={`mailto:${report.email}`}
                                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#2563eb', textDecoration: 'none', wordBreak: 'break-all', fontWeight: '600' }}
                                      title="Send Email"
                                    >
                                      <Mail size={12} color="#3b82f6" style={{ flexShrink: 0 }} />
                                      <span>{report.email}</span>
                                    </a>
                                  ) : null}
                                  {report.phone ? (
                                    <a
                                      href={`tel:${report.phone}`}
                                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#475569', textDecoration: 'none', fontSize: '11.5px', fontWeight: '600' }}
                                      title="Call Phone"
                                    >
                                      <Phone size={11} color="#10b981" style={{ flexShrink: 0 }} />
                                      <span>{report.phone}</span>
                                    </a>
                                  ) : null}
                                  {!report.email && !report.phone && <span style={{ color: '#94a3b8' }}>N/A</span>}
                                </div>
                              </td>
                              <td>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    fontSize: '11.5px',
                                    fontWeight: '700',
                                    color: '#be185d',
                                    backgroundColor: '#fff0f5',
                                    border: '1px solid #fbcfe8',
                                    padding: '4px 9px',
                                    borderRadius: '6px',
                                    maxWidth: '150px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title={report.subject || 'General Inquiry'}
                                >
                                  {report.subject || 'General Inquiry'}
                                </span>
                              </td>
                              <td>
                                <div
                                  style={{
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '6px 10px',
                                    fontSize: '12px',
                                    color: '#334155',
                                    lineHeight: '1.4',
                                    maxWidth: '240px',
                                    wordBreak: 'break-word',
                                  }}
                                  title="Click 'View' button to see full issue message"
                                >
                                  {messageSnippet}
                                </div>
                              </td>
                              <td>
                                {report.status === 'resolved' ? (
                                  <span className="status-pill pill-resolved">Resolved</span>
                                ) : report.status === 'in-progress' ? (
                                  <span className="status-pill pill-reviewed">In Progress</span>
                                ) : (
                                  <span className="status-pill pill-pending">Pending</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                  
                                  {/* VIEW BUTTON WITH MODAL LAUNCH */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenContactModal(report)}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      padding: '6px 12px',
                                      borderRadius: '8px',
                                      border: '1.5px solid #fed7e2',
                                      backgroundColor: '#fff5f7',
                                      color: '#FE3C72',
                                      fontSize: '12.5px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      boxShadow: '0 1px 3px rgba(254, 60, 114, 0.12)',
                                    }}
                                    className="btn-view-contact-report"
                                    title="View complete user issue & submitted details"
                                  >
                                    <Eye size={14} />
                                    <span>View</span>
                                  </button>

                                  {/* STATUS SELECT */}
                                  <ResponsiveSelect
                                    options={[
                                      { value: 'pending', label: 'Pending' },
                                      { value: 'in-progress', label: 'In Progress' },
                                      { value: 'resolved', label: 'Resolved' },
                                    ]}
                                    value={report.status || 'pending'}
                                    onChange={(val) => handleUpdateContactStatus(report._id, val)}
                                    compact
                                    style={{ minWidth: '130px' }}
                                  />

                                  {/* DELETE BUTTON */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteContactReport(report._id)}
                                    style={{
                                      padding: '6px 8px',
                                      borderRadius: '8px',
                                      border: '1px solid #fee2e2',
                                      backgroundColor: '#fff1f2',
                                      color: '#ef4444',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.15s ease',
                                    }}
                                    title="Delete Report"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards View (Visible on Mobile Screens) */}
                  <div className="contact-mobile-cards-container">
                    {paginatedContactReports.map((report) => (
                      <div key={report._id} className="contact-mobile-card">
                        <div className="contact-mobile-card-header">
                          <div className="contact-mobile-sender">
                            <span className="sender-name">{report.name || 'Guest User'}</span>
                            <span className="sender-time">
                              {new Date(report.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div>
                            {report.status === 'resolved' ? (
                              <span className="status-pill pill-resolved">Resolved</span>
                            ) : report.status === 'in-progress' ? (
                              <span className="status-pill pill-reviewed">In Progress</span>
                            ) : (
                              <span className="status-pill pill-pending">Pending</span>
                            )}
                          </div>
                        </div>

                        <div className="contact-mobile-card-body">
                          <div className="contact-mobile-topic">
                            <span className="topic-badge">{report.subject || 'General Inquiry'}</span>
                          </div>

                          {(report.email || report.phone) && (
                            <div className="contact-mobile-info">
                              {report.email && (
                                <div className="info-item">
                                  <Mail size={13} color="#64748b" />
                                  <a href={`mailto:${report.email}`} className="email-link">{report.email}</a>
                                </div>
                              )}
                              {report.phone && <div className="info-item phone">{report.phone}</div>}
                            </div>
                          )}

                          <div className="contact-mobile-message-box">
                            {report.message && report.message.length > 90
                              ? report.message.substring(0, 90) + '...'
                              : report.message}
                          </div>
                        </div>

                        <div className="contact-mobile-card-footer">
                          <button
                            type="button"
                            onClick={() => handleOpenContactModal(report)}
                            className="mobile-view-btn"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              border: '1.5px solid #fed7e2',
                              backgroundColor: '#fff5f7',
                              color: '#FE3C72',
                              fontSize: '12.5px',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            <Eye size={14} />
                            <span>View All Details</span>
                          </button>

                          <div className="status-select-group" style={{ flex: 1, minWidth: '130px' }}>
                            <ResponsiveSelect
                              options={[
                                { value: 'pending', label: 'Pending' },
                                { value: 'in-progress', label: 'In Progress' },
                                { value: 'resolved', label: 'Resolved' },
                              ]}
                              value={report.status || 'pending'}
                              onChange={(val) => handleUpdateContactStatus(report._id, val)}
                              compact
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteContactReport(report._id)}
                            className="mobile-delete-btn"
                            title="Delete Report"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls Footer for Contact Support Reports */}
                  <div className="pagination-wrapper" style={{ marginTop: '20px' }}>
                    <div className="pagination-info">
                      Showing <strong>{contactStartIndex + 1}</strong>–<strong>{Math.min(contactStartIndex + ITEMS_PER_PAGE, totalContactCount)}</strong> of <strong>{totalContactCount}</strong> support tickets
                    </div>
                    <div className="pagination-controls">
                      <button
                        className="pagination-btn"
                        disabled={currentContactPage === 1}
                        onClick={() => setContactReportsPage(1)}
                        title="First Page"
                      >
                        <ChevronsLeft size={16} />
                      </button>
                      <button
                        className="pagination-btn"
                        disabled={currentContactPage === 1}
                        onClick={() => setContactReportsPage((prev) => Math.max(1, prev - 1))}
                        title="Previous Page"
                      >
                        <ChevronLeft size={16} />
                        <span style={{ marginLeft: '4px' }}>Prev</span>
                      </button>

                      {Array.from({ length: totalContactPages }, (_, i) => i + 1)
                        .filter((page) => page === 1 || page === totalContactPages || Math.abs(page - currentContactPage) <= 1)
                        .map((page, idx, arr) => {
                          const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && <span className="pagination-ellipsis">...</span>}
                              <button
                                className={`pagination-btn ${page === currentContactPage ? 'active' : ''}`}
                                onClick={() => setContactReportsPage(page)}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      <button
                        className="pagination-btn"
                        disabled={currentContactPage === totalContactPages}
                        onClick={() => setContactReportsPage((prev) => Math.min(totalContactPages, prev + 1))}
                        title="Next Page"
                      >
                        <span style={{ marginRight: '4px' }}>Next</span>
                        <ChevronRight size={16} />
                      </button>
                      <button
                        className="pagination-btn"
                        disabled={currentContactPage === totalContactPages}
                        onClick={() => setContactReportsPage(totalContactPages)}
                        title="Last Page"
                      >
                        <ChevronsRight size={16} />
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
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
          <div className="modal-container animate-slide-up" onClick={(e) => e.stopPropagation()} style={{ width: '92vw', maxWidth: '640px', boxSizing: 'border-box', overflowX: 'hidden' }}>
            
            {/* Modal Header */}
            <div className="modal-header" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
              <div className="modal-title-box" style={{ flex: 1, minWidth: 0 }}>
                <div className="modal-icon-badge" style={{ flexShrink: 0 }}>
                  <ShieldAlert size={22} />
                </div>
                <div className="modal-title-text" style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.25' }}>Issue Official Warning to Reported User</h3>
                  <p style={{ wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.3' }}>Submit an official moderation warning to be displayed directly on the user's mobile app</p>
                </div>
              </div>
              <button type="button" className="modal-close-btn" style={{ flexShrink: 0 }} onClick={() => setShowReportModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateReportSubmit} className="report-form" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
              
              {/* Section 1: Reported User Selection */}
              <div className="form-group" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', width: '100%', maxWidth: '100%', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.35' }}>
                  <AlertTriangle size={14} className="text-danger" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Target Reported User (Who is receiving this warning?)</span>
                </label>
                <ResponsiveSelect
                  options={[
                    { value: '', label: '-- Select Reported User from Database --' },
                    ...users.map((u) => {
                      const userName = u.name || u.firstName || u.email || 'User';
                      const userContact = u.email || u.mobile || '';
                      const displayContact = userContact.length > 20 ? userContact.substring(0, 18) + '...' : userContact;
                      return {
                        value: u._id || u.id,
                        label: `${userName} ${displayContact ? `(${displayContact})` : ''}`,
                      };
                    }),
                  ]}
                  value={reportFormData.reportedId}
                  onChange={(selId) => {
                    const matched = users.find((u) => (u._id || u.id) === selId);
                    setReportFormData({
                      ...reportFormData,
                      reportedId: selId,
                      reportedName: matched ? (matched.name || matched.firstName) : selId,
                    });
                  }}
                  isSearchable={true}
                  placeholder="-- Search or Select Reported User --"
                />
                {!reportFormData.reportedId && (
                  <input
                    type="text"
                    placeholder="Or enter target user name..."
                    className="form-input"
                    style={{ marginTop: '6px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', height: '38px', fontSize: '13px' }}
                    value={reportFormData.reportedName}
                    onChange={(e) => setReportFormData({ ...reportFormData, reportedName: e.target.value })}
                    required
                  />
                )}
              </div>

              {/* Section 2: Violation Category & Severity */}
              <div className="form-grid-2" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                <div className="form-group" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', maxWidth: '100%' }}>
                    <Flag size={14} style={{ flexShrink: 0 }} /> Violation Category
                  </label>
                  <ResponsiveSelect
                    options={[
                      { value: 'Harassment / Offensive Behavior', label: 'Harassment / Offensive Behavior' },
                      { value: 'Inappropriate Photos / Content', label: 'Inappropriate Photos / Content' },
                      { value: 'Fake Profile / Impersonation', label: 'Fake Profile / Impersonation' },
                      { value: 'Spam, Scam, or Fraud', label: 'Spam, Scam, or Commercial Fraud' },
                      { value: 'Threatening Language / Hate Speech', label: 'Threatening Language / Hate Speech' },
                      { value: 'Other Violation', label: 'Other Policy Violation' },
                    ]}
                    value={reportFormData.category}
                    onChange={(val) => setReportFormData({ ...reportFormData, category: val })}
                  />
                </div>

                <div className="form-group" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                  <label style={{ width: '100%', maxWidth: '100%' }}>Severity Level</label>
                  <div className="severity-picker" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
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
              <div className="form-group" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', maxWidth: '100%' }}>
                  <FileText size={14} style={{ flexShrink: 0 }} /> Complaint Narrative & Evidence Details
                </label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', fontSize: '13px' }}
                  placeholder="Enter full details of the complaint submitted by the reporter (e.g. Chat harassment, inappropriate messages sent...)"
                  value={reportFormData.reason}
                  onChange={(e) => setReportFormData({ ...reportFormData, reason: e.target.value })}
                />
              </div>

              {/* Section 4: Initial Status Queue */}
              <div className="form-group" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                <label style={{ width: '100%', maxWidth: '100%' }}>Initial Status Queue</label>
                <ResponsiveSelect
                  options={[
                    { value: 'pending', label: 'Pending Queue' },
                    { value: 'reviewed', label: 'Working / Under Review' },
                    { value: 'resolved', label: 'Resolved' },
                    { value: 'dismissed', label: 'Dismissed' },
                  ]}
                  value={reportFormData.status}
                  onChange={(val) => setReportFormData({ ...reportFormData, status: val })}
                />
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

      {/* Account Status (Activate / Deactivate) Confirmation Modal */}
      {statusModal.open && statusModal.user && (
        <div className="modal-backdrop">
          <div className="modal-content animate-scale-up" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {statusModal.newStatus ? (
                  <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                    <UserCheck size={22} />
                  </div>
                ) : (
                  <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
                    <UserX size={22} />
                  </div>
                )}
                <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: '700' }}>
                  {statusModal.newStatus ? 'Activate User Account' : 'Deactivate User Account'}
                </h3>
              </div>
              <button 
                className="close-btn" 
                onClick={() => setStatusModal({ open: false, user: null, newStatus: false, reason: '', submitting: false })}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '16px 0' }}>
              <p style={{ color: '#1e293b', fontSize: '14px', lineHeight: '1.5', marginBottom: '14px' }}>
                {statusModal.newStatus ? (
                  <>Are you sure you want to <strong>activate</strong> the account for <span style={{ color: '#ff4d6d', fontWeight: 'bold' }}>{statusModal.user.name || statusModal.user.firstName || 'this user'}</span>? They will be allowed to log in and explore the app again.</>
                ) : (
                  <>Are you sure you want to <strong>deactivate</strong> the account for <span style={{ color: '#ff4d6d', fontWeight: 'bold' }}>{statusModal.user.name || statusModal.user.firstName || 'this user'}</span>? The user will be immediately logged out and blocked from exploring profiles, chats, or swiping.</>
                )}
              </p>

              {!statusModal.newStatus && (
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Deactivation Reason (Optional):</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Terms violation, fake profile, reported multiple times"
                    value={statusModal.reason}
                    onChange={(e) => setStatusModal((prev) => ({ ...prev, reason: e.target.value }))}
                    style={{ width: '100%', marginTop: '6px' }}
                  />
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary-cancel"
                onClick={() => setStatusModal({ open: false, user: null, newStatus: false, reason: '', submitting: false })}
                disabled={statusModal.submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary-submit"
                onClick={handleConfirmStatusChange}
                disabled={statusModal.submitting}
                style={{
                  backgroundColor: statusModal.newStatus ? '#10B981' : '#EF4444',
                  borderColor: statusModal.newStatus ? '#10B981' : '#EF4444',
                }}
              >
                {statusModal.submitting
                  ? 'Saving...'
                  : statusModal.newStatus
                  ? 'Confirm Activation'
                  : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Subscription Details Modal */}
      {subscriptionModal.open && (
        <div className="modal-backdrop">
          <div className="modal-content animate-scale-up" style={{ maxWidth: '560px', width: '95%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(254, 60, 114, 0.15)', color: '#fe3c72' }}>
                  <Crown size={22} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                    User Subscription Details
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {subscriptionModal.user?.name || subscriptionModal.user?.firstName || 'User'} ({subscriptionModal.user?.email || 'No email'})
                  </div>
                </div>
              </div>
              <button 
                className="close-btn" 
                onClick={() => setSubscriptionModal({ open: false, user: null, loading: false, details: null })}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '16px 0', maxHeight: '70vh', overflowY: 'auto' }}>
              {subscriptionModal.loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px' }}>
                  <span className="spinner" style={{ borderColor: 'rgba(254,60,114,0.3)', borderTopColor: '#fe3c72', width: '32px', height: '32px' }}></span>
                  <span style={{ marginTop: '12px', color: '#64748b', fontSize: '13px' }}>Loading subscription details...</span>
                </div>
              ) : (() => {
                const subData = subscriptionModal.details;
                const activeSub = subData?.activeSubscription || subscriptionModal.user?.subscription;
                const planDetails = subData?.planDetails;
                const planName = planDetails?.name || subData?.user?.subscriptionTier || activeSub?.planType || subscriptionModal.user?.subscriptionPlanName || subscriptionModal.user?.subscriptionTier || 'Free Plan';
                const status = (activeSub?.status || subData?.user?.subscriptionStatus || subscriptionModal.user?.subscriptionStatus || 'inactive').toLowerCase();
                const isActive = status === 'active';
                const price = planDetails ? `${planDetails.price} ${planDetails.currency || 'USD'}` : (activeSub?.planType && activeSub.planType !== 'Free' ? 'Paid Plan' : 'Free ($0.00)');
                const cycle = planDetails?.billingCycle ? (planDetails.billingCycle.charAt(0).toUpperCase() + planDetails.billingCycle.slice(1)) : 'Monthly';

                return (
                  <div>
                    {/* Plan Highlight Banner */}
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(254, 60, 114, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
                      border: '1px solid rgba(254, 60, 114, 0.25)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '16px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: '700' }}>
                            Subscribed Package
                          </div>
                          <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Crown size={20} color="#f59e0b" />
                            <span>{planName}</span>
                          </div>
                        </div>

                        <span style={{
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700',
                          backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isActive ? '#10B981' : '#EF4444',
                          border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}>
                          {isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          <span>{isActive ? 'Active Subscription' : (status === 'canceled' ? 'Canceled' : 'Inactive')}</span>
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Pricing & Cycle</span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{price} / {cycle}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Period Start</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                            {activeSub?.currentPeriodStart ? new Date(activeSub.currentPeriodStart).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Renewal / Expiry</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                            {activeSub?.currentPeriodEnd ? new Date(activeSub.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Technical / Gateway Identifiers */}
                    {(activeSub?.stripeCustomerId || activeSub?.stripeSubscriptionId || subscriptionModal.user?.stripeCustomerId) && (
                      <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                        <div style={{ fontWeight: '700', color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CreditCard size={14} color="#64748b" />
                          <span>Payment Gateway Details (Stripe)</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#64748b' }}>
                          {activeSub?.stripeCustomerId && (
                            <div>Customer ID: <code style={{ backgroundColor: '#e2e8f0', padding: '2px 5px', borderRadius: '4px', color: '#1e293b' }}>{activeSub.stripeCustomerId}</code></div>
                          )}
                          {activeSub?.stripeSubscriptionId && (
                            <div>Subscription ID: <code style={{ backgroundColor: '#e2e8f0', padding: '2px 5px', borderRadius: '4px', color: '#1e293b' }}>{activeSub.stripeSubscriptionId}</code></div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Plan Included Features */}
                    {planDetails?.features && planDetails.features.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={14} color="#f59e0b" />
                          <span>Features Included in Plan</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {planDetails.features.map((f, i) => (
                            <span key={i} style={{ fontSize: '11px', fontWeight: '600', padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563EB', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                              ✓ {f.featureKey || f.name || f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subscription History */}
                    {subData?.subscriptionHistory && subData.subscriptionHistory.length > 0 && (
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14} color="#64748b" />
                          <span>Subscription History ({subData.subscriptionHistory.length})</span>
                        </div>
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                              <tr>
                                <th style={{ padding: '6px 10px' }}>Plan</th>
                                <th style={{ padding: '6px 10px' }}>Status</th>
                                <th style={{ padding: '6px 10px' }}>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subData.subscriptionHistory.map((hist, hIdx) => (
                                <tr key={hIdx} style={{ borderTop: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '6px 10px', fontWeight: '600' }}>{hist.planType}</td>
                                  <td style={{ padding: '6px 10px' }}>
                                    <span style={{ color: hist.status === 'active' ? '#10b981' : '#64748b' }}>
                                      {hist.status}
                                    </span>
                                  </td>
                                  <td style={{ padding: '6px 10px', color: '#64748b' }}>
                                    {hist.createdAt ? new Date(hist.createdAt).toLocaleDateString() : 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                className="btn-primary-submit"
                onClick={() => setSubscriptionModal({ open: false, user: null, loading: false, details: null })}
                style={{ padding: '8px 20px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================== */}
      {/* USER SUPPORT REPORT ISSUE DETAILS MODAL */}
      {/* ========================================================================== */}
      {viewContactModal.open && viewContactModal.report && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setViewContactModal({ open: false, report: null, adminNotes: '', savingNotes: false })}>
          <div className="modal-container contact-details-modal animate-slide-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', width: '92%' }}>
            
            {/* Modal Header */}
            <div className="modal-header" style={{ borderBottom: '1.5px solid #f1f5f9', paddingBottom: '16px' }}>
              <div className="modal-title-box">
                <div className="modal-icon-badge" style={{ backgroundColor: '#fff0f5', color: '#FE3C72' }}>
                  <MessageSquare size={22} />
                </div>
                <div className="modal-title-text">
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    User Support Report Details
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Full submission info for ticket #{viewContactModal.report._id?.substring(viewContactModal.report._id.length - 8) || viewContactModal.report._id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setViewContactModal({ open: false, report: null, adminNotes: '', savingNotes: false })}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="modal-body contact-modal-body" style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Row 1: Sender Profile & Status Bar */}
              <div className="contact-modal-info-grid" style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                    Sender Details
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: getAvatarColor(viewContactModal.report.name),
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {(viewContactModal.report.name || 'G')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                        {viewContactModal.report.name || 'Guest User'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} color="#FE3C72" />
                        <span>Submitted: <strong>{formatDateTime(viewContactModal.report.createdAt)}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                    Ticket Status & Action
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <ResponsiveSelect
                        options={[
                          { value: 'pending', label: 'Pending' },
                          { value: 'in-progress', label: 'In Progress' },
                          { value: 'resolved', label: 'Resolved' },
                        ]}
                        value={viewContactModal.report.status || 'pending'}
                        onChange={(val) => handleModalStatusChange(val)}
                        style={{ flex: 1, minWidth: '140px' }}
                      />
                      {viewContactModal.report.status === 'resolved' ? (
                        <span className="status-pill pill-resolved">Resolved</span>
                      ) : viewContactModal.report.status === 'in-progress' ? (
                        <span className="status-pill pill-reviewed">In Progress</span>
                      ) : (
                        <span className="status-pill pill-pending">Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Contact Info Grid */}
              <div className="contact-modal-info-grid">
                
                {/* Email Info Card */}
                <div style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Mail size={14} color="#3b82f6" /> Email Address
                    </span>
                    {viewContactModal.report.email && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(viewContactModal.report.email, 'email')}
                        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        {copiedField === 'email' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                        <span>{copiedField === 'email' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  {viewContactModal.report.email ? (
                    <a
                      href={`mailto:${viewContactModal.report.email}`}
                      style={{ fontSize: '13.5px', fontWeight: '700', color: '#2563eb', textDecoration: 'none', wordBreak: 'break-all' }}
                    >
                      {viewContactModal.report.email}
                    </a>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No email provided</span>
                  )}
                </div>

                {/* Phone Info Card */}
                <div style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Phone size={14} color="#10b981" /> Phone Number
                    </span>
                    {viewContactModal.report.phone && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(viewContactModal.report.phone, 'phone')}
                        style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        {copiedField === 'phone' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                        <span>{copiedField === 'phone' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  {viewContactModal.report.phone ? (
                    <a
                      href={`tel:${viewContactModal.report.phone}`}
                      style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a', textDecoration: 'none' }}
                    >
                      {viewContactModal.report.phone}
                    </a>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>No phone provided</span>
                  )}
                </div>

              </div>

              {/* Row 3: Subject / Topic */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                  Subject / Topic Header
                </span>
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#fff0f5',
                  border: '1px solid #fbcfe8',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  color: '#be185d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <HelpCircle size={16} color="#FE3C72" />
                  <span>{viewContactModal.report.subject || 'General Inquiry / App Problem'}</span>
                </div>
              </div>

              {/* Row 4: Submitted Issue Description (Full Message) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={15} color="#FE3C72" /> Complete User Submitted Issue Description
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(viewContactModal.report.message, 'message')}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', color: '#475569', cursor: 'pointer', fontSize: '11.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedField === 'message' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    <span>{copiedField === 'message' ? 'Copied!' : 'Copy Message'}</span>
                  </button>
                </div>

                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '14px',
                    color: '#1e293b',
                    lineHeight: '1.6',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  {viewContactModal.report.message || 'No description content.'}
                </div>
              </div>

              {/* Row 5: Admin Resolution & Internal Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155' }}>
                  Admin Internal Resolution Notes (Optional)
                </span>
                <textarea
                  rows={3}
                  placeholder="Add internal notes about how this ticket was handled or resolution response..."
                  value={viewContactModal.adminNotes}
                  onChange={(e) => setViewContactModal((prev) => ({ ...prev, adminNotes: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    color: '#0f172a',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn-create-report"
                    disabled={viewContactModal.savingNotes}
                    onClick={handleSaveContactNotes}
                    style={{ padding: '6px 14px', fontSize: '12.5px' }}
                  >
                    {viewContactModal.savingNotes ? (
                      <span>Saving Notes...</span>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Save Admin Notes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="modal-footer" style={{ borderTop: '1.5px solid #f1f5f9', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => {
                  handleDeleteContactReport(viewContactModal.report._id);
                  setViewContactModal({ open: false, report: null, adminNotes: '', savingNotes: false });
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '1px solid #fee2e2',
                  backgroundColor: '#fff1f2',
                  color: '#ef4444',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Trash2 size={15} />
                <span>Delete Ticket</span>
              </button>

              <button
                type="button"
                className="btn-primary-submit"
                onClick={() => setViewContactModal({ open: false, report: null, adminNotes: '', savingNotes: false })}
                style={{ padding: '8px 24px' }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default Dashboard;

