'use client'
import { useGetSingleUserQuery } from '@/redux/api/users';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSecureAxios } from '@/utils/Axios';
import Swal from 'sweetalert2';

export default function Account() {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const { data, isLoading } = useGetSingleUserQuery(token || "");
  const userData = data?.data;
  const axiosInstence = useSecureAxios();

  // Form states
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Initialize form data when userData is loaded
  React.useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || ''
      });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async(e) => {
    e.preventDefault();
    console.log('Profile data to save:', formData);


    try {
      
      const data = await axiosInstence.patch(`/user/update`, formData);
       Swal.fire({
      title: 'Profile Updated',
      text: 'Profile changes have been saved',
      icon: 'success'
    });
      console.log(data)
    } catch (error) {
        Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || error.message || 'Failed to change password',
        icon: 'error'
      });
      
    }

    // Here you would typically make an API call to update the profile
    // For now, we'll just log it to the console
   
    setEditMode(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstence.post('/user/change-password', passwordData);
      console.log(response);
      Swal.fire({
        title: 'Success',
        text: response?.data?.message || 'Password Changed Successfully',
        icon: 'success'
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || error.message || 'Failed to change password',
        icon: 'error'
      });
    }
    
    // Reset form and close modal
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordModal(false);
  };

  return (
    <div className='min-h-screen'>
      <h2 className='text-2xl text-center pt-8'>Account</h2>

      <form 
        className='mx-auto mt-12 flex justify-center flex-col space-y-4 max-w-2xl px-4'
        onSubmit={handleSaveProfile}
      >
        <div className='text-center'>
          <button 
            type="button" 
            className='text-primary cursor-pointer'
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className='relative'>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className='bg-[#333333] pl-24 pr-3 py-2 w-full focus:outline-0'
            readOnly={!editMode}
          />
          <label className='absolute left-3 top-2 px-1 text-[#999]'>
            Name
          </label>
        </div>

        <div className='relative'>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className='bg-[#333333] pl-24 pr-3 py-2 w-full focus:outline-0'
            readOnly={!editMode}
          />
          <label className='absolute left-3 top-2 px-1 text-[#999]'>
            Email
          </label>
        </div>

        <div className='relative'>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className='bg-[#333333] pl-24 pr-3 py-2 w-full focus:outline-0'
            readOnly={!editMode}
          />
          <label className='absolute left-3 top-2 px-1 text-[#999]'>
            Phone
          </label>
        </div>

        <div className='relative'>
          <input
            type="password"
            name="password"
            value={'*************'}
            className='bg-[#333333] px-3 py-2 w-full focus:outline-0 cursor-pointer'
            readOnly
            placeholder='*************'
            onClick={() => setShowPasswordModal(true)}
          />
          <label className='absolute left-3 top-2 px-1 text-[#999]'>
            Password
          </label>
          <span 
            className='absolute right-3 top-2 text-primary text-sm cursor-pointer'
            onClick={() => setShowPasswordModal(true)}
          >
            Change
          </span>
        </div>

        {editMode && (
          <div className='flex justify-center pt-4'>
            <button
              type="submit"
              className='px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors'
            >
              Save Changes
            </button>
          </div>
        )}
      </form>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              className="bg-[#333333] rounded-lg p-6 w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Change Password</h3>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className='relative'>
                  <input
                    type="password"
                    name="oldPassword"
                    placeholder="Old Password"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 bg-[#444444] rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div className='relative'>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 bg-[#444444] rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                    minLength={6}
                  />
                </div>

                <div className='relative'>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 bg-[#444444] rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                    minLength={6}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 text-sm text-white bg-gray-600 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm text-white bg-primary rounded hover:bg-primary-dark"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}