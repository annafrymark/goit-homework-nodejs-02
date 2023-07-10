const sgMail = require("@sendgrid/mail");
require("dotenv").config();
const { nanoid } = require("nanoid");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function createVerificationToken() {
  verificationToken = nanoid();
  return verificationToken;
}

async function sendVerificationEmail(email, verificationToken) {
  const msg = {
    to: email, // Change to your recipient
    from: "annamarai.dev@gmail.com", // Change to your verified sender
    subject: "Verification email",
    text: `Please verify your email: ${process.env.HOST_URL}/api/users/verify/:${verificationToken}`,
    html: `<p>Please verify your email: <a href = ${process.env.HOST_URL}/api/users/verify/:${verificationToken}></p>`,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
}


module.exports = { createVerificationToken, sendVerificationEmail };
