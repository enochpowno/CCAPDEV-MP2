export const iff = (v1, op, v2, opt) => {
  switch (op) {
    case '==':
    case '===':
      return (v1 === v2) ? opt.fn(this) : opt.inverse(this);
    case '!=':
      return (v1 !== v2) ? opt.fn(this) : opt.inverse(this);
    case '!==':
      return (v1 !== v2) ? opt.fn(this) : opt.inverse(this);
    case '<':
      return (v1 < v2) ? opt.fn(this) : opt.inverse(this);
    case '<=':
      return (v1 <= v2) ? opt.fn(this) : opt.inverse(this);
    case '>':
      return (v1 > v2) ? opt.fn(this) : opt.inverse(this);
    case '>=':
      return (v1 >= v2) ? opt.fn(this) : opt.inverse(this);
    case '&&':
      return (v1 && v2) ? opt.fn(this) : opt.inverse(this);
    case '||':
      return (v1 || v2) ? opt.fn(this) : opt.inverse(this);
    default:
      return opt.inverse(this);
  }
};

export const img = (string, opt) => {
  const regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  if (regexp.test(string)) {
    return string;
  }
  let string0 = string;

  if (string.buffer) {
    string0 = string.toString('base64');
  } else if (string.photo) {
    string0 = string.photo.buffer.toString('base64');
  } else if (string.poster) {
    string0 = string.poster.buffer.toString('base64');
  }

  return `data:image/png;base64,${string0}`;
};

export const datePrint = (v1, opt) => v1.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
