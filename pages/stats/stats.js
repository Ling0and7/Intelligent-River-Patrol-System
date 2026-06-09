const db = wx.cloud.database()

Page({

  data:{
    typeData: {},   // 隐患类型统计
    dailyData: {}   // 每日数量统计
  },

  onLoad(){
    this.loadTypeData()
    this.loadDailyData()
  },

  async loadTypeData(){
    try{
      const res = await db.collection('hazards').get()
      const typeCount = {}
      res.data.forEach(item=>{
        if(typeCount[item.type]){
          typeCount[item.type] +=1
        }else{
          typeCount[item.type] =1
        }
      })
      this.setData({typeData:typeCount})
      this.drawTypeChart(typeCount)
    }catch(err){
      console.error(err)
    }
  },

  async loadDailyData(){
    try{
      const res = await db.collection('hazards').get()
      const dailyCount = {}
      res.data.forEach(item=>{
        const date = new Date(item.createTime).toLocaleDateString()
        if(dailyCount[date]){
          dailyCount[date]+=1
        }else{
          dailyCount[date]=1
        }
      })
      this.setData({dailyData:dailyCount})
      this.drawDailyChart(dailyCount)
    }catch(err){
      console.error(err)
    }
  },

  drawTypeChart(data){
    const ctx = wx.createCanvasContext('typeChart')
    const colors = ['#1E90FF','#FF6347','#32CD32','#FFD700','#FF69B4']
    const total = Object.values(data).reduce((a,b)=>a+b,0)
    let startAngle = 0
    let i=0
    for(let key in data){
      const sliceAngle = (data[key]/total)*2*Math.PI
      ctx.beginPath()
      ctx.moveTo(150,150)
      ctx.arc(150,150,100,startAngle,startAngle+sliceAngle)
      ctx.setFillStyle(colors[i%colors.length])
      ctx.fill()
      startAngle += sliceAngle
      i++
    }
    // 绘制图例
    let legendY = 10
    i=0
    for(let key in data){
      ctx.setFillStyle(colors[i%colors.length])
      ctx.fillRect(270,legendY,20,20)
      ctx.setFillStyle('#000')
      ctx.setFontSize(14)
      ctx.fillText(`${key} (${data[key]})`, 300, legendY+15)
      legendY+=30
      i++
    }
    ctx.draw()
  },

  drawDailyChart(data){
    const ctx = wx.createCanvasContext('dailyChart')
    const dates = Object.keys(data).sort()
    const values = dates.map(d=>data[d])
    const maxVal = Math.max(...values)
    const canvasHeight = 300
    const canvasWidth = 400
    const margin = 40
    const stepX = (canvasWidth - 2*margin)/(dates.length-1)

    // 坐标轴
    ctx.beginPath()
    ctx.setStrokeStyle('#333')
    ctx.moveTo(margin,canvasHeight-margin)
    ctx.lineTo(canvasWidth-margin,canvasHeight-margin)
    ctx.moveTo(margin,canvasHeight-margin)
    ctx.lineTo(margin,margin)
    ctx.stroke()

    // 折线
    ctx.setStrokeStyle('#1E90FF')
    ctx.setLineWidth(2)
    for(let i=0;i<dates.length;i++){
      const x = margin + i*stepX
      const y = canvasHeight-margin - (values[i]/maxVal)*(canvasHeight-2*margin)
      if(i==0){
        ctx.moveTo(x,y)
      }else{
        ctx.lineTo(x,y)
      }
    }
    ctx.stroke()

    // 数据点
    for(let i=0;i<dates.length;i++){
      const x = margin + i*stepX
      const y = canvasHeight-margin - (values[i]/maxVal)*(canvasHeight-2*margin)
      ctx.beginPath()
      ctx.arc(x,y,4,0,2*Math.PI)
      ctx.setFillStyle('#FF6347')
      ctx.fill()
      // 日期文字
      ctx.setFillStyle('#000')
      ctx.setFontSize(12)
      ctx.fillText(dates[i],x-15,canvasHeight-margin+20)
    }

    ctx.draw()
  }

})