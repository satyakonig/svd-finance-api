import * as CryptoJS from 'crypto-js';

const secretKey = 'triecoders';

const decrypt = (encryptedPayload: string) => {
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedPayload, secretKey);
  const decryptedPayload = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
  return decryptedPayload;
};

const encrypt = (payload: any) => {
  const encryptedPayload = CryptoJS.AES.encrypt(JSON.stringify(payload), secretKey).toString();
  return encryptedPayload;
};

export { decrypt, encrypt };
