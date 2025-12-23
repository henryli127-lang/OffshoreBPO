const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Email configuration
const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || 'smtp.gmail.com',
	port: parseInt(process.env.SMTP_PORT || '587'),
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS
	},
	tls: {
		// Do not fail on invalid certs
		rejectUnauthorized: false
	},
	// Connection timeout
	connectionTimeout: 10000,
	// Socket timeout
	socketTimeout: 10000,
	// Greeting timeout
	greetingTimeout: 10000
});

// Store submissions in a JSON file
const DATA_FILE = path.join(__dirname, 'consultations.json');

async function readData() {
	try {
		const data = await fs.readFile(DATA_FILE, 'utf8');
		return JSON.parse(data);
	} catch (error) {
		return [];
	}
}

async function writeData(data) {
	await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Resource to PDF URL mapping
const resourceToUrl = {
	'service-overview': 'downloads/emiliateams-service-overview.pdf',
	'eor-vs-peo-guide': 'downloads/eor-vs-peo-guide.pdf',
	'china-team-guide': 'downloads/building-your-china-team-guide.pdf'
};

const resourceToName = {
	'service-overview': 'Service Overview',
	'eor-vs-peo-guide': 'EOR vs. PEO Guide',
	'china-team-guide': 'Building Your China Team Guide'
};

// API endpoint for download requests
app.post('/api/send-download', async (req, res) => {
	console.log('Received download request:', req.body);
	
	try {
		const { name, email, resource } = req.body;

		// Validate required fields
		if (!name || !email || !resource) {
			console.log('Validation failed - missing fields');
			return res.status(400).json({ error: 'Name, email, and resource are required' });
		}

		// Validate resource
		if (!resourceToUrl[resource]) {
			console.log('Validation failed - invalid resource:', resource);
			return res.status(400).json({ error: 'Invalid resource specified' });
		}

		const pdfUrl = resourceToUrl[resource];
		const pdfName = resourceToName[resource];

		// Send email with PDF link
		if (process.env.SMTP_USER && process.env.SMTP_PASS) {
			const mailOptions = {
				from: process.env.SMTP_USER,
				to: email,
				subject: `Your ${pdfName} Download`,
				html: `
					<h2>Thank you for your interest!</h2>
					<p>Hi ${name},</p>
					<p>As requested, here is your download link for the <strong>${pdfName}</strong>:</p>
					<p style="margin: 20px 0;">
						<a href="${req.protocol}://${req.get('host')}/${pdfUrl}" 
						   style="display: inline-block; padding: 12px 24px; background-color: #14B8A6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
							Download ${pdfName}
						</a>
					</p>
					<p>If the button doesn't work, you can copy and paste this link into your browser:</p>
					<p style="color: #666; word-break: break-all;">${req.protocol}://${req.get('host')}/${pdfUrl}</p>
					<p>Best regards,<br>The EmiliaTeams Team</p>
				`
			};

			try {
				console.log('Attempting to send download email...');
				console.log('To:', email);
				const info = await transporter.sendMail(mailOptions);
				console.log('✅ Download email sent successfully!');
				console.log('Message ID:', info.messageId);
			} catch (emailError) {
				console.error('❌ Error sending download email:');
				console.error('Error code:', emailError.code);
				console.error('Error message:', emailError.message);
				// Don't fail the request if email fails, but log it
			}
		} else {
			console.log('⚠️  SMTP credentials not configured, skipping email');
		}

		console.log('Download request processed successfully');
		res.json({ success: true, message: 'Download link sent successfully' });
	} catch (error) {
		console.error('Error processing download request:', error);
		console.error('Error stack:', error.stack);
		res.status(500).json({ error: 'Internal server error: ' + error.message });
	}
});

// API endpoint for consultation submissions
app.post('/api/consultation', async (req, res) => {
	console.log('Received consultation request:', req.body);
	
	try {
		const { name, email, phone, country, employees } = req.body;

		// Validate required fields
		if (!name || !email || !phone || !country || !employees) {
			console.log('Validation failed - missing fields');
			return res.status(400).json({ error: 'All fields are required' });
		}

		// Create submission object
		const submission = {
			id: Date.now().toString(),
			name,
			email,
			phone,
			country,
			employees,
			submittedAt: new Date().toISOString()
		};

		console.log('Saving submission to file...');
		// Save to file
		try {
			const data = await readData();
			data.push(submission);
			await writeData(data);
			console.log('Data saved successfully');
		} catch (fileError) {
			console.error('Error saving to file:', fileError);
			// Continue even if file save fails, but log the error
		}

		// Send email notification (don't fail if email fails)
		if (process.env.SMTP_USER && process.env.SMTP_PASS) {
			const mailOptions = {
				from: process.env.SMTP_USER,
				to: process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER,
				subject: 'New Consultation Request',
				html: `
					<h2>New Consultation Request</h2>
					<p><strong>Name:</strong> ${name}</p>
					<p><strong>Email:</strong> ${email}</p>
					<p><strong>Phone:</strong> ${phone}</p>
					<p><strong>Country:</strong> ${country}</p>
					<p><strong>Employees to Hire:</strong> ${employees}</p>
					<p><strong>Submitted:</strong> ${new Date(submission.submittedAt).toLocaleString()}</p>
				`
			};

			try {
				console.log('Attempting to send email...');
				console.log('From:', process.env.SMTP_USER);
				console.log('To:', process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER);
				const info = await transporter.sendMail(mailOptions);
				console.log('✅ Email sent successfully!');
				console.log('Message ID:', info.messageId);
			} catch (emailError) {
				console.error('❌ Error sending email:');
				console.error('Error code:', emailError.code);
				console.error('Error message:', emailError.message);
				console.error('Full error:', emailError);
				// Don't fail the request if email fails
			}
		} else {
			console.log('⚠️  SMTP credentials not configured, skipping email');
			console.log('SMTP_USER:', process.env.SMTP_USER ? 'Set' : 'Not set');
			console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'Set' : 'Not set');
		}

		console.log('Consultation request processed successfully');
		res.json({ success: true, message: 'Consultation request submitted successfully' });
	} catch (error) {
		console.error('Error processing consultation:', error);
		console.error('Error stack:', error.stack);
		res.status(500).json({ error: 'Internal server error: ' + error.message });
	}
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error('Unhandled error:', err);
	res.status(500).json({ error: 'Internal server error' });
});

