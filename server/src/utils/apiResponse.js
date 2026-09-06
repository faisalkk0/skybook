function success(res, { status = 200, message = 'Success', data = null, meta } = {}) {
  const payload = { success: true, message, data };
  if (meta) payload.meta = meta;
  return res.status(status).json(payload);
}

function fail(res, { status = 400, message = 'Request failed', errors = [] } = {}) {
  return res.status(status).json({ success: false, message, errors });
}

module.exports = { success, fail };
