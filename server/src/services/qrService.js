const QRCode = require('qrcode');

const generateQRCode = async (data) => {
  try {
    const text = typeof data === 'object' ? JSON.stringify(data) : String(data);
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
      width: 250,
    });
    return dataUrl;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    return '';
  }
};

module.exports = { generateQRCode };
