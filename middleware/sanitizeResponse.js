const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return DOMPurify.sanitize(value, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      RETURN_DOM: false
    });
  }
  return value;
};

const deepSanitize = (data) => {
  if (Array.isArray(data)) {
    return data.map(item => deepSanitize(item));
  }

  if (data !== null && typeof data === 'object') {
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = deepSanitize(data[key]);
      return acc;
    }, {});
  }

  return sanitizeValue(data);
};

const xssResponseSanitizer = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = (data) => {
    try {
      const sanitizedData = deepSanitize(JSON.parse(JSON.stringify(data)));
      originalJson.call(res, sanitizedData);
    } catch (err) {
      originalJson.call(res, data);
    }
  };
  
  next();
};

module.exports = xssResponseSanitizer;