const db = wx.cloud.database()

const innerAudioContext = wx.createInnerAudioContext()

Page({

  data: {
    id: '',
    record: {}
  },

  onLoad(options) {

    const id = options.id

    this.setData({
      id
    })

    this.loadRecord(id)

  },

  async loadRecord(id) {

    try {

      const res =
        await db.collection('hazards')
        .doc(id)
        .get()

      let record = res.data

      // 视频转临时地址
      if (record.video) {

        const videoRes =
          await wx.cloud.downloadFile({

            fileID: record.video

          })

        record.video =
          videoRes.tempFilePath

      }

      // 音频转临时地址
      if (record.audio) {

        const audioRes =
          await wx.cloud.downloadFile({

            fileID: record.audio

          })

        record.audio =
          audioRes.tempFilePath

      }

      this.setData({

        record: {
          ...record,
          createTime:
            record.createTime
            ? new Date(record.createTime).toLocaleString()
            : ''
        }

      })

    } catch (err) {

      console.error(err)

      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })

    }

  },

  // 图片预览
  previewImage(e) {

    const current =
      e.currentTarget.dataset.src

    wx.previewImage({

      current,

      urls:
        this.data.record.images

    })

  },

  // 播放语音
  playAudio() {

    if (!this.data.record.audio) {

      wx.showToast({
        title: '暂无语音',
        icon: 'none'
      })

      return

    }

    innerAudioContext.src =
      this.data.record.audio

    innerAudioContext.play()

    wx.showToast({
      title: '正在播放'
    })

  },

  // 页面销毁停止播放
  onUnload() {

    innerAudioContext.stop()

  },

  //消息分享
  onShareAppMessage() {

    return {
  
      title:
        '钱塘江堤防巡检隐患：' +
        this.data.record.type,
  
      path:
        '/pages/detail/detail?id=' +
        this.data.id,
  
      imageUrl:
        this.data.record.images &&
        this.data.record.images.length
        ? this.data.record.images[0]
        : ''
  
    }
  
  }

})