import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Search,
  Star,
  Heart,
  Zap,
  Trash2,
  Edit,
  DollarSign,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  X,
  AlertCircle,
  RefreshCw,
  Sliders,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import {
  fetchPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from '../services/api';

export const SubscriptionManager = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  // Plan Modal Form State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields as requested
  const [formData, setFormData] = useState({
    name: '',
    planKey: '',
    description: '',
    price: '',
    currency: 'USD',
    billingCycle: 'monthly',
    highlightBadge: '',
    // Core Requested Feature Fields:
    includeSwipes: true,
    isUnlimitedSwipes: false,
    swipeLimit: 5,
    includeSuperLikes: false,
    superLikeLimit: 5,
    searchAllowed: false,
    likesAllowed: false,
    // Stripe auto-provisioning
    autoCreateStripeProduct: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const plansRes = await fetchPlans();
      if (plansRes && plansRes.plans) setPlans(plansRes.plans);
    } catch (err) {
      console.error('Failed to load subscription data:', err);
      setStatusMessage('Error loading plans from backend.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 5000);
  };

  const resetPlanForm = () => {
    setFormData({
      name: '',
      planKey: '',
      description: '',
      price: '',
      currency: 'USD',
      billingCycle: 'monthly',
      highlightBadge: '',
      includeSwipes: true,
      isUnlimitedSwipes: false,
      swipeLimit: 5,
      includeSuperLikes: false,
      superLikeLimit: 5,
      searchAllowed: false,
      likesAllowed: false,
      autoCreateStripeProduct: true,
    });
    setIsEditing(false);
    setEditingPlanId(null);
  };

  const openCreatePlanModal = () => {
    resetPlanForm();
    setShowPlanModal(true);
  };

  const openEditPlanModal = (plan) => {
    setIsEditing(true);
    setEditingPlanId(plan._id);

    // Extract current feature values
    const swipesFeat = plan.features?.find((f) => f.featureKey === 'SWIPES');
    const superLikesFeat = plan.features?.find((f) => f.featureKey === 'SUPER_LIKES');
    const searchFeat = plan.features?.find((f) => f.featureKey === 'ADVANCED_SEARCH');
    const likesFeat = plan.features?.find((f) => f.featureKey === 'SEE_WHO_LIKED_YOU');

    const hasSwipes = !!swipesFeat && swipesFeat.isAllowed;
    const isUnlimited = swipesFeat ? swipesFeat.limitValue === -1 : false;
    const swipeVal = swipesFeat && swipesFeat.limitValue > 0 ? swipesFeat.limitValue : 5;

    const hasSuperLikes = !!superLikesFeat && superLikesFeat.isAllowed && superLikesFeat.limitValue > 0;
    const superVal = superLikesFeat ? superLikesFeat.limitValue : 5;

    const hasSearch = !!searchFeat && searchFeat.isAllowed;
    const hasLikes = !!likesFeat && likesFeat.isAllowed;

    setFormData({
      name: plan.name || '',
      planKey: plan.planKey || '',
      description: plan.description || '',
      price: plan.price !== undefined ? String(plan.price) : '',
      currency: plan.currency || 'USD',
      billingCycle: plan.billingCycle || 'monthly',
      highlightBadge: plan.highlightBadge || '',
      includeSwipes: hasSwipes,
      isUnlimitedSwipes: isUnlimited,
      swipeLimit: swipeVal,
      includeSuperLikes: hasSuperLikes,
      superLikeLimit: superVal,
      searchAllowed: hasSearch,
      likesAllowed: hasLikes,
      autoCreateStripeProduct: false,
    });
    setShowPlanModal(true);
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price === '' || isNaN(parseFloat(formData.price))) {
      alert('Please provide a valid plan name and price.');
      return;
    }

    const calculatedPlanKey = isEditing
      ? formData.planKey
      : formData.planKey.trim() || formData.name.trim().replace(/\s+/g, '_').toUpperCase();

    // Build features limit array according to user configuration:
    // Only mark features as allowed if explicitly selected/enabled by admin!
    const featuresPayload = [
      {
        featureKey: 'SWIPES',
        isAllowed: !!formData.includeSwipes,
        limitValue: !formData.includeSwipes ? 0 : (formData.isUnlimitedSwipes ? -1 : parseInt(formData.swipeLimit, 10) || 5),
      },
      {
        featureKey: 'SUPER_LIKES',
        isAllowed: !!formData.includeSuperLikes && parseInt(formData.superLikeLimit, 10) > 0,
        limitValue: formData.includeSuperLikes ? (parseInt(formData.superLikeLimit, 10) || 0) : 0,
      },
      {
        featureKey: 'ADVANCED_SEARCH',
        isAllowed: !!formData.searchAllowed,
        limitValue: formData.searchAllowed ? -1 : 0,
      },
      {
        featureKey: 'SEE_WHO_LIKED_YOU',
        isAllowed: !!formData.likesAllowed,
        limitValue: formData.likesAllowed ? -1 : 0,
      },
    ];

    const payload = {
      name: formData.name.trim(),
      planKey: calculatedPlanKey,
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      currency: 'USD',
      billingCycle: formData.billingCycle,
      highlightBadge: formData.highlightBadge.trim(),
      autoCreateStripeProduct: formData.autoCreateStripeProduct,
      features: featuresPayload,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        const res = await updatePlan(editingPlanId, payload);
        if (res && res.success) {
          showNotification(`Plan "${res.plan.name}" updated successfully!`);
        }
      } else {
        const res = await createPlan(payload);
        if (res && res.success) {
          showNotification(
            `Plan "${res.plan.name}" created! Automatically synced to Stripe Dashboard & Mobile App.`
          );
        }
      }
      setShowPlanModal(false);
      resetPlanForm();
      loadData();
    } catch (err) {
      console.error('Failed to save plan:', err);
      alert(err.response?.data?.message || err.message || 'Failed to save subscription plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePlanActive = async (plan) => {
    const previousPlans = [...plans];
    const newStatus = !plan.isActive;
    // Optimistically update status so card stays clearly visible and updates instantly without screen reload
    setPlans((prev) => prev.map((p) => (p._id === plan._id ? { ...p, isActive: newStatus } : p)));
    try {
      const res = await updatePlan(plan._id, { isActive: newStatus });
      if (res && res.success) {
        showNotification(
          `Plan "${plan.name}" is now ${newStatus ? 'Active & visible in app' : 'Hidden from new users (Current subscribers keep as active)'}.`
        );
      } else {
        setPlans(previousPlans);
      }
    } catch (err) {
      setPlans(previousPlans);
      console.error('Failed to toggle plan:', err);
      alert('Failed to change plan status.');
    }
  };

  const handleDeletePlan = async (plan) => {
    if (!window.confirm(`Are you sure you want to permanently delete plan "${plan.name}"?\n\nThis will remove it from the database and Stripe.`)) return;
    try {
      const res = await deletePlan(plan._id);
      if (res && res.success) {
        showNotification(`Plan "${plan.name}" deleted from database and Stripe.`);
        loadData();
      }
    } catch (err) {
      console.error('Failed to delete plan:', err);
      alert('Failed to delete plan: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="subscription-manager-container animate-fade-in">
      {/* Top Header / Action Bar */}
      <div className="manager-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard size={28} color="#ff4d6d" />
            <span>Subscription & Feature Management</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Configure dynamic plans, pricing (USD), feature limitations, and sync with Stripe & the mobile app.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn-refresh"
            onClick={loadData}
            title="Reload live plans"
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
              color: '#475569',
            }}
          >
            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={openCreatePlanModal}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #ff4d6d 0%, #e02850 100%)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(255, 77, 109, 0.35)',
            }}
          >
            <PlusCircle size={18} />
            <span>Create Subscription Plan</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="alert-banner alert-success animate-fade-in" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
          <CheckCircle2 size={18} />
          <span style={{ fontWeight: 600 }}>{statusMessage}</span>
        </div>
      )}

      {/* PLANS GRID */}
      <div className="plans-grid-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 12px' }} />
            <div>Loading subscription plans...</div>
          </div>
        ) : plans.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <CreditCard size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', color: '#1e293b' }}>No subscription plans found</h3>
            <p style={{ color: '#64748b', marginTop: '6px', marginBottom: '20px' }}>Create your first plan to sync with Stripe and mobile app users.</p>
            <button onClick={openCreatePlanModal} style={{ padding: '10px 20px', backgroundColor: '#ff4d6d', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              + Create Plan Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {plans.map((plan) => {
              const swipeFeat = plan.features?.find((f) => f.featureKey === 'SWIPES');
              const superFeat = plan.features?.find((f) => f.featureKey === 'SUPER_LIKES');
              const searchFeat = plan.features?.find((f) => f.featureKey === 'ADVANCED_SEARCH');
              const likesFeat = plan.features?.find((f) => f.featureKey === 'SEE_WHO_LIKED_YOU');

              const isGoldTier = plan.planKey?.toUpperCase() === 'GOLD';
              const isPremiumTier = plan.planKey?.toUpperCase() === 'PREMIUM';

              return (
                <div
                  key={plan._id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: isGoldTier ? '2px solid #fbbf24' : isPremiumTier ? '2px solid #ff4d6d' : '1px solid #e2e8f0',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    opacity: 1,
                  }}
                >
                  {/* Top Card Badges */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>
                          {plan.planKey} TIER
                        </span>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                          {plan.name}
                        </h3>
                      </div>

                      {plan.highlightBadge && (
                        <span
                          style={{
                            backgroundColor: isGoldTier ? '#fef3c7' : '#fee2e2',
                            color: isGoldTier ? '#92400e' : '#b91c1c',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {plan.highlightBadge}
                        </span>
                      )}
                    </div>

                    {/* Price Display */}
                    <div style={{ margin: '16px 0', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>
                          ${plan.price}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>
                          USD / {plan.billingCycle || 'month'}
                        </span>
                      </div>
                      {plan.description && (
                        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>{plan.description}</p>
                      )}
                    </div>

                    {/* Configured Feature Limits Matrix - ONLY render added/allowed features */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                        Included Features:
                      </div>

                      {/* 1. Swipe Cards */}
                      {swipeFeat && swipeFeat.isAllowed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#1e293b' }}>
                          <Flame size={16} color="#ff4d6d" />
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <strong>Swipe Cards:</strong>{' '}
                            {swipeFeat.limitValue === -1 ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                                <CheckCircle2 size={13} color="#059669" /> Unlimited Swipes
                              </span>
                            ) : (
                              <span>{swipeFeat.limitValue} Swipes / day</span>
                            )}
                          </span>
                        </div>
                      )}

                      {/* 2. Super Likes */}
                      {superFeat && superFeat.isAllowed && superFeat.limitValue > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#1e293b' }}>
                          <Star size={16} color="#fbbf24" fill="#fbbf24" />
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <strong>Super Likes:</strong>
                            <Star size={13} color="#fbbf24" fill="#fbbf24" />
                            <span>{superFeat.limitValue} Super Likes / day</span>
                          </span>
                        </div>
                      )}

                      {/* 3. Search Functionality */}
                      {searchFeat && searchFeat.isAllowed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#1e293b' }}>
                          <Search size={16} color="#3b82f6" />
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <strong>Search Filters:</strong>
                            <Unlock size={13} color="#3b82f6" />
                            <span>All Filters Unlocked</span>
                          </span>
                        </div>
                      )}

                      {/* 4. Likes (See Who Liked You) */}
                      {likesFeat && likesFeat.isAllowed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#1e293b' }}>
                          <Heart size={16} color="#ec4899" fill="#ec4899" />
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <strong>Who Liked You:</strong>
                            <Eye size={13} color="#ec4899" />
                            <span>Unblurred & Revealed</span>
                          </span>
                        </div>
                      )}

                      {/* Fallback if no features were added */}
                      {(!swipeFeat || !swipeFeat.isAllowed) &&
                        (!superFeat || !superFeat.isAllowed || superFeat.limitValue <= 0) &&
                        (!searchFeat || !searchFeat.isAllowed) &&
                        (!likesFeat || !likesFeat.isAllowed) && (
                          <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                            No additional features included in this tier.
                          </div>
                        )}
                    </div>

                    {/* Stripe Sync Status */}
                    {plan.stripePriceId ? (
                      <div style={{ fontSize: '11px', color: '#059669', backgroundColor: '#ecfdf5', padding: '6px 10px', borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={13} />
                        <span>Synced with Stripe ({plan.stripePriceId})</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '11px', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '6px 10px', borderRadius: '6px', marginBottom: '16px' }}>
                        {plan.price === 0 ? 'Free Plan (No Stripe needed)' : 'Custom / Offline Pricing'}
                      </div>
                    )}
                  </div>

                  {/* Card Action Controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      onClick={() => handleTogglePlanActive(plan)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: plan.isActive ? '#059669' : '#475569',
                      }}
                    >
                      {plan.isActive ? <ToggleRight size={22} color="#059669" /> : <ToggleLeft size={22} color="#64748b" />}
                      <span>{plan.isActive ? 'Active in App' : 'Hidden'}</span>
                    </button>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openEditPlanModal(plan)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#f8fafc',
                          cursor: 'pointer',
                          color: '#334155',
                        }}
                        title="Edit Plan"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #fecaca',
                          backgroundColor: '#fef2f2',
                          cursor: 'pointer',
                          color: '#ef4444',
                        }}
                        title="Deactivate Plan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: CREATE / EDIT PLAN FORM */}
      {showPlanModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '30px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={24} color="#ff4d6d" />
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                  {isEditing ? `Edit Plan: ${formData.name}` : 'Create New Subscription Plan'}
                </h3>
              </div>
              <button
                onClick={() => setShowPlanModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePlanSubmit}>
              {/* Plan Name & Plan Key */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diamond VIP"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Plan Tier Key *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    placeholder="e.g. DIAMOND"
                    value={formData.planKey}
                    onChange={(e) => setFormData({ ...formData, planKey: e.target.value.toUpperCase().trim() })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: isEditing ? '#f1f5f9' : '#fff' }}
                  />
                </div>
              </div>

              {/* Price & Currency (USD) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Price Amount *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b', fontWeight: 700 }}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="9.99"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px 10px 28px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Currency
                  </label>
                  <input
                    type="text"
                    disabled
                    value="USD ($)"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', backgroundColor: '#f8fafc', color: '#059669', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Billing Cycle
                  </label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="free">Free</option>
                  </select>
                </div>
              </div>

              {/* Highlight Badge & Description */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Marketing Badge
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MOST POPULAR"
                    value={formData.highlightBadge}
                    onChange={(e) => setFormData({ ...formData, highlightBadge: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Short summary for users"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* FEATURE LIMITATIONS CONFIGURATION (As Requested) */}
              <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sliders size={16} color="#ff4d6d" />
                  <span>Configure Subscription Feature Access</span>
                </h4>

                {/* 1. Swipe Cards */}
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: formData.includeSwipes ? '10px' : '0' }}>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>
                        <input
                          type="checkbox"
                          checked={formData.includeSwipes}
                          onChange={(e) => setFormData({ ...formData, includeSwipes: e.target.checked })}
                        />
                        <Flame size={16} color="#ff4d6d" />
                        <span>Include Swipe Cards Feature</span>
                      </label>
                      <p style={{ fontSize: '12px', color: '#64748b', marginLeft: '22px' }}>Configure swipe limits or unlimited swipes for this tier.</p>
                    </div>

                    <span style={{ fontSize: '12px', fontWeight: 700, color: formData.includeSwipes ? '#059669' : '#94a3b8' }}>
                      {formData.includeSwipes ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  {formData.includeSwipes && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '22px', paddingTop: '8px', borderTop: '1px dashed #f1f5f9' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={formData.isUnlimitedSwipes}
                          onChange={(e) => setFormData({ ...formData, isUnlimitedSwipes: e.target.checked })}
                        />
                        <span>Unlimited Swipes</span>
                      </label>

                      {!formData.isUnlimitedSwipes && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="number"
                            min="1"
                            placeholder="Limit/day"
                            value={formData.swipeLimit}
                            onChange={(e) => setFormData({ ...formData, swipeLimit: e.target.value })}
                            style={{ width: '80px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          />
                          <span style={{ fontSize: '12px', color: '#64748b' }}>swipes/day</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Super Likes */}
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: formData.includeSuperLikes ? '10px' : '0' }}>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>
                        <input
                          type="checkbox"
                          checked={formData.includeSuperLikes}
                          onChange={(e) => setFormData({ ...formData, includeSuperLikes: e.target.checked })}
                        />
                        <Star size={16} color="#fbbf24" fill="#fbbf24" />
                        <span>Include Super Likes Feature</span>
                      </label>
                      <p style={{ fontSize: '12px', color: '#64748b', marginLeft: '22px' }}>Give users daily Super Likes to stand out.</p>
                    </div>

                    <span style={{ fontSize: '12px', fontWeight: 700, color: formData.includeSuperLikes ? '#059669' : '#94a3b8' }}>
                      {formData.includeSuperLikes ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  {formData.includeSuperLikes && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '22px', paddingTop: '8px', borderTop: '1px dashed #f1f5f9' }}>
                      <input
                        type="number"
                        min="1"
                        placeholder="Limit/day"
                        value={formData.superLikeLimit}
                        onChange={(e) => setFormData({ ...formData, superLikeLimit: e.target.value })}
                        style={{ width: '80px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Super Likes per day</span>
                    </div>
                  )}
                </div>

                {/* 3. Search Functionality */}
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>
                      <input
                        type="checkbox"
                        checked={formData.searchAllowed}
                        onChange={(e) => setFormData({ ...formData, searchAllowed: e.target.checked })}
                      />
                      <Search size={16} color="#3b82f6" />
                      <span>Include Advanced Search Filters</span>
                    </label>
                    <p style={{ fontSize: '12px', color: '#64748b', marginLeft: '22px' }}>Unlock filters for Profession, Education, Zodiac, Lifestyle habits.</p>
                  </div>

                  <span style={{ fontSize: '12px', fontWeight: 700, color: formData.searchAllowed ? '#059669' : '#94a3b8' }}>
                    {formData.searchAllowed ? 'Unlocked' : 'Locked'}
                  </span>
                </div>

                {/* 4. Likes (See Who Liked You) */}
                <div style={{ padding: '12px', backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>
                      <input
                        type="checkbox"
                        checked={formData.likesAllowed}
                        onChange={(e) => setFormData({ ...formData, likesAllowed: e.target.checked })}
                      />
                      <Heart size={16} color="#ec4899" fill="#ec4899" />
                      <span>Include "See Who Liked You"</span>
                    </label>
                    <p style={{ fontSize: '12px', color: '#64748b', marginLeft: '22px' }}>Unblur full profiles and photos of users who swiped right.</p>
                  </div>

                  <span style={{ fontSize: '12px', fontWeight: 700, color: formData.likesAllowed ? '#059669' : '#94a3b8' }}>
                    {formData.likesAllowed ? 'Unlocked & Revealed' : 'Blurred'}
                  </span>
                </div>
              </div>

              {/* Stripe Dashboard Sync Option */}
              {!isEditing && (
                <div style={{ marginBottom: '24px', padding: '12px 16px', backgroundColor: '#eef2ff', borderRadius: '10px', border: '1px solid #c7d2fe' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.autoCreateStripeProduct}
                      onChange={(e) => setFormData({ ...formData, autoCreateStripeProduct: e.target.checked })}
                    />
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: '#312e81' }}>
                        Automatically create Product & Price in Stripe Dashboard
                      </span>
                      <p style={{ fontSize: '11.5px', color: '#4338ca', marginTop: '2px' }}>
                        Provisions recurring subscription on Stripe so payments work immediately in the mobile app.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#fff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff4d6d 0%, #e02850 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(255, 77, 109, 0.35)',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? 'Saving to Database & Stripe...' : isEditing ? 'Save Changes' : 'Create & Sync Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SubscriptionManager;
