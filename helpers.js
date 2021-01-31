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

export const img = (string, opt) => {
  return `data:image/png;base64,${string.toString('base64')}`;
};

export const datePrint = (v1, opt) => v1.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
