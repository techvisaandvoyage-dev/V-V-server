const fs = require('fs');

function addImport(filePath, importStr) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('formatOrdinalDate') || content.includes('fmtDate')) return content;
  const lines = content.split('\n');
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) lastImport = i;
  }
  if (lastImport !== -1) {
    lines.splice(lastImport + 1, 0, importStr);
  } else {
    lines.unshift(importStr);
  }
  return lines.join('\n');
}

function processClient() {
  const clientUtils = 'import { formatOrdinalDate } from "../utils/dateUtils";';
  const clientUtils2 = 'import { formatOrdinalDate } from "../../utils/dateUtils";';

  let f, c;

  f = 'client/src/pages/ApplicationSummaryPage.jsx';
  c = addImport(f, clientUtils);
  c = c.replace(/return parsed\.toLocaleDateString\([\s\S]*?\);/, 'return formatOrdinalDate(parsed);');
  fs.writeFileSync(f, c);

  f = 'client/src/pages/UserDashboard.jsx';
  c = addImport(f, clientUtils);
  c = c.replace(/d\.toLocaleDateString\([^)]+\)/, 'formatOrdinalDate(d)');
  fs.writeFileSync(f, c);

  f = 'client/src/pages/ProfilePage.jsx';
  c = addImport(f, clientUtils);
  c = c.replace(/return parsed\.toLocaleDateString\([\s\S]*?\);/, 'return formatOrdinalDate(parsed);');
  fs.writeFileSync(f, c);

  f = 'client/src/pages/ApplicationDetails.jsx';
  c = addImport(f, clientUtils);
  c = c.replace(/new Date\(booking\.createdAt\)\.toLocaleDateString\(\)/g, 'formatOrdinalDate(booking.createdAt)');
  c = c.replace(/new Date\(booking\.travelDate\)\.toLocaleDateString\(\)/g, 'formatOrdinalDate(booking.travelDate)');
  c = c.replace(/new Date\(booking\.returnDate\)\.toLocaleDateString\(\)/g, 'formatOrdinalDate(booking.returnDate)');
  fs.writeFileSync(f, c);

  f = 'client/src/components/ui/DateRangePicker.jsx';
  c = addImport(f, clientUtils2);
  c = c.replace(/return d\.toLocaleDateString\([^)]+\);/, 'return formatOrdinalDate(d);');
  // I will leave aria-label alone, as it's for screen readers. Or replace if needed, but no big deal.
  fs.writeFileSync(f, c);

  f = 'client/src/components/common/SupportChatWidget.jsx';
  c = addImport(f, clientUtils2);
  c = c.replace(/new Date\(app\.travelDate\)\.toLocaleDateString\([\s\S]*?\)/, 'formatOrdinalDate(app.travelDate)');
  c = c.replace(/new Date\(draft\.travelDateFrom\)\.toLocaleDateString\([\s\S]*?\)/, 'formatOrdinalDate(draft.travelDateFrom)');
  fs.writeFileSync(f, c);
}

function processAdmin() {
  const adminUtils = 'import { fmtDate } from "../utils/formatDate";';
  const adminUtils2 = 'import { fmtDate } from "../../utils/formatDate";';

  let f, c;

  f = 'admin/src/pages/Details.jsx';
  c = addImport(f, adminUtils);
  c = c.replace(/new Date\(application\.dob\)\.toLocaleDateString\(\)/g, 'fmtDate(application.dob)');
  c = c.replace(/new Date\(application\.createdAt\)\.toLocaleDateString\(\)/g, 'fmtDate(application.createdAt)');
  c = c.replace(/new Date\(application\.travelDate\)\.toLocaleDateString\(\)/g, 'fmtDate(application.travelDate)');
  c = c.replace(/new Date\(application\.returnDate\)\.toLocaleDateString\(\)/g, 'fmtDate(application.returnDate)');
  c = c.replace(/new Date\(application\.visaFileUploadedAt\)\.toLocaleDateString\(\)/g, 'fmtDate(application.visaFileUploadedAt)');
  fs.writeFileSync(f, c);

  f = 'admin/src/pages/admin/PaymentsPage.jsx';
  c = addImport(f, adminUtils2);
  c = c.replace(/new Date\(transaction\.createdAt\)\.toLocaleDateString\(\)/g, 'fmtDate(transaction.createdAt)');
  fs.writeFileSync(f, c);

  f = 'admin/src/pages/Dashboard.jsx';
  c = addImport(f, adminUtils);
  c = c.replace(/d\.toLocaleDateString\([\s\S]*?\)/, 'fmtDate(d)');
  c = c.replace(/new Date\(tx\.createdAt\)\.toLocaleDateString\(\)/g, 'fmtDate(tx.createdAt)');
  fs.writeFileSync(f, c);

  f = 'admin/src/components/cms/StaticPagesManager.jsx';
  c = addImport(f, adminUtils2);
  c = c.replace(/return date\.toLocaleDateString\([\s\S]*?\);/, 'return fmtDate(date);');
  fs.writeFileSync(f, c);

  f = 'admin/src/components/blog/BlogAdminPanel.jsx';
  c = addImport(f, adminUtils2);
  c = c.replace(/return d\.toLocaleDateString\([\s\S]*?\);/, 'return fmtDate(d);');
  fs.writeFileSync(f, c);
}

processClient();
processAdmin();
console.log("Done");
