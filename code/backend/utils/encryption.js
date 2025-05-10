const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'.substring(0, 32);

/**
 * Encrypts a file buffer using AES-256-CBC
 * @param {Buffer} buffer - The file buffer to encrypt
 * @returns {Object} Object containing encrypted data and initialization vector
 */
const encryptFile = (buffer) => {
    try {
        if (!Buffer.isBuffer(buffer)) {
            console.log('Input is not a buffer, converting...');
            buffer = Buffer.from(buffer);
        }
        
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipheriv(
            'aes-256-cbc', 
            Buffer.from(ENCRYPTION_KEY), 
            iv
        );
        
        const encryptedBuffer = Buffer.concat([
            cipher.update(buffer),
            cipher.final()
        ]);
        
        return {
            encryptedData: encryptedBuffer,
            iv: iv.toString('hex')
        };
    } catch (error) {
        console.error('Encryption error details:', error);
        throw new Error('Failed to encrypt file: ' + error.message);
    }
};

/**
 * Decrypts an encrypted file buffer
 * @param {Buffer} encryptedBuffer - The encrypted file buffer
 * @param {string} iv - The initialization vector as a hex string
 * @returns {Buffer} The decrypted file buffer
 */
const decryptFile = (encryptedBuffer, iv) => {
    try {
        const ivBuffer = Buffer.from(iv, 'hex');
        
        const decipher = crypto.createDecipheriv(
            'aes-256-cbc', 
            Buffer.from(ENCRYPTION_KEY), 
            ivBuffer
        );
        
        return Buffer.concat([
            decipher.update(encryptedBuffer),
            decipher.final()
        ]);
    } catch (error) {
        console.error('Decryption error details:', error);
        throw new Error('Failed to decrypt file: ' + error.message);
    }
};

module.exports = {
    encryptFile,
    decryptFile
};