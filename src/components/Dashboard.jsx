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
  const [reportSearch, setReportSearch] = useState('');
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
  }, [reportStatusFilter, reportSearch]);

  useEffect(() => {
    setContactReportsPage(1);
  }, [contactSearch, contactStatusFilter]);

  // Reported User Complaint View Details Modal State
  const [viewReportModal, setViewReportModal] = useState({
    open: false,
    report: null,
  });

  const handleOpenReportModal = (report) => {
    setViewReportModal({
      open: true,
      report,
    });
  };

  const handleModalReportStatusChange = async (newStatus) => {
    if (!viewReportModal.report) return;
    try {
      const reportId = viewReportModal.report._id;
      await handleUpdateStatus(reportId, newStatus);
      setViewReportModal((prev) => ({
        ...prev,
        report: { ...prev.report, status: newStatus },
      }));
    } catch (err) {
      console.error('Failed to update report status in modal:', err);
    }
  };

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
    const reported = r.reportedId || {};
    const reporter = r.reporterId || {};
    const reportedName = (reported.name || reported.firstName || '').toLowerCase();
    const reportedEmail = (reported.email || '').toLowerCase();
    const reportedMobile = (reported.mobile || '').toLowerCase();
    const reporterName = (reporter.name || reporter.firstName || '').toLowerCase();
    const reporterEmail = (reporter.email || '').toLowerCase();
    const reporterMobile = (reporter.mobile || '').toLowerCase();
    const reason = (r.reason || '').toLowerCase();
    const details = (r.details || '').toLowerCase();
    const category = (r.category || '').toLowerCase();

    const q = reportSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      reportedName.includes(q) ||
      reportedEmail.includes(q) ||
      reportedMobile.includes(q) ||
      reporterName.includes(q) ||
      reporterEmail.includes(q) ||
      reporterMobile.includes(q) ||
      reason.includes(q) ||
      details.includes(q) ||
      category.includes(q);

    let matchesStatus = true;
    const st = (r.status || 'pending').toLowerCase();
    if (reportStatusFilter === 'all') {
      matchesStatus = true;
    } else if (reportStatusFilter === 'reviewed') {
      matchesStatus = ['reviewed', 'working', 'under_review'].includes(st);
    } else {
      matchesStatus = st === reportStatusFilter.toLowerCase();
    }

    return matchesSearch && matchesStatus;
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
            {/* Top Metric Summary Cards */}
            {(() => {
              const totalCount = reports.length;
              const pendingCount = reports.filter((r) => (r.status || 'pending').toLowerCase() === 'pending').length;
              const reviewedCount = reports.filter((r) => ['reviewed', 'working', 'under_review'].includes((r.status || '').toLowerCase())).length;
              const resolvedCount = reports.filter((r) => ['resolved', 'dismissed'].includes((r.status || '').toLowerCase())).length;

              return (
                <div className="stats-grid contact-reports-stats-grid" style={{ marginBottom: '20px' }}>
                  <div
                    className={`stat-card stat-users ${reportStatusFilter === 'all' ? 'selected-card' : ''}`}
                    onClick={() => setReportStatusFilter('all')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="stat-icon-wrapper" style={{ backgroundColor: '#fff0f5', color: '#FE3C72' }}>
                      <ShieldAlert size={24} />
                    </div>
                    <div className="stat-content">
                      <span className="stat-value">{totalCount}</span>
                      <span className="stat-label">Total User Reports</span>
                      <span className="stat-subtext">Community complaints & flags</span>
                    </div>
                  </div>

                  <div
                    className={`stat-card ${reportStatusFilter === 'pending' ? 'selected-card' : ''}`}
                    onClick={() => setReportStatusFilter('pending')}
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
                    className={`stat-card ${reportStatusFilter === 'reviewed' ? 'selected-card' : ''}`}
                    onClick={() => setReportStatusFilter('reviewed')}
                    style={{ cursor: 'pointer', borderLeft: '4px solid #3b82f6' }}
                  >
                    <div className="stat-icon-wrapper" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
                      <RefreshCw size={24} />
                    </div>
                    <div className="stat-content">
                      <span className="stat-value" style={{ color: '#2563eb' }}>{reviewedCount}</span>
                      <span className="stat-label">Under Review</span>
                      <span className="stat-subtext">Currently investigating</span>
                    </div>
                  </div>

                  <div
                    className={`stat-card ${reportStatusFilter === 'resolved' ? 'selected-card' : ''}`}
                    onClick={() => setReportStatusFilter('resolved')}
                    style={{ cursor: 'pointer', borderLeft: '4px solid #10b981' }}
                  >
                    <div className="stat-icon-wrapper" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="stat-content">
                      <span className="stat-value" style={{ color: '#059669' }}>{resolvedCount}</span>
                      <span className="stat-label">Resolved / Dismissed</span>
                      <span className="stat-subtext">Action taken or closed</span>
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
                  placeholder="Search by reported user, reporter, email, mobile, reason..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                />
                {reportSearch && (
                  <button className="clear-search-btn" onClick={() => setReportSearch('')}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="filter-controls-group">
                {/* Quick Status Pills */}
                <div className="contact-quick-status-pills">
                  <button
                    type="button"
                    className={`status-pill-btn ${reportStatusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setReportStatusFilter('all')}
                  >
                    All ({reports.length})
                  </button>
                  <button
                    type="button"
                    className={`status-pill-btn pending ${reportStatusFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setReportStatusFilter('pending')}
                  >
                    Pending ({reports.filter((r) => (r.status || 'pending').toLowerCase() === 'pending').length})
                  </button>
                  <button
                    type="button"
                    className={`status-pill-btn reviewed ${reportStatusFilter === 'reviewed' ? 'active' : ''}`}
                    onClick={() => setReportStatusFilter('reviewed')}
                  >
                    Under Review ({reports.filter((r) => ['reviewed', 'working', 'under_review'].includes((r.status || '').toLowerCase())).length})
                  </button>
                  <button
                    type="button"
                    className={`status-pill-btn resolved ${reportStatusFilter === 'resolved' ? 'active' : ''}`}
                    onClick={() => setReportStatusFilter('resolved')}
                  >
                    Resolved ({reports.filter((r) => (r.status || '').toLowerCase() === 'resolved').length})
                  </button>
                  <button
                    type="button"
                    className={`status-pill-btn dismissed ${reportStatusFilter === 'dismissed' ? 'active' : ''}`}
                    onClick={() => setReportStatusFilter('dismissed')}
                  >
                    Dismissed ({reports.filter((r) => (r.status || '').toLowerCase() === 'dismissed').length})
                  </button>
                </div>

                <div className="filter-select-wrapper">
                  <Filter size={16} className="filter-icon" />
                  <ResponsiveSelect
                    hasLeftIcon={true}
                    options={[
                      { value: 'all', label: 'All Statuses' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'reviewed', label: 'Under Review' },
                      { value: 'resolved', label: 'Resolved' },
                      { value: 'dismissed', label: 'Dismissed' },
                    ]}
                    value={reportStatusFilter}
                    onChange={(val) => setReportStatusFilter(val)}
                    style={{ minWidth: '160px' }}
                  />
                </div>

                <button
                  type="button"
                  className="btn-create-report"
                  onClick={() => setShowReportModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <PlusCircle size={16} />
                  <span>Submit Reported User Form</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-container">
                <span className="spinner" style={{ borderColor: 'rgba(255,77,109,0.3)', borderTopColor: '#ff4d6d' }}></span>
                <span>Loading report queue...</span>
              </div>
            ) : filteredReports.length === 0 ? (
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
                <ShieldCheck size={44} style={{ marginBottom: '12px', opacity: 0.4, color: '#FE3C72' }} />
                <h4 style={{ margin: '0 0 6px 0', color: '#0f172a', fontWeight: '700' }}>No reported users found</h4>
                <p style={{ margin: 0, fontSize: '13px' }}>
                  {reportSearch || reportStatusFilter !== 'all'
                    ? 'Try adjusting your search query or status filter.'
                    : 'No reported users in the system yet.'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop & Tablet Data Table */}
                <div className="table-responsive-wrapper contact-desktop-table-wrapper">
                  <table className="pink-data-table contact-reports-table">
                    <thead>
                      <tr>
                        <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                        <th style={{ width: '130px' }}>Date & Time</th>
                        <th style={{ width: '190px' }}>Reported User</th>
                        <th style={{ width: '170px' }}>Reporter</th>
                        <th style={{ width: '160px' }}>Category / Reason</th>
                        <th style={{ minWidth: '200px' }}>Complaint Details</th>
                        <th style={{ width: '110px' }}>Status</th>
                        <th style={{ width: '210px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedReports.map((report, idx) => {
                        const globalIndex = reportsStartIndex + idx + 1;
                        const reporter = report.reporterId || {};
                        const reported = report.reportedId || {};

                        const reportedName = reported.name || reported.firstName || 'Reported User';
                        const reporterName = reporter.name || reporter.firstName || 'Reporter';

                        const reportedInitial = (reportedName || 'R')[0].toUpperCase();
                        const reporterInitial = (reporterName || 'U')[0].toUpperCase();

                        const warnList = reported.warnings || [];
                        const ackWarn = warnList.find((w) => w.isAcknowledged === true);
                        const pendingWarn = warnList.find((w) => w.isAcknowledged === false);
                        const isAck = report.isAcknowledged === true || report.details === 'Report Viewed & Acknowledged' || !!ackWarn;

                        const reasonSnippet = report.reason && report.reason.length > 65
                          ? report.reason.substring(0, 65) + '...'
                          : (report.reason || 'No description provided');

                        const categoryText = report.category || (report.reason && report.reason.startsWith('[') ? report.reason.split(']')[0].replace('[', '') : 'Community Flag');

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
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: getAvatarColor(reportedName),
                                    color: '#ffffff',
                                    fontWeight: '800',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  {reportedInitial}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>
                                    {reportedName}
                                  </div>
                                  <div style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {reported.email && <span>{reported.email}</span>}
                                    {reported.mobile && <span>{reported.mobile}</span>}
                                    {!reported.email && !reported.mobile && <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>No contact</span>}
                                  </div>
                                  {ackWarn && (
                                    <div style={{ marginTop: '3px', fontSize: '10.5px', color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      <ShieldCheck size={12} />
                                      <span>Acknowledged Warning</span>
                                    </div>
                                  )}
                                  {pendingWarn && !ackWarn && (
                                    <div style={{ marginTop: '3px', fontSize: '10.5px', color: '#f59e0b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      <AlertTriangle size={12} />
                                      <span>Warning Pending</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                                <div
                                  style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    backgroundColor: getAvatarColor(reporterName),
                                    color: '#ffffff',
                                    fontWeight: '800',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  {reporterInitial}
                                </div>
                                <div>
                                  <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>
                                    {reporterName}
                                  </div>
                                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                                    {reporter.email || reporter.mobile || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Anonymous</span>}
                                  </div>
                                </div>
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
                                title={categoryText}
                              >
                                {categoryText}
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
                                title="Click 'View' to read full complaint description"
                              >
                                {reasonSnippet}
                              </div>
                              {isAck && (
                                <div style={{ marginTop: '4px', fontSize: '11px', color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <ShieldCheck size={12} />
                                  <span>Viewed & Acknowledged</span>
                                </div>
                              )}
                            </td>
                            <td>
                              {getReportStatusBadge(report.status)}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                {/* VIEW BUTTON */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenReportModal(report)}
                                  className="btn-view-contact-report"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    border: '1.5px solid #fed7e2',
                                    backgroundColor: '#fff5f7',
                                    color: '#FE3C72',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 1px 3px rgba(254, 60, 114, 0.12)',
                                  }}
                                  title="View full report & complaint details"
                                >
                                  <Eye size={13} />
                                  <span>View</span>
                                </button>

                                {/* STATUS SELECT */}
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
                                  style={{ minWidth: '120px' }}
                                />

                                {/* WARN BUTTON */}
                                <button
                                  type="button"
                                  onClick={() => openReportModalForUser(reported, report._id)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '6px 9px',
                                    borderRadius: '8px',
                                    border: '1px solid #fecdd3',
                                    backgroundColor: '#fff1f2',
                                    color: '#e11d48',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                  }}
                                  title="Issue official warning / action form"
                                >
                                  <AlertTriangle size={13} />
                                  <span>Warn</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="contact-mobile-cards-container">
                  {paginatedReports.map((report) => {
                    const reporter = report.reporterId || {};
                    const reported = report.reportedId || {};
                    const reportedName = reported.name || reported.firstName || 'Reported User';
                    const reporterName = reporter.name || reporter.firstName || 'Reporter';
                    const categoryText = report.category || (report.reason && report.reason.startsWith('[') ? report.reason.split(']')[0].replace('[', '') : 'Community Flag');

                    return (
                      <div key={report._id} className="contact-mobile-card">
                        <div className="contact-mobile-card-header">
                          <div className="contact-mobile-sender">
                            <span className="sender-name">{reportedName}</span>
                            <span className="sender-time">
                              Reported on: {new Date(report.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div>
                            {getReportStatusBadge(report.status)}
                          </div>
                        </div>

                        <div className="contact-mobile-card-body">
                          <div className="contact-mobile-topic">
                            <span className="topic-badge">{categoryText}</span>
                          </div>

                          <div className="contact-mobile-info">
                            <div style={{ fontSize: '12px', color: '#475569' }}>
                              <strong>Reported by:</strong> {reporterName} {reporter.email ? `(${reporter.email})` : ''}
                            </div>
                            {(reported.email || reported.mobile) && (
                              <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                                Contact: {reported.email || reported.mobile}
                              </div>
                            )}
                          </div>

                          <div className="contact-mobile-message-box">
                            {report.reason || 'No description content.'}
                          </div>
                        </div>

                        <div className="contact-mobile-card-footer">
                          <button
                            type="button"
                            onClick={() => handleOpenReportModal(report)}
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
                                { value: 'reviewed', label: 'Under Review' },
                                { value: 'resolved', label: 'Resolved' },
                                { value: 'dismissed', label: 'Dismissed' },
                              ]}
                              value={(report.status || 'pending').toLowerCase()}
                              onChange={(val) => handleUpdateStatus(report._id, val)}
                              compact
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => openReportModalForUser(reported, report._id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid #fecdd3',
                              backgroundColor: '#fff1f2',
                              color: '#e11d48',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            <AlertTriangle size={13} />
                            <span>Warn</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

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
              </>
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
          <div className="modal-container animate-slide-up" onClick={(e) => e.stopPropagation()} style={{ width: '92vw', maxWidth: '640px', boxSizing: 'border-box' }}>
            
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
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
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
                  <FileText size={14} style={{ flexShrink: 0 }} /> Complaint Narrative & Evidence Details
                </label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="Enter full details of the complaint submitted by the reporter (e.g. Chat harassment, inappropriate messages sent...)"
                  value={reportFormData.reason}
                  onChange={(e) => setReportFormData({ ...reportFormData, reason: e.target.value })}
                />
              </div>

              {/* Section 4: Initial Status Queue */}
              <div className="form-group">
                <label>Initial Status Queue</label>
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
        <div className="modal-backdrop" onClick={() => setStatusModal({ open: false, user: null, newStatus: false, reason: '', submitting: false })}>
          <div className="modal-content status-modal-content animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                {statusModal.newStatus ? (
                  <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', flexShrink: 0 }}>
                    <UserCheck size={22} />
                  </div>
                ) : (
                  <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', flexShrink: 0 }}>
                    <UserX size={22} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: '700', margin: 0, wordBreak: 'break-word', lineHeight: '1.25' }}>
                    {statusModal.newStatus ? 'Activate User Account' : 'Deactivate User Account'}
                  </h3>
                </div>
              </div>
              <button 
                type="button"
                className="close-btn" 
                onClick={() => setStatusModal({ open: false, user: null, newStatus: false, reason: '', submitting: false })}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body status-modal-body">
              <p style={{ color: '#1e293b', fontSize: '14px', lineHeight: '1.5', marginBottom: '14px', wordBreak: 'break-word' }}>
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

            <div className="modal-footer status-modal-footer">
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
        <div className="modal-backdrop" onClick={() => setSubscriptionModal({ open: false, user: null, loading: false, details: null })}>
          <div className="modal-content subscription-details-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(254, 60, 114, 0.15)', color: '#fe3c72', flexShrink: 0 }}>
                  <Crown size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: '700', margin: 0, wordBreak: 'break-word', lineHeight: '1.25' }}>
                    User Subscription Details
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', wordBreak: 'break-all', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {subscriptionModal.user?.name || subscriptionModal.user?.firstName || 'User'} ({subscriptionModal.user?.email || 'No email'})
                  </div>
                </div>
              </div>
              <button 
                type="button"
                className="close-btn" 
                onClick={() => setSubscriptionModal({ open: false, user: null, loading: false, details: null })}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body subscription-modal-body">
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
                      <div className="sub-banner-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: '700' }}>
                            Subscribed Package
                          </div>
                          <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <Crown size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
                            <span style={{ wordBreak: 'break-word' }}>{planName}</span>
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
                          flexShrink: 0,
                        }}>
                          {isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          <span>{isActive ? 'Active Subscription' : (status === 'canceled' ? 'Canceled' : 'Inactive')}</span>
                        </span>
                      </div>

                      <div className="sub-meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Pricing & Cycle</span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', wordBreak: 'break-word' }}>{price} / {cycle}</span>
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
                          <CreditCard size={14} color="#64748b" style={{ flexShrink: 0 }} />
                          <span>Payment Gateway Details (Stripe)</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#64748b' }}>
                          {activeSub?.stripeCustomerId && (
                            <div style={{ wordBreak: 'break-all' }}>Customer ID: <code style={{ backgroundColor: '#e2e8f0', padding: '2px 5px', borderRadius: '4px', color: '#1e293b', wordBreak: 'break-all', display: 'inline-block' }}>{activeSub.stripeCustomerId}</code></div>
                          )}
                          {activeSub?.stripeSubscriptionId && (
                            <div style={{ wordBreak: 'break-all' }}>Subscription ID: <code style={{ backgroundColor: '#e2e8f0', padding: '2px 5px', borderRadius: '4px', color: '#1e293b', wordBreak: 'break-all', display: 'inline-block' }}>{activeSub.stripeSubscriptionId}</code></div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Plan Included Features */}
                    {planDetails?.features && planDetails.features.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
                          <span>Features Included in Plan</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {planDetails.features.map((f, i) => (
                            <span key={i} style={{ fontSize: '11px', fontWeight: '600', padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563EB', border: '1px solid rgba(59, 130, 246, 0.2)', wordBreak: 'break-word' }}>
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
                          <Clock size={14} color="#64748b" style={{ flexShrink: 0 }} />
                          <span>Subscription History ({subData.subscriptionHistory.length})</span>
                        </div>
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <table style={{ width: '100%', minWidth: '300px', fontSize: '12px', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                              <tr>
                                <th style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>Plan</th>
                                <th style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>Status</th>
                                <th style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>Date</th>
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
                                  <td style={{ padding: '6px 10px', color: '#64748b', whiteSpace: 'nowrap' }}>
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

            <div className="modal-footer subscription-modal-footer">
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
            <div className="modal-header">
              <div className="modal-title-box">
                <div className="modal-icon-badge" style={{ backgroundColor: '#fff0f5', color: '#FE3C72' }}>
                  <MessageSquare size={22} />
                </div>
                <div className="modal-title-text">
                  <h3>User Support Report Details</h3>
                  <p>
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
            <div className="modal-body contact-modal-body">
              
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
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', wordBreak: 'break-word' }}>
                        {viewContactModal.report.name || 'Guest User'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                        <Calendar size={12} color="#FE3C72" style={{ flexShrink: 0 }} />
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
                        style={{ flex: 1, minWidth: '130px' }}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Mail size={14} color="#3b82f6" style={{ flexShrink: 0 }} /> Email Address
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Phone size={14} color="#10b981" style={{ flexShrink: 0 }} /> Phone Number
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
                      style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a', textDecoration: 'none', wordBreak: 'break-all' }}
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
                  wordBreak: 'break-word',
                }}>
                  <HelpCircle size={16} color="#FE3C72" style={{ flexShrink: 0 }} />
                  <span>{viewContactModal.report.subject || 'General Inquiry / App Problem'}</span>
                </div>
              </div>

              {/* Row 4: Submitted Issue Description (Full Message) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={15} color="#FE3C72" style={{ flexShrink: 0 }} />
                    <span>User Submitted Issue Description</span>
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
                    padding: '14px',
                    fontSize: '13.5px',
                    color: '#1e293b',
                    lineHeight: '1.6',
                    maxHeight: '200px',
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
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    color: '#0f172a',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn-create-report"
                    disabled={viewContactModal.savingNotes}
                    onClick={handleSaveContactNotes}
                    style={{ padding: '7px 14px', fontSize: '12.5px' }}
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
            <div className="modal-footer contact-modal-footer">
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

      {/* ========================================================================== */}
      {/* REPORTED USER COMPLAINT DETAILS MODAL */}
      {/* ========================================================================== */}
      {viewReportModal.open && viewReportModal.report && (() => {
        const report = viewReportModal.report;
        const reported = report.reportedId || {};
        const reporter = report.reporterId || {};
        const reportedName = reported.name || reported.firstName || 'Reported User';
        const reporterName = reporter.name || reporter.firstName || 'Reporter';
        const reportedInitial = (reportedName || 'R')[0].toUpperCase();
        const reporterInitial = (reporterName || 'U')[0].toUpperCase();

        const warnList = reported.warnings || [];
        const ackWarn = warnList.find((w) => w.isAcknowledged === true);
        const pendingWarn = warnList.find((w) => w.isAcknowledged === false);
        const isAck = report.isAcknowledged === true || report.details === 'Report Viewed & Acknowledged' || !!ackWarn;
        const ackDate = report.acknowledgedAt || ackWarn?.acknowledgedAt;

        const categoryText = report.category || (report.reason && report.reason.startsWith('[') ? report.reason.split(']')[0].replace('[', '') : 'Community Guidelines Violation');

        return (
          <div className="modal-backdrop animate-fade-in" onClick={() => setViewReportModal({ open: false, report: null })}>
            <div className="modal-container contact-details-modal animate-slide-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', width: '92%' }}>
              
              {/* Modal Header */}
              <div className="modal-header">
                <div className="modal-title-box">
                  <div className="modal-icon-badge" style={{ backgroundColor: '#fff0f5', color: '#FE3C72' }}>
                    <ShieldAlert size={22} />
                  </div>
                  <div className="modal-title-text">
                    <h3>Reported User Complaint Details</h3>
                    <p>
                      Ticket #{report._id?.substring(report._id.length - 8) || report._id} • Logged {formatDateTime(report.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setViewReportModal({ open: false, report: null })}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content Body */}
              <div className="modal-body contact-modal-body">
                
                {/* Row 1: Reported User Profile & Status Action */}
                <div className="contact-modal-info-grid" style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                      <AlertTriangle size={13} color="#e11d48" /> Reported User
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: getAvatarColor(reportedName),
                        color: '#ffffff',
                        fontWeight: '800',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {reportedInitial}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', wordBreak: 'break-word' }}>
                          {reportedName}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          <Calendar size={12} color="#FE3C72" style={{ flexShrink: 0 }} />
                          <span>Reported on: <strong>{formatDateTime(report.createdAt)}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                      Investigation Status
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <ResponsiveSelect
                          options={[
                            { value: 'pending', label: 'Pending' },
                            { value: 'reviewed', label: 'Under Review' },
                            { value: 'resolved', label: 'Resolved' },
                            { value: 'dismissed', label: 'Dismissed' },
                          ]}
                          value={(report.status || 'pending').toLowerCase()}
                          onChange={(val) => handleModalReportStatusChange(val)}
                          style={{ flex: 1, minWidth: '130px' }}
                        />
                        {getReportStatusBadge(report.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Reported User & Reporter Contact Info Grid */}
                <div className="contact-modal-info-grid">
                  
                  {/* Reported User Contact Details */}
                  <div style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <User size={14} color="#e11d48" style={{ flexShrink: 0 }} /> Reported User Info
                      </span>
                      {reported.email && (
                        <button
                          type="button"
                          onClick={() => handleCopyText(reported.email, 'reportedEmail')}
                          style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}
                        >
                          {copiedField === 'reportedEmail' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                          <span>{copiedField === 'reportedEmail' ? 'Copied!' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                    {reported.email ? (
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', wordBreak: 'break-all' }}>
                        {reported.email}
                      </div>
                    ) : (
                      <span style={{ fontSize: '12.5px', color: '#94a3b8', fontStyle: 'italic' }}>No email registered</span>
                    )}
                    {reported.mobile && (
                      <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={11} color="#10b981" />
                        <span>{reported.mobile}</span>
                      </div>
                    )}
                  </div>

                  {/* Reporter Contact Details */}
                  <div style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <User size={14} color="#3b82f6" style={{ flexShrink: 0 }} /> Submitted By (Reporter)
                      </span>
                      {reporter.email && (
                        <button
                          type="button"
                          onClick={() => handleCopyText(reporter.email, 'reporterEmail')}
                          style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}
                        >
                          {copiedField === 'reporterEmail' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                          <span>{copiedField === 'reporterEmail' ? 'Copied!' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                      {reporterName}
                    </div>
                    {reporter.email ? (
                      <a
                        href={`mailto:${reporter.email}`}
                        style={{ fontSize: '12.5px', color: '#2563eb', textDecoration: 'none', wordBreak: 'break-all' }}
                      >
                        {reporter.email}
                      </a>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Anonymous / In-app Report</span>
                    )}
                    {reporter.mobile && (
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {reporter.mobile}
                      </div>
                    )}
                  </div>

                </div>

                {/* Row 3: Category / Topic */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                    Complaint Reason & Category
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
                    wordBreak: 'break-word',
                  }}>
                    <Flag size={16} color="#FE3C72" style={{ flexShrink: 0 }} />
                    <span>{categoryText}</span>
                  </div>
                </div>

                {/* Row 4: Full Complaint Description & Reason Box */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={15} color="#FE3C72" style={{ flexShrink: 0 }} />
                      <span>Reporter Statement / Details</span>
                    </span>
                    {report.reason && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(report.reason, 'reportReason')}
                        style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', color: '#475569', cursor: 'pointer', fontSize: '11.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {copiedField === 'reportReason' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                        <span>{copiedField === 'reportReason' ? 'Copied!' : 'Copy Statement'}</span>
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px',
                      fontSize: '13.5px',
                      color: '#1e293b',
                      lineHeight: '1.6',
                      maxHeight: '180px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    {report.reason || 'No description provided by reporter.'}
                  </div>
                </div>

                {/* Row 5: Warning / User Acknowledgment Status */}
                {isAck ? (
                  <div style={{ padding: '12px 14px', backgroundColor: 'rgba(16, 185, 129, 0.12)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={20} color="#10B981" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#065f46' }}>Report Viewed & Acknowledged by User</div>
                      {ackDate && (
                        <div style={{ fontSize: '11.5px', color: '#047857', marginTop: '2px' }}>
                          Acknowledged on {new Date(ackDate).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ) : pendingWarn ? (
                  <div style={{ padding: '12px 14px', backgroundColor: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#92400e' }}>Warning Issued (Pending Acknowledgment)</div>
                      <div style={{ fontSize: '11.5px', color: '#b45309', marginTop: '2px' }}>
                        User has been notified and must acknowledge the community guidelines.
                      </div>
                    </div>
                  </div>
                ) : null}

              </div>

              {/* Modal Footer */}
              <div className="modal-footer contact-modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setViewReportModal({ open: false, report: null });
                    openReportModalForUser(reported, report._id);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid #fecdd3',
                    backgroundColor: '#fff1f2',
                    color: '#e11d48',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <AlertTriangle size={15} />
                  <span>Submit Reported User Form / Warn</span>
                </button>

                <button
                  type="button"
                  className="btn-primary-submit"
                  onClick={() => setViewReportModal({ open: false, report: null })}
                  style={{ padding: '8px 24px' }}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      </div>
    </div>
  );
};

export default Dashboard;

