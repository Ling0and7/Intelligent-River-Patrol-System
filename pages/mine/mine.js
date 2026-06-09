const db = wx.cloud.database()

Page({
  data:{
    loggedIn:false,
    avatarUrl:'/images/user.jpg', // 默认头像
    nickname:'火花骑士',
    openid:''
  },

  onLoad(){
    // 检查本地是否已有openid
    const openid = wx.getStorageSync('openid')
    if(openid){
      this.setData({
        openid,
        loggedIn:true
      })
    }
  },

  login(){
    wx.login({
      success: res => {
        // 调用云函数换取openid
        wx.cloud.callFunction({
          name:'getOpenId',
          data:{},
          success: cloudRes=>{
            const openid = cloudRes.result.openid
            wx.setStorageSync('openid', openid)
            this.setData({
              openid,
              loggedIn:true,
              avatarUrl:'/images/user.jpg', // 本地头像
              nickname:'火花骑士'
            })
            wx.showToast({title:'登录成功'})
          },
          fail: err=>{
            console.error(err)
            wx.showToast({title:'登录失败', icon:'none'})
          }
        })
      }
    })
  },

  goWeather() {
    wx.navigateTo({
      url:'/pages/weather/weather'
    })
  
  }
})