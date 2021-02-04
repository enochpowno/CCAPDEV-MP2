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

  newValue = (suffixNum == 0) ? newValue : newValue.toPrecision(3);

  newValue += suffixes[suffixNum];
  return newValue;
};

export const img = (string, opt) => `data:image/png;base64,${string.toString('base64')}`;

export const datePrint = (v1, opt) => v1.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

export const isin = (elem, list, opt) => {
  if (elem && list && list.indexOf(elem) > -1) {
    return opt.fn(this);
  }

  return opt.inverse(this);
};

export const notin = (elem, list, opt) => {
  if (list && list.includes(elem.toString())) {
    return opt.inverse(this);
  }

  return opt.fn(this);
};

export const PayPal = {
  CLIENT: process.env.PAYPAL_CLIENT || 'AV26OAHegyO056dMXH59tgL8K5I9DTtyYJAXU9WdIPUHRmUpbkxgdlzLEwhPxMSNrG1N_DghZ0KNSuxq',
  SECRET: process.env.PAYPAL_SECRET || 'EKrr-ln1BpApSbmh2ZoOGrSYgGcIVuwrOmWBGda9lBPxDPH-mm2GM-tL1gZHj00N0JTRHRZdPESNsY-I',
  AUTH: process.env.PAYPAL_AUTH || 'A21AAIk7JFJs514Gn_huDHLkmWTOE5ORrwWwWKZYuxkZlmFuEac57BdIKpExBIPzxwjBGiA46JphMuLRSYTrVZ9Qtm1ZZn0vQ',
  API: 'https://api-m.sandbox.paypal.com',
};
