const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    authTimeoutMs: 120000,
    qrMaxRetries: 5,
    markOnlineOnConnect: false,
    puppeteer: {
        headless: true,
        timeout: 120000,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    }
});

client.on('qr', (qr) => {
    console.log('QR Code Received, Scan it Fast!');
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('Bot is Ready!');

    // Bot ke offline rakhar chesta korbe, jate bot er karone account online na dekha jay
    try {
        await client.sendPresenceUnavailable();
    } catch (err) {
        console.log('Presence Error:', err.message);
    }
});

client.on('authenticated', () => {
    console.log('Login Successful!');
});

client.on('auth_failure', (msg) => {
    console.log('Login Failed!', msg);
});

client.on('disconnected', (reason) => {
    console.log('Bot Disconnected!', reason);
});

client.on('message', async (msg) => {
    try {
        if (msg.from === 'status@broadcast' || msg.fromMe) return;

        const text = msg.body.toLowerCase().trim();
        let replyText = '';

        // includes use korlam, jate helli, helloo, hii sob dhore
        if (text.includes('hi') || text.includes('hello') || text.includes('hey') || text.includes('helli') || text.includes('ho')) {
            replyText = 'Hi! Welcome. How can I help you?';
        }
        else if (text.includes('price') || text.includes('dam') || text.includes('cost') || text.includes('rate')) {
            replyText = 'Please let me know which product price you want to know.';
        }
        else if (text.includes('thank')) {
            replyText = 'Thank you so much! Please visit again. We are happy to serve you.';
        }
        else if (text.includes('location') || text.includes('address') || text.includes('where') || text.includes('kothay') || text.includes('shop')) {
            replyText = 'Our Address:\nCoxs Bazar Sadar, Main Road\nPhone: 018XX-XXXXXX\n\nOpen: 9 AM - 9 PM';
        }
        else if (text.includes('delivery') || text.includes('kobe pabo') || text.includes('when')) {
            replyText = 'Your order will be delivered within 2-3 days.';
        }
        else {
            replyText = 'Sorry, I could not find an answer. Please try another keyword.';
        }

        // Quote diye Reply dibe, kintu chat Seen/Read korbe na.
        // sendSeen: false na dile whatsapp-web.js default vabe read receipt pathay,
        // tokhon pathano number er phone e blue tick/seen dekha jay.
        await client.sendMessage(msg.from, replyText, {
            quotedMessageId: msg.id._serialized,
            sendSeen: false
        });

    } catch (err) {
        console.log('Message Error:', err.message);
    }
});

client.initialize().catch(err => {
    console.log('Initialize Error:', err.message);
});