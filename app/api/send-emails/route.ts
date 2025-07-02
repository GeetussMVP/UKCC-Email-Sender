import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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
    const attachments = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return {
          filename: file.name,
          content: buffer,
          contentType: file.type,
        };
      })
    );

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

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: subject,
          text: message,
          html: message.replace(/\n/g, '<br>'),
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