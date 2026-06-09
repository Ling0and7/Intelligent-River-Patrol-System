App({
  globalData: {
    openid: '',
    userInfo: null
  },

  onLaunch() {
    wx.cloud.init({
      env: 'cloudbase-d0gi51i1g4fca5c75',
      traceUser: true
    })
  }
})