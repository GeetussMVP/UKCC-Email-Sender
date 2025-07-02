// components/FirebaseTest.tsx
'use client';

import { useState, useEffect } from 'react';
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
    childrenWithCancer: string;
    lastUpdated: string;
    createdAt: string;
  };
}

export default function FirebaseTest() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [childrenWithCancerImage, setChildrenWithCancerImage] = useState<string>('');
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Carpark');
  const [showPreview, setShowPreview] = useState(false);

  // Auto-initialize on component mount
  useEffect(() => {
    const autoInit = async () => {
      setStatus('🚀 Auto-initializing Firebase with enhanced email templates for Children with Cancer UK...');
      try {
        const templates = getEnhancedTemplates();
        const templatesRef = ref(database, 'emailTemplates');
        await set(templatesRef, templates);
        setStatus('✅ Enhanced email templates for Children with Cancer UK auto-initialized successfully in Firebase!');
        console.log('Enhanced templates written to Firebase:', templates);
      } catch (error) {
        console.error('Error auto-initializing templates:', error);
        setStatus(`❌ Error auto-initializing templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    autoInit();
  }, [childrenWithCancerImage]);

  // Get enhanced email templates
  const getEnhancedTemplates = (): EmailTemplates => {
    return {
      'Carpark': {
        emails: 'gytis.kondze@gmail.com',
        subject: 'Transform Your Car Park Into a Hub for Sustainability - and Earn Extra Income',
        message: `🌟 Hello! We hope this message finds you well! 

We are reaching out to propose placing one of our textile clothing banks within your car park premises. Your location is ideal due to its accessibility and visibility! 📍✨

🔧 Our team handles ALL maintenance and servicing so the site remains well-presented at all times - no hassle for you! We make regular collections to ensure the unit stays clean, tidy, and never negatively impacts your area's appearance. 🧹✨

💰 As part of our partnerships, we offer a reasonable monthly payment per textile bank, providing your premises with a consistent income stream! 💳 This supports both sustainable initiatives AND generates additional revenue - it's a win-win! 🎯

🌱 You'll be promoting environmentally responsible textile recycling while supporting an amazing charitable cause! Every donation directly supports Children with Cancer UK - an incredible charity helping children and families in their most challenging times. Your partnership means every piece of clothing donated will help fund vital support services, emotional assistance, and practical help for children battling cancer and their families. 💚

💙 Children with Cancer UK provides essential support to families facing childhood cancer diagnoses, offering emotional, practical, and financial assistance during their darkest hours. Your efforts and this partnership will make a real, meaningful difference to these brave families who are fighting the toughest battle of their lives! 🙏

🤝 We would love to work with you and believe this could be the beginning of a positive, long-term partnership that truly changes lives for children with cancer! If you're interested, we'd be happy to provide more details and arrange a simple agreement to get started. 📋

Looking forward to hearing from you! 😊`,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      'Community Centres': {
        emails: 'gytis.kondze@gmail.com',
        subject: 'Support Your Community Centre\'s Mission - And Benefit From a New Income Stream',
        message: `🏢 Hello from our team! 

We would like to propose placing one of our textile clothing banks at your community centre! Your site is a perfect hub for local residents and provides an ideal location to encourage convenient clothing donations that will directly support Children with Cancer UK. 🎯

🛠️ Don't worry about maintenance - our team manages ALL upkeep and monitoring of the bank! We ensure regular collections to keep the area clean and visually appealing at all times. ✨

💡 To support this partnership, we offer a fair and consistent monthly payment per bank! 💳 This means additional income for your centre while supporting an environmentally conscious cause that helps children battling cancer. 🌍

♻️ This initiative perfectly aligns with community values - promoting sustainability, reuse, and local engagement while supporting Children with Cancer UK! Every donation from your community members will help fund critical support services for families facing childhood cancer, providing them with emotional, practical, and financial assistance when they need it most. Your community will love having a convenient way to make a real difference in the lives of children with cancer! 💝

💙 Children with Cancer UK provides vital support to families during their most challenging times, offering everything from emotional counseling to practical assistance with daily needs. Your community centre's partnership means every donation will directly contribute to helping brave children and their families navigate the difficult journey of childhood cancer! 🌟

🌟 We hope to build a long-term, positive partnership that truly changes lives for children with cancer and would love the opportunity to discuss next steps! We can provide a simple agreement to begin working together. 📝

Thanks for considering this opportunity to support children battling cancer! 🙏`,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      'Sports Facilities': {
        emails: 'gytis.kondze@gmail.com',
        subject: 'Score Extra Income for Your Sports Facility - With a Simple Sustainability Project',
        message: `⚽ Greetings from our team!

We are proposing to install one of our textile clothing banks at your sports facility! With your regular footfall and strong community presence, your location offers a fantastic opportunity for clothing recycling that will directly support Children with Cancer UK! 🏆

💪 We take FULL responsibility for maintenance and collections, ensuring the area remains clean and presentable at all times! Zero effort required from your team - we handle everything while you help support children battling cancer! 🔧✨

🌱 In return, we offer a reasonable monthly payment per textile bank! This provides steady income for your facility while contributing to a greener, more sustainable future AND supporting children who desperately need help in their fight against cancer! 💰

💙 Every donation collected from your facility will directly fund vital services for Children with Cancer UK - supporting families facing childhood cancer diagnoses with emotional, practical, and financial assistance. Your sports facility will be making a real difference to brave children and their families who are fighting the toughest battle of their lives! 🙏

🎯 This initiative has proven to be simple and effective for supporting environmental efforts and Children with Cancer UK - plus your members will appreciate knowing their donations are helping children with cancer! Your facility will be part of something truly meaningful in the fight against childhood cancer! 👥💚

📞 We'd welcome the opportunity to partner with you in supporting this amazing cause for children with cancer and would be happy to provide more details plus a straightforward agreement if you wish to proceed!

Game on for sustainability and supporting children battling cancer! 🏃‍♂️🌍`,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      'Churches and Places of Worship': {
        emails: 'gytis.kondze@gmail.com',
        subject: 'Support Your Church\'s Good Work - With a Sustainable Clothing Donation Point',
        message: `🙏 Blessings and greetings!

We would like to place a textile clothing bank at your church premises to support local textile recycling and, most importantly, help Children with Cancer UK! ⛪ The church is a trusted space for many in the community, offering a meaningful opportunity to encourage responsible donation that will directly support children battling cancer and their families.

🕊️ We handle ALL servicing and collections to keep the area respectful and clean - maintaining the peaceful atmosphere of your sacred space while supporting God's work in helping children with cancer! ✨

💝 As part of our agreement, we provide a modest but consistent monthly contribution per clothing bank! This offers a valuable addition to your church's funds while advancing an eco-friendly mission that supports Children with Cancer UK - truly embodying Christian values of caring for the most vulnerable children in their fight against cancer. 💰

💙 Every donation from your congregation will directly support Children with Cancer UK, which provides essential emotional, practical, and financial support to families facing childhood cancer. Your church will be instrumental in providing hope and healing to families in their greatest time of need, helping children battle cancer with the support they deserve! 🌟

✨ The bank will be managed entirely by our team with no disruption to your usual activities! Your congregation will appreciate this meaningful way to help children battling cancer and their families - a perfect reflection of your church's mission to serve the most vulnerable! 👥💚

🤝 We'd be delighted to work together on this initiative that aligns so beautifully with your church's values of compassion and service to children with cancer, and can offer a simple agreement to get started whenever convenient for you! 📋

May this partnership bring blessings to many children battling cancer and their families! 🤝🙏`,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      'Recycling Centers or Waste Disposal Sites': {
        emails: 'gytis.kondze@gmail.com',
        subject: 'A Simple Way to Support Your Mission and Earn Extra Funds',
        message: `🌿 Hello eco-warriors!

We would like to propose placing one of our textile clothing banks at your facility! As a location focused on environmental responsibility, your premises are perfect for encouraging clothing donations that will support both sustainability and Children with Cancer UK! 🔄

🌍 Our charity clothing banks complement your environmental mission beautifully - turning textile waste into support for Children with Cancer UK! Every donation creates a positive impact for the environment AND helps children battling cancer get the support they desperately need. 💚

💙 Children with Cancer UK provides crucial support to families facing childhood cancer diagnoses, offering emotional, practical, and financial assistance during their most challenging times. Your facility will be directly contributing to this life-changing cause with every donation collected, helping children and families navigate the difficult journey of childhood cancer! 🙏

✨ Our team handles ALL servicing to ensure cleanliness and minimal visual impact - we know how important maintaining your facility's standards is while supporting Children with Cancer UK! 🧹

💰 In appreciation of the partnership, we offer a reasonable monthly payment per clothing bank! This provides steady additional funds while supporting sustainable, ethical recycling practices that directly benefit children battling cancer! 💳

🌟 Together we can benefit the community, the environment, AND Children with Cancer UK - it's the perfect partnership for making a real difference in the lives of children fighting cancer! Your efforts will help fund vital support services for children and families facing their toughest battle! 🤝

If this sounds interesting, we'd be happy to move forward with a straightforward agreement and begin what we hope will be a positive and lasting partnership that truly changes lives for children with cancer! 📋

Let's make sustainability profitable while supporting children battling cancer! 🚀💚`,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      images: {
        childrenWithCancer: childrenWithCancerImage || '',
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    };
  };

  // Generate email preview HTML
  const generateEmailPreview = (category: string): string => {
    const templates = getEnhancedTemplates();
    
    // Type guard to ensure we have a valid template
    const template = templates[category];
    
    // Handle the images object case and type guard
    if (!template || typeof template !== 'object' || !('message' in template)) {
      return '<p>Invalid template selected</p>';
    }

    const emailTemplate = template as EmailTemplate;
    let htmlMessage = emailTemplate.message.replace(/\n/g, '<br>');
    
    // Find the middle of the message to insert charity bank section
    const messageParts = htmlMessage.split('<br>');
    const middleIndex = Math.floor(messageParts.length / 2);
    
    // Create charity bank section
    let charityBankSection = '<br><div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; text-align: center;">';
    charityBankSection += '<h3 style="color: #2563eb; margin-bottom: 15px; font-family: Arial, sans-serif;">🏦 Our Charity Clothing Bank Supporting Children with Cancer 🏦</h3>';
    
    if (childrenWithCancerImage) {
      charityBankSection += `
        <div style="margin: 15px 0; padding: 10px; border: 2px solid #3b82f6; border-radius: 8px; background-color: white;">
          <h4 style="color: #1e40af; margin-bottom: 10px;">💙 Children with Cancer UK Clothing Bank</h4>
          <img src="${childrenWithCancerImage}" alt="Children with Cancer UK Clothing Bank" style="max-width: 350px; width: 100%; height: auto; display: block; margin: 10px auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="color: #1e40af; font-weight: bold; margin-top: 10px;">- Every donation supports brave children and families battling cancer 💪</p>
          <p style="color: #1e40af; margin-top: 5px; font-style: italic;">Your donations help fund vital emotional, practical, and financial support services for children with cancer</p>
        </div>
      `;
    } else {
      charityBankSection += `
        <div style="margin: 15px 0; padding: 10px; border: 2px solid #3b82f6; border-radius: 8px; background-color: white;">
          <h4 style="color: #1e40af; margin-bottom: 10px;">💙 Children with Cancer UK Clothing Bank</h4>
          <div style="max-width: 350px; width: 100%; height: 150px; display: flex; align-items: center; justify-content: center; margin: 10px auto; border: 2px dashed #ddd; border-radius: 8px; background-color: #f9f9f9; color: #666;">
            📷 Image will appear here
          </div>
          <p style="color: #1e40af; font-weight: bold; margin-top: 10px;">- Every donation supports brave children and families battling cancer 💪</p>
          <p style="color: #1e40af; margin-top: 5px; font-style: italic;">Your donations help fund vital emotional, practical, and financial support services for children with cancer</p>
        </div>
      `;
    }
    
    charityBankSection += '</div><br>';
    
    // Insert charity bank section in the middle of the message
    messageParts.splice(middleIndex, 0, charityBankSection);
    htmlMessage = messageParts.join('<br>');

    // Add call-to-action button section at the end
    const ctaSection = `
      <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; text-align: center;">
        <h3 style="color: white; margin-bottom: 15px; font-size: 20px;">📞 Ready to Support Children with Cancer?</h3>
        <p style="color: white; margin-bottom: 20px; opacity: 0.9;">Let's schedule a quick chat to discuss how your partnership can help children battling cancer!</p>
        <a href="https://ukcc-email-sender.vercel.app/appointment" 
           style="display: inline-block; background-color: #fbbf24; color: #1f2937; text-decoration: none; font-weight: bold; padding: 15px 30px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;"
           target="_blank">
          🗓️ Schedule Your Call Now
        </a>
        <p style="color: white; margin-top: 15px; font-size: 12px; opacity: 0.8;">
          Click the button above to choose your preferred time - help us support children with cancer!
        </p>
      </div>
    `;

    // Add professional email styling
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
        <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🌟 Partnership Opportunity Supporting Children with Cancer 🌟</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          ${htmlMessage}
          ${ctaSection}
          <div style="margin-top: 20px; padding: 20px; background-color: #f0f9ff; border-radius: 8px; text-align: center; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; color: #1e40af; font-weight: bold;">🤝 Ready to support children battling cancer together? Let's chat! 📞</p>
            <p style="margin: 10px 0 0 0; color: #1e40af; font-style: italic;">Every donation makes a real difference in a child's fight against cancer ❤️</p>
          </div>
        </div>
      </div>
    `;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Firebase Email Templates Test - Children with Cancer UK</h1>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Status:</p>
        <div className="p-3 bg-gray-100 rounded border">
          {status}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select Category for Preview:
        </label>
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border rounded w-full"
        >
          <option value="Carpark">Carpark</option>
          <option value="Community Centres">Community Centres</option>
          <option value="Sports Facilities">Sports Facilities</option>
          <option value="Churches and Places of Worship">Churches and Places of Worship</option>
          <option value="Recycling Centers or Waste Disposal Sites">Recycling Centers or Waste Disposal Sites</option>
        </select>
      </div>

      <div className="mb-4">
        <button 
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showPreview ? 'Hide Preview' : 'Show Email Preview'}
        </button>
      </div>

      {showPreview && (
        <div className="border rounded p-4 bg-white">
          <h3 className="text-lg font-semibold mb-3">Email Preview - {selectedCategory} (Children with Cancer UK)</h3>
          <div 
            dangerouslySetInnerHTML={{ 
              __html: generateEmailPreview(selectedCategory) 
            }} 
          />
        </div>
      )}
    </div>
  );
}