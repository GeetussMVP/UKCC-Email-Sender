// components/FirebaseTest.tsx
'use client';

import { useState } from 'react';
import { database } from '../lib/firebase';
import { ref, set, get, push } from 'firebase/database';

export default function FirebaseTest() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing Firebase connection...');
    
    try {
      // Test basic write
      const testRef = ref(database, 'test');
      await set(testRef, {
        message: 'Hello Firebase!',
        timestamp: new Date().toISOString()
      });
      
      setStatus('✅ Firebase connection successful!');
    } catch (error) {
      console.error('Firebase test error:', error);
      setStatus(`❌ Firebase error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const initializeEmailTemplates = async () => {
    setLoading(true);
    setStatus('Initializing email templates...');
    
    try {
      const templates = {
        'Carpark': {
          emails: 'gytis.kondze@gmail.com',
          subject: 'Transform Your Car Park Into a Hub for Sustainability - and Earn Extra Income',
          message: `We are reaching out to propose placing one of our textile clothing banks within your car park premises. Your location is ideal due to its accessibility and visibility, and it would allow us to make regular collections to ensure the unit remains clean, tidy, and never negatively impacts the appearance of the area. Our team handles all maintenance and servicing so the site remains well-presented at all times.

As part of our partnerships, we offer a reasonable monthly payment per textile bank, providing your premises with a consistent income stream while supporting a sustainable, community-driven initiative. We believe this is a great opportunity to generate additional revenue while promoting environmentally responsible textile recycling.

We would love to work with you and believe this could be the beginning of a positive, long-term partnership. If you are open to this proposal, we'd be happy to provide more details and arrange a simple agreement to get started.`,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        'Community Centres': {
          emails: 'gytis.kondze@gmail.com',
          subject: 'Support Your Community Centre\'s Mission - And Benefit From a New Income Stream',
          message: `We would like to propose placing one of our textile clothing banks at your community centre. Your site is a hub for local residents and provides the perfect location to encourage convenient clothing donations, while we ensure regular collections to keep the area clean and visually appealing. Our team manages all upkeep and monitoring of the bank.

To support the partnership, we offer a fair and consistent monthly payment per bank, offering your centre additional income while supporting an environmentally conscious cause. This initiative aligns with many community values—promoting sustainability, reuse, and local engagement.

We hope to build a long-term, positive partnership and would love the opportunity to discuss next steps and provide a simple agreement to begin working together.`,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        'Sports Facilities': {
          emails: 'gytis.kondze@gmail.com',
          subject: 'Score Extra Income for Your Sports Facility - With a Simple Sustainability Project',
          message: `We are proposing to install one of our textile clothing banks at your sports facility. With regular footfall and a strong community presence, your location offers a great opportunity for clothing recycling. We take full responsibility for maintenance and collections, ensuring the area remains clean and presentable at all times.

In return, we offer a reasonable monthly payment per textile bank, providing a steady income for your facility while contributing to a greener, more sustainable future. The initiative requires no effort from your team and has proven to be a simple and effective way to support environmental efforts.

We'd welcome the opportunity to partner with you and would be happy to provide more details and a straightforward agreement should you wish to proceed.`,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        'Churches and Places of Worship': {
          emails: 'gytis.kondze@gmail.com',
          subject: 'Support Your Church\'s Good Work - With a Sustainable Clothing Donation Point',
          message: `We would like to place a textile clothing bank at your church premises to support local textile recycling. The church is a trusted space for many in the community, and your location offers a meaningful opportunity to encourage responsible donation. We handle all servicing and collections to keep the area respectful and clean.

As part of our agreement, we provide a modest but consistent monthly contribution per clothing bank, offering a valuable addition to your church's funds while advancing an eco-friendly mission. The bank will be managed entirely by our team, with no disruption to your usual activities.

We'd be delighted to work together on this initiative and can offer a simple agreement to get started whenever convenient for you.`,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        'Recycling Centers or Waste Disposal Sites': {
          emails: 'gytis.kondze@gmail.com',
          subject: 'A Simple Way to Support Your Mission and Earn Extra Funds',
          message: `We would like to propose placing one of our textile clothing banks at your place of worship. As a respected and well-visited community location, your premises are ideal for encouraging clothing donations in a way that aligns with charitable and environmental values. Our team handles all servicing to ensure cleanliness and minimal visual impact.

In appreciation of the partnership, we offer a reasonable monthly payment per clothing bank. This provides a steady source of additional funds while supporting sustainable, ethical recycling practices that benefit both the community and the environment.

If this is of interest, we'd be happy to move forward with a straightforward agreement and begin what we hope will be a positive and lasting partnership.`,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      };

      const templatesRef = ref(database, 'emailTemplates');
      await set(templatesRef, templates);
      
      setStatus('✅ Email templates initialized successfully in Firebase!');
      console.log('Templates written to Firebase:', templates);
    } catch (error) {
      console.error('Error initializing templates:', error);
      setStatus(`❌ Error initializing templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const readTemplates = async () => {
    setLoading(true);
    setStatus('Reading templates from Firebase...');
    
    try {
      const templatesRef = ref(database, 'emailTemplates');
      const snapshot = await get(templatesRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('Templates from Firebase:', data);
        setStatus(`✅ Found ${Object.keys(data).length} templates in Firebase!`);
      } else {
        setStatus('❌ No templates found in Firebase');
      }
    } catch (error) {
      console.error('Error reading templates:', error);
      setStatus(`❌ Error reading templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Firebase Database Test</h2>
      
      <div className="space-y-4">
        <button
          onClick={testConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Firebase Connection'}
        </button>
        
        <button
          onClick={initializeEmailTemplates}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Initializing...' : 'Force Initialize Email Templates'}
        </button>
        
        <button
          onClick={readTemplates}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? 'Reading...' : 'Read Templates from Firebase'}
        </button>
      </div>
      
      {status && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">{status}</p>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Steps to debug:</strong></p>
        <ol className="list-decimal list-inside space-y-1">
          <li>First click "Test Firebase Connection"</li>
          <li>Then click "Force Initialize Email Templates"</li>
          <li>Finally click "Read Templates from Firebase"</li>
          <li>Check your browser console for detailed logs</li>
        </ol>
      </div>
    </div>
  );
}