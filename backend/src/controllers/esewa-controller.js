//THIRD-PARTY MODULES
import crypto from "crypto";
import esewaSignatureGenerator from "../config/signatureGenerator.js";

//CHECKOUT E-SEWA
export const checkout = async (req, res) => {
  const { amount } = req.body;
  const transaction_uuid = crypto.randomUUID();


  //CREATE SIGNATURE FOR E-SEWA
  const signature = esewaSignatureGenerator(amount, transaction_uuid);

  const data = {
    amount: amount,
    tax_amount: 0,
    total_amount: amount,
    transaction_uuid: transaction_uuid,
    product_code: "EPAYTEST",
    product_service_charge: 0,
    product_delivery_charge: 0,
    success_url: "http://localhost:3000/api/v1/esewa/success",
    failure_url: "http://localhost:3000/api/v1/esewa/failure",
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature: signature,
  };

  res.json(data);
};


//SUCCESS PAYMENT E-SEWA
export const success = async (req, res) => {
  console.log("eSewa Success Callback:", req.body);

  const { transaction_uuid, total_amount, reference_id } = req.body;

  try {
    // 🔐 VERIFY PAYMENT SERVER TO SERVER
    const verify = await axios.post(
      "https://rc-epay.esewa.com.np/api/epay/transaction/status/",
      {
        product_code: "EPAYTEST",
        total_amount,
        transaction_uuid,
      },
    );

    if (verify.data.status === "COMPLETE") {
      await Order.findOneAndUpdate(
        { _id: transaction_uuid },
        { paid: "PAID", transactionId: reference_id },
      );

      return res.redirect("http://localhost:3000/payment-success");
    }

    return res.redirect("http://localhost:3000/payment-failed");
  } catch (err) {
    console.error("Verify Error:", err);
    return res.redirect("http://localhost:3000/payment-failed");
  }
};


//FAIL PAYMENT E-SEWA
export const failure = (req, res) => {
  console.log("eSewa Failed:", req.body);
  res.redirect("http://localhost:3000/payment-failed");
};
