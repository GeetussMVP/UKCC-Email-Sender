'use client';

// pages/send-emails.tsx or app/send-emails/page.tsx (depending on your Next.js version)
import { useState, useEffect } from 'react';
import { database } from './lib/firebase'; // Adjust path as needed
import { ref, set, get } from 'firebase/database';

interface EmailCategoryData {
  emails: string;
  subject: string;
  message: string;
  files: File[];
}

interface EmailTemplate {
  emails: string;
  subject: string;
  message: string;
  lastUpdated?: string;
  createdAt?: string;
}

interface DatabaseTemplate extends EmailTemplate {
  childrenWithCancerImage?: string;
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
  const [fontSize, setFontSize] = useState('text-lg');
  const [fontFamily, setFontFamily] = useState('font-sans');
  const [childrenWithCancerImage, setChildrenWithCancerImage] = useState<string>('');
  const [imageUploading, setImageUploading] = useState(false);

  // Default templates that will be saved to Firebase
  const getDefaultTemplates = () => {
    return {
      'Carpark': {
        emails: 'gytis.kondze@gmail.com',
        subject: 'Transform Your Car Park Into a Hub for Sustainability - and Earn Extra Income',
        message: `🌟 Hello! We hope this message finds you well! 

We are reaching out to propose placing one of our textile clothing banks within your car park premises. Your location is ideal due to its accessibility and visibility! 📍✨

🔧 Our team handles ALL maintenance and servicing so the site remains well-presented at all times - no hassle for you! We make regular collections to ensure the unit stays clean, tidy, and never negatively impacts your area's appearance. 🧹✨

💰 As part of our partnerships, we offer a reasonable monthly payment per textile bank, providing your premises with a consistent income stream! 💳 This supports both sustainable initiatives AND generates additional revenue - it's a win-win! 🎯

🌱 You'll be promoting environmentally responsible textile recycling while supporting amazing charitable causes! Every donation makes a real difference to families in need. 💚

🤝 We would love to work with you and believe this could be the beginning of a positive, long-term partnership! If you're interested, we'd be happy to provide more details and arrange a simple agreement to get started. 📋

Looking forward to hearing from you! 😊`
      },
      'Community Centres': {
        emails: 'gytis.kondze@gmail.com',
        subject: 'Support Your Community Centre\'s Mission - And Benefit From a New Income Stream',
        message: `🏢 Hello from our team! 

We would like to propose placing one of our textile clothing banks at your community centre! Your site is a perfect hub for local residents and provides an ideal location to encourage convenient clothing donations. 🎯

🛠️ Don't worry about maintenance - our team manages ALL upkeep and monitoring of the bank! We ensure regular collections to keep the area clean and visually appealing at all times. ✨

💡 To support this partnership, we offer a fair and consistent monthly payment per bank! 💳 This means additional income for your centre while supporting an environmentally conscious cause. 🌍

♻️ This initiative perfectly aligns with community values - promoting sustainability, reuse, and local engagement! Your community members will love having a convenient way to donate while supporting charity! 💝

🌟 We hope to build a long-term, positive partnership and would love the opportunity to discuss next steps! We can provide a simple agreement to begin working together. 📝

Thanks for considering this opportunity! 🙏`
      },
      'Sports Facilities': {
        emails: 'gytis.kondze@gmail.com',
        subject: 'Score Extra Income for Your Sports Facility - With a Simple Sustainability Project',
        message: `⚽ Greetings from our team!

We are proposing to install one of our textile clothing banks at your sports facility! With your regular footfall and strong community presence, your location offers a fantastic opportunity for clothing recycling! 🏆

💪 We take FULL responsibility for maintenance and collections, ensuring the area remains clean and presentable at all times! Zero effort required from your team - we handle everything! 🔧✨

🌱 In return, we offer a reasonable monthly payment per textile bank! This provides steady income for your facility while contributing to a greener, more sustainable future! 💰

🎯 This initiative has proven to be simple and effective for supporting environmental efforts - plus your members will appreciate the convenient donation option! 👥💚

📞 We'd welcome the opportunity to partner with you and would be happy to provide more details plus a straightforward agreement if you wish to proceed!

Game on for sustainability! 🏃‍♂️🌍`
      },
      'Churches and Places of Worship': {
        emails: 'gytis.kondze@gmail.com',
        subject: 'Support Your Church\'s Good Work - With a Sustainable Clothing Donation Point',
        message: `🙏 Blessings and greetings!

We would like to place a textile clothing bank at your church premises to support local textile recycling! ⛪ The church is a trusted space for many in the community, offering a meaningful opportunity to encourage responsible donation.

🕊️ We handle ALL servicing and collections to keep the area respectful and clean - maintaining the peaceful atmosphere of your sacred space! ✨

💝 As part of our agreement, we provide a modest but consistent monthly contribution per clothing bank! This offers a valuable addition to your church's funds while advancing an eco-friendly mission. 💰

🌟 The bank will be managed entirely by our team with no disruption to your usual activities! Your congregation will appreciate this convenient way to help others while supporting charity! 👥💚

✨ We'd be delighted to work together on this initiative and can offer a simple agreement to get started whenever convenient for you! 📋

May this partnership bring blessings to many! 🤝🙏`
      },
      'Recycling Centers or Waste Disposal Sites': {
        emails: 'gytis.kondze@gmail.com',
        subject: 'A Simple Way to Support Your Mission and Earn Extra Funds',
        message: `🌿 Hello eco-warriors!

We would like to propose placing one of our textile clothing banks at your facility! As a location focused on environmental responsibility, your premises are perfect for encouraging clothing donations! 🔄

🌍 Our charity clothing banks complement your environmental mission beautifully - turning textile waste into support for families in need! Every donation creates a positive impact! 💚

✨ Our team handles ALL servicing to ensure cleanliness and minimal visual impact - we know how important maintaining your facility's standards is! 🧹

💰 In appreciation of the partnership, we offer a reasonable monthly payment per clothing bank! This provides steady additional funds while supporting sustainable, ethical recycling practices! 💳

🌟 Together we can benefit both the community AND the environment - it's the perfect partnership for making a real difference! 🤝

If this sounds interesting, we'd be happy to move forward with a straightforward agreement and begin what we hope will be a positive and lasting partnership! 📋

Let's make sustainability profitable! 🚀💚`
      }
    };
  };

  // Convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Handle image upload for charity bank
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setImageUploading(true);
    try {
      const base64 = await convertToBase64(file);
      setChildrenWithCancerImage(base64);
      console.log('Children with Cancer image converted to base64:', base64.substring(0, 100) + '...');
    } catch (error) {
      console.error('Error converting image to base64:', error);
    } finally {
      setImageUploading(false);
    }
  };

  // Load templates from Firebase on component mount
  useEffect(() => {
    const initializeTemplates = async () => {
      try {
        const templatesRef = ref(database, 'emailTemplates');
        const snapshot = await get(templatesRef);
        
        if (snapshot.exists()) {
          // Templates exist in Firebase, load them
          const templates = snapshot.val();
          console.log('Loaded existing templates from Firebase:', templates);
          
          // Load image from database if it exists
          if (templates.images && templates.images.childrenWithCancer) {
            setChildrenWithCancerImage(templates.images.childrenWithCancer);
          }
          
          setEmailCategories(prev => {
            const updated = { ...prev };
            EMAIL_CATEGORIES.forEach(category => {
              if (templates[category]) {
                updated[category] = {
                  ...prev[category],
                  emails: templates[category].emails || '',
                  subject: templates[category].subject || '',
                  message: templates[category].message || '',
                };
              }
            });
            return updated;
          });
        } else {
          // No templates exist, initialize with defaults
          console.log('No templates found in Firebase, initializing with defaults...');
          await initializeDefaultTemplates();
        }
      } catch (error) {
        console.error('Error loading templates from Firebase:', error);
        // Fallback to local defaults
        loadLocalDefaults();
      } finally {
        setTemplatesLoaded(true);
      }
    };

    initializeTemplates();
  }, []);

  // Initialize Firebase with default templates
  const initializeDefaultTemplates = async () => {
    try {
      const defaultTemplates = getDefaultTemplates();
      const templatesRef = ref(database, 'emailTemplates');
      
      // Add timestamp to each template
      const templatesWithTimestamp = Object.entries(defaultTemplates).reduce((acc, [key, value]) => {
        acc[key] = {
          ...value,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        return acc;
      }, {} as any);

      // Add image section (only Children with Cancer)
      templatesWithTimestamp.images = {
        childrenWithCancer: childrenWithCancerImage,
        lastUpdated: new Date().toISOString()
      };

      await set(templatesRef, templatesWithTimestamp);
      console.log('Default templates initialized in Firebase successfully!');
      
      // Load the templates into local state
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
      console.error('Error initializing default templates:', error);
      loadLocalDefaults();
    }
  };

  // Load local defaults as fallback
  const loadLocalDefaults = () => {
    const defaultTemplates = getDefaultTemplates();
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
          message: 'Template saved to database successfully!'
        }
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setResponses(prev => {
          const updated = { ...prev };
          if (updated[category]?.message === 'Template saved to database successfully!') {
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
          message: `Failed to save template to database: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }));
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Save image to Firebase
  const saveImageToFirebase = async () => {
    setImageUploading(true);
    try {
      const imagesRef = ref(database, 'emailTemplates/images');
      await set(imagesRef, {
        childrenWithCancer: childrenWithCancerImage,
        lastUpdated: new Date().toISOString()
      });
      
      console.log('Image saved to Firebase');
      alert('Image saved to database successfully!');
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image to database');
    } finally {
      setImageUploading(false);
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
        
        // Include charity bank image from Firebase (base64)
        formData.append('childrenWithCancerImage', childrenWithCancerImage);

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

  // Get the CSS class for custom fonts
  const getFontClass = (fontFamily: string) => {
    const fontMap: Record<string, string> = {
      'font-custom-arial': 'Arial, sans-serif',
      'font-custom-helvetica': 'Helvetica, sans-serif', 
      'font-custom-times': 'Times New Roman, serif',
      'font-custom-georgia': 'Georgia, serif',
      'font-custom-verdana': 'Verdana, sans-serif'
    };
    return fontMap[fontFamily] || '';
  };

  const customFontStyle = getFontClass(fontFamily) ? { fontFamily: getFontClass(fontFamily) } : {};

  return (
    <div className={`min-h-screen bg-gray-50 py-8 ${fontFamily.startsWith('font-custom') ? '' : fontFamily} ${fontSize}`} style={customFontStyle}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Targeted Bulk Email Sender
            </h1>
            
            {/* Font and Size Controls */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Font Size:</label>
                <select 
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="text-xs">Extra Small</option>
                  <option value="text-sm">Small</option>
                  <option value="text-base">Medium</option>
                  <option value="text-lg">Large</option>
                  <option value="text-xl">Extra Large</option>
                  <option value="text-2xl">2X Large</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Font Family:</label>
                <select 
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="font-sans">Sans Serif (Default)</option>
                  <option value="font-serif">Serif</option>
                  <option value="font-mono">Monospace</option>
                  <option value="font-custom-arial">Arial</option>
                  <option value="font-custom-helvetica">Helvetica</option>
                  <option value="font-custom-times">Times New Roman</option>
                  <option value="font-custom-georgia">Georgia</option>
                  <option value="font-custom-verdana">Verdana</option>
                </select>
              </div>
              
              {/* Reset Button */}
              <button
                type="button"
                onClick={() => {
                  setFontSize('text-lg');
                  setFontFamily('font-sans');
                }}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Loading indicator */}
          {!templatesLoaded && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-800">Loading email templates from Firebase database...</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSendEmails} className="space-y-8">
            {/* Charity Bank Image Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                🖼️ Charity Bank Image (Auto-Included in All Emails)
              </h2>
              <div className="max-w-md">
                {/* Children with Cancer UK Image */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-medium text-gray-800 mb-3">📧 Children with Cancer UK</h3>
                  {childrenWithCancerImage ? (
                    <div>
                      <img 
                        src={childrenWithCancerImage} 
                        alt="Children with Cancer UK Bank" 
                        className="max-w-full h-32 object-contain border rounded mb-2"
                      />
                      <p className="text-xs text-green-600">✅ Loaded from database - Auto-included in emails</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>📷 No image loaded from database</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                    className="mt-3 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
              
              {/* Save Image Button */}
              <div className="mt-4 flex items-center gap-4">
                <button
                  type="button"
                  onClick={saveImageToFirebase}
                  disabled={imageUploading || !childrenWithCancerImage}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {imageUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating Database...
                    </>
                  ) : (
                    <>
                      💾 Update Image in Database
                    </>
                  )}
                </button>
                
                <div className="text-sm text-gray-600">
                  <p>💡 Image is automatically loaded from Firebase and included in all emails</p>
                </div>
              </div>
            </div>

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