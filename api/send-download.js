const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || 'smtp.gmail.com',
	port: parseInt(process.env.SMTP_PORT || '587'),
	secure: false,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS
	},
	tls: {
		rejectUnauthorized: false
	},
	connectionTimeout: 10000,
	socketTimeout: 10000,
	greetingTimeout: 10000
});

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

module.exports = async (req, res) => {
	// Set CORS headers
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	// Handle preflight
	if (req.method === 'OPTIONS') {
		return res.status(200).end();
	}

	// Only allow POST
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

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

		// Get the base URL from the request
		const baseUrl = req.headers.origin || `https://${req.headers.host}`;

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
						<a href="${baseUrl}/${pdfUrl}" 
						   style="display: inline-block; padding: 12px 24px; background-color: #14B8A6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
							Download ${pdfName}
						</a>
					</p>
					<p>If the button doesn't work, you can copy and paste this link into your browser:</p>
					<p style="color: #666; word-break: break-all;">${baseUrl}/${pdfUrl}</p>
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
				console.error('Full error:', emailError);
				// Don't fail the request if email fails
			}
		} else {
			console.log('⚠️  SMTP credentials not configured, skipping email');
		}

		console.log('Download request processed successfully');
		res.status(200).json({ success: true, message: 'Download link sent successfully' });
	} catch (error) {
		console.error('Error processing download request:', error);
		console.error('Error stack:', error.stack);
		res.status(500).json({ error: 'Internal server error: ' + error.message });
	}
};

