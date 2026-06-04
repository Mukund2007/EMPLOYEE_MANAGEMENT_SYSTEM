import { useState } from 'react';
import { request } from '../services/api';

export const useEmployees = (showNotification) => {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [linkRequests, setLinkRequests] = useState([]);
  const [myLinkRequest, setMyLinkRequest] = useState(null);

  const fetchEmployees = async (page = 0, size = 1000, sortBy = 'name', order = 'asc') => {
    setLoading(true);
    try {
      const data = await request(`/employees?page=${page}&size=${size}&sortBy=${sortBy}&order=${order}`);
      // Page response contains content field
      setEmployees(data.content || data);
    } catch (err) {
      if (showNotification) {
        showNotification(err.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await request('/employees/stats');
      setStats(data);
    } catch (err) {
      if (showNotification) {
        showNotification(err.message, 'error');
      }
    }
  };

  const fetchMyProfile = async () => {
    try {
      const data = await request('/employees/me');
      setMyProfile(data);
    } catch (err) {
      // It is normal if user has no linked profile yet, don't show loud error
      setMyProfile(null);
    }
  };

  const addEmployee = async (employeeData) => {
    setSubmitting(true);
    try {
      const data = await request('/employees', {
        method: 'POST',
        body: JSON.stringify(employeeData)
      });
      showNotification('Employee profile created successfully');
      return data;
    } catch (err) {
      if (showNotification) {
        showNotification(err.message, 'error');
      }
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const updateEmployee = async (id, employeeData) => {
    setSubmitting(true);
    try {
      const data = await request(`/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(employeeData)
      });
      showNotification('Employee profile updated successfully');
      return data;
    } catch (err) {
      if (showNotification) {
        showNotification(err.message, 'error');
      }
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await request(`/employees/${id}`, {
        method: 'DELETE'
      });
      showNotification('Employee soft-deleted successfully');
    } catch (err) {
      if (showNotification) {
        showNotification(err.message, 'error');
      }
      throw err;
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    setSubmitting(true);
    try {
      await request('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ oldPassword, newPassword })
      });
      showNotification('Password updated successfully');
    } catch (err) {
      if (showNotification) {
        showNotification(err.message, 'error');
      }
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Leaves CRUD Operations
  const fetchLeaves = async (employeeId = null) => {
    try {
      const url = employeeId === 'me'
        ? '/leaves/me'
        : employeeId
          ? `/leaves/employee/${employeeId}`
          : '/leaves';
      const data = await request(url);
      setLeaves(data || []);
    } catch (err) {
      if (showNotification) {
        showNotification(err.message, 'error');
      }
    }
  };

  const createLeave = async (leaveData) => {
    setSubmitting(true);
    try {
      const data = await request('/leaves', {
        method: 'POST',
        body: JSON.stringify(leaveData)
      });
      showNotification('Leave request submitted successfully');
      return data;
    } catch (err) {
      if (showNotification) {
        showNotification(err.message, 'error');
      }
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const updateLeaveStatus = async (id, status) => {
    try {
      const data = await request(`/leaves/${id}/status?status=${status}`, {
        method: 'PUT'
      });
      showNotification(`Leave request ${status.toLowerCase()} successfully`);
      return data;
    } catch (err) {
      if (showNotification) {
        showNotification(err.message, 'error');
      }
      throw err;
    }
  };

  const fetchLinkRequests = async () => {
    try {
      const data = await request('/link-requests');
      setLinkRequests(data || []);
    } catch (err) {
      if (showNotification) {
        showNotification(err.message, 'error');
      }
    }
  };

  const fetchMyLinkRequest = async () => {
    try {
      const data = await request('/link-requests/me');
      setMyLinkRequest(data);
    } catch (err) {
      setMyLinkRequest(null);
    }
  };

  const createLinkRequest = async (message) => {
    setSubmitting(true);
    try {
      const data = await request('/link-requests', {
        method: 'POST',
        body: JSON.stringify({ message })
      });
      showNotification('Account link request submitted successfully');
      setMyLinkRequest(data);
      return data;
    } catch (err) {
      if (showNotification) {
        showNotification(err.message, 'error');
      }
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const linkUserToEmployee = async (id, employeeId) => {
    try {
      const data = await request(`/link-requests/${id}/link?employeeId=${employeeId}`, {
        method: 'PUT'
      });
      showNotification('Account linked successfully');
      fetchLinkRequests();
      return data;
    } catch (err) {
      if (showNotification) {
        showNotification(err.message, 'error');
      }
      throw err;
    }
  };

  const dismissLinkRequest = async (id) => {
    try {
      const data = await request(`/link-requests/${id}/dismiss`, {
        method: 'PUT'
      });
      showNotification('Request dismissed');
      fetchLinkRequests();
      return data;
    } catch (err) {
      if (showNotification) {
        showNotification(err.message, 'error');
      }
      throw err;
    }
  };

  return {
    employees,
    stats,
    leaves,
    myProfile,
    loading,
    submitting,
    linkRequests,
    myLinkRequest,
    fetchEmployees,
    fetchStats,
    fetchMyProfile,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    changePassword,
    fetchLeaves,
    createLeave,
    updateLeaveStatus,
    fetchLinkRequests,
    fetchMyLinkRequest,
    createLinkRequest,
    linkUserToEmployee,
    dismissLinkRequest
  };
};
