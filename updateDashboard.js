const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'admin/src/pages/Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Import VisaTypesManager
content = content.replace(
  'import PaymentsPage from "./admin/PaymentsPage";',
  'import PaymentsPage from "./admin/PaymentsPage";\nimport VisaTypesManager from "../components/controls/VisaTypesManager";'
);

// 2. Add to controlSections
content = content.replace(
  '{ key: "processing-days", icon: Clock, label: "Processing Days" },\n    { key: "required-docs", icon: FileText, label: "Required Documents" },',
  '{ key: "processing-days", icon: Clock, label: "Processing Days" },\n    { key: "visa-types-dropdown", icon: ListChecks, label: "Visa Types Dropdown" },\n    { key: "required-docs", icon: FileText, label: "Required Documents" },'
);

// 3. Add to render loop
const searchStr = '              {/* === TAB: REQUIRED DOCUMENTS === */}\n              <div className={activeControlSection === "required-docs" ? "" : "hidden"}>';
const insertStr = `              {/* === TAB: VISA TYPES DROPDOWN MANAGER === */}
              <div className={activeControlSection === "visa-types-dropdown" ? "" : "hidden"}>
                <VisaTypesManager />
              </div>

`;

content = content.replace(searchStr, insertStr + searchStr);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Dashboard updated successfully.');
