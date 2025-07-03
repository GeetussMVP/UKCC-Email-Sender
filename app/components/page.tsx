// components/FirebaseTest.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { database } from '../lib/firebase';
import { ref, set, get } from 'firebase/database';

interface EmailTemplate {
  emails: string;
  subject: string;
  message: string;
  lastUpdated: string;
  createdAt: string;
}

interface EmailTemplates {
  [key: string]: EmailTemplate | {
    environmentalImage: string;
    lastUpdated: string;
    createdAt: string;
  };
}

export default function FirebaseTest() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplates>({});
  const [environmentalImage, setEnvironmentalImage] = useState<string>('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Carpark');
  const [showPreview, setShowPreview] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate>({
    emails: '',
    subject: '',
    message: '',
    lastUpdated: '',
    createdAt: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Carpark',
    'Community Centres',
    'Sports Facilities',
    'Churches and Places of Worship',
    'Recycling Centers or Waste Disposal Sites'
  ];

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setStatus('❌ Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatus('❌ Image size must be less than 5MB');
      return;
    }

    setImageUploading(true);
    setStatus('📤 Uploading image...');

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setEnvironmentalImage(base64String);
        setImageFile(file);
        setStatus('✅ Image uploaded successfully!');
        setImageUploading(false);
      };
      reader.onerror = () => {
        setStatus('❌ Error reading image file');
        setImageUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      setStatus('❌ Error uploading image');
      setImageUploading(false);
    }
  };

  // Remove uploaded image
  const removeImage = () => {
    setEnvironmentalImage('');
    setImageFile(null);
    setStatus('🗑️ Image removed');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof EmailTemplate, value: string) => {
    setCurrentTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Load templates from Firebase on component mount
  useEffect(() => {
    loadTemplatesFromFirebase();
  }, []);

  // Update current template when category changes
  useEffect(() => {
    if (templates[selectedCategory] && 'message' in templates[selectedCategory]) {
      setCurrentTemplate(templates[selectedCategory] as EmailTemplate);
    }
  }, [selectedCategory, templates]);

  // Load templates from Firebase
  const loadTemplatesFromFirebase = async () => {
    setLoading(true);
    setStatus('📥 Loading templates from Firebase...');
    try {
      const templatesRef = ref(database, 'emailTemplates');
      const snapshot = await get(templatesRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTemplates(data);
        setEnvironmentalImage(data.images?.environmentalImage || '');
        setStatus('✅ Templates loaded successfully from Firebase!');
      } else {
        // Initialize with default templates if none exist
        const defaultTemplates = getDefaultTemplates();
        setTemplates(defaultTemplates);
        await set(templatesRef, defaultTemplates);
        setStatus('🚀 Default templates initialized in Firebase!');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setStatus(`❌ Error loading templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Get default email templates
  const getDefaultTemplates = (): EmailTemplates => {
    const currentDate = new Date().toISOString();
    return {
      'Carpark': {
        emails: 'your-email@example.com',
        subject: 'Partnership Opportunity - Environmental Initiative for Your Car Park',
        message: `🌟 Hello! We hope this message finds you well! 

We are reaching out to propose placing one of our environmental collection points within your car park premises. Your location is ideal due to its accessibility and visibility! 📍✨

🔧 Our team handles ALL maintenance and servicing so the site remains well-presented at all times - no hassle for you! We make regular collections to ensure the unit stays clean, tidy, and never negatively impacts your area's appearance. 🧹✨

💰 As part of our partnerships, we offer a reasonable monthly payment per collection point, providing your premises with a consistent income stream! 💳 This supports both environmental initiatives AND generates additional revenue - it's a win-win! 🎯

🌱 You'll be promoting environmentally responsible practices while supporting positive community initiatives! Every contribution helps fund environmental projects and community support programs. Your partnership means every item collected will help create a more sustainable future! 💚

🤝 We would love to work with you and believe this could be the beginning of a positive, long-term partnership that truly makes a difference! If you're interested, we'd be happy to provide more details and arrange a simple agreement to get started. 📋

Looking forward to hearing from you! 😊`,
        lastUpdated: currentDate,
        createdAt: currentDate
      },
      'Community Centres': {
        emails: 'your-email@example.com',
        subject: 'Support Your Community Centre\'s Mission - Environmental Partnership Opportunity',
        message: `🏢 Hello from our team! 

We would like to propose placing one of our environmental collection points at your community centre! Your site is a perfect hub for local residents and provides an ideal location to encourage community participation in environmental initiatives. 🎯

🛠️ Don't worry about maintenance - our team manages ALL upkeep and monitoring! We ensure regular collections to keep the area clean and visually appealing at all times. ✨

💡 To support this partnership, we offer a fair and consistent monthly payment per collection point! 💳 This means additional income for your centre while supporting environmentally conscious initiatives. 🌍

♻️ This initiative perfectly aligns with community values - promoting sustainability, reuse, and local engagement! Every contribution from your community members will help fund environmental projects and community support programs. Your community will love having a convenient way to make a positive impact! 💝

🌟 We hope to build a long-term, positive partnership and would love the opportunity to discuss next steps! We can provide a simple agreement to begin working together. 📝

Thanks for considering this opportunity to support environmental initiatives! 🙏`,
        lastUpdated: currentDate,
        createdAt: currentDate
      },
      'Sports Facilities': {
        emails: 'your-email@example.com',
        subject: 'Score Extra Income for Your Sports Facility - Environmental Partnership',
        message: `⚽ Greetings from our team!

We are proposing to install one of our environmental collection points at your sports facility! With your regular footfall and strong community presence, your location offers a fantastic opportunity for environmental initiatives! 🏆

💪 We take FULL responsibility for maintenance and collections, ensuring the area remains clean and presentable at all times! Zero effort required from your team - we handle everything! 🔧✨

🌱 In return, we offer a reasonable monthly payment per collection point! This provides steady income for your facility while contributing to a greener, more sustainable future! 💰

🎯 This initiative has proven to be simple and effective for supporting environmental efforts - plus your members will appreciate knowing their contributions are helping create positive change! 👥💚

📞 We'd welcome the opportunity to partner with you and would be happy to provide more details plus a straightforward agreement if you wish to proceed!

Game on for sustainability! 🏃‍♂️🌍`,
        lastUpdated: currentDate,
        createdAt: currentDate
      },
      'Churches and Places of Worship': {
        emails: 'your-email@example.com',
        subject: 'Support Your Church\'s Mission - Environmental Stewardship Partnership',
        message: `🙏 Blessings and greetings!

We would like to place an environmental collection point at your church premises to support local environmental initiatives! ⛪ The church is a trusted space for many in the community, offering a meaningful opportunity to encourage responsible stewardship of our environment.

🕊️ We handle ALL servicing and collections to keep the area respectful and clean - maintaining the peaceful atmosphere of your sacred space! ✨

💝 As part of our agreement, we provide a modest but consistent monthly contribution per collection point! This offers a valuable addition to your church's funds while advancing an eco-friendly mission that truly embodies values of caring for creation. 💰

✨ The collection point will be managed entirely by our team with no disruption to your usual activities! Your congregation will appreciate this meaningful way to practice environmental stewardship - a perfect reflection of your church's mission to care for creation! 👥💚

🤝 We'd be delighted to work together on this initiative that aligns so beautifully with your church's values of stewardship and service, and can offer a simple agreement to get started whenever convenient for you! 📋

May this partnership bring blessings to our environment and community! 🤝🙏`,
        lastUpdated: currentDate,
        createdAt: currentDate
      },
      'Recycling Centers or Waste Disposal Sites': {
        emails: 'your-email@example.com',
        subject: 'Enhance Your Environmental Mission - Partnership Opportunity',
        message: `🌿 Hello eco-warriors!

We would like to propose placing one of our environmental collection points at your facility! As a location focused on environmental responsibility, your premises are perfect for encouraging sustainable practices! 🔄

🌍 Our collection points complement your environmental mission beautifully - turning waste into positive community impact! Every contribution creates a positive impact for the environment and supports community initiatives. 💚

✨ Our team handles ALL servicing to ensure cleanliness and minimal visual impact - we know how important maintaining your facility's standards is! 🧹

💰 In appreciation of the partnership, we offer a reasonable monthly payment per collection point! This provides steady additional funds while supporting sustainable, ethical practices! 💳

🌟 Together we can benefit the community, the environment, and promote positive change - it's the perfect partnership for making a real difference! 🤝

If this sounds interesting, we'd be happy to move forward with a straightforward agreement and begin what we hope will be a positive and lasting partnership! 📋

Let's make sustainability profitable! 🚀💚`,
        lastUpdated: currentDate,
        createdAt: currentDate
      },
      images: {
        environmentalImage: environmentalImage || '',
        lastUpdated: currentDate,
        createdAt: currentDate
      }
    };
  };

  // Save templates to Firebase
  const saveTemplates = async () => {
    setLoading(true);
    setStatus('💾 Saving templates to Firebase...');
    try {
      // Update the current template in the templates object
      const updatedTemplates = {
        ...templates,
        [selectedCategory]: {
          ...currentTemplate,
          lastUpdated: new Date().toISOString()
        },
        images: {
          environmentalImage: environmentalImage,
          lastUpdated: new Date().toISOString(),
          createdAt: templates.images?.createdAt || new Date().toISOString()
        }
      };

      const templatesRef = ref(database, 'emailTemplates');
      await set(templatesRef, updatedTemplates);
      setTemplates(updatedTemplates);
      setStatus('✅ Templates saved successfully to Firebase!');
      setEditMode(false);
    } catch (error) {
      console.error('Error saving templates:', error);
      setStatus(`❌ Error saving templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate email preview HTML
  const generateEmailPreview = (category: string): string => {
    const template = templates[category];
    
    if (!template || typeof template !== 'object' || !('message' in template)) {
      return '<p>Invalid template selected</p>';
    }

    const emailTemplate = template as EmailTemplate;
    let htmlMessage = emailTemplate.message.replace(/\n/g, '<br>');
    
    // Find the middle of the message to insert environmental section
    const messageParts = htmlMessage.split('<br>');
    const middleIndex = Math.floor(messageParts.length / 2);
    
    // Create environmental section
    let environmentalSection = '<br><div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; text-align: center;">';
    environmentalSection += '<h3 style="color: #16a34a; margin-bottom: 15px; font-family: Arial, sans-serif;">🌱 Environmental Collection Point 🌱</h3>';
    
    if (environmentalImage) {
      environmentalSection += `
        <div style="margin: 15px 0; padding: 10px; border: 2px solid #16a34a; border-radius: 8px; background-color: white;">
          <h4 style="color: #15803d; margin-bottom: 10px;">♻️ Environmental Initiative</h4>
          <img src="${environmentalImage}" alt="Environmental Collection Point" style="max-width: 350px; width: 100%; height: auto; display: block; margin: 10px auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="color: #15803d; font-weight: bold; margin-top: 10px;">- Every contribution supports environmental initiatives 🌍</p>
          <p style="color: #15803d; margin-top: 5px; font-style: italic;">Your contributions help fund environmental projects and community programs</p>
        </div>
      `;
    } else {
      environmentalSection += `
        <div style="margin: 15px 0; padding: 10px; border: 2px solid #16a34a; border-radius: 8px; background-color: white;">
          <h4 style="color: #15803d; margin-bottom: 10px;">♻️ Environmental Initiative</h4>
          <div style="max-width: 350px; width: 100%; height: 150px; display: flex; align-items: center; justify-content: center; margin: 10px auto; border: 2px dashed #ddd; border-radius: 8px; background-color: #f9f9f9; color: #666;">
            📷 Image will appear here
          </div>
          <p style="color: #15803d; font-weight: bold; margin-top: 10px;">- Every contribution supports environmental initiatives 🌍</p>
          <p style="color: #15803d; margin-top: 5px; font-style: italic;">Your contributions help fund environmental projects and community programs</p>
        </div>
      `;
    }
    
    environmentalSection += '</div><br>';
    
    // Insert environmental section in the middle of the message
    messageParts.splice(middleIndex, 0, environmentalSection);
    htmlMessage = messageParts.join('<br>');

    // Add professional email styling
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
        <div style="padding: 20px; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🌟 Environmental Partnership Opportunity 🌟</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          ${htmlMessage}
          <div style="margin-top: 30px; padding: 20px; background-color: #f0fdf4; border-radius: 8px; text-align: center; border-left: 4px solid #16a34a;">
            <p style="margin: 0; color: #15803d; font-weight: bold;">🤝 Ready to make a positive environmental impact together? Let's chat! 📞</p>
            <p style="margin: 10px 0 0 0; color: #15803d; font-style: italic;">Every contribution makes a real difference for our environment 🌍</p>
          </div>
          
          <!-- Appointment Scheduling Button Section -->
          <div style="margin-top: 40px; padding: 25px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 12px; text-align: center; box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2);">
            <h3 style="margin: 0 0 15px 0; color: white; font-size: 20px; font-weight: bold;">📅 Schedule a Meeting</h3>
            <p style="margin: 0 0 20px 0; color: white; opacity: 0.9; font-size: 16px;">Ready to discuss this partnership opportunity? Book a convenient time for us to connect!</p>
            <a href="https://ukcc-email-sender.vercel.app/appointment" 
               style="display: inline-block; 
                      background-color: #ffffff; 
                      color: #1d4ed8; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      font-size: 16px; 
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
                      transition: all 0.3s ease;"
               target="_blank">
              📞 Book Appointment Now
            </a>
            <p style="margin: 15px 0 0 0; color: white; opacity: 0.8; font-size: 14px;">Click the button above to access our online booking system</p>
          </div>
        </div>
      </div>
    `;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Environmental Email Templates Manager</h1>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Status:</p>
        <div className="p-3 bg-gray-100 rounded border">
          {status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Template Editor */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold mb-4">Template Editor</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Select Category:
              </label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 border rounded w-full"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Email Recipients:
              </label>
              <input
                type="text"
                value={currentTemplate.emails}
                onChange={(e) => handleInputChange('emails', e.target.value)}
                disabled={!editMode}
                className="w-full p-2 border rounded disabled:bg-gray-100"
                placeholder="Enter email addresses separated by commas"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Subject:
              </label>
              <input
                type="text"
                value={currentTemplate.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                disabled={!editMode}
                className="w-full p-2 border rounded disabled:bg-gray-100"
                placeholder="Enter email subject"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Message:
              </label>
              <textarea
                value={currentTemplate.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                disabled={!editMode}
                rows={12}
                className="w-full p-2 border rounded disabled:bg-gray-100"
                placeholder="Enter email message"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Environmental Image:
              </label>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {!editMode ? (
                <div className="space-y-2">
                  {environmentalImage ? (
                    <div className="relative">
                      <img 
                        src={environmentalImage} 
                        alt="Environmental Initiative" 
                        className="w-full max-w-sm h-32 object-cover rounded border"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        {imageFile ? `File: ${imageFile.name}` : 'Current image'}
                      </p>
                    </div>
                  ) : (
                    <div className="w-full max-w-sm h-32 bg-gray-100 rounded border flex items-center justify-center">
                      <span className="text-gray-500">No image uploaded</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={triggerFileInput}
                      disabled={imageUploading}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {imageUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          📤 Upload Image
                        </>
                      )}
                    </button>
                    
                    {environmentalImage && (
                      <button
                        onClick={removeImage}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
                      >
                        🗑️ Remove Image
                      </button>
                    )}
                  </div>
                  
                  {environmentalImage && (
                    <div className="space-y-2">
                      <div className="relative">
                        <img 
                          src={environmentalImage} 
                          alt="Environmental Initiative Preview" 
                          className="w-full max-w-sm h-32 object-cover rounded border"
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        {imageFile ? `File: ${imageFile.name} (${(imageFile.size / 1024).toFixed(1)}KB)` : 'Current image'}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!editMode ? (
                <button 
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  ✏️ Edit Template
                </button>
              ) : (
                <>
                  <button 
                    onClick={saveTemplates}
                    disabled={loading}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {loading ? '💾 Saving...' : '💾 Save Changes'}
                  </button>
                  <button 
                    onClick={() => {
                      setEditMode(false);
                      // Reset to original template
                      if (templates[selectedCategory] && 'message' in templates[selectedCategory]) {
                        setCurrentTemplate(templates[selectedCategory] as EmailTemplate);
                      }
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    ❌ Cancel
                  </button>
                </>
              )}
              
              <button 
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                {showPreview ? '👁️ Hide Preview' : '👁️ Show Preview'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        {showPreview && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-semibold mb-4">Email Preview - {selectedCategory}</h2>
              <div className="border rounded p-4 bg-gray-50 max-h-96 overflow-y-auto">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: generateEmailPreview(selectedCategory) 
                  }} 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}