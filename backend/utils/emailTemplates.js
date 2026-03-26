function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function baseTemplate({ companyName, subject, greetingName, bodyHtml }) {
  const safeCompany = escapeHtml(companyName || 'EnterpriseHR');
  const safeGreetingName = escapeHtml(greetingName || 'Employee');
  return `
  <div style="font-family: Inter, Arial, sans-serif; background:#f9fafb; padding:24px;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
      <div style="background:#4F46E5;color:#fff;padding:18px 20px;font-weight:700;font-size:18px;">
        ${safeCompany}
      </div>
      <div style="padding:20px;color:#111827;">
        <div style="font-size:12px;color:#6b7280;margin-bottom:12px;">${escapeHtml(subject || '')}</div>
        <p style="margin:0 0 12px 0;font-size:14px;">Dear ${safeGreetingName},</p>
        <div style="font-size:14px;line-height:1.6;">
          ${bodyHtml}
        </div>
        <div style="margin-top:18px;font-size:14px;">
          Regards,<br/>
          HR Department<br/>
          ${safeCompany}
        </div>
      </div>
      <div style="background:#f3f4f6;color:#6b7280;padding:12px 20px;font-size:12px;">
        This is an automated HR notification. Please do not reply.
      </div>
    </div>
  </div>
  `;
}

function newLeaveRequestEmail({ companyName, employeeName, startDate, endDate, reason }) {
  const bodyHtml = `
    <p style="margin:0 0 10px 0;">A new leave request has been submitted.</p>
    <ul style="margin:0;padding-left:18px;">
      <li><b>Employee</b>: ${escapeHtml(employeeName)}</li>
      <li><b>Start Date</b>: ${escapeHtml(startDate)}</li>
      <li><b>End Date</b>: ${escapeHtml(endDate)}</li>
      <li><b>Reason</b>: ${escapeHtml(reason)}</li>
    </ul>
    <p style="margin:12px 0 0 0;">Please review the request in the HRMS portal.</p>
  `;
  return baseTemplate({
    companyName,
    subject: 'New Leave Request Submitted',
    greetingName: 'HR/Admin',
    bodyHtml,
  });
}

function leaveStatusUpdateEmail({ companyName, employeeName, status, startDate, endDate }) {
  const statusColor = status === 'approved' ? '#16a34a' : status === 'rejected' ? '#dc2626' : '#6b7280';
  const bodyHtml = `
    <p style="margin:0 0 10px 0;">Your leave request status has been updated:</p>
    <p style="margin:0 0 10px 0;">
      <b>Status</b>: <span style="color:${statusColor};font-weight:700;">${escapeHtml(status)}</span>
    </p>
    <ul style="margin:0;padding-left:18px;">
      <li><b>Start Date</b>: ${escapeHtml(startDate)}</li>
      <li><b>End Date</b>: ${escapeHtml(endDate)}</li>
    </ul>
    <p style="margin:12px 0 0 0;">If you have questions, contact HR.</p>
  `;
  return baseTemplate({
    companyName,
    subject: 'Leave Request Status Update',
    greetingName: employeeName,
    bodyHtml,
  });
}

function employeeToAdminEmail({ companyName, employeeName, employeeCode, subject, message }) {
  const bodyHtml = `
    <p style="margin:0 0 10px 0;">An employee has submitted a new inquiry/request via the dashboard.</p>
    <div style="background:#f9fafb;padding:12px;border-left:4px solid #4F46E5;margin:12px 0;">
      <p style="margin:0 0 4px 0;"><b>From</b>: ${escapeHtml(employeeName)} (ID: ${escapeHtml(employeeCode)})</p>
      <p style="margin:0 0 4px 0;"><b>Subject</b>: ${escapeHtml(subject)}</p>
    </div>
    <div style="font-size:14px;line-height:1.6;margin-top:12px;white-space:pre-wrap;">
${escapeHtml(message)}
    </div>
    <p style="margin:16px 0 0 0;">Please follow up with this employee if required.</p>
  `;
  return baseTemplate({
    companyName,
    subject: 'New Employee Inquiry',
    greetingName: 'HR/Admin Team',
    bodyHtml,
  });
}

module.exports = {
  newLeaveRequestEmail,
  leaveStatusUpdateEmail,
  employeeToAdminEmail,
};

