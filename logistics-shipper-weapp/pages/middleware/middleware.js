// pages/middleware/middleware.js
Page({
  data: {
    loading:false
  },

  onLoad: function (options) {
    const { __mac } = options
    wx.navigateTo({
      url: __mac ? `/pages/web/web?__mac=${__mac}` : `/pages/web/web`,
      success:() => {
        setTimeout(()=>{
          this.setData({ loading: true })
        },2000)
      }
    })
  },
  backToWeb (){
    // let pages = getCurrentPages();
    // let currPage = {};
    // if (pages.length) {
    //   currPage = pages[pages.length - 1];
    // }
    // const { options={} } = currPage
    // const { __mac } = options
    wx.navigateTo({
      url: `/pages/web/web`
    })
  }
})