const PDFDocument = require("pdfkit");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");

async function generateReceipt(orderData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(buffers);

        const key = `receipts/receipt-${Date.now()}.pdf`;

        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: pdfBuffer,
            ContentType: "application/pdf",
          })
        );

        const url =
          `https://${process.env.S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${key}`;

        resolve(url);
      } catch (err) {
        reject(err);
      }
    });

    doc.fontSize(20).text("Order Receipt");

    doc.moveDown();

    doc.text(`Customer: ${orderData.name}`);
    doc.text(`Email: ${orderData.email}`);
    doc.text(`Amount: ${orderData.amount}`);

    doc.end();
  });
}

module.exports = generateReceipt;
