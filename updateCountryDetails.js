const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/pages/CountryDetails.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add activeVisaTypes state and fetch effect
const stateStr = '  const [visaOption, setVisaOption] = useState("e-Visa");';
const insertStateStr = `  const [visaOption, setVisaOption] = useState("e-Visa");
  const [activeVisaTypes, setActiveVisaTypes] = useState([]);

  useEffect(() => {
    let mounted = true;
    api.get("/visa-types/active").then(res => {
      if (mounted && res.data?.success) {
        setActiveVisaTypes(res.data.visaTypes);
        setVisaOption(prev => {
          const types = res.data.visaTypes;
          if (types.length > 0 && !types.some(t => t.name === prev)) {
            return types[0].name;
          }
          return prev;
        });
      }
    }).catch(err => console.error("Failed to fetch visa types", err));
    return () => { mounted = false; };
  }, []);
`;

content = content.replace(stateStr, insertStateStr);

// 2. Replace hardcoded select options
const selectSearchStr = `<option value="e-Visa">e-Visa</option>
                    <option value="Sticker Visa">Sticker Visa</option>`;
const selectInsertStr = `{activeVisaTypes.length > 0 ? (
                      activeVisaTypes.map(vt => (
                        <option key={vt._id} value={vt.name}>{vt.name}</option>
                      ))
                    ) : (
                      <option disabled value={visaOption || ""}>No visa types available</option>
                    )}`;

content = content.replace(selectSearchStr, selectInsertStr);

fs.writeFileSync(filePath, content, 'utf8');
console.log('CountryDetails updated successfully.');
