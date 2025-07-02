import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface AppointmentData {
  name: string;
  email: string;
  phone: string;
  company: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  contactMethod: 'call' | 'email';
  createdAt: string;
  status: string;
}

export async function POST(request: NextRequest) {
  try {
    const appointmentData: AppointmentData = await request.json();

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify transporter
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
      return NextResponse.json(
        { success: false, message: 'Email configuration error' },
        { status: 500 }
      );
    }

    // Format the appointment date and time
    const appointmentDate = new Date(appointmentData.preferredDate);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const formattedTime = new Date(`2000-01-01T${appointmentData.preferredTime}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const createdAt = new Date(appointmentData.createdAt).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Create email content
    const subject = `🗓️ New ${appointmentData.contactMethod === 'call' ? 'Call' : 'Email'} Appointment Scheduled - ${appointmentData.name}`;
    
    const textContent = `
New Appointment Scheduled!

Contact Details:
- Name: ${appointmentData.name}
- Email: ${appointmentData.email}
- Phone: ${appointmentData.phone || 'Not provided'}
- Company: ${appointmentData.company || 'Not provided'}

Appointment Details:
- Contact Method: ${appointmentData.contactMethod === 'call' ? 'Phone Call' : 'Email Response'}
- Preferred Date: ${formattedDate}
- Preferred Time: ${formattedTime}
- Status: ${appointmentData.status}

Message from Customer:
${appointmentData.message || 'No additional message provided'}

Submitted: ${createdAt}
    `;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🗓️ New Appointment Scheduled</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">A potential partner has requested a ${appointmentData.contactMethod === 'call' ? 'call' : 'an email response'}</p>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Contact Information -->
          <div style="margin-bottom: 25px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h2 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">👤 Contact Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 10px 5px 0; font-weight: bold; color: #374151;">Name:</td>
                <td style="padding: 5px 0; color: #374151;">${appointmentData.name}</td>
              </tr>
              <tr>
                <td style="padding: 5px 10px 5px 0; font-weight: bold; color: #374151;">Email:</td>
                <td style="padding: 5px 0; color: #374151;"><a href="mailto:${appointmentData.email}" style="color: #3b82f6; text-decoration: none;">${appointmentData.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 5px 10px 5px 0; font-weight: bold; color: #374151;">Phone:</td>
                <td style="padding: 5px 0; color: #374151;">${appointmentData.phone || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 5px 10px 5px 0; font-weight: bold; color: #374151;">Company:</td>
                <td style="padding: 5px 0; color: #374151;">${appointmentData.company || 'Not provided'}</td>
              </tr>
            </table>
          </div>

          <!-- Appointment Details -->
          <div style="margin-bottom: 25px; padding: 20px; background-color: ${appointmentData.contactMethod === 'call' ? '#fef3c7' : '#dbeafe'}; border-radius: 8px; border-left: 4px solid ${appointmentData.contactMethod === 'call' ? '#f59e0b' : '#3b82f6'};">
            <h2 style="margin: 0 0 15px 0; color: ${appointmentData.contactMethod === 'call' ? '#92400e' : '#1e40af'}; font-size: 18px;">
              ${appointmentData.contactMethod === 'call' ? '📞' : '✉️'} ${appointmentData.contactMethod === 'call' ? 'Call' : 'Email'} Appointment
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 10px 5px 0; font-weight: bold; color: #374151;">Date:</td>
                <td style="padding: 5px 0; color: #374151;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 5px 10px 5px 0; font-weight: bold; color: #374151;">Time:</td>
                <td style="padding: 5px 0; color: #374151;">${formattedTime}</td>
              </tr>
              <tr>
                <td style="padding: 5px 10px 5px 0; font-weight: bold; color: #374151;">Status:</td>
                <td style="padding: 5px 0; color: #374151;"><span style="background-color: #fbbf24; color: #92400e; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">PENDING</span></td>
              </tr>
            </table>
          </div>

          <!-- Customer Message -->
          ${appointmentData.message ? `
            <div style="margin-bottom: 25px; padding: 20px; background-color: #f0f9ff; border-radius: 8px; border-left: 4px solid #8b5cf6;">
              <h2 style="margin: 0 0 15px 0; color: #7c3aed; font-size: 18px;">💬 Customer Message</h2>
              <p style="margin: 0; color: #374151; line-height: 1.6; font-style: italic;">"${appointmentData.message}"</p>
            </div>
          ` : ''}

          <!-- Action Items -->
          <div style="margin-bottom: 25px; padding: 20px; background-color: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;">
            <h2 style="margin: 0 0 15px 0; color: #047857; font-size: 18px;">✅ Next Steps</h2>
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
              <li style="margin-bottom: 8px;">Add this appointment to your calendar</li>
              <li style="margin-bottom: 8px;">${appointmentData.contactMethod === 'call' ? `Prepare to call ${appointmentData.name} at ${appointmentData.phone}` : `Prepare email response for ${appointmentData.name}`}</li>
              <li style="margin-bottom: 8px;">Review their location type and prepare relevant partnership information</li>
              <li>Update appointment status in the system after contact</li>
            </ul>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 20px; background-color: #f9fafb; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              📅 Submitted on ${createdAt}<br>
              🔔 This is an automated notification from your appointment system
            </p>
          </div>
        </div>
      </div>
    `;

    // Send notification email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'info@ukclothingcaravan.co.uk',
      subject: subject,
      text: textContent,
      html: htmlContent,
    });

    console.log(`✓ Appointment notification sent for: ${appointmentData.name}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Notification email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending appointment notification:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send notification email' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, message: 'GET method not supported' },
    { status: 405 }
  );
}