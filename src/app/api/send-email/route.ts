import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
    try {
        const { to, galleryUrl, username, galleryName } = await request.json();

        console.log('📧 Email API called with:', { to, galleryUrl, username, galleryName });

        // Check environment variables
        const gmailUser = process.env.GMAIL_USER;
        const gmailPass = process.env.GMAIL_APP_PASSWORD;

        console.log('📧 Environment check:', {
            hasGmailUser: !!gmailUser,
            hasGmailPass: !!gmailPass,
            gmailUserValue: gmailUser ? gmailUser.substring(0, 5) + '...' : 'NOT SET'
        });

        if (!gmailUser || !gmailPass) {
            console.error('❌ Missing Gmail credentials in environment variables');
            return NextResponse.json(
                { error: 'Email service not configured' },
                { status: 500 }
            );
        }

        // Validate required fields
        if (!to || !galleryUrl) {
            console.error('❌ Missing required fields:', { to: !!to, galleryUrl: !!galleryUrl });
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create transporter using Gmail SMTP
        console.log('📧 Creating Gmail transporter...');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmailUser,
                pass: gmailPass,
            },
        });

        // Generate NPS link
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const npsLink = `${baseUrl}/nps`;

        // Email content
        const mailOptions = {
            from: `"Hargao" <${process.env.GMAIL_USER}>`,
            to,
            subject: `🎉 Your Gallery "${galleryName || 'My Gallery'}" is Live!`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                        <!-- Header -->
                        <div style="background-color: #FF8C00; border: 4px solid #1a1a2e; padding: 30px; text-align: center; box-shadow: 8px 8px 0 #1a1a2e;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 800; text-transform: uppercase; color: #ffffff;">
                                🎉 Congratulations!
                            </h1>
                        </div>
                        
                        <!-- Content -->
                        <div style="background-color: #ffffff; border: 4px solid #1a1a2e; border-top: none; padding: 30px;">
                            <p style="font-size: 16px; line-height: 1.6; color: #333;">
                                Hi ${username || 'there'},
                            </p>
                            <p style="font-size: 16px; line-height: 1.6; color: #333;">
                                Your 3D gallery <strong>"${galleryName || 'My Gallery'}"</strong> is now live and ready to share with the world!
                            </p>
                            
                            <!-- Gallery Link Box -->
                            <div style="background-color: #f0f0f0; border: 3px solid #1a1a2e; padding: 20px; margin: 25px 0; text-align: center;">
                                <p style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; font-weight: 700; color: #666;">
                                    Your Gallery Link
                                </p>
                                <a href="${baseUrl}${galleryUrl}" style="font-size: 18px; font-weight: 600; color: #008080; word-break: break-all; text-decoration: none;">
                                    ${baseUrl}${galleryUrl}
                                </a>
                            </div>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${baseUrl}${galleryUrl}" style="display: inline-block; padding: 15px 40px; background-color: #FF8C00; border: 3px solid #1a1a2e; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 16px; text-transform: uppercase;">
                                    View Your Gallery
                                </a>
                            </div>
                            
                            <p style="font-size: 16px; line-height: 1.6; color: #333;">
                                Share this link with friends, family, or on social media to showcase your art!
                            </p>
                            
                            <!-- Divider -->
                            <hr style="border: none; border-top: 2px solid #eee; margin: 30px 0;">
                            
                            <!-- Feedback Section -->
                            <div style="background-color: #f9fafb; border: 2px dashed #ddd; padding: 20px; text-align: center;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                                    💬 <strong>Quick question (30 seconds):</strong>
                                </p>
                                <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">
                                    How likely are you to recommend Hargao?
                                </p>
                                <a href="${npsLink}" style="display: inline-block; padding: 10px 25px; background-color: #008080; border: 2px solid #1a1a2e; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px;">
                                    Share Feedback
                                </a>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
                            <p style="margin: 0;">
                                Made with ❤️ by <strong>Hargao</strong>
                            </p>
                            <p style="margin: 10px 0 0 0;">
                                <a href="${baseUrl}" style="color: #888;">hargao.io</a>
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        // Send email
        console.log('📧 Sending email to:', to);
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!', { messageId: result.messageId, response: result.response });

        return NextResponse.json({ success: true, messageId: result.messageId });
    } catch (error: any) {
        console.error('❌ Email send error:', error.message || error);
        console.error('❌ Full error:', error);
        return NextResponse.json(
            { error: 'Failed to send email', details: error.message },
            { status: 500 }
        );
    }
}
