export const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isValidUUID(uuid?: string): boolean {
  if (!uuid) return false;
  return UUID_REGEX.test(uuid.trim());
}

export function isXmlFile(file: File): boolean {
  const isXmlType = file.type === 'text/xml' || file.type === 'application/xml';
  const hasXmlExt = file.name.toLowerCase().endsWith('.xml');
  return isXmlType || hasXmlExt;
}

export function isDuplicateUUID(uuid: string, existingUUIDs: Set<string>): boolean {
  if (!uuid) return false;
  return existingUUIDs.has(uuid.toUpperCase());
}
