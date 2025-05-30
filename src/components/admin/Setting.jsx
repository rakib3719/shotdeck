'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSecureAxios } from '@/utils/Axios';
import Swal from 'sweetalert2';
import { useGetSettingQuery } from '@/redux/api/shot';

export default function Settings() {
  const axiosInstance = useSecureAxios();
  const { data } = useGetSettingQuery();
  console.log(data?.data[0], 'This is settings data');
  const prevSettings = data?.data[0];

  // Initialize state with default values or prevSettings, using schema field names
  const [settings, setSettings] = useState({
    websiteName: prevSettings?.websiteName || 'My Website',
    logo: null,
    logoPreview: prevSettings?.logo || '',
    coverphoto: [],
    coverphotoPreviews: prevSettings?.coverphoto || [],
    coverHeading: prevSettings?.coverHeading || '',
    coverDescription: prevSettings?.coverDescription || '',
    footerText: prevSettings?.footerText || '',
    contactEmail: prevSettings?.contactEmail || 'contact@example.com',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Update settings when prevSettings changes
  useEffect(() => {
    if (prevSettings) {
      setSettings((prev) => ({
        ...prev,
        websiteName: prevSettings.websiteName || prev.websiteName,
        logo: null, // File inputs can't be pre-set for security reasons
        logoPreview: prevSettings.logo || prev.logoPreview,
        coverphoto: [], // File inputs can't be pre-set
        coverphotoPreviews: prevSettings.coverphoto || prev.coverphotoPreviews,
        coverHeading: prevSettings.coverHeading || prev.coverHeading,
        coverDescription: prevSettings.coverDescription || prev.coverDescription,
        footerText: prevSettings.footerText || prev.footerText,
        contactEmail: prevSettings.contactEmail || prev.contactEmail,
      }));
    }
  }, [prevSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings((prev) => ({
          ...prev,
          logo: file,
          logoPreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const previews = [];
      const readers = files.map((file) => {
        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onloadend = () => {
            previews.push(reader.result);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(() => {
        setSettings((prev) => ({
          ...prev,
          coverphoto: files,
          coverphotoPreviews: previews,
        }));
      });
    }
  };

  const resetForm = () => {
    setSettings({
      websiteName: prevSettings?.websiteName || 'My Website',
      logo: null,
      logoPreview: prevSettings?.logo || '',
      coverphoto: [],
      coverphotoPreviews: prevSettings?.coverphoto || [],
      coverHeading: prevSettings?.coverHeading || '',
      coverDescription: prevSettings?.coverDescription || '',
      footerText: prevSettings?.footerText || '',
      contactEmail: prevSettings?.contactEmail || 'contact@example.com',
    });
    setUploadProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const uploadedUrls = {
        logo: settings.logo ? null : prevSettings?.logo || null, // Retain previous logo URL if no new logo is uploaded
        coverphoto: settings.coverphoto.length > 0 ? [] : prevSettings?.coverphoto || [], // Retain previous cover photo URLs if no new photos are uploaded
      };

      // Upload logo if exists
      if (settings.logo) {
        const formDataLogo = new FormData();
        formDataLogo.append('file', settings.logo);
        formDataLogo.append('upload_preset', 'e-paper');
        formDataLogo.append('cloud_name', 'djf8l2ahy');

        const logoResp = await axios.post(
          'https://api.cloudinary.com/v1_1/djf8l2ahy/image/upload',
          formDataLogo,
          {
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 50) / progressEvent.total);
              setUploadProgress(progress);
            },
          }
        );
        uploadedUrls.logo = logoResp.data.secure_url;
      }

      // Upload cover photos if exist
      if (settings.coverphoto.length > 0) {
        const uploadPromises = settings.coverphoto.map(async (photo, index) => {
          const formDataCover = new FormData();
          formDataCover.append('file', photo);
          formDataCover.append('upload_preset', 'e-paper');
          formDataCover.append('cloud_name', 'djf8l2ahy');

          const coverResp = await axios.post(
            'https://api.cloudinary.com/v1_1/djf8l2ahy/image/upload',
            formDataCover,
            {
              onUploadProgress: (progressEvent) => {
                const progress = 50 + Math.round((progressEvent.loaded * 50) / (progressEvent.total * settings.coverphoto.length));
                setUploadProgress(progress);
              },
            }
          );
          return coverResp.data.secure_url;
        });

        uploadedUrls.coverphoto = await Promise.all(uploadPromises);
      }

      // Prepare data for the backend, matching the schema field names
      const settingsData = {
        id:prevSettings?._id,
        websiteName: settings.websiteName || prevSettings?.websiteName || 'My Website',
        logo: uploadedUrls.logo || prevSettings?.logo || null,
        coverphoto: uploadedUrls.coverphoto.length > 0 ? uploadedUrls.coverphoto : prevSettings?.coverphoto || [],
        coverHeading: settings.coverHeading || prevSettings?.coverHeading || '',
        coverDescription: settings.coverDescription || prevSettings?.coverDescription || '',
        footerText: settings.footerText || prevSettings?.footerText || '',
        contactEmail: settings.contactEmail || prevSettings?.contactEmail || 'contact@example.com',
      };

      // Log the uploaded URLs
      console.log('Uploaded URLs:', uploadedUrls);

      // Log settings (excluding file blobs for readability)
      const settingsToLog = {
        id:prevSettings?._id,
        websiteName: settingsData.websiteName,
        logo: settings.logo ? settings.logo.name : null,
        logoUrl: settingsData.logo,
        coverphoto: settings.coverphoto.map((file) => file.name),
        coverPhotoUrls: settingsData.coverphoto,
        coverHeading: settingsData.coverHeading,
        coverDescription: settingsData.coverDescription,
        footerText: settingsData.footerText,
        contactEmail: settingsData.contactEmail,
      };
      console.log('Settings to save:', settingsToLog);

      // Send data to the backend
      const response = await axiosInstance.patch('/shot/website', settingsData);
      console.log('Update response:', response.data);

      // Show success notification
      await Swal.fire({
        title: 'Success',
        text: 'Settings Saved Successfully!',
        icon: 'success',
      });

      // Show additional notification for approval (if needed)
      // await Swal.fire({
      //   title: 'Settings added successfully',
      //   text: 'Settings Saved Successfully, waiting for approval',
      //   icon: 'success',
      // });

      // Reset the form
      resetForm();
    } catch (error) {
      console.error('Upload or save error:', error);
      await Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || error.message || 'Failed to save settings',
        icon: 'error',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-28 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Website Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Website Name */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-1">
            <label htmlFor="websiteName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Website Name
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">The name displayed across your website</p>
          </div>
          <div className="md:col-span-2">
            <input
              type="text"
              id="websiteName"
              name="websiteName"
              value={settings.websiteName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Logo Upload */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-1">
            <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Site Logo
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">Recommended size: 200x50 pixels</p>
          </div>
          <div className="md:col-span-2 md:flex items-center space-x-4">
            {settings.logoPreview ? (
              <img src={settings.logoPreview} alt="Logo preview" className="h-12 object-contain" />
            ) : (
              <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
                No logo uploaded
              </div>
            )}
            <label className="cursor-pointer">
              <span className="px-4  py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Upload Logo
              </span>
              <input
                type="file"
                id="logo"
                name="logo"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Cover Photo Upload */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-1">
            <label htmlFor="coverphoto" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cover Photos
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">Upload multiple cover images</p>
          </div>
          <div className="md:col-span-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {settings.coverphotoPreviews.length > 0 ? (
                settings.coverphotoPreviews.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Cover photo preview ${index + 1}`}
                    className="h-16 w-16 object-cover rounded-md"
                  />
                ))
              ) : (
                <div className="h-16 w-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
                  No cover photos uploaded
                </div>
              )}
            </div>
            <label className="cursor-pointer">
              <span className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Upload Cover Photos
              </span>
              <input
                type="file"
                id="coverphoto"
                name="coverphoto"
                accept="image/*"
                multiple
                onChange={handleCoverPhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        {/* Cover Heading */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-1">
            <label htmlFor="coverHeading" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cover Heading
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">Main heading for the cover section</p>
          </div>
          <div className="md:col-span-2">
            <input
              type="text"
              id="coverHeading"
              name="coverHeading"
              value={settings.coverHeading}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Cover Description */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-1">
            <label htmlFor="coverDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cover Description
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">Description for the cover section</p>
          </div>
          <div className="md:col-span-2">
            <textarea
              id="coverDescription"
              name="coverDescription"
              value={settings.coverDescription}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Footer Text */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-1">
            <label htmlFor="footerText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Footer Text
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">Text displayed in the website footer</p>
          </div>
          <div className="md:col-span-2">
            <textarea
              id="footerText"
              name="footerText"
              value={settings.footerText}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Contact Email */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-1">
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contact Email
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">For user inquiries and notifications</p>
          </div>
          <div className="md:col-span-2">
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={settings.contactEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div> */}

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isUploading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUploading ? 'Uploading...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}