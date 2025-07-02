'use client';

// pages/send-emails.tsx or app/send-emails/page.tsx (depending on your Next.js version)
import { useState, useEffect } from 'react';
import { database } from './lib/firebase'; // Adjust path as needed
import { ref, set, get, onValue } from 'firebase/database';

interface EmailCategoryData {
  emails: string;
  subject: string;
  message: string;
  files: File[];
}

interface SendResponse {
  success: boolean;
  message: string;
  successCount?: number;
  failedEmails?: string[];
}

const EMAIL_CATEGORIES = [
  'Carpark',
  'Community Centres',
  'Sports Facilities',
  'Churches and Places of Worship',
  'Recycling Centers or Waste Disposal Sites'
] as const;

type EmailCategory = typeof EMAIL_CATEGORIES[number];

export default function SendEmails() {
  const [emailCategories, setEmailCategories] = useState<Record<EmailCategory, EmailCategoryData>>(() => {
    const initialState: Record<EmailCategory, EmailCategoryData> = {} as any;
    EMAIL_CATEGORIES.forEach(category => {
      initialState[category] = {
        emails: '',
        subject: '',
        message: '',
        files: []
      };
    });
    return initialState;
  });

  const [selectedCategories, setSelectedCategories] = useState<Set<EmailCategory>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<Record<EmailCategory, SendResponse>>({} as any);
  const [editingCategory, setEditingCategory] = useState<EmailCategory | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);

  // Load templates from Firebase on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templatesRef = ref(database, 'emailTemplates');
        const snapshot = await get(templatesRef);
        
        if (snapshot.exists()) {
          const templates = snapshot.val();
          console.log('Loaded templates from Firebase:', templates);
          
          setEmailCategories(prev => {
            const updated = { ...prev };
            EMAIL_CATEGORIES.forEach(category => {
              if (templates[category]) {
                updated[category] = {
                  ...prev[category],
                  emails: templates[category].emails || prev[category].emails,
                  subject: templates[category].subject || prev[category].subject,
                  message: templates[category].message || prev[category].message,
                };
              }
            });
            return updated;
          });
        } else {
          // No templates exist, save default templates
          await saveDefaultTemplates();
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        // Fallback to default templates
        await saveDefaultTemplates();
      } finally {
        setTemplatesLoaded(true);
      }
    };

    loadTemplates();
  }, []);

  // Save default templates to Firebase
  const saveDefaultTemplates = async () => {
    const defaultTemplates = {
      'Carpark': {
        emails: 'gytis.kondze@gmail.com',
        subject: 'Transform Your Car Park Into a Hub for Sustainability - and Earn Extra Income',
        message: `We are reaching out to propose placing one of our textile clothing banks within your car park premises. Your location is ideal due to its accessibility and visibility, and it would allow us to make regular collections to ensure the unit remains clean, tidy, and never negatively impacts the appearance of the area. Our team handles all maintenance and servicing so the site remains well-presented at all times.

As part of our partnerships, we offer a reasonable monthly payment per textile bank, providing your premises with a consistent income stream while supporting a sustainable, community-driven initiative. We believe this is a great opportunity to generate additional revenue while promoting environmentally responsible textile recycling.

We would love to work with you and believe this could be the beginning of a positive, long-term partnership. If you are open to this proposal, we'd be happy to provide more details and arrange a simple agreement to get started.`
      },
      'Community Centres': {
        emails: 'gytis.kondze@gmail.com',
        subject: 'Support Your Community Centre\'s Mission - And Benefit From a New Income Stream',
        message: `We would like to propose placing one of our textile clothing banks at your community centre. Your site is a hub for local residents and provides the perfect location to encourage convenient clothing donations, while we ensure regular collections to keep the area clean and visually appealing. Our team manages all upkeep and monitoring of the bank.

To support the partnership, we offer a fair and consistent monthly payment per bank, offering your centre additional income while supporting an environmentally conscious cause. This initiative aligns with many community values—promoting sustainability, reuse, and local engagement.

We hope to build a long-term, positive partnership and would love the opportunity to discuss next steps and provide a simple agreement to begin working together.`
      },
      'Sports Facilities': {
        emails: 'gytis.kondze@gmail.com',
        subject: 'Score Extra Income for Your Sports Facility - With a Simple Sustainability Project',
        message: `We are proposing to install one of our textile clothing banks at your sports facility. With regular footfall and a strong community presence, your location offers a great opportunity for clothing recycling. We take full responsibility for maintenance and collections, ensuring the area remains clean and presentable at all times.

In return, we offer a reasonable monthly payment per textile bank, providing a steady income for your facility while contributing to a greener, more sustainable future. The initiative requires no effort from your team and has proven to be a simple and effective way to support environmental efforts.

We'd welcome the opportunity to partner with you and would be happy to provide more details and a straightforward agreement should you wish to proceed.`
      },
      'Churches and Places of Worship': {
        emails: 'gytis.kondze@gmail.com',
        subject: 'Support Your Church\'s Good Work - With a Sustainable Clothing Donation Point',
        message: `We would like to place a textile clothing bank at your church premises to support local textile recycling. The church is a trusted space for many in the community, and your location offers a meaningful opportunity to encourage responsible donation. We handle all servicing and collections to keep the area respectful and clean.

As part of our agreement, we provide a modest but consistent monthly contribution per clothing bank, offering a valuable addition to your church's funds while advancing an eco-friendly mission. The bank will be managed entirely by our team, with no disruption to your usual activities.

We'd be delighted to work together on this initiative and can offer a simple agreement to get started whenever convenient for you.`
      },
      'Recycling Centers or Waste Disposal Sites': {
        emails: 'gytis.kondze@gmail.com',
        subject: 'A Simple Way to Support Your Mission and Earn Extra Funds',
        message: `We would like to propose placing one of our textile clothing banks at your place of worship. As a respected and well-visited community location, your premises are ideal for encouraging clothing donations in a way that aligns with charitable and environmental values. Our team handles all servicing to ensure cleanliness and minimal visual impact.

In appreciation of the partnership, we offer a reasonable monthly payment per clothing bank. This provides a steady source of additional funds while supporting sustainable, ethical recycling practices that benefit both the community and the environment.

If this is of interest, we'd be happy to move forward with a straightforward agreement and begin what we hope will be a positive and lasting partnership.`
      }
    };

    try {
      const templatesRef = ref(database, 'emailTemplates');
      await set(templatesRef, defaultTemplates);
      console.log('Default templates saved to Firebase');
      
      setEmailCategories(prev => {
        const updated = { ...prev };
        EMAIL_CATEGORIES.forEach(category => {
          updated[category] = {
            ...prev[category],
            ...defaultTemplates[category],
          };
        });
        return updated;
      });
    } catch (error) {
      console.error('Error saving default templates:', error);
    }
  };

  // Save template to Firebase
  const saveTemplate = async (category: EmailCategory) => {
    setIsSavingTemplate(true);
    try {
      const templateData = {
        emails: emailCategories[category].emails,
        subject: emailCategories[category].subject,
        message: emailCategories[category].message,
        lastUpdated: new Date().toISOString()
      };

      const templateRef = ref(database, `emailTemplates/${category}`);
      await set(templateRef, templateData);
      
      console.log(`Template saved for ${category}`);
      setEditingCategory(null);
      
      // Show success message
      setResponses(prev => ({
        ...prev,
        [category]: {
          success: true,
          message: 'Template saved successfully!'
        }
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setResponses(prev => {
          const updated = { ...prev };
          if (updated[category]?.message === 'Template saved successfully!') {
            delete updated[category];
          }
          return updated;
        });
      }, 3000);
      
    } catch (error) {
      console.error('Error saving template:', error);
      setResponses(prev => ({
        ...prev,
        [category]: {
          success: false,
          message: 'Failed to save template. Please try again.'
        }
      }));
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleInputChange = (
    category: EmailCategory,
    field: keyof Omit<EmailCategoryData, 'files'>,
    value: string
  ) => {
    setEmailCategories(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleFileChange = (category: EmailCategory, files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setEmailCategories(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          files: fileArray
        }
      }));
    }
  };

  const removeFile = (category: EmailCategory, fileIndex: number) => {
    setEmailCategories(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        files: prev[category].files.filter((_, index) => index !== fileIndex)
      }
    }));
  };

  const toggleCategorySelection = (category: EmailCategory) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const getEmailCount = (category: EmailCategory) => {
    return emailCategories[category].emails
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0).length;
  };

  const handleSendEmails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponses({} as any);

    const categoriesToSend = Array.from(selectedCategories);
    
    if (categoriesToSend.length === 0) {
      setResponses({
        [EMAIL_CATEGORIES[0]]: {
          success: false,
          message: 'Please select at least one category to send emails to'
        }
      } as any);
      setIsLoading(false);
      return;
    }

    const newResponses: Record<EmailCategory, SendResponse> = {} as any;

    for (const category of categoriesToSend) {
      const categoryData = emailCategories[category];
      
      try {
        const emailList = categoryData.emails
          .split(',')
          .map(email => email.trim())
          .filter(email => email.length > 0);

        if (emailList.length === 0) {
          newResponses[category] = {
            success: false,
            message: 'Please enter at least one email address'
          };
          continue;
        }

        // Create FormData for file uploads
        const formData = new FormData();
        formData.append('emails', JSON.stringify(emailList));
        formData.append('subject', categoryData.subject);
        formData.append('message', categoryData.message);
        formData.append('category', category);

        // Append files
        categoryData.files.forEach((file, index) => {
          formData.append(`file_${index}`, file);
        });

        const res = await fetch('/api/send-emails', {
          method: 'POST',
          body: formData, // Use FormData instead of JSON for file uploads
        });

        const data: SendResponse = await res.json();
        newResponses[category] = data;
      } catch (error) {
        newResponses[category] = {
          success: false,
          message: 'Failed to send emails. Please try again.'
        };
      }
    }

    setResponses(newResponses);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Targeted Bulk Email Sender
          </h1>

          {/* Loading indicator */}
          {!templatesLoaded && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-800">Loading email templates from database...</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSendEmails} className="space-y-8">
            {/* Category Selection */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Select Categories to Send Emails
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {EMAIL_CATEGORIES.map(category => (
                  <label
                    key={category}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCategories.has(category)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(category)}
                      onChange={() => toggleCategorySelection(category)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {category}
                      {getEmailCount(category) > 0 && (
                        <span className="ml-2 text-blue-600 text-xs">
                          ({getEmailCount(category)} email{getEmailCount(category) !== 1 ? 's' : ''})
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Email Categories */}
            <div className="space-y-8">
              {EMAIL_CATEGORIES.map(category => (
                <div
                  key={category}
                  className={`border rounded-lg p-6 transition-opacity ${
                    selectedCategories.has(category) ? 'border-blue-300' : 'border-gray-200 opacity-60'
                  }`}
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                      {category}
                      {selectedCategories.has(category) && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingCategory === category ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveTemplate(category)}
                            disabled={isSavingTemplate}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                          >
                            {isSavingTemplate ? (
                              <>
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                              </>
                            ) : (
                              '💾 Save Template'
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            className="px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingCategory(category)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 flex items-center gap-1"
                        >
                          ✏️ Edit Template
                        </button>
                      )}
                    </div>
                  </h3>

                  <div className="space-y-6">
                    {/* Email Recipients */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Recipients
                        {getEmailCount(category) > 0 && (
                          <span className="ml-2 text-blue-600 text-xs">
                            ({getEmailCount(category)} email{getEmailCount(category) !== 1 ? 's' : ''})
                          </span>
                        )}
                      </label>
                      <textarea
                        disabled={editingCategory === category}
                        rows={4}
                        value={emailCategories[category].emails}
                        onChange={(e) => handleInputChange(category, 'emails', e.target.value)}
                        placeholder="Enter email addresses separated by commas (e.g., email1@example.com, email2@example.com, email3@example.com)"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          editingCategory === category ? 'bg-yellow-50 border-yellow-300' : ''
                        }`}
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        disabled={editingCategory === category}
                        type="text"
                        value={emailCategories[category].subject}
                        onChange={(e) => handleInputChange(category, 'subject', e.target.value)}
                        placeholder="Enter email subject"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          editingCategory === category ? 'bg-yellow-50 border-yellow-300' : ''
                        }`}
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        disabled={editingCategory === category}
                        rows={8}
                        value={emailCategories[category].message}
                        onChange={(e) => handleInputChange(category, 'message', e.target.value)}
                        placeholder="Enter your email message"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          editingCategory === category ? 'bg-yellow-50 border-yellow-300' : ''
                        }`}
                      />
                    </div>

                    {/* File Attachments */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        File Attachments
                      </label>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileChange(category, e.target.files)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {emailCategories[category].files.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm text-gray-600">Selected files:</p>
                          {emailCategories[category].files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                              <span className="text-sm truncate">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeFile(category, index)}
                                className="text-red-600 hover:text-red-800 ml-2 font-bold"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Response for this category */}
                  {responses[category] && (
                    <div className={`mt-4 p-4 rounded-md ${
                      responses[category].success 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className={`text-sm ${
                        responses[category].success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        <p className="font-medium">{responses[category].message}</p>
                        {responses[category].successCount && (
                          <p className="mt-1">Successfully sent to {responses[category].successCount} recipients</p>
                        )}
                        {responses[category].failedEmails && responses[category].failedEmails!.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium">Failed to send to:</p>
                            <ul className="list-disc list-inside mt-1">
                              {responses[category].failedEmails!.map((email, index) => (
                                <li key={index}>{email}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Send Button */}
            <div className="border-t border-gray-200 pt-6">
              <button
                type="submit"
                disabled={isLoading || selectedCategories.size === 0}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading 
                  ? 'Sending...' 
                  : `Send Emails to ${selectedCategories.size} Selected Categories`
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}