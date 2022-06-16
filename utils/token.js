const TOKEN_KEY = `${window.SETTING && window.SETTING.TENANT_ID}_token`
export default {
  getToken () {
    return localStorage[TOKEN_KEY]
  },
  setToken (value) {
    localStorage[TOKEN_KEY] = value
  },
  clearLStorage () {
    localStorage.removeItem(TOKEN_KEY)
  }
}
