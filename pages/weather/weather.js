Page({

  data: {
    temperature: '--',
    windspeed: '--',
    weathercode: '--',
    time: '--'
  },

  onLoad() {
    this.getWeather()
  },

  getWeather() {

    wx.showLoading({
      title: '加载天气'
    })

    wx.request({

      url: 'https://api.open-meteo.com/v1/forecast',

      data: {
        latitude: 30.2741,
        longitude: 120.1551,
        current_weather: true
      },

      success: res => {

        const weather = res.data.current_weather

        this.setData({

          temperature: weather.temperature,

          windspeed: weather.windspeed,

          weathercode: weather.weathercode,

          time: weather.time

        })

      },

      fail: err => {

        console.log(err)

        wx.showToast({
          title: '天气获取失败',
          icon: 'none'
        })

      },

      complete() {

        wx.hideLoading()

      }

    })

  },

  onPullDownRefresh() {

    this.getWeather()

    wx.stopPullDownRefresh()

  }

})