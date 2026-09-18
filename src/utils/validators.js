/**
 * Validador e Formatador de Documentos e Telefones Brasileiros (CPF, CNPJ e WhatsApp)
 * Fit Seven Platform
 */

// Limpa caracteres nao numericos
export const cleanDigits = (value) => {
  if (!value) return '';
  return value.toString().replace(/\D/g, '');
};

// Validador matematico de CPF real (Algoritmo Modulo 11)
export const validateCPF = (cpf) => {
  const clean = cleanDigits(cpf);
  if (!clean || clean.length !== 11) return false;

  // Rejeita sequencias de digitos repetidos (ex: 000.000.000-00, 111.111.111-11, etc.)
  if (/^(\d)\1{10}$/.test(clean)) return false;

  // 1o digito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;

  // 2o digito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) return false;

  return true;
};

// Validador matematico de CNPJ real (Algoritmo Modulo 11)
export const validateCNPJ = (cnpj) => {
  const clean = cleanDigits(cnpj);
  if (!clean || clean.length !== 14) return false;

  // Rejeita sequencias de digitos repetidos
  if (/^(\d)\1{13}$/.test(clean)) return false;

  // 1o digito
  let size = clean.length - 2;
  let numbers = clean.substring(0, size);
  let digits = clean.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0), 10)) return false;

  // 2o digito
  size = size + 1;
  numbers = clean.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1), 10)) return false;

  return true;
};

// Validador generico para estabelecimentos (aceita CPF ou CNPJ)
export const validateDoc = (doc) => {
  const clean = cleanDigits(doc);
  if (clean.length === 11) return validateCPF(clean);
  if (clean.length === 14) return validateCNPJ(clean);
  return false;
};

// Formatacao automatica de CPF: 000.000.000-00
export const formatCPF = (value) => {
  const clean = cleanDigits(value).slice(0, 11);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return clean.slice(0, 3) + '.' + clean.slice(3);
  if (clean.length <= 9) return clean.slice(0, 3) + '.' + clean.slice(3, 6) + '.' + clean.slice(6);
  return clean.slice(0, 3) + '.' + clean.slice(3, 6) + '.' + clean.slice(6, 9) + '-' + clean.slice(9, 11);
};

// Formatacao automatica de CNPJ: 00.000.000/0000-00
export const formatCNPJ = (value) => {
  const clean = cleanDigits(value).slice(0, 14);
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return clean.slice(0, 2) + '.' + clean.slice(2);
  if (clean.length <= 8) return clean.slice(0, 2) + '.' + clean.slice(2, 5) + '.' + clean.slice(5);
  if (clean.length <= 12) return clean.slice(0, 2) + '.' + clean.slice(2, 5) + '.' + clean.slice(5, 8) + '/' + clean.slice(8);
  return clean.slice(0, 2) + '.' + clean.slice(2, 5) + '.' + clean.slice(5, 8) + '/' + clean.slice(8, 12) + '-' + clean.slice(12, 14);
};

// Formatacao dinamica de documento (detecta CPF ou CNPJ enquanto digita)
export const formatDoc = (value) => {
  const clean = cleanDigits(value);
  if (clean.length > 11) return formatCNPJ(clean);
  return formatCPF(clean);
};

// Formatacao automatica de Telefone / WhatsApp: (00) 00000-0000 ou (00) 0000-0000
export const formatPhone = (value) => {
  const clean = cleanDigits(value).slice(0, 11);
  if (clean.length <= 2) return clean;
  if (clean.length <= 6) return '(' + clean.slice(0, 2) + ') ' + clean.slice(2);
  if (clean.length <= 10) return '(' + clean.slice(0, 2) + ') ' + clean.slice(2, 6) + '-' + clean.slice(6);
  return '(' + clean.slice(0, 2) + ') ' + clean.slice(2, 7) + '-' + clean.slice(7, 11);
};
