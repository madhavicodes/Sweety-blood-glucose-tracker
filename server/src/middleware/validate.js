const validate = (schema, source = 'body') => async (req, res, next) => {
  try {
    const dataToValidate = req[source] || {};
    const parsedData = await schema.parseAsync(dataToValidate);
    req[source] = parsedData;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validate;
