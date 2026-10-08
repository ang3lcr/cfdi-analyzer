/**
 * Diagnostic error classes for CFDI XML processing.
 * Provides clear stages, error types, and human-friendly Spanish explanations.
 */

export type CfdiParserStage =
  | 'Lectura y sintaxis XML'
  | 'Identificación de tipo CFDI'
  | 'Extracción del Timbre Fiscal Digital'
  | 'Extracción de Emisor y Receptor'
  | 'Extracción de Conceptos'
  | 'Extracción de Impuestos'
  | 'Normalización del modelo';

export type CfdiErrorType =
  | 'XmlSyntaxError'
  | 'NotACfdiError'
  | 'MissingFiscalStampError'
  | 'InvalidUUIDError'
  | 'ParserError';

export class CfdiParseError extends Error {
  public readonly stage: CfdiParserStage;
  public readonly errorType: CfdiErrorType;
  public readonly technicalDetail?: string;

  constructor(
    stage: CfdiParserStage,
    message: string,
    errorType: CfdiErrorType = 'ParserError',
    technicalDetail?: string
  ) {
    super(message);
    this.name = 'CfdiParseError';
    this.stage = stage;
    this.errorType = errorType;
    this.technicalDetail = technicalDetail;

    // Maintains proper stack trace in V8 engines
    const errorCtor = Error as { captureStackTrace?: (target: object, ctor: Function) => void };
    if (typeof errorCtor.captureStackTrace === 'function') {
      errorCtor.captureStackTrace(this, CfdiParseError);
    }
  }
}
