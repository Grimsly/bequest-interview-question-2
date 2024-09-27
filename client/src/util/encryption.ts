import { cipher, Hex, pkcs5, util } from "node-forge";

const algorithm = "AES-CBC";

/**
 * Encrypt the data contents
 * @param password Password of user
 * @param iv Initialization vector
 * @param salt Salt
 * @param data Data string to be encrypted
 * @returns The encrypted data in hex format
 */
export function encrypt(
  password: string,
  iv: string,
  salt: string,
  data: string
) {
  const key = pkcs5.pbkdf2(password, salt, 2, 32);
  const aes_cipher = cipher.createCipher(algorithm, key);

  aes_cipher.start({ iv: iv });
  aes_cipher.update(util.createBuffer(data));
  aes_cipher.finish();

  var encrypted = aes_cipher.output;

  return encrypted.toHex();
}

/**
 * Decrypt the data contents
 * @param password Password of user
 * @param iv Initialization vector
 * @param salt Salt
 * @param data Data to be decrypted
 * @returns The decrypted data string
 */
export function decrypt(
  password: string,
  iv: string,
  salt: string,
  encrypted_data: Hex
) {
  const key = pkcs5.pbkdf2(password, salt, 2, 32);

  const aes_decipher = cipher.createDecipher(algorithm, key);

  const input = util.createBuffer(util.hexToBytes(encrypted_data));

  aes_decipher.start({ iv: iv });
  aes_decipher.update(input);
  var result = aes_decipher.finish();

  console.log(result);

  return aes_decipher.output.data;
}
