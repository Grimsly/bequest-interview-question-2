import { cipher, Hex, util } from "node-forge";

const algorithm = "AES-CBC";

export function encrypt(
  password: string,
  iv: string,
  salt: string,
  data: string
) {
  const aes_cipher = cipher.createCipher(algorithm, password);

  aes_cipher.start({ iv: iv });
  aes_cipher.update(util.createBuffer(data));
  aes_cipher.finish();

  var encrypted = aes_cipher.output;

  return encrypted.toHex();
}

export function decrypt(
  password: string,
  iv: string,
  salt: string,
  encrypted_data: Hex
) {
  const aes_decipher = cipher.createDecipher(algorithm, password);

  const input = util.createBuffer(util.hexToBytes(encrypted_data));

  aes_decipher.start({ iv: iv });
  aes_decipher.update(input);
  var result = aes_decipher.finish();

  console.log(result);

  return aes_decipher.output.data;
}
