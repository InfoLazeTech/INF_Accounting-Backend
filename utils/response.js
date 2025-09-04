function success(data = null, message = 'OK') {
  return { success: true, message, data };
}
function error(message = 'Error', code = 'ERROR', details = null) {
  return { success: false, error: { message, code, details } };
}
module.exports = { success, error };
