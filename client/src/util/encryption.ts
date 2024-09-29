import { cipher, pkcs5, random, util } from "node-forge";

const algorithm = "AES-CBC";

/**
 * The following encryption technique is heavily inspired by this article:
 * https://medium.com/passpill-project/creating-a-client-side-encryption-system-aaa601b4ad35
 */

/**
 * Encrypt the data contents
 * @param password Password of user
 * @param salt Salt
 * @param data Data string to be encrypted
 * @returns The encrypted data in hex format
 */
export function encrypt(password: string, salt: string, data: string) {
  // Both IV and key have to be 32 bytes for AES-256
  const iv = random.getBytesSync(32).toString();
  const key = pkcs5.pbkdf2(password, salt, 2, 32);
  const aes_cipher = cipher.createCipher(algorithm, key);

  aes_cipher.start({ iv: iv });
  aes_cipher.update(util.createBuffer(data));
  aes_cipher.finish();

  var encrypted = aes_cipher.output;

  // Create a pill with the salt, IV, and the encrypted bytes
  return salt + iv + encrypted.getBytes();
}

/**
 * Decrypt the data contents
 * @param password Password of user
 * @param data Data to be decrypted
 * @returns The decrypted data string
 */
export function decrypt(password: string, pill: string) {
  // Knowing that the salt and IV are 32 bytes each, slice the pill to retrieve them
  const salt = pill.slice(0, 32);
  const iv = pill.slice(32, 64);
  // The leftover pill will be the encrypted data in bytes form
  const encrypted_data = pill.slice(64);
  const key = pkcs5.pbkdf2(password, salt, 2, 32);

  const aes_decipher = cipher.createDecipher(algorithm, key);

  const input = util.createBuffer(encrypted_data);

  aes_decipher.start({ iv: iv });
  aes_decipher.update(input);
  var result = aes_decipher.finish();
  if (result) {
    return aes_decipher.output.data;
  } else {
    throw new Error("Data has been tampered with or password is wrong");
  }
}
