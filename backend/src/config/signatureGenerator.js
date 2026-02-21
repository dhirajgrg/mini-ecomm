import crypto from "crypto";

const product_code = "EPAYTEST";
const secret_key = "8gBm/:&EnhH.1/q";
const esewaSignatureGenerator = (total_amount, transaction_uuid) => {
    
  // 1. Create the message string in the exact format eSewa expects
  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

  // 2. Create the HMAC-SHA256 hash using your Secret Key
  const signature = crypto
    .createHmac("sha256", secret_key)
    .update(message)
    .digest("base64"); // eSewa requires Base64 encoding

  return signature;
};

export default esewaSignatureGenerator;
