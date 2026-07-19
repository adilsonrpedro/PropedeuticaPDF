export const PIX_CONFIG = {
  CHAVE_PIX: 'e7e6fd4e-88f8-4ea1-b844-5f297baa30c4',
  BENEFICIARIO: 'SEU_NOME_COMPLETO_AQUI',
  CIDADE: 'SUACIDADE',
};

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function field(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, '0')}${value}`;
}

function sanitize(str: string, max: number): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .slice(0, max)
    .toUpperCase();
}

export function generatePixPayload(amount?: number): string {
  const merchantAccount = field('00', 'br.gov.bcb.pix') + field('01', PIX_CONFIG.CHAVE_PIX);
  const merchantAccountInfo = field('26', merchantAccount);
  const additionalData = field('05', '***');

  const payload =
    field('00', '01') +
    field('01', '12') +
    merchantAccountInfo +
    field('52', '0000') +
    field('53', '986') +
    (amount != null && amount > 0 ? field('54', amount.toFixed(2)) : '') +
    field('58', 'BR') +
    field('59', sanitize(PIX_CONFIG.BENEFICIARIO, 25)) +
    field('60', sanitize(PIX_CONFIG.CIDADE, 15)) +
    additionalData +
    '6304';

  return payload + crc16(payload);
}
