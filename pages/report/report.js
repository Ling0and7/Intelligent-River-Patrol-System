const db = wx.cloud.database()
const recorderManager = wx.getRecorderManager()

Page({
  data: {
    typeList: ['堤坝破损','垃圾倾倒','违法建筑','人为破坏','其他'],
    type: '',
    description: '',
    images: [],
    video: '',
    latitude: '',
    longitude: '',
    address: '',

    // 👇 用户信息（新增）
    openid: '',
    nickname: '火花骑士',
    avatarUrl: '/images/user.jpg',

    //语音输入
    audioPath: '',
    audioFileID: '',
    recording: false,
  },

  onLoad() {
    // 从本地读取 openid
    const openid = wx.getStorageSync('openid')
    this.setData({ openid })
  },

  typeChange(e) {
    this.setData({ type: this.data.typeList[e.detail.value] })
  },

  descInput(e) {
    this.setData({ description: e.detail.value })
  },

  chooseImages() {
    wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      success: res => {
        const imgs = res.tempFiles.map(item => item.tempFilePath)
        this.setData({ images: imgs })
      }
    })
  },

  chooseVideo() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      success: res => {
        this.setData({ video: res.tempFiles[0].tempFilePath })
      }
    })
  },

  getLocation() {
    wx.showLoading({ title:'定位中' })
    wx.getLocation({
      type:'gcj02',
      success: res => {
        wx.hideLoading()
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          address: '定位成功'
        })
        wx.showToast({ title:'定位成功' })
      },
      fail: err => {
        wx.hideLoading()
        wx.showModal({
          title:'定位失败',
          content:JSON.stringify(err)
        })
      }
    })
  },

  chooseLocation() {
    wx.chooseLocation({
      success: res => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          address: res.address
        })
      }
    })
  },

  async uploadImages() {
    let fileIDs = []
    for (let i = 0; i < this.data.images.length; i++) {
      const filePath = this.data.images[i]
      const suffix = filePath.match(/\.[^.]+?$/)[0]
      const res = await wx.cloud.uploadFile({
        cloudPath: 'images/' + Date.now() + '_' + i + suffix,
        filePath
      })
      fileIDs.push(res.fileID)
    }
    return fileIDs
  },

  async uploadVideo() {
    if (!this.data.video) return ''
    const suffix = this.data.video.match(/\.[^.]+?$/)[0]
    const res = await wx.cloud.uploadFile({
      cloudPath: 'videos/' + Date.now() + suffix,
      filePath: this.data.video
    })
    return res.fileID
  },

  // 上传录音
  async uploadAudio() {
    if (!this.data.audioPath) {
      return ''
    }
    const res = await wx.cloud.uploadFile({
      cloudPath:
       'audio/' +
        Date.now() +
        '.mp3',
      filePath:
        this.data.audioPath
    })
    return res.fileID
  },

  // 开始录音
  startRecord() {
    recorderManager.start({
      duration: 60000,
      sampleRate: 16000,
     numberOfChannels: 1,
     encodeBitRate: 96000,
     format: 'mp3'
    })

    this.setData({
      recording: true
    })

    wx.showToast({
      title: '开始录音',
      icon: 'none'
    })
  },

  // 停止录音
  stopRecord() {
    recorderManager.stop()
    recorderManager.onStop((res) => {
      this.setData({
       audioPath: res.tempFilePath,
        recording: false
      })
      wx.showToast({
        title: '录音完成'
      })
    })
  },

  // 🚀 提交（已加入用户信息）
  async submitReport() {
    if (!this.data.type) {
      wx.showToast({ title: '请选择类别', icon: 'none' })
      return
    }

    wx.showLoading({ title: '上传中' })

    try {

      const imageFileIDs = await this.uploadImages()
      const videoFileID = await this.uploadVideo()
      const audioFileID = await this.uploadAudio()

      const openid = this.data.openid || wx.getStorageSync('openid')

      await db.collection('hazards').add({
        data: {
          type: this.data.type,
          description: this.data.description,
          images: imageFileIDs,
          video: videoFileID,
          audio: audioFileID,
          latitude: this.data.latitude,
          longitude: this.data.longitude,
          address: this.data.address,
          createTime: new Date(),
          status: '未处理',

          // ⭐⭐⭐ 核心：用户信息绑定
          user: {
            openid: openid,
            nickname: this.data.nickname,
            avatarUrl: this.data.avatarUrl
          }
        }
      })

      wx.hideLoading()
      wx.showToast({ title: '上报成功' })

      this.clearForm()

    } catch (err) {
      console.error(err)
      wx.hideLoading()
      wx.showToast({ title: '上传失败', icon: 'none' })
    }
  },

  clearForm() {
    this.setData({
      type: '',
      description: '',
      images: [],
      video: '',
      audioPath: '',
      audioFileID: '',
      latitude: '',
      longitude: '',
      address: ''
    })
  }

})