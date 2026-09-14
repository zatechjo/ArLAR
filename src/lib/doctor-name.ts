const honorificPattern = /^(?:(?:dr|doctor|prof|professor|mr|mrs|ms|capt)\s*\.?\s*)+/i;
const credentialPattern = /\s+(?:m\s*\.?\s*d\s*\.?|ph\s*\.?\s*d\s*\.?|d\s*\.?\s*sc\s*\.?|frcp(?:ch)?|mrcp(?:ch)?|facp|facr|frcpc|frcpch|mrcpi|mrcpgs|mbbch|mb\s*chb|mbbs|bmbch|abim|om sb|omsb|kbim|rcpi|mph|msc|bsc|ma|ms|dm)\b.*$/i;
const rolePrefixPattern = /^(?:(?:life skills specialist|physiotherapist|dietitian|tai chi instructor|yoga instructor|trainer|entraineuse de yoga)\s+)/i;
const roleSuffixPattern = /\s+(?:life skills specialist|physiotherapist|dietitian|tai chi instructor|yoga instructor|trainer|entraineuse de yoga)\b.*$/i;
const nameParticles = new Set(["al", "el", "abu", "ibn", "bin", "ben", "de", "la", "le", "van", "von"]);

function looksLikeName(value: string) {
  const parts = value.split(/\s+/).filter(Boolean);
  return (
    parts.length <= 1 ||
    parts.every((part) =>
      /^[A-ZÀ-ÖØ-Þ]/u.test(part.replace(/^[('“\[]+/, "")) ||
      nameParticles.has(part.toLowerCase().replace(/[.'’,-]+$/g, "")),
    )
  );
}

/**
 * Frontend-only doctor naming rule. Source records remain unchanged; this is
 * only the consistent presentation format used throughout the site.
 */
export function formatDoctorName(value: string) {
  const source = value.replace(/\u00a0/g, " ").trim();
  if (!source) return source;

  const withoutCredentials = source
    .replace(/\s*,\s*(?:m\s*\.?\s*d\s*\.?|ph\s*\.?\s*d\s*\.?|d\s*\.?\s*sc\s*\.?|frcp(?:ch)?|mrcp(?:ch)?|facp|facr|frcpc|frcpch|mrcpi|mrcpgs|mbbch|mb\s*chb|mbbs|bmbch|abim|om sb|omsb|kbim|rcpi|mph|msc|bsc|ma|ms|dm)\b.*$/i, "")
    .replace(credentialPattern, "")
    .trim();
  const name = withoutCredentials
    .replace(honorificPattern, "")
    .replace(rolePrefixPattern, "")
    .replace(roleSuffixPattern, "")
    .replace(/\s+(?:and|&)\s*$/i, "")
    .replace(/\s+/g, " ")
    .replace(/[,:;]+$/, "")
    .trim();

  return name && looksLikeName(name) ? `${name}, MD` : source;
}

/** Compact initials for doctor avatars when no portrait has been supplied. */
export function getDoctorInitials(value: string) {
  const name = formatDoctorName(value)
    .replace(/,\s*(?:m\s*\.?\s*d\.?|ph\s*\.?\s*d\.?)\s*$/i, "")
    .trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (!parts.length) return "DR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

/**
 * Credential tokens, longest variant first so that e.g. "FRCPC" cannot be
 * partially consumed as "FRCP".
 */
const credentialToken = [
  String.raw`ph\s*\.?\s*d\s*\.?`,
  String.raw`m\s*\.?\s*d\s*\.?`,
  String.raw`d\s*\.?\s*sc\s*\.?`,
  "frcpch",
  "frcpc",
  "frcp",
  "mrcpch",
  "mrcpgs",
  "mrcpi",
  "mrcp",
  "facp",
  "facr",
  "mbbch",
  String.raw`mb\s*chb`,
  "mbbs",
  "bmbch",
  "abim",
  String.raw`om\s*sb`,
  "omsb",
  "kbim",
  "rcpi",
  "mph",
  "msc",
  "bsc",
  "dm",
  "ma",
  "ms",
].join("|");

const trailingCredentialsPattern = new RegExp(
  String.raw`,\s*((?:${credentialToken})\b(?:\s*,\s*(?:${credentialToken})\b)*)\s*$`,
  "i",
);

const credentialListPattern = new RegExp(
  String.raw`^(?:${credentialToken})\b(?:\s*,\s*(?:${credentialToken})\b)*$`,
  "i",
);

const bareMdPattern = /^m\s*\.?\s*d\s*\.?$/i;

/**
 * Like {@link formatDoctorName}, but keeps every credential the source records
 * instead of collapsing them to "MD". Reserved for the biography dialog — cards
 * and listings stay on the short form so the grid keeps an even rhythm.
 *
 * `credentials` is the list the doctor database already split off the name;
 * when it is absent we recover one from the name itself, for the sources that
 * bypass that database.
 */
export function formatDoctorNameWithCredentials(value: string, credentials?: string) {
  const source = value.replace(/\u00a0/g, " ").trim();
  if (!source) return source;

  const base = formatDoctorName(source);
  const candidate =
    credentials?.replace(/\s+/g, " ").trim() ||
    source.match(trailingCredentialsPattern)?.[1] ||
    "";
  const list = candidate.replace(/\s*,\s*/g, ", ").trim();

  // Not every comma in a source name introduces credentials — some records
  // carry a lecture title there — so only a pure credential list is accepted.
  if (!list || !credentialListPattern.test(list)) return base;

  // A bare "MD" is what the short form already produces; nothing extra to add.
  if (bareMdPattern.test(list)) return base;

  return `${base.replace(/,\s*m\s*\.?\s*d\s*\.?$/i, "")}, ${list}`;
}

/** Formats a short list of speaker names while preserving a leading label. */
export function formatDoctorNameList(value: string) {
  const source = value.replace(/\u00a0/g, " ").trim();
  if (!source) return source;

  const labelMatch = source.match(/^(Speaker:\s*)/i);
  const label = labelMatch?.[1] ?? "";
  const body = label ? source.slice(label.length) : source;
  const separatedBody = body.replace(/\s+Speaker:\s+/gi, "\n");
  const lineParts = separatedBody.split(/\r?\n/).map((part) => part.trim()).filter(Boolean);
  if (lineParts.length > 1) {
    return `${label}${lineParts.map((part) => formatDoctorName(part)).join(", ")}`;
  }

  const parts = body.split(/(?:,\s*|\s+)(?=(?:dr|doctor|prof|professor|mr|mrs|ms|capt)\s*\.?\s)/i);

  if (parts.length === 1) return formatDoctorName(source);
  return `${label}${parts.map((part) => formatDoctorName(part)).join(", ")}`;
}
