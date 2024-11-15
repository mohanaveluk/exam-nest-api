"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactAdminTemplate = void 0;
const contactAdminTemplate = (data) => `
<!DOCTYPE html>
<html>
<body>
  <h2>New Contact Form Submission</h2>
  <p>A new contact form has been submitted with the following details:</p>
  <ul>
    <li><strong>Name:</strong> ${data.fullName}</li>
    <li><strong>Email:</strong> ${data.email}</li>
    <li><strong>Mobile:</strong> ${data.mobileNumber}</li>
  </ul>
  <h3>Message:</h3>
  <p>${data.message}</p>
</body>
</html>
`;
exports.contactAdminTemplate = contactAdminTemplate;
//# sourceMappingURL=contact-admin.template.js.map