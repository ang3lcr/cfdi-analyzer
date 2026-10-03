/**
 * Robust XML helper utilities for DOMParser handling namespaces and case-insensitivity.
 */

export function parseXmlString(xmlContent: string): Document {
  // Clean potential Byte Order Mark (BOM) or trailing whitespace
  const sanitized = xmlContent.replace(/^\uFEFF/, '').trim();
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitized, 'application/xml');

  // Check for parser errors
  const parseError = doc.getElementsByTagName('parsererror')[0];
  if (parseError) {
    const errorText = parseError.textContent || 'Error al interpretar la sintaxis XML';
    throw new Error(`Sintaxis XML inválida: ${errorText.substring(0, 150)}`);
  }

  return doc;
}

/**
 * Find the first descendant element matching the given localName, ignoring namespace prefixes.
 */
export function findElementByLocalName(
  root: Document | Element | null | undefined,
  localName: string
): Element | null {
  if (!root) return null;

  const target = localName.toLowerCase();

  // If root is Document, check documentElement first
  if ('documentElement' in root && root.documentElement) {
    const rootName =
      root.documentElement.localName ||
      root.documentElement.nodeName.split(':').pop() ||
      '';
    if (rootName.toLowerCase() === target) {
      return root.documentElement;
    }
  }

  // If root itself is an element and matches
  if ('localName' in root && (root as Element).localName?.toLowerCase() === target) {
    return root as Element;
  }

  // Search all child elements
  const allElements = root.getElementsByTagName('*');
  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i];
    const name = el.localName || el.nodeName.split(':').pop() || '';
    if (name.toLowerCase() === target) {
      return el;
    }
  }

  return null;
}

/**
 * Find direct child elements matching the given localName, ignoring namespace prefixes.
 */
export function findDirectChildrenByLocalName(
  parent: Element | null | undefined,
  localName: string
): Element[] {
  if (!parent) return [];
  const results: Element[] = [];
  const target = localName.toLowerCase();

  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i];
    const name = child.localName || child.nodeName.split(':').pop() || '';
    if (name.toLowerCase() === target) {
      results.push(child);
    }
  }
  return results;
}

/**
 * Find all descendant elements matching the given localName, ignoring namespace prefixes.
 */
export function findElementsByLocalName(
  root: Document | Element | null | undefined,
  localName: string
): Element[] {
  if (!root) return [];
  const results: Element[] = [];
  const target = localName.toLowerCase();

  const allElements = root.getElementsByTagName('*');
  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i];
    const name = el.localName || el.nodeName.split(':').pop() || '';
    if (name.toLowerCase() === target) {
      results.push(el);
    }
  }
  return results;
}

/**
 * Case-insensitive attribute retriever.
 * Accepts one or multiple candidate attribute names.
 */
export function getAttributeValue(
  el: Element | null | undefined,
  names: string | string[],
  defaultValue: string = ''
): string {
  if (!el || !el.attributes) return defaultValue;

  const candidateNames = Array.isArray(names) ? names : [names];
  const lowerCandidates = new Set(candidateNames.map((n) => n.toLowerCase()));

  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    const attrName = attr.localName || attr.nodeName.split(':').pop() || '';
    if (lowerCandidates.has(attrName.toLowerCase())) {
      return attr.value.trim();
    }
  }

  return defaultValue;
}

/**
 * Retrieves a numeric attribute value safely.
 */
export function getNumericAttribute(
  el: Element | null | undefined,
  names: string | string[],
  defaultValue: number = 0
): number {
  const val = getAttributeValue(el, names, '');
  if (!val) return defaultValue;
  const parsed = parseFloat(val.replace(/[^0-9.-]+/g, ''));
  return isNaN(parsed) ? defaultValue : parsed;
}
