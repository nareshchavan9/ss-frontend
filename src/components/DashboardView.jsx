import React, { useState, useEffect } from 'react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

export default function DashboardView({ user, onNavigate, showToast, onUpdateUser, onBroadcastSent, activeTab, setActiveTab }) {
  const isAdmin = !!(user && user.role === 'ADMIN');
  const isHotelOwner = !!(user && user.role === 'HOTEL_OWNER');
  const isTraveler = !isAdmin && !isHotelOwner;

  const [activities, setActivities] = useState([
    { id: 1, text: 'New Host Registered: Ocean Crest Villas', status: 'Success', type: 'success' },
    { id: 2, text: 'User Account Suspended: spammer@test.com', status: 'Alert', type: 'alert' }
  ]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [latency, setLatency] = useState('45ms');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastAudience, setBroadcastAudience] = useState('EVERYONE');
  const [showReportModal, setShowReportModal] = useState(false);
  const [generatedReportDate, setGeneratedReportDate] = useState('');
  const [allBroadcasts, setAllBroadcasts] = useState([]);
  const [editingBroadcast, setEditingBroadcast] = useState(null);

  // Interactive Lists States
  const [usersList, setUsersList] = useState([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const mappedUsers = data.data.map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.isSuspended ? 'Suspended' : (u.isVerified ? 'Verified' : 'Pending Verify')
        }));
        setUsersList(mappedUsers);
      } else {
        showToast(data.message || 'Failed to fetch users.', true);
      }
    } catch (error) {
      showToast('Error connecting to server to fetch users.', true);
    }
  };

  const fetchAllBroadcasts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}/auth/broadcasts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAllBroadcasts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch broadcasts:', error);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        fetchUsers();
        fetchAllBroadcasts();
        fetchSystemConfig();
      } else if (user.role === 'HOTEL_OWNER') {
        fetchHostHotels();
        fetchHostReservations();
        fetchHostReviews();
        fetchHostPayoutMethods();
      } else {
        fetchTravelerCards();
        fetchTravelerBookings();
        fetchWishlist();
      }
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'dining' && isTraveler) {
      fetchFoodOrders();
      fetchTravelerBookings();
    } else if (activeTab === 'dining-orders' && isHotelOwner) {
      fetchHostFoodOrders();
    }
  }, [activeTab, isTraveler, isHotelOwner]);

  const [hotelsList, setHotelsList] = useState([
    { id: 1, name: 'The Azure Pavilion', host: 'Marcus Vance', location: 'Maldives', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9Vyd3zQJN1bsCNKoybmYimsRCAq4TiAnKxiaqh1tcMlPVY7aNOPYRwgFXRbTaeSpkaMj8mB00aVDOhHB22Bof42UqGsjl1uLTw8In7Go72mHJqN37gl90Hbxv-kw1Cy6Y7Z7DA6bizRTOX4_vpsd92ctV-QwDIrbiF0YD-sAV57gIEaOJ-MfvrQR2vYq-RjXmZSDOMu5Jb7YHjKnyqOgemQr44H47whXskMTKjJDNIIohdAKKTu-dJKleALPZvf0TqDcgkz5ZIdmC', price: 450, status: 'Approved' },
    { id: 2, name: 'Alpine Obsidian Chalet', host: 'Sarah Jenkins', location: 'Switzerland', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyhO_cLk5flMgpJaojeEO4moeIjNqzXIB5VBOcb24YkuD7wqDVMnlRbEeHQhW10YWFXc4GO9zSfwv2uRk5cBBKFCQiQdM_rsXHjyoqRGP9frukoVGaC-zwS9GtoXZLeqUg5cYeqGbACLcP4CyBXEA6NMGbXxK9LQYTG1PITdgDCEpc0iI_lslEHPpEN7v4SLGEtbsYvuHPdysXY5UkitFenu26YYD92Uxw0NOZ4SJejGv5JZMjvWojyH2uadlnlZ3HxzS5g8i1hqvQ', price: 1200, status: 'Pending Review' }
  ]);

  // Filtering States
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [hotelSearchQuery, setHotelSearchQuery] = useState('');
  const [hotelStatusFilter, setHotelStatusFilter] = useState('ALL');

  // Modals / Edit Dialogs
  const [editingUser, setEditingUser] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('USER');

  // Profile Settings States (Initialized from current logged-in user)
  const [profileName, setProfileName] = useState(user ? user.name : '');
  const [profileEmail, setProfileEmail] = useState(user ? user.email : '');
  const [profilePhone, setProfilePhone] = useState(user && user.phone ? user.phone : '');
  const [profilePhoto, setProfilePhoto] = useState(user && user.avatar ? user.avatar : '');

  // Host listing state variables
  const [hostHotels, setHostHotels] = useState([]);
  const [reservationsList, setReservationsList] = useState([]);
  const [travelerBookings, setTravelerBookings] = useState([]);
  // Food service states
  const [foodOrders, setFoodOrders] = useState([]);
  const [hostFoodOrders, setHostFoodOrders] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [foodCart, setFoodCart] = useState({});
  const [foodMenuFilter, setFoodMenuFilter] = useState('All');
  const [showCreateHotelModal, setShowCreateHotelModal] = useState(false);
  const [newHotelName, setNewHotelName] = useState('');
  const [newHotelDesc, setNewHotelDesc] = useState('');
  const [newHotelCity, setNewHotelCity] = useState('');
  const [newHotelCountry, setNewHotelCountry] = useState('');
  const [newHotelStars, setNewHotelStars] = useState(5);
  const [newHotelEmail, setNewHotelEmail] = useState('');
  const [newHotelPhone, setNewHotelPhone] = useState('');

  // Edit Listing state variables
  const [editingHotel, setEditingHotel] = useState(null);
  const [editHotelName, setEditHotelName] = useState('');
  const [editHotelDesc, setEditHotelDesc] = useState('');
  const [editHotelCity, setEditHotelCity] = useState('');
  const [editHotelCountry, setEditHotelCountry] = useState('');
  const [editHotelStars, setEditHotelStars] = useState(5);
  const [editHotelEmail, setEditHotelEmail] = useState('');
  const [editHotelPhone, setEditHotelPhone] = useState('');

  // Guest Reviews State
  const [guestReviews, setGuestReviews] = useState([]);

  // Traveler Wishlist State
  const [wishlist, setWishlist] = useState([]);

  // Payout Methods State (for Host)
  const [payoutMethods, setPayoutMethods] = useState([]);
  const [showAddPayoutModal, setShowAddPayoutModal] = useState(false);
  const [newPayoutType, setNewPayoutType] = useState('Bank Transfer');
  const [newPayoutBankName, setNewPayoutBankName] = useState('');
  const [newPayoutAccount, setNewPayoutAccount] = useState('');
  const [newPayoutRouting, setNewPayoutRouting] = useState('');
  const [newPayoutPaypalEmail, setNewPayoutPaypalEmail] = useState('');

  // Transaction Payout History
  const [payoutHistory, setPayoutHistory] = useState([
    { id: 101, amount: 2250.00, date: 'Sept 15, 2026', method: 'Chase Checking •••• 4820', status: 'Pending Approval' },
    { id: 102, amount: 2040.00, date: 'Aug 07, 2026', method: 'PayPal (host@sancharsati.com)', status: 'Settled' },
    { id: 103, amount: 4890.00, date: 'Jul 15, 2026', method: 'Chase Checking •••• 4820', status: 'Settled' }
  ]);

  // Traveler Payment Methods State
  const [travelerCards, setTravelerCards] = useState([]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardholder, setNewCardholder] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCVV, setNewCardCVV] = useState('');
  const [newCardType, setNewCardType] = useState('Visa');

  const handleReviewReply = async (reviewId, replyText) => {
    if (!replyText.trim()) return;
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/reviews/${reviewId}/reply`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reply: replyText })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Reply submitted successfully.', false);
        fetchHostReviews();
      } else {
        showToast(data.message || 'Failed to submit reply.', true);
      }
    } catch (error) {
      showToast('Error submitting review reply.', true);
    }
  };

  const handleAddPayoutMethod = async (e) => {
    e.preventDefault();
    if (newPayoutType === 'Bank Transfer' && (!newPayoutBankName || !newPayoutAccount || !newPayoutRouting)) {
      showToast('All bank transfer fields are required.', true);
      return;
    }
    if (newPayoutType === 'PayPal' && !newPayoutPaypalEmail) {
      showToast('PayPal Email is required.', true);
      return;
    }

    const name = newPayoutType === 'Bank Transfer' ? `${newPayoutBankName} Checking` : 'PayPal Payouts';
    const details = newPayoutType === 'Bank Transfer' ? `•••• ${newPayoutAccount.slice(-4)}` : newPayoutPaypalEmail;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/payment-methods/payouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: newPayoutType,
          name,
          details
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowAddPayoutModal(false);
        setNewPayoutBankName('');
        setNewPayoutAccount('');
        setNewPayoutRouting('');
        setNewPayoutPaypalEmail('');
        showToast('Payout method added successfully.', false);
        fetchHostPayoutMethods();
      } else {
        showToast(data.message || 'Failed to add payout method.', true);
      }
    } catch (error) {
      showToast('Error adding payout method.', true);
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCardholder || !newCardNumber || !newCardExpiry || !newCardCVV) {
      showToast('All card fields are required.', true);
      return;
    }

    const cleanedNum = newCardNumber.replace(/\s+/g, '');
    if (cleanedNum.length < 12) {
      showToast('Please enter a valid card number.', true);
      return;
    }

    const formattedNum = `•••• •••• •••• ${cleanedNum.slice(-4)}`;
    
    const cardColors = [
      'from-[#1e1b4b] to-[#312e81]',
      'from-[#0f172a] to-[#334155]',
      'from-[#064e3b] to-[#0f766e]',
      'from-[#701a75] to-[#86198f]'
    ];
    const chosenColor = cardColors[travelerCards.length % cardColors.length];

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/payment-methods/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cardholder: newCardholder,
          number: formattedNum,
          expiry: newCardExpiry,
          type: newCardType,
          color: chosenColor
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowAddCardModal(false);
        setNewCardholder('');
        setNewCardNumber('');
        setNewCardExpiry('');
        setNewCardCVV('');
        showToast('Payment card added successfully.', false);
        fetchTravelerCards();
      } else {
        showToast(data.message || 'Failed to add card.', true);
      }
    } catch (error) {
      showToast('Error adding payment card.', true);
    }
  };

  const handleDeletePayoutMethod = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/payment-methods/payouts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        showToast('Payout method removed.', false);
        fetchHostPayoutMethods();
      } else {
        showToast(data.message || 'Failed to remove payout method.', true);
      }
    } catch (error) {
      showToast('Error removing payout method.', true);
    }
  };

  const handleDeleteCard = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/payment-methods/cards/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        showToast('Payment method removed.', false);
        fetchTravelerCards();
      } else {
        showToast(data.message || 'Failed to remove payment card.', true);
      }
    } catch (error) {
      showToast('Error removing payment card.', true);
    }
  };

  // Synchronize profile state when user object changes (e.g. after updates/reload)
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
      setProfilePhone(user.phone || '');
      setProfilePhoto(user.avatar || '');
    }
  }, [user]);

  // Security Form States
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preference Toggle States
  const [prefBackup, setPrefBackup] = useState(true);
  const [prefDebugLog, setPrefDebugLog] = useState(false);
  const [prefAutoCache, setPrefAutoCache] = useState(true);

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    showToast('Generating system audit report...', false);
    setTimeout(() => {
      setIsGeneratingReport(false);
      setGeneratedReportDate(new Date().toLocaleString());
      setShowReportModal(true);
      showToast('Audit Report generated successfully. Click to view.', false);
    }, 1500);
  };

  const handleDownloadReport = () => {
    const element = document.createElement("a");
    const file = new Blob([
      `Sanchar Sati System Audit Logs\n` +
      `Generated: ${generatedReportDate || new Date().toLocaleString()}\n` +
      `----------------------------------------\n` +
      `Total Users: 2,840\n` +
      `Active Hotels: 120\n` +
      `System Revenue: $342,850\n` +
      `System Health: 99.9%\n` +
      `Latency: ${latency} avg\n` +
      `System Status: ALL SYSTEMS OPERATIONAL\n` +
      `----------------------------------------\n` +
      `End of Report`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `system-audit-report-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Audit Report file downloaded.', false);
  };

  const handleClearCache = () => {
    setIsClearingCache(true);
    showToast('Flushing memory cache...', false);
    setTimeout(() => {
      setIsClearingCache(false);
      setLatency('12ms');
      showToast('System memory cache flushed successfully.', false);
    }, 1000);
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    const isEditing = editingBroadcast !== null;
    const url = isEditing 
      ? `${BACKEND_URL}/auth/broadcasts/${editingBroadcast._id}`
      : `${BACKEND_URL}/auth/broadcasts`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: broadcastMessage,
          targetAudience: broadcastAudience
        })
      });
      const data = await response.json();
      if (data.success) {
        showToast(isEditing ? 'Broadcast updated successfully.' : 'Broadcast alert sent successfully.', false);
        setBroadcastMessage('');
        setBroadcastAudience('EVERYONE');
        setEditingBroadcast(null);
        setShowBroadcastModal(false);
        fetchAllBroadcasts();
        if (onBroadcastSent) {
          onBroadcastSent();
        }
      } else {
        showToast(data.message || 'Failed to submit broadcast.', true);
      }
    } catch (error) {
      showToast('Error submitting broadcast alert.', true);
    }
  };

  const handleDeleteBroadcast = async (broadcastId) => {
    if (!window.confirm('Are you sure you want to delete this broadcast?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/auth/broadcasts/${broadcastId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        showToast('Broadcast deleted successfully.', false);
        fetchAllBroadcasts();
        if (onBroadcastSent) {
          onBroadcastSent();
        }
      } else {
        showToast(data.message || 'Failed to delete broadcast.', true);
      }
    } catch (error) {
      showToast('Error deleting broadcast.', true);
    }
  };

  const handleSuspendUser = async (userId, userName, userEmail) => {
    const targetUser = usersList.find(u => u.id === userId);
    if (!targetUser) return;
    
    const isCurrentlySuspended = targetUser.status === 'Suspended';
    const newSuspendedState = !isCurrentlySuspended;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/auth/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isSuspended: newSuspendedState })
      });
      const data = await response.json();
      if (data.success) {
        showToast(newSuspendedState ? `User ${userName} has been suspended.` : `User ${userName} has been reactivated.`, !newSuspendedState);
        
        // Log activity
        setActivities(actPrev => [
          {
            id: Date.now(),
            text: newSuspendedState ? `User Account Suspended: ${userEmail}` : `User Account Reactivated: ${userEmail}`,
            status: newSuspendedState ? 'Alert' : 'Success',
            type: newSuspendedState ? 'alert' : 'success'
          },
          ...actPrev
        ]);

        fetchUsers();
      } else {
        showToast(data.message || 'Failed to update user status.', true);
      }
    } catch (error) {
      showToast('Error connecting to server to update user status.', true);
    }
  };

  const handleVerifyUser = async (userId, userName) => {
    const targetUser = usersList.find(u => u.id === userId);
    if (!targetUser) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/auth/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isVerified: true })
      });
      const data = await response.json();
      if (data.success) {
        showToast(`User ${userName} verified successfully.`, false);
        
        // Log activity
        setActivities(actPrev => [
          {
            id: Date.now(),
            text: `User Account Verified: ${targetUser.email}`,
            status: 'Success',
            type: 'success'
          },
          ...actPrev
        ]);

        fetchUsers();
      } else {
        showToast(data.message || 'Failed to verify user.', true);
      }
    } catch (error) {
      showToast('Error connecting to server to verify user.', true);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showToast('Please fill out all fields.', true);
      return;
    }
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          role: newUserRole,
          password: 'LuminaPassword123!'
        })
      });
      const data = await response.json();
      if (data.success) {
        showToast(`User ${newUserName} registered successfully.`, false);
        
        // Log activity
        setActivities(actPrev => [
          {
            id: Date.now(),
            text: `New User Registered: ${newUserName} (${newUserRole})`,
            status: 'Success',
            type: 'success'
          },
          ...actPrev
        ]);

        setNewUserName('');
        setNewUserEmail('');
        setNewUserRole('USER');
        setShowAddUserModal(false);
        fetchUsers();
      } else {
        showToast(data.message || 'Failed to register user.', true);
      }
    } catch (error) {
      showToast('Error connecting to server to register user.', true);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    const targetUser = usersList.find(u => u.id === userId);
    if (!targetUser) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await response.json();
      if (data.success) {
        showToast(`Role updated for ${targetUser.name} to ${newRole}.`, false);
        
        // Log activity
        setActivities(actPrev => [
          {
            id: Date.now(),
            text: `User Role Updated: ${targetUser.email} to ${newRole}`,
            status: 'Success',
            type: 'success'
          },
          ...actPrev
        ]);

        setEditingUser(null);
        fetchUsers();
      } else {
        showToast(data.message || 'Failed to update role.', true);
      }
    } catch (error) {
      showToast('Error connecting to server to update role.', true);
    }
  };

  const handleApproveHotel = (hotelId, hotelName) => {
    setHotelsList(prev => prev.map(h => {
      if (h.id === hotelId) {
        setActivities(actPrev => [
          {
            id: Date.now(),
            text: `Listing Approved: ${hotelName}`,
            status: 'Success',
            type: 'success'
          },
          ...actPrev
        ]);
        showToast(`Listing ${hotelName} has been approved.`, false);
        return { ...h, status: 'Approved' };
      }
      return h;
    }));
  };

  const handleRejectHotel = (hotelId, hotelName) => {
    setHotelsList(prev => prev.filter(h => h.id !== hotelId));
    setActivities(actPrev => [
      {
        id: Date.now(),
        text: `Listing Application Rejected: ${hotelName}`,
        status: 'Alert',
        type: 'alert'
      },
      ...actPrev
    ]);
    showToast(`Listing application for ${hotelName} rejected.`, true);
  };

  const handleSuspendHotel = (hotelId, hotelName) => {
    setHotelsList(prev => prev.map(h => {
      if (h.id === hotelId) {
        const isCurrentlySuspended = h.status === 'Suspended';
        const newStatus = isCurrentlySuspended ? 'Approved' : 'Suspended';
        setActivities(actPrev => [
          {
            id: Date.now(),
            text: isCurrentlySuspended ? `Listing Reactivated: ${hotelName}` : `Listing Suspended: ${hotelName}`,
            status: isCurrentlySuspended ? 'Success' : 'Alert',
            type: isCurrentlySuspended ? 'success' : 'alert'
          },
          ...actPrev
        ]);
        showToast(isCurrentlySuspended ? `Listing ${hotelName} has been reactivated.` : `Listing ${hotelName} has been suspended.`, !isCurrentlySuspended);
        return { ...h, status: newStatus };
      }
      return h;
    }));
  };

  const fetchSystemConfig = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}/auth/system-config`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPrefBackup(data.data.prefBackup);
        setPrefDebugLog(data.data.prefDebugLog);
        setPrefAutoCache(data.data.prefAutoCache);
      }
    } catch (error) {
      console.error('Failed to fetch system configurations:', error);
    }
  };

  const fetchHostHotels = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token || !user) return;
      const response = await fetch(`${BACKEND_URL}/hotels?owner=${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success && data.data && data.data.hotels) {
        setHostHotels(data.data.hotels);
      }
    } catch (error) {
      console.error('Failed to fetch host hotels:', error);
    }
  };

  const fetchHostReservations = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}/bookings/host`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setReservationsList(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch host reservations:', error);
    }
  };

  const handleUpdateReservationStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        showToast(`Reservation status updated to ${newStatus}.`, false);
        fetchHostReservations();
      } else {
        showToast(data.message || 'Failed to update reservation status.', true);
      }
    } catch (error) {
      showToast('Error updating reservation status.', true);
    }
  };

  const fetchHostReviews = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}/reviews/host`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const mappedReviews = data.data.map(r => ({
          id: r._id,
          guestName: r.user?.name || 'Anonymous Guest',
          guestInitials: getInitials(r.user?.name || 'Anonymous'),
          hotelName: r.hotel?.name || 'Hotel',
          rating: r.rating,
          date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          comment: r.comment,
          reply: r.reply || ''
        }));
        setGuestReviews(mappedReviews);
      }
    } catch (error) {
      console.error('Failed to fetch host reviews:', error);
    }
  };

  const fetchHostPayoutMethods = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}/payment-methods/payouts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPayoutMethods(data.data.map(p => ({
          id: p._id,
          type: p.type,
          name: p.name,
          details: p.details,
          isDefault: p.isDefault
        })));
      }
    } catch (error) {
      console.error('Failed to fetch payout methods:', error);
    }
  };

  const fetchTravelerCards = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}/payment-methods/cards`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTravelerCards(data.data.map(c => ({
          id: c._id,
          cardholder: c.cardholder,
          number: c.number,
          expiry: c.expiry,
          type: c.type,
          color: c.color
        })));
      }
    } catch (error) {
      console.error('Failed to fetch traveler cards:', error);
    }
  };

  const fetchTravelerBookings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}/bookings/traveler`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTravelerBookings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch traveler bookings:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setWishlist(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  };

  const handleRemoveWishlist = async (hotelId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ hotelId })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Removed from wishlist.', false);
        fetchWishlist();
      } else {
        showToast(data.message || 'Failed to remove from wishlist.', true);
      }
    } catch (error) {
      showToast('Error removing from wishlist.', true);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Cancelled' })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Reservation has been cancelled.', false);
        fetchTravelerBookings();
      } else {
        showToast(data.message || 'Failed to cancel booking.', true);
      }
    } catch (error) {
      showToast('Error cancelling booking.', true);
    }
  };

  const HOTEL_MENUS = {
    default: [
      { name: 'Sanchar Club Sandwich', description: 'Double-decker toasted bread with grilled chicken, bacon, fried egg, lettuce, tomato, and garlic aioli, served with truffle fries.', price: 18, category: 'Mains' },
      { name: 'Classic Caesar Salad', description: 'Creamy Caesar dressing over crisp romaine lettuce, topped with garlic croutons and parmigiano.', price: 14, category: 'Salads' },
      { name: 'Truffle Mushroom Risotto', description: 'Rich wild mushroom broth, white wine, white truffle oil, and herbs.', price: 24, category: 'Mains' },
      { name: 'Warm Chocolate Lava Cake', description: 'Molten chocolate center cake served with vanilla bean gelato.', price: 10, category: 'Desserts' },
      { name: 'Fresh Orange Juice', description: '100% natural, freshly squeezed.', price: 6, category: 'Beverages' }
    ],
    maldives: [
      { name: 'Reef Lobster Thermidor', description: 'Local Maldives lobster baked in a rich cream sauce of cognac, mustard, and cheese.', price: 58, category: 'Seafood' },
      { name: 'Seared Yellowfin Tuna Steak', description: 'Freshly caught yellowfin tuna, sesame-crusted and seared medium-rare, ginger-soy glaze.', price: 34, category: 'Seafood' },
      { name: 'Island Coconut Curry', description: 'Fragrant Maldivian curry cooked with fresh coconut milk, local herbs, basmati rice.', price: 26, category: 'Mains' },
      { name: 'Maldivian Mango Panna Cotta', description: 'Silky cream dessert infused with local sweet mango puree.', price: 12, category: 'Desserts' },
      { name: 'Tropical Lagoon Cooler', description: 'Refreshing mocktail blend of pineapple, coconut cream, mint, and lime.', price: 8, category: 'Beverages' }
    ],
    kyoto: [
      { name: 'Kyoto Bento Box', description: 'Curated selection of sashimi, tempura, grilled black cod, pickled vegetables, miso soup.', price: 42, category: 'Mains' },
      { name: 'Wagyu Beef Tataki', description: 'Thinly sliced, lightly seared premium Japanese Wagyu beef, ponzu dressing.', price: 36, category: 'Mains' },
      { name: 'Matcha Green Tea Tiramisu', description: 'Ladyfingers soaked in premium matcha, layered with mascarpone cream.', price: 12, category: 'Desserts' },
      { name: 'Premium Hojicha Latte', description: 'Roasted green tea steamed with milk and organic honey.', price: 7, category: 'Beverages' }
    ],
    ubud: [
      { name: 'Bali Vegan Jackfruit Rendang', description: 'Slow-cooked jackfruit in a rich spice paste of lemongrass, galangal, coconut milk.', price: 18, category: 'Mains' },
      { name: 'Balinese Tempeh Satay', description: 'Grilled marinated tempeh skewers served with peanut dipping sauce.', price: 12, category: 'Starters' },
      { name: 'Raw Avocado Chocolate Mousse', description: 'Sugar-free mousse made from organic Ubud avocados and dark cacao.', price: 10, category: 'Desserts' },
      { name: 'Cold-Pressed Green Elixir', description: 'Juice blend of cucumber, celery, kale, apple, ginger, and lemon.', price: 8, category: 'Beverages' }
    ],
    switzerland: [
      { name: 'Swiss Cheese Fondue', description: 'Melted Gruyère and Vacherin cheese with white wine, garlic, and bread cubes.', price: 32, category: 'Mains' },
      { name: 'Zürcher Geschnetzeltes', description: 'Sliced veal in a rich mushroom and cream sauce, served with crispy Rösti.', price: 38, category: 'Mains' },
      { name: 'Warm Apple Strudel', description: 'Flaky pastry filled with spiced apples, served warm with vanilla custard.', price: 11, category: 'Desserts' },
      { name: 'Swiss Hot Chocolate', description: 'Made with melted premium Swiss dark chocolate and steamed whole milk.', price: 8, category: 'Beverages' }
    ]
  };

  const getHotelMenu = (hotelName = '', hotelLocation = '') => {
    const name = (hotelName || '').toLowerCase();
    const loc = (hotelLocation || '').toLowerCase();
    if (name.includes('maldives') || loc.includes('maldives') || name.includes('ocean')) {
      return HOTEL_MENUS.maldives;
    }
    if (name.includes('kyoto') || loc.includes('kyoto') || name.includes('japan')) {
      return HOTEL_MENUS.kyoto;
    }
    if (name.includes('ubud') || name.includes('bali') || loc.includes('bali') || loc.includes('ubud')) {
      return HOTEL_MENUS.ubud;
    }
    if (name.includes('switzerland') || name.includes('swiss') || name.includes('alpine') || loc.includes('switzerland')) {
      return HOTEL_MENUS.switzerland;
    }
    return HOTEL_MENUS.default;
  };

  const fetchFoodOrders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}/food-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setFoodOrders(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch food orders:', error);
    }
  };

  const fetchHostFoodOrders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}/food-orders/host`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setHostFoodOrders(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch host food orders:', error);
    }
  };

  const handlePlaceFoodOrder = async (bookingId, items) => {
    if (!bookingId) {
      showToast('No stay selected.', true);
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}/food-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId, items })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Room service order placed successfully!', false);
        setFoodCart({});
        fetchFoodOrders();
      } else {
        showToast(data.message || 'Failed to place room service order.', true);
      }
    } catch (error) {
      showToast('Error placing room service order.', true);
    }
  };

  const handleUpdateFoodOrderStatus = async (orderId, nextStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}/food-orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Order status updated successfully!', false);
        fetchHostFoodOrders();
      } else {
        showToast(data.message || 'Failed to update order status.', true);
      }
    } catch (error) {
      showToast('Error updating order status.', true);
    }
  };

  useEffect(() => {
    if (travelerBookings && travelerBookings.length > 0) {
      const confirmed = travelerBookings.filter(b => b.status === 'Confirmed');
      if (confirmed.length > 0 && !selectedBookingId) {
        setSelectedBookingId(confirmed[0]._id);
      }
    }
  }, [travelerBookings, selectedBookingId]);

  const handleCreateHotel = async (e) => {
    e.preventDefault();
    if (!newHotelName.trim() || !newHotelCity.trim() || !newHotelCountry.trim()) {
      showToast('Name, City and Country are required.', true);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/hotels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newHotelName,
          description: newHotelDesc,
          address: {
            city: newHotelCity,
            country: newHotelCountry
          },
          location: {
            coordinates: [0, 0] // Default coords
          },
          starRating: Number(newHotelStars),
          contactEmail: newHotelEmail || undefined,
          contactPhone: newHotelPhone || undefined
        })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Hotel listing created successfully!', false);
        setNewHotelName('');
        setNewHotelDesc('');
        setNewHotelCity('');
        setNewHotelCountry('');
        setNewHotelStars(5);
        setNewHotelEmail('');
        setNewHotelPhone('');
        setShowCreateHotelModal(false);
        fetchHostHotels();
      } else {
        showToast(data.message || 'Failed to create hotel listing.', true);
      }
    } catch (error) {
      showToast('Error creating hotel listing.', true);
    }
  };

  const handleUpdateHotel = async (e) => {
    e.preventDefault();
    if (!editHotelName.trim() || !editHotelCity.trim() || !editHotelCountry.trim()) {
      showToast('Name, City and Country are required.', true);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/hotels/${editingHotel._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editHotelName,
          description: editHotelDesc,
          address: {
            city: editHotelCity,
            country: editHotelCountry
          },
          starRating: Number(editHotelStars),
          contactEmail: editHotelEmail || undefined,
          contactPhone: editHotelPhone || undefined
        })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Hotel listing updated successfully!', false);
        setEditingHotel(null);
        fetchHostHotels();
      } else {
        showToast(data.message || 'Failed to update hotel listing.', true);
      }
    } catch (error) {
      showToast('Error updating hotel listing.', true);
    }
  };

  const handleUpdateSystemConfig = async (key, value) => {
    // Optimistically update
    if (key === 'prefBackup') setPrefBackup(value);
    if (key === 'prefDebugLog') setPrefDebugLog(value);
    if (key === 'prefAutoCache') setPrefAutoCache(value);

    try {
      const token = localStorage.getItem('accessToken');
      const body = {
        prefBackup: key === 'prefBackup' ? value : prefBackup,
        prefDebugLog: key === 'prefDebugLog' ? value : prefDebugLog,
        prefAutoCache: key === 'prefAutoCache' ? value : prefAutoCache
      };
      const response = await fetch(`${BACKEND_URL}/auth/system-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (data.success) {
        setPrefBackup(data.data.prefBackup);
        setPrefDebugLog(data.data.prefDebugLog);
        setPrefAutoCache(data.data.prefAutoCache);
        showToast('System configuration updated successfully.', false);
      } else {
        showToast(data.message || 'Failed to update system configuration.', true);
        if (key === 'prefBackup') setPrefBackup(!value);
        if (key === 'prefDebugLog') setPrefDebugLog(!value);
        if (key === 'prefAutoCache') setPrefAutoCache(!value);
      }
    } catch (error) {
      showToast('Error updating system configuration.', true);
      if (key === 'prefBackup') setPrefBackup(!value);
      if (key === 'prefDebugLog') setPrefDebugLog(!value);
      if (key === 'prefAutoCache') setPrefAutoCache(!value);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', true);
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem('accessToken');
      showToast('Uploading profile photo...', false);
      const response = await fetch(`${BACKEND_URL}/auth/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setProfilePhoto(data.data.avatar);
        if (onUpdateUser) {
          onUpdateUser(data.data);
        }
        showToast('Profile photo uploaded successfully!', false);
      } else {
        showToast(data.message || 'Failed to upload photo.', true);
      }
    } catch (error) {
      showToast('Error uploading photo.', true);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) {
      showToast('Name and Email are required.', true);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BACKEND_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          phone: profilePhone
        })
      });

      const data = await response.json();
      if (data.success) {
        if (onUpdateUser) {
          onUpdateUser(data.data);
        }
        showToast('Profile updated successfully!', false);
      } else {
        showToast(data.message || 'Failed to update profile.', true);
      }
    } catch (error) {
      showToast('Error updating profile.', true);
    }
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currPassword || !newPassword || !confirmPassword) {
      showToast('All password fields are required.', true);
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', true);
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', true);
      return;
    }
    showToast('Password updated successfully!', false);
    setCurrPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const displayName = user ? user.name : 'Julian Vance';
  let displayRole = 'Elite Member';
  if (isAdmin) {
    displayRole = 'System Administrator';
  } else if (isHotelOwner) {
    displayRole = 'Hotel Host / Owner';
  }

  const handleTabClick = (tab, e) => {
    if (e) e.preventDefault();
    setActiveTab(tab);
    localStorage.setItem('dashboardActiveTab', tab);
    
    // Do not show the under-development toast for active Admin/Owner/Traveler dashboard sections
    const adminImplemented = ['dashboard', 'users', 'hotels', 'settings', 'broadcasts'];
    const ownerImplemented = ['dashboard', 'listings', 'reviews', 'payouts', 'dining-orders', 'settings'];
    const travelerImplemented = ['dashboard', 'bookings', 'wishlist', 'payments', 'dining', 'settings'];

    if (isAdmin && adminImplemented.includes(tab)) return;
    if (isHotelOwner && ownerImplemented.includes(tab)) return;
    if (isTraveler && travelerImplemented.includes(tab)) return;

    showToast(`The ${tab} section is under development. Showing dashboard summary.`, false);
  };

  return (
    <div className="pt-32 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex flex-col md:flex-row gap-gutter">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="flex flex-col gap-6 sticky top-32">
          <div className="flex items-center gap-4 pb-6 border-b border-outline-variant/30">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-outline-variant/50 flex-shrink-0 flex items-center justify-center bg-primary/10 text-primary font-bold text-xl select-none">
              {user && user.avatar ? (
                <img
                  alt="User Profile"
                  className="w-full h-full object-cover"
                  src={user.avatar}
                />
              ) : (
                getInitials(displayName)
              )}
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm leading-tight">{displayName}</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{displayRole}</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            <a
              onClick={(e) => handleTabClick('dashboard', e)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-surface-container text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
              href="#"
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-interactive text-interactive">Dashboard</span>
            </a>
            
            {isAdmin ? (
              <>
                <a
                  onClick={(e) => handleTabClick('users', e)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'users'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                  href="#"
                >
                  <span className="material-symbols-outlined">group</span>
                  <span className="font-interactive text-interactive">Manage Users</span>
                </a>
                <a
                  onClick={(e) => handleTabClick('hotels', e)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'hotels'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                  href="#"
                >
                  <span className="material-symbols-outlined">domain</span>
                  <span className="font-interactive text-interactive">Manage Hotels</span>
                </a>
                <a
                  onClick={(e) => handleTabClick('broadcasts', e)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'broadcasts'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                  href="#"
                >
                  <span className="material-symbols-outlined">campaign</span>
                  <span className="font-interactive text-interactive">Manage Broadcasts</span>
                </a>
              </>
            ) : isHotelOwner ? (
              <>
                <a
                  onClick={(e) => handleTabClick('listings', e)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'listings'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                  href="#"
                >
                  <span className="material-symbols-outlined">domain</span>
                  <span className="font-interactive text-interactive">My Listings</span>
                </a>
                <a
                  onClick={(e) => handleTabClick('dining-orders', e)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'dining-orders'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                  href="#"
                >
                  <span className="material-symbols-outlined">restaurant</span>
                  <span className="font-interactive text-interactive">Dining Orders</span>
                </a>
                <a
                  onClick={(e) => handleTabClick('reviews', e)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'reviews'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                  href="#"
                >
                  <span className="material-symbols-outlined">rate_review</span>
                  <span className="font-interactive text-interactive">Guest Reviews</span>
                </a>
                <a
                  onClick={(e) => handleTabClick('payouts', e)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'payouts'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                  href="#"
                >
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                  <span className="font-interactive text-interactive">Payout Methods</span>
                </a>
              </>
            ) : (
              <>
                <a
                  onClick={(e) => handleTabClick('bookings', e)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'bookings'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                  href="#"
                >
                  <span className="material-symbols-outlined">calendar_month</span>
                  <span className="font-interactive text-interactive">My Bookings</span>
                </a>
                <a
                  onClick={(e) => handleTabClick('wishlist', e)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'wishlist'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                  href="#"
                >
                  <span className="material-symbols-outlined">favorite</span>
                  <span className="font-interactive text-interactive">Wishlist</span>
                </a>
                <a
                  onClick={(e) => handleTabClick('dining', e)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'dining'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                  href="#"
                >
                  <span className="material-symbols-outlined">room_service</span>
                  <span className="font-interactive text-interactive">In-Room Dining</span>
                </a>
                <a
                  onClick={(e) => handleTabClick('payments', e)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'payments'
                      ? 'bg-surface-container text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                  href="#"
                >
                  <span className="material-symbols-outlined">payments</span>
                  <span className="font-interactive text-interactive">Payment Methods</span>
                </a>
              </>
            )}
            
            <a
              onClick={(e) => handleTabClick('settings', e)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-surface-container text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
              href="#"
            >
              <span className="material-symbols-outlined">settings</span>
              <span className="font-interactive text-interactive">Account Settings</span>
            </a>
          </nav>
        </div>
      </aside>

      {/* Canvas */}
      <div className="flex-grow space-y-section-gap">
        {activeTab === 'settings' ? (
          /* UNIVERSAL ACCOUNT SETTINGS VIEW */
          <section className="text-left font-sans animate-fade-in">
            <div className="mb-8">
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-2">Manage Account</span>
              <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg leading-none">Account Settings.</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter items-start">
              {/* Profile Card */}
              <div className="md:col-span-2 p-6 bg-white border border-outline-variant/30 rounded-xl space-y-6 text-left shadow-sm">
                <div>
                  <h3 className="font-headline-sm text-lg font-bold border-b border-outline-variant/30 pb-3">Personal Profile</h3>
                  <p className="text-on-surface-variant text-xs mt-1">Update your basic profile settings and photo.</p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="flex items-center gap-6 pb-2">
                    <div className="w-20 h-20 rounded-full overflow-hidden border border-outline-variant/50 flex-shrink-0 flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl select-none">
                      {profilePhoto ? (
                        <img 
                          alt="Profile Preview" 
                          src={profilePhoto} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        getInitials(profileName || (user && user.name) || '')
                      )}
                    </div>
                    <div className="flex-grow space-y-2">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Profile Photo</label>
                      <div className="flex items-center gap-3">
                        <label 
                          htmlFor="avatar-upload" 
                          className="px-4 py-2 border border-outline text-on-surface font-interactive text-xs rounded hover:bg-surface-container transition-all flex items-center gap-2 cursor-pointer font-bold"
                        >
                          <span className="material-symbols-outlined text-sm">upload</span>
                          <span>Upload Photo</span>
                        </label>
                        <input 
                          type="file" 
                          id="avatar-upload" 
                          accept="image/*"
                          onChange={handlePhotoUpload} 
                          className="hidden"
                        />
                      </div>
                      <p className="text-[10px] text-on-surface-variant">PNG, JPG or GIF. Max 5MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        value={profileName} 
                        onChange={(e) => setProfileName(e.target.value)} 
                        className="w-full border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        required 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        value={profileEmail} 
                        onChange={(e) => setProfileEmail(e.target.value)} 
                        className="w-full border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Phone Number</label>
                    <input 
                      type="text" 
                      value={profilePhone} 
                      onChange={(e) => setProfilePhone(e.target.value)} 
                      className="w-full border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                    />
                  </div>

                  <div className="pt-2 border-t border-outline-variant/20 flex justify-end">
                    <button 
                      type="submit" 
                      className="px-6 py-2.5 bg-primary text-white text-xs rounded hover:opacity-90 font-bold cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>

              {/* Sidebar Cards Stack */}
              <div className="flex flex-col gap-6">
                {/* Security Password Card */}
                <div className="p-6 bg-white border border-outline-variant/30 rounded-xl space-y-4 text-left shadow-sm">
                  <div>
                    <h3 className="font-headline-sm text-base font-bold border-b border-outline-variant/30 pb-3">Update Password</h3>
                  </div>
                  <form onSubmit={handleUpdatePassword} className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Current Password</label>
                      <input 
                        type="password" 
                        value={currPassword} 
                        onChange={(e) => setCurrPassword(e.target.value)} 
                        className="w-full border border-outline-variant/50 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary outline-none" 
                        required 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        className="w-full border border-outline-variant/50 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary outline-none" 
                        required 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        className="w-full border border-outline-variant/50 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary outline-none" 
                        required 
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full py-2 bg-secondary text-white text-xs rounded hover:opacity-90 font-bold cursor-pointer mt-2"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

                {/* Preference Options Card */}
                <div className="p-6 bg-surface-container-low border border-outline-variant/30 rounded-xl space-y-4 text-left shadow-sm">
                  <div>
                    <h3 className="font-headline-sm text-base font-bold border-b border-outline-variant/30 pb-3">
                      {isAdmin ? 'System Configuration' : 'Platform Preferences'}
                    </h3>
                  </div>

                  {isAdmin ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold block">Daily Auto Backups</span>
                          <span className="text-[10px] text-on-surface-variant">Scheduled at 04:00 AM</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={prefBackup} 
                          onChange={(e) => handleUpdateSystemConfig('prefBackup', e.target.checked)} 
                          className="w-4 h-4 text-primary rounded outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold block">API Debug Logging</span>
                          <span className="text-[10px] text-on-surface-variant">Output server verbose traces</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={prefDebugLog} 
                          onChange={(e) => handleUpdateSystemConfig('prefDebugLog', e.target.checked)} 
                          className="w-4 h-4 text-primary rounded outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold block">Scheduled Cache Flush</span>
                          <span className="text-[10px] text-on-surface-variant">Flush stale listings hourly</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={prefAutoCache} 
                          onChange={(e) => handleUpdateSystemConfig('prefAutoCache', e.target.checked)} 
                          className="w-4 h-4 text-primary rounded outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Currency</label>
                        <select className="w-full border border-outline-variant/50 rounded-xl px-2.5 py-1.5 text-xs bg-white">
                          <option>USD ($)</option>
                          <option>EUR (€)</option>
                          <option>JPY (¥)</option>
                          <option>GBP (£)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold block">Email Notifications</span>
                          <span className="text-[10px] text-on-surface-variant">Get alerts for upcoming stays</span>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded outline-none" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold block">SMS Alerts</span>
                          <span className="text-[10px] text-on-surface-variant">Instant text booking updates</span>
                        </div>
                        <input type="checkbox" className="w-4 h-4 text-primary rounded outline-none" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : isAdmin ? (
          /* SYSTEM ADMINISTRATOR HUB VIEW */
          <>
            {activeTab === 'dashboard' && (
              <>
                {/* Header Summary */}
                <section>
                  <div className="mb-8">
                    <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-2">Platform Administration Hub</span>
                    <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg leading-none">System Metrics & Controls.</h1>
                  </div>

                  {/* Admin Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-12">
                    <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 text-left">
                      <span className="font-label-caps text-[10px] text-on-surface-variant block mb-2">TOTAL USERS</span>
                      <div className="text-3xl font-display-lg text-primary font-bold">2,840</div>
                      <p className="text-xs text-secondary mt-1">↑ 8% this week</p>
                    </div>
                    <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 text-left">
                      <span className="font-label-caps text-[10px] text-on-surface-variant block mb-2">ACTIVE HOTELS</span>
                      <div className="text-3xl font-display-lg text-primary font-bold">120</div>
                      <p className="text-xs text-on-surface-variant mt-1">98.5% uptime score</p>
                    </div>
                    <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 text-left">
                      <span className="font-label-caps text-[10px] text-on-surface-variant block mb-2">SYSTEM REVENUE</span>
                      <div className="text-3xl font-display-lg text-primary font-bold">$342,850</div>
                      <p className="text-xs text-secondary mt-1">Commission: $51,427 (15%)</p>
                    </div>
                    <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 text-left">
                      <span className="font-label-caps text-[10px] text-on-surface-variant block mb-2">SYSTEM HEALTH</span>
                      <div className="text-3xl font-display-lg text-primary font-bold">99.9%</div>
                      <p className="text-xs text-secondary mt-1">Latency: {latency} avg</p>
                    </div>
                  </div>
                </section>                {/* Quick Controls Card & Overview Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter items-start font-sans">
                  <div className="md:col-span-2 space-y-6">
                    {/* Admin Overview */}
                    <div className="p-6 bg-white border border-outline-variant/30 rounded-xl space-y-4 text-left shadow-sm">
                      <h3 className="font-headline-sm text-lg font-bold border-b border-outline-variant/30 pb-3">Admin Overview</h3>
                      <p className="text-on-surface-variant text-sm leading-relaxed">
                        Welcome to the Sanchar Sati Admin Portal. Use the sidebar navigation to manage active platform users, moderate listings, and view detailed logs.
                      </p>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20">
                          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Server Status</span>
                          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase font-bold">Online</span>
                        </div>
                        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20">
                          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Active Warnings</span>
                          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase font-bold">0 Alerts</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Platform Activity */}
                    <div className="p-6 bg-white border border-outline-variant/30 rounded-xl space-y-4 text-left shadow-sm">
                      <h3 className="font-headline-sm text-lg font-bold border-b border-outline-variant/30 pb-3">Recent Platform Activity</h3>
                      <div className="space-y-3 font-body-sm text-body-sm text-on-surface-variant font-sans">
                        {activities.slice(0, 5).map((activity) => (
                          <div key={activity.id} className="flex items-center justify-between py-1.5 border-b border-outline-variant/10 last:border-b-0 font-sans">
                            <span>{activity.text}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              activity.type === 'success'
                                ? 'bg-emerald-100 text-emerald-800'
                                : activity.type === 'alert'
                                ? 'bg-error-container text-on-error-container'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {activity.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Controls Card */}
                  <div className="p-6 bg-surface-container-low border border-outline-variant/30 rounded-xl space-y-4 text-left flex flex-col shadow-sm">
                    <h3 className="font-headline-sm text-lg font-bold border-b border-outline-variant/30 pb-3 mb-4">Quick Actions</h3>
                    <div className="flex flex-col gap-3">
                      {generatedReportDate ? (
                        <button
                          onClick={() => setShowReportModal(true)}
                          className="w-full py-3 bg-primary text-white font-interactive text-xs rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer font-bold"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          <span>View Audit Report</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleGenerateReport}
                          disabled={isGeneratingReport}
                          className="w-full py-3 bg-primary text-white font-interactive text-xs rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isGeneratingReport ? 'hourglass_empty' : 'analytics'}
                          </span>
                          <span>{isGeneratingReport ? 'Generating...' : 'Generate Audit Report'}</span>
                        </button>
                      )}
                      <button
                        onClick={handleClearCache}
                        disabled={isClearingCache}
                        className="w-full py-3 border border-outline text-on-surface font-interactive text-xs rounded hover:bg-surface-container transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isClearingCache ? 'hourglass_empty' : 'cached'}
                        </span>
                        <span>{isClearingCache ? 'Flushing...' : 'Clear Cache'}</span>
                      </button>
                    </div>
                    <button
                      onClick={() => setShowBroadcastModal(true)}
                      className="w-full py-3 bg-error text-white font-interactive text-xs rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <span className="material-symbols-outlined text-sm">campaign</span>
                      <span>Broadcast Alert</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'broadcasts' && (
              <section className="text-left font-sans animate-fade-in">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-headline-md text-headline-md">Manage Broadcast Alerts</h2>
                    <p className="text-on-surface-variant font-body-sm text-body-sm">Create, edit, or delete active platform broadcast messages.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingBroadcast(null);
                      setBroadcastMessage('');
                      setBroadcastAudience('EVERYONE');
                      setShowBroadcastModal(true);
                    }}
                    className="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer self-start md:self-auto"
                  >
                    <span className="material-symbols-outlined text-sm">campaign</span>
                    <span>New Broadcast</span>
                  </button>
                </div>

                <div className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container border-b border-outline-variant/30 text-on-surface font-bold text-xs uppercase">
                          <th className="p-4 w-[60%]">Message</th>
                          <th className="p-4">Audience</th>
                          <th className="p-4">Date Created</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20 font-body-sm text-body-sm">
                        {allBroadcasts.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="p-8 text-center text-on-surface-variant">
                              No broadcasts found. Click "New Broadcast" to create one.
                            </td>
                          </tr>
                        ) : (
                          allBroadcasts.map(b => (
                            <tr key={b._id}>
                              <td className="p-4 font-medium max-w-xs truncate md:max-w-md">{b.message}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                  b.targetAudience === 'EVERYONE'
                                    ? 'bg-blue-100 text-blue-800'
                                    : b.targetAudience === 'USER'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {b.targetAudience === 'EVERYONE' ? 'Everyone' : b.targetAudience === 'USER' ? 'Travelers' : 'Hosts'}
                                </span>
                              </td>
                              <td className="p-4 text-on-surface-variant text-xs">
                                {new Date(b.createdAt).toLocaleString()}
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingBroadcast(b);
                                    setBroadcastMessage(b.message);
                                    setBroadcastAudience(b.targetAudience);
                                    setShowBroadcastModal(true);
                                  }}
                                  className="text-xs text-primary hover:underline cursor-pointer font-bold"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteBroadcast(b._id)}
                                  className="text-xs text-error hover:underline cursor-pointer font-bold"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'users' && (
              <section className="text-left font-sans animate-fade-in">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-headline-md text-headline-md">Manage Platform Users</h2>
                    <p className="text-on-surface-variant font-body-sm text-body-sm">View, update, or suspend user accounts.</p>
                  </div>
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer self-start md:self-auto"
                  >
                    <span className="material-symbols-outlined text-sm">person_add</span>
                    <span>Add User</span>
                  </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-grow">
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="w-full border border-outline-variant/50 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                    >
                      <option value="ALL">All Roles</option>
                      <option value="USER">Travelers</option>
                      <option value="HOTEL_OWNER">Hosts</option>
                      <option value="ADMIN">Admins</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container border-b border-outline-variant/30 text-on-surface font-bold text-xs uppercase">
                          <th className="p-4">Name</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Role</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20 font-body-sm text-body-sm">
                        {usersList
                          .filter(u => {
                            const query = userSearchQuery.toLowerCase();
                            const matchesSearch = u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
                            const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
                            return matchesSearch && matchesRole;
                          })
                          .map(u => (
                            <tr key={u.id}>
                              <td className="p-4 font-semibold">{u.name}</td>
                              <td className="p-4 text-on-surface-variant font-mono text-xs">{u.email}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                  u.role === 'ADMIN' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : u.role === 'HOTEL_OWNER' 
                                    ? 'bg-secondary-container text-on-secondary-container' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {u.role === 'HOTEL_OWNER' ? 'Host / Owner' : u.role}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                  u.status === 'Verified'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : u.status === 'Suspended'
                                    ? 'bg-error-container text-on-error-container'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {u.status}
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <button 
                                  onClick={() => setEditingUser(u)} 
                                  className="text-xs text-primary hover:underline cursor-pointer font-bold"
                                >
                                  Edit Role
                                </button>
                                {u.status === 'Pending Verify' && (
                                  <button 
                                    onClick={() => handleVerifyUser(u.id, u.name)} 
                                    className="text-xs text-secondary hover:underline cursor-pointer font-bold"
                                  >
                                    Verify
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleSuspendUser(u.id, u.name, u.email)} 
                                  className="text-xs text-error hover:underline cursor-pointer font-bold"
                                >
                                  {u.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
                                </button>
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'hotels' && (
              <section className="text-left font-sans animate-fade-in">
                <div className="mb-8">
                  <h2 className="font-headline-md text-headline-md">Manage Platform Listings</h2>
                  <p className="text-on-surface-variant font-body-sm text-body-sm">Approve pending applications or modify active property listings.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-grow">
                    <input
                      type="text"
                      placeholder="Search hotels by name or location..."
                      value={hotelSearchQuery}
                      onChange={(e) => setHotelSearchQuery(e.target.value)}
                      className="w-full border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <select
                      value={hotelStatusFilter}
                      onChange={(e) => setHotelStatusFilter(e.target.value)}
                      className="w-full border border-outline-variant/50 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Approved">Approved</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  {hotelsList
                    .filter(h => {
                      const query = hotelSearchQuery.toLowerCase();
                      const matchesSearch = h.name.toLowerCase().includes(query) || h.location.toLowerCase().includes(query);
                      const matchesStatus = hotelStatusFilter === 'ALL' || h.status === hotelStatusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map(h => (
                      <div key={h.id} className="p-6 bg-white border border-outline-variant/30 rounded-xl flex gap-6 items-center shadow-sm">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            alt={h.name} 
                            className="w-full h-full object-cover"
                            src={h.image}
                          />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-headline-sm text-base font-bold">{h.name}</h4>
                          <p className="text-xs text-on-surface-variant">Host: {h.host} • {h.location}</p>
                          <span className={`inline-block mt-2 px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                            h.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : h.status === 'Suspended'
                              ? 'bg-error-container text-on-error-container'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {h.status}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {h.status === 'Pending Review' && (
                            <>
                              <button 
                                onClick={() => handleApproveHotel(h.id, h.name)}
                                className="px-4 py-1.5 bg-primary text-white text-xs rounded hover:opacity-90 cursor-pointer font-semibold"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleRejectHotel(h.id, h.name)}
                                className="px-4 py-1.5 border border-outline text-on-surface text-xs rounded hover:bg-surface-container transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {h.status !== 'Pending Review' && (
                            <button 
                              onClick={() => handleSuspendHotel(h.id, h.name)}
                              className={`px-4 py-2 border text-xs rounded transition-colors cursor-pointer ${
                                h.status === 'Suspended' 
                                  ? 'border-emerald-600 text-emerald-700 hover:bg-emerald-50' 
                                  : 'border-error text-error hover:bg-error-container/20'
                              }`}
                            >
                              {h.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </section>
            )}

            {/* Broadcast Modal */}
            {showBroadcastModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1C30]/50 backdrop-blur-md">
                <div className="bg-white rounded-2xl max-w-md w-full border border-outline-variant/30 overflow-hidden shadow-2xl p-6 text-left">
                  <h3 className="font-headline-sm text-lg font-bold border-b border-outline-variant/30 pb-3 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-error">campaign</span>
                    <span>{editingBroadcast ? 'Edit Broadcast Alert' : 'Broadcast System Alert'}</span>
                  </h3>
                  <form onSubmit={handleSendBroadcast} className="space-y-4">
                    <p className="font-body-sm text-sm text-on-surface-variant">
                      Choose the target audience and type the message to broadcast.
                    </p>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Target Audience</label>
                      <select
                        value={broadcastAudience}
                        onChange={(e) => setBroadcastAudience(e.target.value)}
                        className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                      >
                        <option value="EVERYONE">Everyone</option>
                        <option value="USER">Travelers (USER)</option>
                        <option value="HOTEL_OWNER">Hosts (HOTEL_OWNER)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Message</label>
                      <textarea
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Type your system alert here..."
                        required
                        rows={4}
                        className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowBroadcastModal(false)}
                        className="px-4 py-2 border border-outline text-on-surface text-xs rounded hover:bg-surface-container transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-error text-white text-xs rounded hover:opacity-90 cursor-pointer font-semibold"
                      >
                        {editingBroadcast ? 'Save Changes' : 'Send Broadcast'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* System Audit Report Modal */}
            {showReportModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1C30]/50 backdrop-blur-md">
                <div className="bg-white rounded-2xl max-w-2xl w-full border border-outline-variant/30 overflow-hidden shadow-2xl p-6 text-left flex flex-col max-h-[90vh]">
                  <h3 className="font-headline-sm text-lg font-bold border-b border-outline-variant/30 pb-3 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">analytics</span>
                      <span>System Audit Report</span>
                    </div>
                    <span className="text-xs text-on-surface-variant font-normal font-mono">Generated: {generatedReportDate}</span>
                  </h3>
                  
                  {/* Modal Scrollable Canvas Content */}
                  <div className="flex-grow overflow-y-auto space-y-6 pr-2 mb-6 font-sans">
                    {/* Metrics Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-surface-container rounded-xl text-center shadow-sm">
                        <span className="text-[10px] text-on-surface-variant block uppercase font-bold tracking-wider mb-1">Total Users</span>
                        <span className="text-2xl font-bold text-primary font-mono">2,840</span>
                      </div>
                      <div className="p-4 bg-surface-container rounded-xl text-center shadow-sm">
                        <span className="text-[10px] text-on-surface-variant block uppercase font-bold tracking-wider mb-1">Hotels</span>
                        <span className="text-2xl font-bold text-primary font-mono">120</span>
                      </div>
                      <div className="p-4 bg-surface-container rounded-xl text-center shadow-sm">
                        <span className="text-[10px] text-on-surface-variant block uppercase font-bold tracking-wider mb-1">Latency</span>
                        <span className="text-2xl font-bold text-primary font-mono">{latency}</span>
                      </div>
                      <div className="p-4 bg-surface-container rounded-xl text-center shadow-sm">
                        <span className="text-[10px] text-on-surface-variant block uppercase font-bold tracking-wider mb-1">Uptime</span>
                        <span className="text-2xl font-bold text-secondary font-mono">99.9%</span>
                      </div>
                    </div>

                     {/* Detailed Data */}
                    <div className="space-y-4 font-sans text-sm text-on-surface">
                      <div>
                        <h4 className="text-xs font-bold uppercase text-on-surface-variant tracking-wider mb-2">Commission & Revenue Breakdown</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 text-left">
                          <div className="flex justify-between py-1 border-b border-outline-variant/10">
                            <span className="text-on-surface-variant">Gross Platform Revenue:</span>
                            <span className="font-semibold text-primary font-mono">$342,850.00</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-outline-variant/10">
                            <span className="text-on-surface-variant">Platform Fee Rate:</span>
                            <span className="font-semibold text-primary">15% commission</span>
                          </div>
                          <div className="flex justify-between py-1 md:border-b-0 border-b border-outline-variant/10">
                            <span className="text-on-surface-variant">Net Platform Earnings:</span>
                            <span className="font-bold text-secondary font-mono">$51,427.50</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-on-surface-variant">Payout Status:</span>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase">All Settled</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase text-on-surface-variant tracking-wider mb-2">Member Profiles Summary</h4>
                          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-2 text-left">
                            <div className="flex justify-between text-xs">
                              <span className="text-on-surface-variant">Travelers Registered:</span>
                              <span className="font-semibold font-mono">2,400</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-on-surface-variant">Hosts / Hotel Owners:</span>
                              <span className="font-semibold font-mono">440</span>
                            </div>
                            <div className="flex justify-between text-xs border-t border-outline-variant/10 pt-1.5 mt-1.5">
                              <span className="text-on-surface-variant">Active Sessions:</span>
                              <span className="font-semibold text-secondary font-mono">1,102 online</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold uppercase text-on-surface-variant tracking-wider mb-2">Security & Backups</h4>
                          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-2 text-left">
                            <div className="flex justify-between text-xs">
                              <span className="text-on-surface-variant">SSL Certificate:</span>
                              <span className="text-emerald-700 font-bold uppercase text-[9px] bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-on-surface-variant">Last Database Backup:</span>
                              <span className="font-semibold font-mono">Today, 04:00 AM</span>
                            </div>
                            <div className="flex justify-between text-xs border-t border-outline-variant/10 pt-1.5 mt-1.5">
                              <span className="text-on-surface-variant">Firewall Threat Level:</span>
                              <span className="text-emerald-700 font-bold uppercase text-[9px] bg-emerald-50 px-1.5 py-0.5 rounded">Secure</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex justify-end gap-3 border-t border-outline-variant/30 pt-4 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="px-5 py-2.5 border border-outline text-on-surface text-xs rounded hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadReport}
                      className="px-5 py-2.5 bg-primary text-white text-xs rounded hover:opacity-90 cursor-pointer font-semibold flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      <span>Download Report</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add User Modal */}
            {showAddUserModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1C30]/50 backdrop-blur-md animate-fade-in">
                <div className="bg-white rounded-2xl max-w-md w-full border border-outline-variant/30 overflow-hidden shadow-2xl p-6 text-left">
                  <h3 className="font-headline-sm text-lg font-bold border-b border-outline-variant/30 pb-3 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">person_add</span>
                    <span>Add New Platform User</span>
                  </h3>
                  <form onSubmit={handleCreateUser} className="space-y-4 font-sans">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                        className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Role</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                      >
                        <option value="USER">Traveler (USER)</option>
                        <option value="HOTEL_OWNER">Host / Owner (HOTEL_OWNER)</option>
                        <option value="ADMIN">System Administrator (ADMIN)</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddUserModal(false)}
                        className="px-4 py-2 border border-outline text-on-surface text-xs rounded hover:bg-surface-container transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white text-xs rounded hover:opacity-90 cursor-pointer font-semibold"
                      >
                        Register User
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Edit User Role Modal */}
            {editingUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1C30]/50 backdrop-blur-md animate-fade-in">
                <div className="bg-white rounded-2xl max-w-sm w-full border border-outline-variant/30 overflow-hidden shadow-2xl p-6 text-left">
                  <h3 className="font-headline-sm text-base font-bold border-b border-outline-variant/30 pb-3 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">edit_square</span>
                    <span>Change User Role</span>
                  </h3>
                  <div className="space-y-4 font-sans">
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Select a new role for <span className="font-bold text-on-surface">{editingUser.name}</span> ({editingUser.email}).
                    </p>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Select Role</label>
                      <select
                        defaultValue={editingUser.role}
                        id="editUserRoleSelect"
                        className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                      >
                        <option value="USER">Traveler (USER)</option>
                        <option value="HOTEL_OWNER">Host / Owner (HOTEL_OWNER)</option>
                        <option value="ADMIN">System Administrator (ADMIN)</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="px-4 py-2 border border-outline text-on-surface text-xs rounded hover:bg-surface-container transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const val = document.getElementById('editUserRoleSelect').value;
                          handleUpdateUserRole(editingUser.id, val);
                        }}
                        className="px-4 py-2 bg-primary text-white text-xs rounded hover:opacity-90 cursor-pointer font-semibold"
                      >
                        Save Role
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : isHotelOwner ? (
          /* HOTEL OWNER / ADMIN HUB VIEW */
          <>
            {activeTab === 'dashboard' && (
              <>
                {/* Header Summary */}
                <section>
                  <div className="mb-8">
                    <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-2">Host Portal</span>
                    <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg leading-none">Your Properties at a Glance.</h1>
                  </div>

                  {/* Owner Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-12">
                    <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 text-left">
                      <span className="font-label-caps text-[10px] text-on-surface-variant block mb-2">TOTAL REVENUE</span>
                      <div className="text-3xl font-display-lg text-primary font-bold">$142,850</div>
                      <p className="text-xs text-secondary mt-1">↑ 12% from last month</p>
                    </div>
                    <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 text-left">
                      <span className="font-label-caps text-[10px] text-on-surface-variant block mb-2">OCCUPANCY RATE</span>
                      <div className="text-3xl font-display-lg text-primary font-bold">84.2%</div>
                      <p className="text-xs text-on-surface-variant mt-1">Avg. 5 nights per stay</p>
                    </div>
                    <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 text-left">
                      <span className="font-label-caps text-[10px] text-on-surface-variant block mb-2">ACTIVE LISTINGS</span>
                      <div className="text-3xl font-display-lg text-primary font-bold">{hostHotels.length} {hostHotels.length === 1 ? 'Hotel' : 'Hotels'}</div>
                      <p className="text-xs text-on-surface-variant mt-1">All properties online</p>
                    </div>
                    <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 text-left">
                      <span className="font-label-caps text-[10px] text-on-surface-variant block mb-2">AVERAGE RATING</span>
                      <div className="text-3xl font-display-lg text-primary font-bold">4.92 / 5</div>
                      <p className="text-xs text-secondary mt-1">Based on 302 reviews</p>
                    </div>
                  </div>
                </section>

                {/* Guest Reservations Received */}
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="font-headline-md text-headline-md">Recent Reservations</h2>
                  </div>
                  <div className="space-y-4">
                    {reservationsList.length === 0 ? (
                      <div className="p-8 text-center bg-white border border-outline-variant/30 rounded-xl text-on-surface-variant">
                        No recent reservations received.
                      </div>
                    ) : (
                      reservationsList.map(res => {
                        const initials = getInitials(`${res.firstName} ${res.lastName}`);
                        const statusColors = 
                          res.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                          res.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800';

                        return (
                          <div key={res._id} className="p-6 bg-white border border-outline-variant/30 rounded-lg flex flex-col md:flex-row items-center gap-6 text-left">
                            <div className="w-12 h-12 rounded-full bg-[#dae2fd] text-[#002117] flex items-center justify-center font-bold">
                              {initials}
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center gap-3">
                                <h4 className="font-body-lg text-body-lg font-bold">{res.firstName} {res.lastName}</h4>
                                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${statusColors}`}>
                                  {res.status}
                                </span>
                              </div>
                              <p className="text-on-surface-variant font-body-sm text-body-sm mt-1">
                                {res.hotel?.name || 'Hotel'} • {res.room?.type || 'Room'} ({res.room?.roomNumber || 'Room'}) • {res.nights} {res.nights === 1 ? 'Night' : 'Nights'} • {res.checkIn} — {res.checkOut}
                              </p>
                              {res.requests && (
                                <p className="text-xs text-on-surface-variant italic mt-1">
                                  Note: "{res.requests}"
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold text-primary block">${res.total.toFixed(2)}</span>
                              <span className={`text-[10px] font-semibold block uppercase mt-0.5 ${res.payoutStatus === 'Settled' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {res.payoutStatus === 'Settled' ? 'Payout Settled' : 'Payout Pending'}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {res.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateReservationStatus(res._id, 'Confirmed')}
                                    className="px-5 py-2 bg-primary text-white font-interactive text-xs rounded-sm hover:opacity-90 transition-opacity cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleUpdateReservationStatus(res._id, 'Cancelled')}
                                    className="px-5 py-2 bg-surface-container text-on-surface font-interactive text-xs rounded-sm hover:bg-surface-container-high transition-colors cursor-pointer"
                                  >
                                    Decline
                                  </button>
                                </>
                              )}
                              {res.status === 'Confirmed' && (
                                <button
                                  onClick={() => showToast('Directing to Concierge chat...', false)}
                                  className="px-5 py-2 bg-surface-container text-on-surface font-interactive text-xs rounded-sm hover:bg-surface-container-high transition-colors cursor-pointer"
                                >
                                  Contact Guest
                                </button>
                              )}
                              {res.status === 'Cancelled' && (
                                <span className="text-xs text-outline font-semibold uppercase px-4 py-2">
                                  Cancelled
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              </>
            )}

            {activeTab === 'listings' && (
              <>
                {/* Properties Listings Section */}
                <section className="text-left font-sans animate-fade-in">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="font-headline-md text-headline-md">Manage Listings</h2>
                    <button
                      onClick={() => setShowCreateHotelModal(true)}
                      className="px-6 py-2 bg-primary text-white font-interactive text-interactive hover:opacity-90 transition-opacity flex items-center gap-2 rounded cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      <span>Create Listing</span>
                    </button>
                  </div>

                  {/* Listings List */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                    {hostHotels.length === 0 ? (
                      <div className="col-span-full p-8 text-center bg-white border border-outline-variant/30 rounded-xl text-on-surface-variant">
                        No active listings. Click "Create Listing" to get started.
                      </div>
                    ) : (
                      hostHotels.map(h => {
                        const imgUrl = h.images && h.images.length > 0 
                          ? h.images[0].url 
                          : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                        return (
                          <div key={h._id} className="group border border-outline-variant/30 rounded-xl overflow-hidden bg-white shadow-sm">
                            <div className="relative aspect-[4/3] overflow-hidden">
                              <img 
                                alt={h.name} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                src={imgUrl}
                              />
                              <span className="absolute top-4 left-4 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                                {h.isActive ? 'Active' : 'Suspended'}
                              </span>
                            </div>
                            <div className="p-5">
                              <h4 className="font-headline-sm text-lg font-bold mb-1">{h.name}</h4>
                              <p className="text-xs text-on-surface-variant mb-4">{h.address.city}, {h.address.country}</p>
                              <div className="flex justify-between items-center pt-3 border-t border-outline-variant/30">
                                <span className="text-xs font-semibold text-primary">{h.starRating} Stars</span>
                                <button 
                                  onClick={() => {
                                    setEditingHotel(h);
                                    setEditHotelName(h.name || '');
                                    setEditHotelDesc(h.description || '');
                                    setEditHotelCity(h.address?.city || '');
                                    setEditHotelCountry(h.address?.country || '');
                                    setEditHotelStars(h.starRating || 5);
                                    setEditHotelEmail(h.contactEmail || '');
                                    setEditHotelPhone(h.contactPhone || '');
                                  }}
                                  className="text-xs text-on-surface-variant hover:text-primary underline cursor-pointer"
                                >
                                  Edit Details
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              </>
            )}

            {activeTab === 'reviews' && (
              <section className="text-left font-sans animate-fade-in space-y-6">
                <div className="mb-8">
                  <h2 className="font-headline-md text-headline-md">Guest Reviews</h2>
                  <p className="text-on-surface-variant font-body-sm text-body-sm">View reviews left on your properties and submit responses.</p>
                </div>

                {/* Reviews Analytics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-surface-container-low border border-outline-variant/30 rounded-xl text-left shadow-sm flex items-center gap-4">
                    <span className="material-symbols-outlined text-amber-500 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <div>
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block font-sans">Average Rating</span>
                      <span className="text-2xl font-bold font-mono text-primary">4.92 / 5</span>
                    </div>
                  </div>
                  <div className="p-6 bg-surface-container-low border border-outline-variant/30 rounded-xl text-left shadow-sm flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary text-4xl">rate_review</span>
                    <div>
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block font-sans">Total Reviews</span>
                      <span className="text-2xl font-bold font-mono text-primary">302</span>
                    </div>
                  </div>
                  <div className="p-6 bg-surface-container-low border border-outline-variant/30 rounded-xl text-left shadow-sm flex items-center gap-4">
                    <span className="material-symbols-outlined text-secondary text-4xl">quickreply</span>
                    <div>
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block font-sans">Response Rate</span>
                      <span className="text-2xl font-bold font-mono text-primary">100%</span>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6 pt-2">
                  {guestReviews.map(r => (
                    <div key={r.id} className="p-6 bg-white border border-outline-variant/30 rounded-xl space-y-4 shadow-sm text-left">
                      <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm select-none font-sans">
                            {r.guestInitials}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-on-surface">{r.guestName}</h4>
                            <span className="text-[10px] text-on-surface-variant block font-sans">
                              {r.date} • Stayed at <span className="font-semibold text-secondary">{r.hotelName}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/50 px-2.5 py-1 rounded">
                          <span className="material-symbols-outlined text-amber-500 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="text-xs font-bold text-amber-800 font-sans">{r.rating}.0 / 5</span>
                        </div>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed italic">"{r.comment}"</p>
                      
                      {r.reply ? (
                        <div className="p-4 bg-surface-container rounded-lg border-l-2 border-primary space-y-1">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider block font-sans">Your Response</span>
                          <p className="text-xs text-on-surface leading-relaxed font-sans">"{r.reply}"</p>
                        </div>
                      ) : (
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            const input = e.target.elements[`reply-${r.id}`];
                            handleReviewReply(r.id, input.value);
                            input.value = '';
                          }}
                          className="flex gap-2 font-sans"
                        >
                          <input 
                            type="text" 
                            name={`reply-${r.id}`}
                            placeholder="Type your response to this review..."
                            required
                            className="flex-grow border border-outline-variant/50 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none bg-white"
                          />
                          <button 
                            type="submit" 
                            className="px-4 py-2 bg-primary text-white text-xs rounded font-bold hover:opacity-90 transition-opacity cursor-pointer"
                          >
                            Submit Reply
                          </button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'payouts' && (
              <section className="text-left font-sans animate-fade-in space-y-6">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-headline-md text-headline-md">Payout Methods</h2>
                    <p className="text-on-surface-variant font-body-sm text-body-sm">Configure how you receive hotel booking payments.</p>
                  </div>
                  <button
                    onClick={() => setShowAddPayoutModal(true)}
                    className="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer self-start md:self-auto"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>Add Payout Method</span>
                  </button>
                </div>

                {/* Info row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="p-5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-left shadow-sm">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Next Settlement</span>
                    <span className="text-lg font-bold text-primary block">Sept 20, 2026</span>
                    <span className="text-xs text-on-surface-variant">Payout is automatically approved after guests complete stays.</span>
                  </div>
                  <div className="p-5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-left shadow-sm">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Payout Schedule</span>
                    <span className="text-lg font-bold text-secondary block">Weekly Payments</span>
                    <span className="text-xs text-on-surface-variant">Cleared balances are processed every Friday.</span>
                  </div>
                </div>

                {/* Saved Methods List */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Settlement Destinations</h3>
                  
                  {payoutMethods.length === 0 ? (
                    <div className="p-6 text-center bg-white border border-outline-variant/30 rounded-xl text-on-surface-variant text-xs">
                      No payout methods configured. Add a payout method to receive payouts.
                    </div>
                  ) : (
                    payoutMethods.map(m => (
                      <div key={m.id} className="p-5 bg-white border border-outline-variant/30 rounded-xl flex items-center justify-between shadow-sm text-left">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-xl">
                              {m.type === 'Bank Transfer' ? 'account_balance' : 'payments'}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-on-surface">{m.name}</span>
                              {m.isDefault && (
                                <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Primary</span>
                              )}
                            </div>
                            <span className="text-xs text-on-surface-variant font-mono">{m.details}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeletePayoutMethod(m.id)}
                          className="text-xs text-error hover:underline font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Payout History Transactions */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Recent Payout Settlements</h3>
                  <div className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-container border-b border-outline-variant/30 text-on-surface font-bold text-xs uppercase">
                            <th className="p-4">Payout ID</th>
                            <th className="p-4">Settled Date</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Destination</th>
                            <th className="p-4 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 font-body-sm text-body-sm">
                          {payoutHistory.map(ph => (
                            <tr key={ph.id}>
                              <td className="p-4 font-mono font-bold text-xs text-on-surface-variant">LMY-{ph.id}</td>
                              <td className="p-4 text-xs">{ph.date}</td>
                              <td className="p-4 font-bold text-primary">${ph.amount.toFixed(2)}</td>
                              <td className="p-4 text-xs text-on-surface-variant">{ph.method}</td>
                              <td className="p-4 text-right">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                  ph.status === 'Settled'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {ph.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Create Hotel Listing Modal */}
            {showCreateHotelModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1C30]/50 backdrop-blur-md animate-fade-in">
                <div className="bg-white rounded-2xl max-w-md w-full border border-outline-variant/30 overflow-hidden shadow-2xl p-6 text-left">
                  <h3 className="font-headline-sm text-lg font-bold border-b border-outline-variant/30 pb-3 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">add_business</span>
                    <span>Create New Hotel Listing</span>
                  </h3>
                  <form onSubmit={handleCreateHotel} className="space-y-4 font-sans">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Hotel Name *</label>
                      <input
                        type="text"
                        value={newHotelName}
                        onChange={(e) => setNewHotelName(e.target.value)}
                        placeholder="Grand Plaza Resort"
                        required
                        className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Description</label>
                      <textarea
                        value={newHotelDesc}
                        onChange={(e) => setNewHotelDesc(e.target.value)}
                        placeholder="Brief description of the property..."
                        rows={3}
                        className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">City *</label>
                        <input
                          type="text"
                          value={newHotelCity}
                          onChange={(e) => setNewHotelCity(e.target.value)}
                          placeholder="Kyoto"
                          required
                          className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Country *</label>
                        <input
                          type="text"
                          value={newHotelCountry}
                          onChange={(e) => setNewHotelCountry(e.target.value)}
                          placeholder="Japan"
                          required
                          className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Star Rating (1-5)</label>
                        <select
                          value={newHotelStars}
                          onChange={(e) => setNewHotelStars(Number(e.target.value))}
                          className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                        >
                          <option value={5}>5 Stars</option>
                          <option value={4}>4 Stars</option>
                          <option value={3}>3 Stars</option>
                          <option value={2}>2 Stars</option>
                          <option value={1}>1 Star</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Contact Phone</label>
                        <input
                          type="text"
                          value={newHotelPhone}
                          onChange={(e) => setNewHotelPhone(e.target.value)}
                          placeholder="+81 75-123-4567"
                          className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Contact Email</label>
                      <input
                        type="email"
                        value={newHotelEmail}
                        onChange={(e) => setNewHotelEmail(e.target.value)}
                        placeholder="reservations@grandresort.com"
                        className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateHotelModal(false)}
                        className="px-4 py-2 border border-outline text-on-surface text-xs rounded hover:bg-surface-container transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white text-xs rounded hover:opacity-90 cursor-pointer font-semibold"
                      >
                        Create Listing
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Edit Hotel Listing Modal */}
            {editingHotel && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1C30]/50 backdrop-blur-md animate-fade-in">
                <div className="bg-white rounded-2xl max-w-md w-full border border-outline-variant/30 overflow-hidden shadow-2xl p-6 text-left">
                  <h3 className="font-headline-sm text-lg font-bold border-b border-outline-variant/30 pb-3 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">edit_square</span>
                    <span>Edit Hotel Listing</span>
                  </h3>
                  <form onSubmit={handleUpdateHotel} className="space-y-4 font-sans">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Hotel Name *</label>
                      <input
                        type="text"
                        value={editHotelName}
                        onChange={(e) => setEditHotelName(e.target.value)}
                        placeholder="Grand Plaza Resort"
                        required
                        className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Description</label>
                      <textarea
                        value={editHotelDesc}
                        onChange={(e) => setEditHotelDesc(e.target.value)}
                        placeholder="Brief description of the property..."
                        rows={3}
                        className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">City *</label>
                        <input
                          type="text"
                          value={editHotelCity}
                          onChange={(e) => setEditHotelCity(e.target.value)}
                          placeholder="Kyoto"
                          required
                          className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Country *</label>
                        <input
                          type="text"
                          value={editHotelCountry}
                          onChange={(e) => setEditHotelCountry(e.target.value)}
                          placeholder="Japan"
                          required
                          className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Star Rating (1-5)</label>
                        <select
                          value={editHotelStars}
                          onChange={(e) => setEditHotelStars(Number(e.target.value))}
                          className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                        >
                          <option value={5}>5 Stars</option>
                          <option value={4}>4 Stars</option>
                          <option value={3}>3 Stars</option>
                          <option value={2}>2 Stars</option>
                          <option value={1}>1 Star</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Contact Phone</label>
                        <input
                          type="text"
                          value={editHotelPhone}
                          onChange={(e) => setEditHotelPhone(e.target.value)}
                          placeholder="+81 75-123-4567"
                          className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Contact Email</label>
                      <input
                        type="email"
                        value={editHotelEmail}
                        onChange={(e) => setEditHotelEmail(e.target.value)}
                        placeholder="reservations@grandresort.com"
                        className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingHotel(null)}
                        className="px-4 py-2 border border-outline text-on-surface text-xs rounded hover:bg-surface-container transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white text-xs rounded hover:opacity-90 cursor-pointer font-semibold"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Add Payout Method Modal */}
            {showAddPayoutModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1C30]/50 backdrop-blur-md animate-fade-in">
                <div className="bg-white rounded-2xl max-w-md w-full border border-outline-variant/30 overflow-hidden shadow-2xl p-6 text-left">
                  <h3 className="font-headline-sm text-lg font-bold border-b border-outline-variant/30 pb-3 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                    <span>Add Payout Method</span>
                  </h3>
                  <form onSubmit={handleAddPayoutMethod} className="space-y-4 font-sans">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Method Type</label>
                      <select
                        value={newPayoutType}
                        onChange={(e) => setNewPayoutType(e.target.value)}
                        className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
                      >
                        <option value="Bank Transfer">Bank Transfer (Direct Deposit)</option>
                        <option value="PayPal">PayPal Account</option>
                      </select>
                    </div>
                    
                    {newPayoutType === 'Bank Transfer' ? (
                      <>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Bank Name *</label>
                          <input
                            type="text"
                            value={newPayoutBankName}
                            onChange={(e) => setNewPayoutBankName(e.target.value)}
                            placeholder="Chase, Wells Fargo, etc."
                            required
                            className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Account Number *</label>
                            <input
                              type="text"
                              value={newPayoutAccount}
                              onChange={(e) => setNewPayoutAccount(e.target.value)}
                              placeholder="123456789"
                              required
                              className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Routing Number *</label>
                            <input
                              type="text"
                              value={newPayoutRouting}
                              onChange={(e) => setNewPayoutRouting(e.target.value)}
                              placeholder="987654321"
                              required
                              className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">PayPal Email *</label>
                        <input
                          type="email"
                          value={newPayoutPaypalEmail}
                          onChange={(e) => setNewPayoutPaypalEmail(e.target.value)}
                          placeholder="paypal@example.com"
                          required
                          className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddPayoutModal(false)}
                        className="px-4 py-2 border border-outline text-on-surface text-xs rounded hover:bg-surface-container transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white text-xs rounded hover:opacity-90 cursor-pointer font-semibold"
                      >
                        Add Payout Method
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        ) : (
          /* STANDARD TRAVELER VIEW */
          <>
            {activeTab === 'dashboard' && (
              <>
                {/* Summary Section */}
                <section>
                  <div className="flex items-end justify-between mb-8">
                    <div>
                      <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-2">Welcome Back</span>
                      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg leading-none">Your Sanctuary Awaits.</h1>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                    {/* Upcoming Trip Main Card */}
                    {travelerBookings.filter(b => b.status !== 'Cancelled').length === 0 ? (
                      <div className="md:col-span-2 p-8 bg-white border border-outline-variant/30 rounded-xl text-center flex flex-col items-center justify-center min-h-[300px]">
                        <span className="material-symbols-outlined text-outline text-5xl mb-4">explore</span>
                        <h3 className="font-headline-sm text-headline-sm mb-2 text-on-surface">No upcoming stays</h3>
                        <p className="text-on-surface-variant font-body-sm text-body-sm mb-6 max-w-sm">Explore our curated collections of pristine sanctuaries and shoreline retreats to plan your next journey.</p>
                        <button
                          onClick={() => onNavigate('explore')}
                          className="px-6 py-3 bg-primary text-white font-interactive text-interactive rounded hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          Explore Stays
                        </button>
                      </div>
                    ) : (
                      (() => {
                        const nextStay = travelerBookings.filter(b => b.status !== 'Cancelled')[0];
                        const bImg = nextStay.hotel?.images?.[0]?.url || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80';
                        return (
                          <div className="md:col-span-2 relative group overflow-hidden rounded-xl bg-white border border-outline-variant/30 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)]">
                            <div className="flex flex-col md:flex-row h-full">
                              <div className="w-full md:w-1/2 overflow-hidden h-64 md:h-auto animate-none">
                                <img
                                  alt="Upcoming Stay"
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  src={bImg}
                                />
                              </div>
                              <div className="p-8 flex flex-col justify-between flex-grow">
                                <div>
                                  <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-secondary-container text-on-secondary-container font-label-caps text-label-caps rounded-sm">
                                      UPCOMING STAY
                                    </span>
                                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                                      {nextStay.nights} {nextStay.nights === 1 ? 'Night' : 'Nights'}
                                    </span>
                                  </div>
                                  <h3 className="font-headline-md text-headline-md mb-2">{nextStay.hotel?.name}</h3>
                                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">{nextStay.checkIn} — {nextStay.checkOut}</p>
                                </div>
                                <button
                                  onClick={() => handleTabClick('bookings')}
                                  className="w-full py-4 bg-primary text-white font-interactive text-interactive transition-opacity hover:opacity-90 cursor-pointer"
                                >
                                  View Reservation Details
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    )}

                    {/* Quick Stats */}
                    <div className="flex flex-col gap-gutter">
                      <div className="p-8 bg-surface-container-low rounded-xl border border-outline-variant/30 flex-grow text-left">
                        <span className="font-label-caps text-label-caps text-on-surface-variant block mb-4">SANCHAR SATI REWARDS</span>
                        <div className="text-4xl font-display-lg text-primary mb-2 font-bold">42,850</div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Points available for redemption</p>
                        <div className="mt-6 pt-6 border-t border-outline-variant/30">
                          <a
                            onClick={(e) => {
                              e.preventDefault();
                              showToast('Redirecting to rewards shop...', false);
                            }}
                            className="text-primary font-bold text-interactive flex items-center gap-2 cursor-pointer"
                            href="#"
                          >
                            Explore Rewards <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeTab === 'bookings' && (
              <>
                {/* Bookings Section */}
                <section className="text-left font-sans animate-fade-in space-y-6">
                  <div className="mb-8">
                    <h2 className="font-headline-md text-headline-md">Your Bookings</h2>
                    <p className="text-on-surface-variant font-body-sm text-body-sm">Track your upcoming stays and reservations details.</p>
                  </div>

                  <div className="space-y-6">
                    {travelerBookings.length === 0 ? (
                      <div className="p-8 text-center bg-white border border-outline-variant/30 rounded-xl text-on-surface-variant text-xs">
                        No active bookings found.
                      </div>
                    ) : (
                      travelerBookings.map(b => {
                        const bImg = b.hotel?.images?.[0]?.url || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80';
                        const statusColors = 
                          b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800';

                        return (
                          <div key={b._id} className="relative group overflow-hidden rounded-xl bg-white border border-outline-variant/30 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] text-left">
                            <div className="flex flex-col md:flex-row h-full">
                              <div className="w-full md:w-1/2 overflow-hidden h-64 md:h-auto">
                                <img
                                  alt={b.hotel?.name || 'Hotel'}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  src={bImg}
                                />
                              </div>
                              <div className="p-8 flex flex-col justify-between space-y-6 flex-grow">
                                <div>
                                  <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 font-label-caps text-[10px] font-bold rounded-sm ${statusColors}`}>
                                      RESERVATION {b.status.toUpperCase()}
                                    </span>
                                    <span className="font-body-sm text-body-sm text-on-surface-variant">{b.nights} {b.nights === 1 ? 'Night' : 'Nights'} • {b.guests}</span>
                                  </div>
                                  <h3 className="font-headline-md text-headline-md mb-2">{b.hotel?.name}</h3>
                                  <p className="font-body-md text-body-md text-on-surface-variant mb-4 font-bold">{b.checkIn} — {b.checkOut}</p>
                                  
                                  <div className="border-t border-outline-variant/20 pt-4 mt-4 space-y-2 text-xs text-on-surface-variant">
                                    <div className="flex justify-between">
                                      <span>Room Type:</span>
                                      <span className="font-semibold text-on-surface">{b.room?.type} Suite ({b.room?.roomNumber})</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Confirmation Code:</span>
                                      <span className="font-mono font-bold text-on-surface">LM-{b._id.slice(-6).toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Total Price Paid:</span>
                                      <span className="font-bold text-primary">${b.total.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-4">
                                  {b.status === 'Confirmed' && (
                                    <button
                                      onClick={() => showToast('Connecting to Sanchar Sati POS/check-in service...', false)}
                                      className="flex-grow py-3 bg-primary text-white font-interactive text-xs font-bold rounded hover:opacity-90 transition-opacity cursor-pointer text-center font-sans"
                                    >
                                      Online Check-In
                                    </button>
                                  )}
                                  <button
                                    onClick={() => showToast('Directing to Concierge chat...', false)}
                                    className="px-6 py-3 border border-outline text-on-surface font-interactive text-xs font-bold rounded hover:bg-surface-container transition-colors cursor-pointer text-center font-sans flex-grow"
                                  >
                                    Contact Host
                                  </button>
                                  {(b.status === 'Confirmed' || b.status === 'Pending') && (
                                    <button
                                      onClick={() => handleCancelBooking(b._id)}
                                      className="px-6 py-3 border border-error text-error font-interactive text-xs font-bold rounded hover:bg-error-container/10 transition-colors cursor-pointer text-center font-sans flex-grow"
                                    >
                                      Cancel Booking
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* Past Journeys Section */}
                <section className="text-left font-sans animate-fade-in pt-6">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="font-headline-md text-headline-md">Past Journeys</h2>
                  </div>
                  <div className="space-y-4">
                    {/* Render past stays if comparison matches checkOut < todayStr, otherwise show mock fallback */}
                    {(() => {
                      const todayStr = new Date().toISOString().split('T')[0];
                      const pastStays = travelerBookings.filter(b => b.checkOut < todayStr && b.status !== 'Cancelled');
                      if (pastStays.length === 0) {
                        return (
                          <>
                            <div className="p-6 bg-white border border-outline-variant/30 rounded-lg flex flex-col md:flex-row items-center gap-6 transition-colors hover:bg-surface-container-lowest text-left">
                              <div className="w-24 h-24 rounded overflow-hidden flex-shrink-0">
                                <img
                                  alt="Past Stay Ubud"
                                  className="w-full h-full object-cover"
                                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAB9K_u4tCtlagrnIelT3wlfdlJdghv3v7QMgZmqNocVSdChQLgxOIsC0AIyZCfPYR7PDSurkGWnUn_ZYfQAsvxGwh9XQxIbS05qNClH13BT9pxUJLoaKlxDlXuYPhWxZHTsdevyYQAiJacN_6dRNRta-ERuNx2FNLKEKaiAFTvhnqMpJqjfL8yxgEYW-LSOXR4RXFz1OGoMRdhvTleKUH6PqJaLjPmvqTGG44ugIE4qcZtKEvZSL92O6TNoTMd53tKXlYSEBqX983r"
                                />
                              </div>
                              <div className="flex-grow">
                                <h4 className="font-body-lg text-body-lg font-bold text-on-surface font-sans">The Verdant Canopy</h4>
                                <p className="text-on-surface-variant font-body-sm text-body-sm font-sans">Ubud, Bali • May 12 — May 19, 2024</p>
                              </div>
                              <div className="flex gap-4">
                                <button
                                  onClick={() => showToast('Initiating rebooking flow...', false)}
                                  className="px-6 py-2 border border-primary text-primary font-interactive text-interactive rounded hover:bg-primary/5 transition-colors cursor-pointer font-sans"
                                >
                                  Book Again
                                </button>
                                <button
                                  onClick={() => showToast('Downloading invoice...', false)}
                                  className="px-6 py-2 bg-surface-container text-on-surface font-interactive text-interactive rounded hover:bg-surface-container-high transition-colors cursor-pointer font-sans"
                                >
                                  Download Invoice
                                </button>
                              </div>
                            </div>
                            <div className="p-6 bg-white border border-outline-variant/30 rounded-lg flex flex-col md:flex-row items-center gap-6 transition-colors hover:bg-surface-container-lowest text-left">
                              <div className="w-24 h-24 rounded overflow-hidden flex-shrink-0">
                                <img
                                  alt="Past Stay NYC"
                                  className="w-full h-full object-cover"
                                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9P-ptTCRAh08mNJKb5DuFHXhhRSzIbl1UypH42be5elVywmD_VTy0IVfEEefWeVdt0k-8klWFCQsrl4ing322pNwGjuckmN-FIY2qt8xce2cwd7XH5D9Fe0xYoRBLdLZPw5AbFeIk6J3nZhpSXf3I7FOhw868OM3rTrDP7H2nxj1VoD09HM_GZYJuBakcQdonIF-XY_oIrtUw9vmMS7SYpQZAfNLUgIMEFN5drhbFciI98-DHdkcWG_Ty-tmrfpW8KNiUn1Qd6v3I"
                                />
                              </div>
                              <div className="flex-grow">
                                <h4 className="font-body-lg text-body-lg font-bold text-on-surface font-sans">Metropolis Heights</h4>
                                <p className="text-on-surface-variant font-body-sm text-body-sm font-sans">New York City, USA • Jan 04 — Jan 08, 2024</p>
                              </div>
                              <div className="flex gap-4">
                                <button
                                  onClick={() => showToast('Initiating rebooking flow...', false)}
                                  className="px-6 py-2 border border-primary text-primary font-interactive text-interactive rounded hover:bg-primary/5 transition-colors cursor-pointer font-sans"
                                >
                                  Book Again
                                </button>
                                <button
                                  onClick={() => showToast('Downloading invoice...', false)}
                                  className="px-6 py-2 bg-surface-container text-on-surface font-interactive text-interactive rounded hover:bg-surface-container-high transition-colors cursor-pointer font-sans"
                                >
                                  Download Invoice
                                </button>
                              </div>
                            </div>
                          </>
                        );
                      }

                      return pastStays.map(s => {
                        const sImg = s.hotel?.images?.[0]?.url || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';
                        return (
                          <div key={s._id} className="p-6 bg-white border border-outline-variant/30 rounded-lg flex flex-col md:flex-row items-center gap-6 transition-colors hover:bg-surface-container-lowest text-left">
                            <div className="w-24 h-24 rounded overflow-hidden flex-shrink-0">
                              <img
                                alt={s.hotel?.name || 'Hotel'}
                                className="w-full h-full object-cover"
                                src={sImg}
                              />
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-body-lg text-body-lg font-bold text-on-surface font-sans">{s.hotel?.name}</h4>
                              <p className="text-on-surface-variant font-body-sm text-body-sm font-sans">
                                {s.hotel?.address?.city}, {s.hotel?.address?.country} • {s.checkIn} — {s.checkOut}
                              </p>
                            </div>
                            <div className="flex gap-4">
                              <button
                                onClick={() => showToast('Initiating rebooking flow...', false)}
                                className="px-6 py-2 border border-primary text-primary font-interactive text-interactive rounded hover:bg-primary/5 transition-colors cursor-pointer font-sans"
                              >
                                Book Again
                              </button>
                              <button
                                onClick={() => showToast('Downloading invoice...', false)}
                                className="px-6 py-2 bg-surface-container text-on-surface font-interactive text-interactive rounded hover:bg-surface-container-high transition-colors cursor-pointer font-sans"
                              >
                                Download Invoice
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </section>
              </>
            )}

            {activeTab === 'wishlist' && (
              <section className="text-left font-sans animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-headline-md text-headline-md">Your Wishlist</h2>
                </div>
                {wishlist.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-outline-variant/30 rounded-xl text-on-surface-variant text-xs">
                    Your wishlist is currently empty.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                    {wishlist.map(item => {
                      const hotel = item.hotel;
                      if (!hotel) return null;
                      const hotelImage = hotel.images && hotel.images.length > 0
                        ? hotel.images[0].url
                        : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                      return (
                        <div key={item._id} className="group text-left cursor-pointer" onClick={() => onNavigate('explore')}>
                          <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-4">
                            <img
                              alt={hotel.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              src={hotelImage}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveWishlist(hotel._id);
                              }}
                              className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-error material-symbols-outlined cursor-pointer"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              favorite
                            </button>
                          </div>
                          <h4 className="font-headline-sm text-headline-sm mb-1 text-on-surface font-sans">{hotel.name}</h4>
                          <p className="font-body-sm text-body-sm text-on-surface-variant font-sans">
                            {hotel.address?.city}, {hotel.address?.country}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'payments' && (
              <section className="text-left font-sans animate-fade-in space-y-6">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-headline-md text-headline-md">Payment Methods</h2>
                    <p className="text-on-surface-variant font-body-sm text-body-sm font-sans">Manage your credit cards and billing settings.</p>
                  </div>
                  <button
                    onClick={() => setShowAddCardModal(true)}
                    className="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer self-start md:self-auto"
                  >
                    <span className="material-symbols-outlined text-sm">credit_card</span>
                    <span>Add New Card</span>
                  </button>
                </div>

                {/* Credit Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {travelerCards.map(c => (
                    <div 
                      key={c.id} 
                      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.color} text-white p-6 shadow-md flex flex-col justify-between h-48 border border-white/10`}
                    >
                      {/* Stylized Glassmorphism Credit Card */}
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-white/60 block mb-1">Sanchar Sati Elite Card</span>
                          <span className="font-headline-sm text-lg font-bold">{c.type}</span>
                        </div>
                        <span className="material-symbols-outlined text-2xl text-white/80">contactless</span>
                      </div>
                      <div className="text-lg font-mono tracking-widest my-2">{c.number}</div>
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-white/50 block">Cardholder</span>
                          <span className="text-xs font-bold font-sans uppercase">{c.cardholder}</span>
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <span className="text-[8px] uppercase tracking-wider text-white/50 block">Expires</span>
                            <span className="text-xs font-mono">{c.expiry}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteCard(c.id)}
                            className="bg-white/15 hover:bg-white/25 text-white p-1.5 rounded-full flex items-center justify-center transition-all cursor-pointer self-end"
                            title="Remove payment card"
                          >
                            <span className="material-symbols-outlined text-xs">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Add Traveler Card Modal */}
            {showAddCardModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1C30]/50 backdrop-blur-md animate-fade-in">
                <div className="bg-white rounded-2xl max-w-md w-full border border-outline-variant/30 overflow-hidden shadow-2xl p-6 text-left">
                  <h3 className="font-headline-sm text-lg font-bold border-b border-outline-variant/30 pb-3 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">add_card</span>
                    <span>Add New Card</span>
                  </h3>
                  <form onSubmit={handleAddCard} className="space-y-4 font-sans">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Cardholder Name *</label>
                      <input
                        type="text"
                        value={newCardholder}
                        onChange={(e) => setNewCardholder(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Card Number *</label>
                      <input
                        type="text"
                        value={newCardNumber}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').substring(0, 16);
                          const formatted = v.match(/.{1,4}/g)?.join(' ') || v;
                          setNewCardNumber(formatted);
                        }}
                        placeholder="1234 5678 1234 5678"
                        required
                        className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Expiration Date *</label>
                        <input
                          type="text"
                          value={newCardExpiry}
                          onChange={(e) => {
                            let v = e.target.value.replace(/\D/g, '').substring(0, 4);
                            if (v.length > 2) {
                              v = v.substring(0, 2) + '/' + v.substring(2);
                            }
                            setNewCardExpiry(v);
                          }}
                          placeholder="MM/YY"
                          required
                          className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">CVV *</label>
                        <input
                          type="password"
                          value={newCardCVV}
                          onChange={(e) => setNewCardCVV(e.target.value.replace(/\D/g, '').substring(0, 3))}
                          placeholder="•••"
                          required
                          className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Card Type</label>
                      <select
                        value={newCardType}
                        onChange={(e) => setNewCardType(e.target.value)}
                        className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
                      >
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="Amex">American Express</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddCardModal(false)}
                        className="px-4 py-2 border border-outline text-on-surface text-xs rounded hover:bg-surface-container transition-colors cursor-pointer font-sans"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white text-xs rounded hover:opacity-90 cursor-pointer font-semibold font-sans"
                      >
                        Add Card
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'dining' && (
              <section className="text-left font-sans animate-fade-in space-y-6">
                <div className="mb-8">
                  <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-2">Room Service Portal</span>
                  <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg leading-none">In-Room Dining.</h1>
                </div>

                {/* Booking Selector */}
                {travelerBookings.filter(b => b.status === 'Confirmed').length === 0 ? (
                  <div className="p-8 text-center bg-white border border-outline-variant/30 rounded-xl text-on-surface-variant text-xs flex flex-col items-center justify-center min-h-[300px]">
                    <span className="material-symbols-outlined text-outline text-5xl mb-4">room_service</span>
                    <p className="font-semibold text-base mb-2">No active stays found</p>
                    <p className="text-sm mb-6 max-w-md text-center text-on-surface-variant">To order food, you must have a confirmed reservation. Browse our beautiful collection of properties to book a stay.</p>
                    <button
                      onClick={() => onNavigate('explore')}
                      className="px-6 py-3 bg-primary text-white font-interactive text-xs font-semibold rounded-lg hover:opacity-90 cursor-pointer transition-all"
                    >
                      Explore Properties
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                    {/* Menu and Booking Selection Column (2 cols wide on desktop) */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Booking Dropdown */}
                      <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30">
                        <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                          Select Your Confirmed Stay
                        </label>
                        <select
                          value={selectedBookingId}
                          onChange={(e) => {
                            setSelectedBookingId(e.target.value);
                            setFoodCart({});
                          }}
                          className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none bg-white font-sans"
                        >
                          {travelerBookings
                            .filter(b => b.status === 'Confirmed')
                            .map((b) => (
                              <option key={b._id} value={b._id}>
                                {b.hotel?.name || 'Hotel Stay'} ({b.room?.roomNumber ? `Room ${b.room.roomNumber}` : 'Standard Room'}) — {b.checkIn} to {b.checkOut}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Gourmet Menu */}
                      {(() => {
                        const activeB = travelerBookings.find(b => b._id === selectedBookingId);
                        if (!activeB) return <p className="text-sm text-outline">Please select a stay to view the menu.</p>;
                        
                        const menu = getHotelMenu(
                          activeB.hotel?.name,
                          (activeB.hotel?.address?.city || '') + ' ' + (activeB.hotel?.address?.country || '')
                        );

                        const categories = ['All', ...new Set(menu.map(item => item.category))];
                        const filteredMenu = foodMenuFilter === 'All' 
                          ? menu 
                          : menu.filter(item => item.category === foodMenuFilter);

                        return (
                          <div className="space-y-4">
                            {/* Category Filter Pills */}
                            <div className="flex flex-wrap gap-2">
                              {categories.map(cat => (
                                <button
                                  key={cat}
                                  onClick={() => setFoodMenuFilter(cat)}
                                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                                    foodMenuFilter === cat
                                      ? 'bg-primary text-white shadow-sm'
                                      : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-high'
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>

                            {/* Menu Items Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {filteredMenu.map((item) => {
                                const cartQty = foodCart[item.name] || 0;
                                return (
                                  <div key={item.name} className="p-5 bg-surface-container-low border border-outline-variant/30 rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div>
                                      <div className="flex justify-between items-start gap-2 mb-1">
                                        <h4 className="font-semibold text-sm text-on-surface">{item.name}</h4>
                                        <span className="text-sm font-bold text-primary font-sans">${item.price}</span>
                                      </div>
                                      <span className="inline-block text-[9px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-bold uppercase tracking-wider mb-2">
                                        {item.category}
                                      </span>
                                      <p className="text-xs text-on-surface-variant italic font-sans mb-4">{item.description}</p>
                                    </div>

                                    {/* Add to Cart / Quantity Selector */}
                                    <div className="flex justify-end items-center">
                                      {cartQty === 0 ? (
                                        <button
                                          onClick={() => setFoodCart(prev => ({ ...prev, [item.name]: 1 }))}
                                          className="px-3 py-1.5 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                                        >
                                          <span className="material-symbols-outlined text-xs">add</span>
                                          Add to Cart
                                        </button>
                                      ) : (
                                        <div className="flex items-center gap-3 bg-surface-container rounded-lg border border-outline-variant/50 p-1">
                                          <button
                                            onClick={() => setFoodCart(prev => {
                                              const updated = { ...prev };
                                              if (updated[item.name] <= 1) {
                                                delete updated[item.name];
                                              } else {
                                                updated[item.name]--;
                                              }
                                              return updated;
                                            })}
                                            className="w-6 h-6 rounded flex items-center justify-center text-xs bg-white text-on-surface hover:bg-surface-container-high cursor-pointer font-bold border border-outline-variant/30"
                                          >
                                            -
                                          </button>
                                          <span className="text-xs font-bold font-sans w-4 text-center">{cartQty}</span>
                                          <button
                                            onClick={() => setFoodCart(prev => ({ ...prev, [item.name]: (prev[item.name] || 0) + 1 }))}
                                            className="w-6 h-6 rounded flex items-center justify-center text-xs bg-white text-on-surface hover:bg-surface-container-high cursor-pointer font-bold border border-outline-variant/30"
                                          >
                                            +
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Order Cart / Checkout Column (1 col wide on desktop) */}
                    <div className="space-y-6">
                      {/* Summary Drawer Card */}
                      <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 sticky top-32">
                        <h3 className="font-headline-sm text-sm font-bold uppercase tracking-wider text-on-surface mb-4 pb-2 border-b border-outline-variant/30 flex items-center gap-2 font-sans">
                          <span className="material-symbols-outlined text-primary">shopping_bag</span>
                          Your Room Order
                        </h3>

                        {(() => {
                          const activeB = travelerBookings.find(b => b._id === selectedBookingId);
                          if (!activeB) return null;

                          const menu = getHotelMenu(
                            activeB.hotel?.name,
                            (activeB.hotel?.address?.city || '') + ' ' + (activeB.hotel?.address?.country || '')
                          );

                          const cartItems = Object.keys(foodCart)
                            .map(name => {
                              const menuItem = menu.find(item => item.name === name);
                              return menuItem ? { ...menuItem, quantity: foodCart[name] } : null;
                            })
                            .filter(Boolean);

                          const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                          return (
                            <div className="space-y-4 text-left font-sans">
                              <div className="text-xs border-b border-outline-variant/30 pb-3 space-y-1">
                                <p className="text-on-surface font-semibold">{activeB.hotel?.name}</p>
                                <p className="text-on-surface-variant font-sans flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">meeting_room</span>
                                  Room {activeB.room?.roomNumber || 'Standard'}
                                </p>
                              </div>

                              {cartItems.length === 0 ? (
                                <p className="text-xs text-on-surface-variant italic py-6 text-center">
                                  Your room service cart is empty. Tap "Add to Cart" to start your gourmet experience.
                                </p>
                              ) : (
                                <>
                                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                                    {cartItems.map(item => (
                                      <div key={item.name} className="flex justify-between items-center text-xs">
                                        <div className="flex-1 pr-2">
                                          <p className="font-semibold text-on-surface leading-tight">{item.name}</p>
                                          <p className="text-[10px] text-on-surface-variant font-sans">
                                            {item.quantity} x ${item.price}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-1 font-sans">
                                          <span className="font-bold text-on-surface">${item.price * item.quantity}</span>
                                          <button
                                            onClick={() => setFoodCart(prev => {
                                              const updated = { ...prev };
                                              delete updated[item.name];
                                              return updated;
                                            })}
                                            className="text-error hover:text-error/80 ml-2 cursor-pointer material-symbols-outlined text-sm font-normal"
                                          >
                                            delete
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="pt-3 border-t border-outline-variant/30 space-y-2">
                                    <div className="flex justify-between text-xs text-on-surface-variant">
                                      <span>Subtotal</span>
                                      <span>${subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-on-surface-variant">
                                      <span>Service Fee & Tax</span>
                                      <span className="text-emerald-600">Complimentary</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-sm text-on-surface pt-1 border-t border-outline-variant/10">
                                      <span>Total Price</span>
                                      <span>${subtotal}</span>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => handlePlaceFoodOrder(selectedBookingId, cartItems)}
                                    className="w-full mt-4 py-3 bg-primary text-white text-xs font-semibold rounded-xl hover:opacity-95 shadow transition-all cursor-pointer text-center font-interactive flex items-center justify-center gap-2"
                                  >
                                    <span className="material-symbols-outlined text-xs">restaurant</span>
                                    Confirm Room Delivery
                                  </button>
                                </>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Orders History & Real-Time Status */}
                <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 mt-8 font-sans">
                  <h3 className="font-headline-sm text-sm font-bold uppercase tracking-wider text-on-surface mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">history</span>
                    Order History & Delivery Tracker
                  </h3>

                  {foodOrders.length === 0 ? (
                    <p className="text-xs text-on-surface-variant italic text-center py-6">
                      You haven't placed any room service orders yet.
                    </p>
                  ) : (
                    <div className="space-y-4 font-sans">
                      {foodOrders.map((order) => {
                        const statusSteps = ['Pending', 'Preparing', 'On the way', 'Delivered'];
                        const currentStepIndex = statusSteps.indexOf(order.status);
                        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        return (
                          <div key={order._id} className="p-5 bg-white border border-outline-variant/30 rounded-xl space-y-4 font-sans">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-3 border-b border-outline-variant/20">
                              <div>
                                <h4 className="font-semibold text-sm text-on-surface">{order.hotel?.name || 'Hotel stay'}</h4>
                                <p className="text-[10px] text-on-surface-variant mt-0.5">
                                  Ordered on {orderDate} • Delivery to <strong>Room {order.roomNumber}</strong>
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-sm text-primary font-sans">${order.totalPrice}</span>
                                <span className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-full tracking-wider ${
                                  order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                                  order.status === 'On the way' ? 'bg-purple-100 text-purple-800' :
                                  order.status === 'Preparing' ? 'bg-blue-100 text-blue-800' :
                                  'bg-amber-100 text-amber-800 animate-pulse'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>

                            {/* Order Items List */}
                            <div className="text-xs text-on-surface-variant space-y-1 pl-1 font-sans">
                              {order.items.map((item, idx) => (
                                <p key={idx}>
                                  <span className="font-bold text-on-surface">{item.quantity}x</span> {item.name} (${item.price}/ea)
                                </p>
                              ))}
                            </div>

                            {/* Live Delivery Progress Tracker */}
                            <div className="pt-2 font-sans">
                              <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                                <span className={currentStepIndex >= 0 ? 'text-primary' : ''}>1. Received</span>
                                <span className={currentStepIndex >= 1 ? 'text-primary' : ''}>2. Kitchen</span>
                                <span className={currentStepIndex >= 2 ? 'text-primary' : ''}>3. Delivery</span>
                                <span className={currentStepIndex >= 3 ? 'text-emerald-600 font-extrabold' : ''}>4. Arrived</span>
                              </div>
                              
                              {/* Progress bar container */}
                              <div className="relative w-full h-2 bg-surface-container rounded-full overflow-hidden">
                                <div 
                                  className={`absolute top-0 left-0 h-full transition-all duration-1000 rounded-full ${
                                    order.status === 'Delivered' ? 'bg-emerald-500' : 'bg-primary'
                                  }`}
                                  style={{ width: `${(currentStepIndex / 3) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
