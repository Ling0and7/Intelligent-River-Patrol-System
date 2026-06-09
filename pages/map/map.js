const db = wx.cloud.database()

Page({

  data: {

    latitude: 30.2741,
    longitude: 120.1551,

    markers: []

  },

  onLoad() {

    this.getCurrentLocation()

    this.loadMarkers()

  },

  // 获取当前位置
  getCurrentLocation() {

    wx.getLocation({

      type: 'gcj02',

      success: res => {

        this.setData({

          latitude: res.latitude,
          longitude: res.longitude

        })

      },

      fail: err => {

        console.error(err)

      }

    })

  },

  // 加载所有隐患点
  async loadMarkers() {

    try {

      const res = await db
        .collection('hazards')
        .get()

      const markers = res.data.map((item, index) => {

        return {

          id: index,

          width: 32,
          height: 32,

          latitude: item.latitude,
          longitude: item.longitude,

          title: item.type,

          callout: {

            content:
              item.type +
              '\n' +
              item.description,

            display: 'BYCLICK',

            padding: 8,

            borderRadius: 6

          },

          _id: item._id

        }

      })

      this.setData({
        markers
      })

    } catch (err) {

      console.error(err)

      wx.showToast({

        title: '地图加载失败',
        icon: 'none'

      })

    }

  },
  //跳转页面
  goRoute() {
    wx.navigateTo({
      url: '/pages/route/route'
    })
  },
  
  // 点击标记
  onMarkerTap(e) {

    const markerId = e.markerId

    const marker =
      this.data.markers[markerId]

    wx.showModal({

      title: marker.title,

      content: '查看该隐患详情？',

      success: res => {

        if (res.confirm) {

          wx.navigateTo({

            url:
              '/pages/detail/detail?id=' +
              marker._id

          })

        }

      }

    })

  }

})