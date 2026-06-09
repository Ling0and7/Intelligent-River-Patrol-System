const db = wx.cloud.database()

Page({

  data: {
    records: []
  },

  onLoad() {
    this.loadRecords()
  },

  // 加载所有记录
  async loadRecords() {
    try {
      const res = await db.collection('hazards')
        .orderBy('createTime', 'desc')
        .get()

      // 对每条记录处理视频临时路径
      const records = await Promise.all(res.data.map(async item => {
        let newItem = { ...item }
        if (item.video) {
          const downloadRes = await wx.cloud.downloadFile({
            fileID: item.video
          })
          newItem.video = downloadRes.tempFilePath
        }
        newItem.createTime = item.createTime.toLocaleString()
        return newItem
      }))

      this.setData({ records })

    } catch (err) {
      console.error(err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadRecords().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 点击记录进入详情页
  toDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  // 点击查看报告结果
  goStats() {
    wx.navigateTo({
      url: '/pages/stats/stats'
    })
  }

})