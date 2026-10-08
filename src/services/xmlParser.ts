/**
 * Robust XML helper utilities for parsing SAT CFDI XML documents.
 * Operates on canonical XML namespaces and localNames, completely decoupled
 * from arbitrary XML prefixes (e.g. cfdi:, tfd:, retenciones:, or no prefix).
 */

import { CfdiParseError } from './cfdiErrors';

/**
 * Known SAT XML Namespaces for CFDI, Retenciones, and fiscal complements.
 */
export const SAT_NAMESPACES = {
  CFDI_40: 'http://www.sat.gob.mx/cfd/4',
  CFDI_33: 'http://www.sat.gob.mx/cfd/3',
  CFDI_32: 'http://www.sat.gob.mx/cfd/3',
  RETENCIONES_20: 'http://www.sat.gob.mx/esquemas/retencionpago/2',
  RETENCIONES_10: 'http://www.sat.gob.mx/esquemas/retencionpago/1',
  TFD: 'http://www.sat.gob.mx/TimbreFiscalDigital',
  PAGOS_20: 'http://www.sat.gob.mx/Pagos20',
  PAGOS_10: 'http://www.sat.gob.mx/Pagos',
  NOMINA_12: 'http://www.sat.gob.mx/nomina12',
  PLATAFORMAS_10: 'http://www.sat.gob.mx/esquemas/retencionpago/1/PlataformasTecnologicas10',
} as const;

/**
 * Parses raw XML text into a DOM Document.
 * Throws a structured CfdiParseError if the XML syntax is broken or empty.
 */
export function parseXmlString(xmlContent: string): Document {
  if (!xmlContent || typeof xmlContent !== 'string' || xmlContent.trim().length === 0) {
    throw new CfdiParseError(
      'Lectura y sintaxis XML',
      'El contenido XML está vacío o no es una cadena válida.',
      'XmlSyntaxError'
    );
  }

  // Clean potential Byte Order Mark (BOM) or trailing whitespace
  const sanitized = xmlContent.replace(/^\uFEFF/, '').trim();

  // Create DOMParser (available in browser and jsdom)
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitized, 'application/xml');

  // Check for XML parser error nodes (standard DOMParser error output)
  const parseErrors = doc.getElementsByTagName('parsererror');
  if (parseErrors.length > 0) {
    const errorText = parseErrors[0].textContent?.trim() || 'Error de sintaxis al interpretar el XML';
    // Truncate if very long
    const shortDetail = errorText.replace(/\s+/g, ' ').substring(0, 160);
    throw new CfdiParseError(
      'Lectura y sintaxis XML',
      `Sintaxis XML inválida o mal formada: ${shortDetail}`,
      'XmlSyntaxError',
      errorText
    );
  }

  return doc;
}

/**
 * Extracts the localName of an element, safely falling back to splitting nodeName by colon
 * in case localName is not populated or prefixed.
 */
export function getElementLocalName(el: Element): string {
  if (el.localName) return el.localName;
  const parts = el.nodeName.split(':');
  return parts[parts.length - 1];
}

/**
 * Checks whether an element matches a given localName (case-insensitive)
 * and optionally one of the expected namespace URIs.
 */
export function isElementMatch(
  el: Element,
  localName: string,
  expectedNamespaces?: string | string[]
): boolean {
  const elLocal = getElementLocalName(el).toLowerCase();
  if (elLocal !== localName.toLowerCase()) {
    return false;
  }

  // If no namespace constraint is specified, localName match is sufficient
  if (!expectedNamespaces) {
    return true;
  }

  const namespaces = Array.isArray(expectedNamespaces)
    ? expectedNamespaces
    : [expectedNamespaces];

  // If the element has a namespaceURI, check if it matches
  if (el.namespaceURI) {
    return namespaces.includes(el.namespaceURI);
  }

  // If the element doesn't have a namespaceURI set (e.g. parsed without namespace awareness),
  // tolerate match by localName
  return true;
}

/**
 * Find the first descendant element matching the given localName,
 * optionally verifying its namespace URI.
 */
export function findElementByLocalName(
  root: Document | Element | null | undefined,
  localName: string,
  expectedNamespaces?: string | string[]
): Element | null {
  if (!root) return null;

  // Check documentElement if root is Document
  if ('documentElement' in root && root.documentElement) {
    if (isElementMatch(root.documentElement, localName, expectedNamespaces)) {
      return root.documentElement;
    }
  }

  // Check root itself if it is an Element
  if ('attributes' in root && isElementMatch(root as Element, localName, expectedNamespaces)) {
    return root as Element;
  }

  // Search through all descendants
  const allElements = root.getElementsByTagName('*');
  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i];
    if (isElementMatch(el, localName, expectedNamespaces)) {
      return el;
    }
  }

  return null;
}

/**
 * Find all descendant elements matching the given localName,
 * optionally verifying their namespace URI.
 */
export function findElementsByLocalName(
  root: Document | Element | null | undefined,
  localName: string,
  expectedNamespaces?: string | string[]
): Element[] {
  if (!root) return [];
  const results: Element[] = [];

  const allElements = root.getElementsByTagName('*');
  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i];
    if (isElementMatch(el, localName, expectedNamespaces)) {
      results.push(el);
    }
  }

  return results;
}

/**
 * Find direct children of an element matching the given localName,
 * optionally verifying their namespace URI.
 */
export function findDirectChildrenByLocalName(
  parent: Element | null | undefined,
  localName: string,
  expectedNamespaces?: string | string[]
): Element[] {
  if (!parent || !parent.children) return [];
  const results: Element[] = [];

  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i];
    if (isElementMatch(child, localName, expectedNamespaces)) {
      results.push(child);
    }
  }

  return results;
}

/**
 * Case-insensitive attribute retriever.
 * Accepts one or multiple candidate attribute names and checks both localName and nodeName.
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
    const attrLocal = (attr.localName || attr.nodeName.split(':').pop() || '').toLowerCase();
    const attrFull = attr.nodeName.toLowerCase();

    if (lowerCandidates.has(attrLocal) || lowerCandidates.has(attrFull)) {
      return attr.value.trim();
    }
  }

  return defaultValue;
}

/**
 * Retrieves a numeric attribute value safely.
 * Strips non-numeric characters (leaving digits, minus sign, and decimal point)
 * and returns defaultValue if the result is NaN.
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
