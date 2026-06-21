const fs = require('fs');
const path = require('path');

const locales = {};
const localesDir = path.join(__dirname, 'locales');

for (const file of fs.readdirSync(localesDir)) {
  if (file.endsWith('.json')) {
    const lang = file.replace('.json', '');
    locales[lang] = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf8'));
  }
}

function get(lang, key, vars = {}) {
  const locale = locales[lang] || locales['en'];
  const keys = key.split('.');
  let value = locale;

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }

  if (value === undefined && lang !== 'en') {
    value = locales['en'];
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
  }

  if (value === undefined) {
    return key;
  }

  let result = value;
  for (const [varName, varValue] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\{${varName}\}`, 'g'), varValue);
  }

  return result;
}

async function getUserLang(userId) {
  try {
    const UserProfile = require('./models/UserProfile');
    const profile = await UserProfile.findOne({ userId });
    return profile?.nativeLanguage || profile?.language || 'en';
  } catch {
    return 'en';
  }
}

module.exports = { get, getUserLang, locales };
