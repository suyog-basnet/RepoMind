const KNOWN_PREFIXES = [
  { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/ },
  { name: "GitHub Token", regex: /gh[pousr]_[A-Za-z0-9]{36,}/ },
  { name: "Stripe Live Key", regex: /sk_live_[A-Za-z0-9]{24,}/ },
  { name: "OpenAI Key", regex: /sk-[A-Za-z0-9]{20,}/ },
  { name: "Generic Bearer-style Secret", regex: /['"][A-Za-z0-9_\-]{32,}['"]/ },
];

const SAFE_VALUE_PATTERNS = [
  /^process\.env\./,
  /^['"]?\s*['"]?$/, // empty string
  /^['"](your[-_ ]?|example|placeholder|xxxx|changeme|<.*>)/i,
];

const SECRET_KEYWORDS = ["apikey", "api_key", "api-key", "secret", "token", "password", "passwd", "accesskey", "access_key", "privatekey", "private_key", "key"];

function isLikelySecretAssignment(line) {
  if (!/=/.test(line)) return false;
  const beforeEquals = line.split("=")[0].toLowerCase();
  return SECRET_KEYWORDS.some((kw) => beforeEquals.includes(kw));
}

function looksLikeRealValue(valueText) {
  return !SAFE_VALUE_PATTERNS.some((pattern) => pattern.test(valueText.trim()));
}

export function scanFileForSecrets(fileContent, filePath) {
  const findings = [];
  const lines = fileContent.split("\n");

  lines.forEach((line, i) => {
    if (!isLikelySecretAssignment(line)) return;

    const valueMatch = line.match(/=\s*(.+?)(;|,|$)/);
    if (!valueMatch) return;
    const valueText = valueMatch[1];

    if (!looksLikeRealValue(valueText)) return;

    for (const { name, regex } of KNOWN_PREFIXES) {
      if (regex.test(valueText)) {
        findings.push({
          file: filePath,
          line: i + 1,
          type: name,
          preview: line.trim().slice(0, 80),
        });
        break;
      }
    }
  });

  return findings;
}

export function scanProjectForSecrets(project, rootDir, pathModule) {
  const findings = [];

  for (const sf of project.getSourceFiles()) {
    const filePath = pathModule.relative(rootDir, sf.getFilePath());
    if (filePath.includes(".test.") || filePath.includes(".spec.")) continue;

    const content = sf.getFullText();
    findings.push(...scanFileForSecrets(content, filePath));
  }

  return findings;
}