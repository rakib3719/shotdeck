'use client'
import React, { useState } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState({
    siteName: 'My Website',
    logo: null,
    logoPreview: '',
    primaryColor: '#3b82f6',
    darkMode: false,
    maintenanceMode: false,
    contactEmail: 'contact@example.com',
    seoDescription: 'A professional website built with React',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({
          ...prev,
          logo: file,
          logoPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the settings to your backend
    console.log('Settings saved:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-28 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Website Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Site Name */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-1">
            <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Site Name
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">The name displayed across your website</p>
          </div>
          <div className="md:col-span-2">
            <input
              type="text"
              id="siteName"
              name="siteName"
              value={settings.siteName}
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
          <div className="md:col-span-2 flex items-center space-x-4">
            {settings.logoPreview ? (
              <img src={settings.logoPreview} alt="Logo preview" className="h-12 object-contain" />
            ) : (
              <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
                No logo uploaded
              </div>
            )}
            <label className="cursor-pointer">
              <span className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
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

        {/* Primary Color */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-1">
            <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Primary Color
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">Main brand color for your site</p>
          </div>
          <div className="md:col-span-2 flex items-center space-x-4">
            <input
              type="color"
              id="primaryColor"
              name="primaryColor"
              value={settings.primaryColor}
              onChange={handleChange}
              className="h-10 w-16 cursor-pointer"
            />
            <span className="text-gray-600 dark:text-gray-300">{settings.primaryColor}</span>
          </div>
        </div>

        {/* Toggle Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Display Options
            </label>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="darkMode"
                name="darkMode"
                checked={settings.darkMode}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="darkMode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Enable Dark Mode
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenanceMode"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Maintenance Mode
              </label>
            </div>
          </div>
        </div>

        {/* Contact Email */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
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
        </div>

        {/* SEO Description */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-1">
            <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              SEO Description
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">Brief description for search engines</p>
          </div>
          <div className="md:col-span-2">
            <textarea
              id="seoDescription"
              name="seoDescription"
              value={settings.seoDescription}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            style={{ backgroundColor: settings.primaryColor }}
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}