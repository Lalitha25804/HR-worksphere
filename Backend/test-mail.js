require('dotenv').config();
const { sendWelcomeEmail } = require("./utils/mailer");

(async () => {
  console.log("Testing mailer with EMAIL_USER:", process.env.EMAIL_USER);
  await sendWelcomeEmail(process.env.EMAIL_USER, "Test User", "Test Role", "test-password-123");
  console.log("Test execution finished.");
})();
