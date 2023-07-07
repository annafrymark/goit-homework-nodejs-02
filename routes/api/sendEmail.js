const sgMail = require("@sendgrid/mail");

const nanoid = require("nanoid/async");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function createVerificationToken() {
  verificationToken = await nanoid();
}

async function sendVerificationEmail(email, verificationToken) {
  const msg = {
    to: email, // Change to your recipient
    from: "annamarai.dev@gmail.com", // Change to your verified sender
    subject: "Verification email",
    text: `Please verify your email: http://localhost:3000/api/users/verify/:${verificationToken}`,
    html: `<p>Please verify your email: <a href = http://localhost:3000/api/users/verify/:${verificationToken}></p>`,
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
