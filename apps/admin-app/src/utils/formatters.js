export function formatRupiah(amount) {
  const num = Number(amount) || 0;
  return `Rp ${num.toLocaleString('id-ID')}`;
}
