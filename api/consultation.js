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

// Store submissions in a JSON file
const DATA_FILE = path.join('/tmp', 'consultations.json');

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

	console.log('Received consultation request:', req.body);

	try {
		const { name, email, company, country, employees, notes } = req.body;

		// Validate required fields
		if (!name || !email || !company || !country || !employees) {
			console.log('Validation failed - missing fields:', { name, email, company, country, employees });
			return res.status(400).json({ error: 'All fields are required' });
		}

		// Create submission object
		const submission = {
			id: Date.now().toString(),
			name,
			email,
			company,
			country,
			employees,
			notes: notes || '',
			submittedAt: new Date().toISOString()
		};

		console.log('Saving submission...');
		// Save to file (in Vercel, use /tmp directory)
		try {
			const data = await readData();
			data.push(submission);
			await writeData(data);
			console.log('Data saved successfully');
		} catch (fileError) {
			console.error('Error saving to file:', fileError);
			// Continue even if file save fails
		}

		// Send email notification
		if (process.env.SMTP_USER && process.env.SMTP_PASS) {
			const mailOptions = {
				from: process.env.SMTP_USER,
				to: process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER,
				subject: 'New Consultation Request',
				html: `
					<h2>New Consultation Request</h2>
					<p><strong>Name:</strong> ${name}</p>
					<p><strong>Email:</strong> ${email}</p>
					<p><strong>Company:</strong> ${company}</p>
					<p><strong>Country:</strong> ${country}</p>
					<p><strong>Employees to Hire:</strong> ${employees}</p>
					${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
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
			}
		} else {
			console.log('⚠️  SMTP credentials not configured, skipping email');
		}

		console.log('Consultation request processed successfully');
		res.status(200).json({ success: true, message: 'Consultation request submitted successfully' });
	} catch (error) {
		console.error('Error processing consultation:', error);
		console.error('Error stack:', error.stack);
		res.status(500).json({ error: 'Internal server error: ' + error.message });
	}
};


