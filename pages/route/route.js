const db = wx.cloud.database()

let timer = null
let simTimer = null

Page({

  data: {
    recording: false,
    simulating: false,   // ⭐ 新增
    longitude: 120.15,
    latitude: 30.27,
    route: [],
    polyline: [],
    markers: []
  },

  // 📍 开始记录轨迹
  startTrack() {

    this.setData({
      recording: true,
      route: []
    })

    wx.startLocationUpdate()

    wx.onLocationChange(res => {

      const route = this.data.route
      route.push({
        latitude: res.latitude,
        longitude: res.longitude
      })

      this.setData({
        route,
        latitude: res.latitude,
        longitude: res.longitude,
        polyline: [{
          points: route,
          color: "#1E90FF",
          width: 5
        }],
        markers: [{
          id: 1,
          latitude: res.latitude,
          longitude: res.longitude,
          iconPath: "/images/user.jpg",
          width: 30,
          height: 30
        }]
      })
    })

    wx.showToast({ title: '开始巡检' })
  },

  // 🛑 停止记录
  stopTrack() {

    this.setData({ recording: false })

    wx.stopLocationUpdate()

    const openid = wx.getStorageSync('openid')

    db.collection('routes').add({
      data: {
        openid,
        route: this.data.route,
        createTime: new Date()
      }
    })

    wx.showToast({ title: '轨迹已保存' })
  },

  // ▶️ 回放路线（核心动画）
  playRoute() {

    db.collection('routes')
      .orderBy('createTime', 'desc')
      .limit(1)
      .get()
      .then(res => {

        if (!res.data.length) {
          wx.showToast({ title: '暂无轨迹', icon: 'none' })
          return
        }

        const route = res.data[0].route

        this.animateRoute(route)

      })
  },

  // 🎬 动画回放（重点加分）
  animateRoute(route) {

    let i = 0

    this.setData({
      polyline: [{
        points: route,
        color: "#FF0000",
        width: 4
      }]
    })

    timer = setInterval(() => {

      if (i >= route.length) {
        clearInterval(timer)
        return
      }

      this.setData({
        latitude: route[i].latitude,
        longitude: route[i].longitude,
        markers: [{
          id: 1,
          latitude: route[i].latitude,
          longitude: route[i].longitude,
          iconPath: "/images/user.jpg",
          width: 30,
          height: 30
        }]
      })

      i++

    }, 500) // 每0.5秒移动一次

  },

  startSimulate() {

    this.setData({
      simulating: true,
      route: []
    })
  
    // 模拟路线（钱塘江附近）
    const fakeRoute = [
      { latitude: 30.250, longitude: 120.120 },
      { latitude: 30.252, longitude: 120.122 },
      { latitude: 30.255, longitude: 120.125 },
      { latitude: 30.258, longitude: 120.128 },
      { latitude: 30.262, longitude: 120.132 },
      { latitude: 30.265, longitude: 120.135 },
      { latitude: 30.268, longitude: 120.138 },
      { latitude: 30.270, longitude: 120.140 }
    ]
  
    let i = 0
  
    simTimer = setInterval(() => {
  
      if (!this.data.simulating || i >= fakeRoute.length) {
        clearInterval(simTimer)
        return
      }
  
      const point = fakeRoute[i]
  
      const route = this.data.route
      route.push(point)
  
      this.setData({
        route,
        latitude: point.latitude,
        longitude: point.longitude,
  
        polyline: [{
          points: route,
          color: "#00CCFF",
          width: 5
        }],
  
        markers: [{
          id: 1,
          latitude: point.latitude,
          longitude: point.longitude,
          iconPath: "/images/user.jpg",
          width: 30,
          height: 30
        }]
      })
  
      i++
  
    }, 800)
  
    wx.showToast({ title: '模拟巡检开始' })
  },

  stopSimulate() {

    this.setData({
      simulating: false
    })
  
    clearInterval(simTimer)
  
    wx.showToast({ title: '模拟已停止' })
  }

})