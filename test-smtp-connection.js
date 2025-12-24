// Test SMTP connection script
const net = require('net');

const host = 'smtp.feishu.cn';
const port = 465;

console.log(`Testing connection to ${host}:${port}...`);

const socket = new net.Socket();
const timeout = 10000; // 10 seconds

socket.setTimeout(timeout);

socket.on('connect', () => {
	console.log(`✅ Successfully connected to ${host}:${port}`);
	socket.destroy();
	process.exit(0);
});

socket.on('timeout', () => {
	console.error(`❌ Connection timeout after ${timeout}ms`);
	socket.destroy();
	process.exit(1);
});

socket.on('error', (err) => {
	console.error(`❌ Connection error: ${err.message}`);
	console.error(`   Code: ${err.code}`);
	if (err.code === 'ENOTFOUND') {
		console.error('   The hostname could not be resolved. Check your DNS settings.');
	} else if (err.code === 'ECONNREFUSED') {
		console.error('   Connection refused. The server may be down or the port may be blocked.');
	} else if (err.code === 'ETIMEDOUT') {
		console.error('   Connection timed out. Check firewall settings or network connectivity.');
	} else if (err.code === 'EHOSTUNREACH') {
		console.error('   Host unreachable. Check network routing.');
	}
	process.exit(1);
});

socket.connect(port, host);

