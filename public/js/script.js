function datePrint(date) {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function img(buffer) {
  if (typeof buffer === 'string') return `data:image/png;base64,${buffer}`;
  return `data:image/png;base64,${btoa(buffer.reduce((data, byte) => data + String.fromCharCode(byte), ''))}`;
}

$(document).ready(() => {
  AOS.init({
    once: true,
  });

  $('input[type=file]').on('change', function () {
    if (this.files[0].size > 1048576) {
      alert('file too large');
      this.value = '';
    }
  });
});