// Test email configuration on startup
async function testEmailConfig() {
	if (process.env.SMTP_USER && process.env.SMTP_PASS) {
		console.log('📧 Email configuration found:');
		console.log('   SMTP_HOST:', process.env.SMTP_HOST || 'smtp.gmail.com');
		console.log('   SMTP_PORT:', process.env.SMTP_PORT || '587');
		console.log('   SMTP_USER:', process.env.SMTP_USER);
		console.log('   NOTIFICATION_EMAIL:', process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER);
		console.log('   SMTP_PASS:', process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'Not set');
		
		// Test connection (optional - can be slow)
		try {
			await transporter.verify();
			console.log('✅ SMTP connection verified successfully');
		} catch (verifyError) {
			console.error('❌ SMTP connection verification failed:');
			console.error('   Error:', verifyError.message);
			console.error('   Please check your SMTP credentials in .env file');
		}
	} else {
		console.log('⚠️  Warning: SMTP credentials not configured');
		console.log('   SMTP_USER:', process.env.SMTP_USER ? 'Set' : 'Not set');
		console.log('   SMTP_PASS:', process.env.SMTP_PASS ? 'Set' : 'Not set');
		console.log('   Please configure SMTP settings in .env file to receive email notifications');
	}
}

// Start server
app.listen(PORT, async () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
	console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
	await testEmailConfig();
});

