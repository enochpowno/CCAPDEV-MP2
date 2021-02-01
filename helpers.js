export const iff = (v1, op, v2, opt) => {
  switch (op) {
    case 'strcmp':
      return (v1.toString() == v2.toString()) ? opt.fn(this) : opt.inverse(this);
    case '==':
      return (v1 == v2) ? opt.fn(this) : opt.inverse(this);
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

export const abbreviateNumber = (value) => {
  let newValue = value;
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  let suffixNum = 0;
  while (newValue >= 1000) {
    newValue /= 1000;
    suffixNum++;
  }

  newValue = newValue.toPrecision(3);

  newValue += suffixes[suffixNum];
  return newValue;
};

export const img = (string, opt) => `data:image/png;base64,${string.toString('base64')}`;

export const datePrint = (v1, opt) => v1.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
