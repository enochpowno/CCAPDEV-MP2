function datePrint(date) {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function abbreviateNumber(value) {
  let newValue = value;
  const suffixes = ["", "K", "M", "B","T"];
  let suffixNum = 0;
  while (newValue >= 1000) {
    newValue /= 1000;
    suffixNum++;
  }

  newValue = newValue.toPrecision(3);

  newValue += suffixes[suffixNum];
  return newValue;
}

function img(buffer) {
  if (typeof buffer === 'string') return `data:image/png;base64,${buffer}`;
  if (buffer.data) return `data:image/png;base64,${btoa(buffer.data.reduce((data, byte) => data + String.fromCharCode(byte), ''))}`;

  return `data:image/png;base64,${btoa(buffer.reduce((data, byte) => data + String.fromCharCode(byte), ''))}`;
}

function createError(errors) {
  return $(`
  <div class="alert alert-danger" role="alert">
    <b>Uh oh! </b> Something went wrong, check the message/s below.<br/>
    ${errors.reduce((p, c) => `${p}<li>${c}</li>`, '')}
  </div>
  `);
}

function createSuccess(message) {
  return $(`
  <div class="alert alert-success" role="alert">
    <b>Success: </b> ${message}
  </div>
  `);
}

function createResponseView(obj) {
  if (obj.success && obj.errors.length === 0) return createSuccess(obj.message);
  return createError(obj.errors);
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
