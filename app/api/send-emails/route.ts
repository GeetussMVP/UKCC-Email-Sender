import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type { Attachment } from 'nodemailer/lib/mailer';

interface EmailResponse {
  success: boolean;
  message: string;
  successCount?: number;
  failedEmails?: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Parse FormData instead of JSON to handle file uploads
    const formData = await request.formData();
    
    // Extract basic data
    const emailsString = formData.get('emails') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const category = formData.get('category') as string;
    const childrenWithCancerImage = formData.get('childrenWithCancerImage') as string;
    const treeOfHopeImage = formData.get('treeOfHopeImage') as string;
    
    // Parse emails array
    let emails: string[];
    try {
      emails = JSON.parse(emailsString);
    } catch (error) {
      console.error('Invalid emails JSON:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email format in request',
        },
        { status: 400 }
      );
    }
    
    // Extract files
    const files: File[] = [];
    const fileEntries = Array.from(formData.entries())
      .filter(([key]) => key.startsWith('file_'))
      .map(([, value]) => value as File);
    
    files.push(...fileEntries);
    
    // Validate input
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please provide a valid list of email addresses',
        },
        { status: 400 }
      );
    }

    if (!subject || !message) {
      return NextResponse.json(
        {
          success: false,
          message: 'Subject and message are required',
        },
        { status: 400 }
      );
    }

    // Log for debugging
    console.log(`Sending emails for category: ${category}`);
    console.log(`Email count: ${emails.length}`);
    console.log(`File count: ${files.length}`);
    if (files.length > 0) {
      console.log(`Files:`, files.map(f => f.name));
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your app password
      },
    });

    try {
      // Verify transporter credentials
      await transporter.verify();
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
      return NextResponse.json(
        {
          success: false,
          message: 'Email configuration is invalid. Please check credentials.',
        },
        { status: 500 }
      );
    }

    // Prepare file attachments
    const attachments: Attachment[] = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return {
          filename: file.name,
          content: buffer,
          contentType: file.type,
        };
      })
    );

    // Add charity bank images as attachments (always include if available)
    if (childrenWithCancerImage && childrenWithCancerImage.length > 0) {
      try {
        const base64Data = childrenWithCancerImage.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        if (base64Data) {
          const buffer = Buffer.from(base64Data, 'base64');
          attachments.push({
            filename: 'children-with-cancer-bank.jpg',
            content: buffer,
            contentType: 'image/jpeg',
            cid: 'childrenWithCancerBank' // Content ID for embedding in email
          });
        }
      } catch (error) {
        console.error('Error processing Children with Cancer image:', error);
      }
    }

    if (treeOfHopeImage && treeOfHopeImage.length > 0) {
      try {
        const base64Data = treeOfHopeImage.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        if (base64Data) {
          const buffer = Buffer.from(base64Data, 'base64');
          attachments.push({
            filename: 'tree-of-hope-bank.jpg',
            content: buffer,
            contentType: 'image/jpeg',
            cid: 'treeOfHopeBank' // Content ID for embedding in email
          });
        }
      } catch (error) {
        console.error('Error processing Tree of Hope image:', error);
      }
    }

    const failedEmails: string[] = [];
    let successCount = 0;

    for (const email of emails) {
      try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          console.error(`Invalid email format: ${email}`);
          failedEmails.push(email);
          continue;
        }

        // Create HTML version with embedded images
        let htmlMessage = message.replace(/\n/g, '<br>');
        
        // Find the middle of the message to insert images
        const messageParts = htmlMessage.split('<br>');
        const middleIndex = Math.floor(messageParts.length / 2);
        
        // Create charity bank images section
        let charityBanksSection = '<br><div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; text-align: center;">';
        charityBanksSection += '<h3 style="color: #2563eb; margin-bottom: 15px; font-family: Arial, sans-serif;">🏦 Our Charity Clothing Banks 🏦</h3>';
        
        if (childrenWithCancerImage && childrenWithCancerImage.length > 0) {
          charityBanksSection += `
            <div style="margin: 15px 0; padding: 10px; border: 2px solid #3b82f6; border-radius: 8px; background-color: white;">
              <h4 style="color: #1e40af; margin-bottom: 10px;">💙 Children with Cancer UK Clothing Bank</h4>
              <img src="cid:childrenWithCancerBank" alt="Children with Cancer UK Clothing Bank" style="max-width: 350px; width: 100%; height: auto; display: block; margin: 10px auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="color: #1e40af; font-weight: bold; margin-top: 10px;">- Supporting brave children and families affected by cancer 💪</p>
            </div>
          `;
        }
        
        if (treeOfHopeImage && treeOfHopeImage.length > 0) {
          charityBanksSection += `
            <div style="margin: 15px 0; padding: 10px; border: 2px solid #059669; border-radius: 8px; background-color: white;">
              <h4 style="color: #047857; margin-bottom: 10px;">🌳 Tree of Hope Clothing Bank</h4>
              <img src="cid:treeOfHopeBank" alt="Tree of Hope Clothing Bank" style="max-width: 350px; width: 100%; height: auto; display: block; margin: 10px auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="color: #047857; font-weight: bold; margin-top: 10px;">- Helping families access life-changing medical treatments 🙏</p>
            </div>
          `;
        }
        
        charityBanksSection += '</div><br>';
        
        // Insert charity banks section in the middle of the message
        messageParts.splice(middleIndex, 0, charityBanksSection);
        htmlMessage = messageParts.join('<br>');
        
        // Remove old placeholder references since we now have dedicated sections
        htmlMessage = htmlMessage.replace(/📸 \*\*Children with Cancer UK Clothing Bank\*\* - [^<]*/g, '');
        htmlMessage = htmlMessage.replace(/📸 \*\*Tree of Hope Clothing Bank\*\* - [^<]*/g, '');

        // Add professional email styling
        htmlMessage = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">🌟 Sustainable Partnership Opportunity 🌟</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              ${htmlMessage}
              <div style="margin-top: 30px; padding: 20px; background-color: #f0f9ff; border-radius: 8px; text-align: center; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #1e40af; font-weight: bold;">🤝 Ready to make a difference together? Let's chat! 📞</p>
              </div>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: subject,
          text: message,
          html: htmlMessage,
          attachments: attachments.length > 0 ? attachments : undefined,
        });

        successCount++;
        console.log(`✓ Email sent to: ${email} (Category: ${category})`);
      } catch (error) {
        console.error(`✗ Failed to send email to ${email}:`, error);
        failedEmails.push(email);
      }
    }

    const allFailed = successCount === 0;
    const partialSuccess = successCount > 0 && failedEmails.length > 0;

    let responseMessage = '';
    if (allFailed) {
      responseMessage = `Failed to send emails to all recipients in ${category}`;
    } else if (partialSuccess) {
      responseMessage = `Emails sent for ${category}! ${successCount} succeeded, ${failedEmails.length} failed`;
    } else {
      responseMessage = `All emails sent successfully for ${category} to ${successCount} recipients!`;
    }

    const response: EmailResponse = {
      success: successCount > 0,
      message: responseMessage,
      successCount,
      failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error while processing request',
      },
      { status: 500 }
    );
  }
}

// Optional: Add other HTTP methods if needed
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: 'GET method not supported for this endpoint',
    },
    { status: 405 }
  );
}