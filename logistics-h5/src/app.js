import './envConfig';
// import './services/dictionaryService'
/* eslint-disable */

export const dva = {
  config: {
    onError(e) {
      e.preventDefault()
      Promise.reject(e)
    }
  },
  plugins: [
    require('dva-logger')()
  ]
}

// 生成模板
function getTemplate () {
  return `<div style="min-width: 1024px; margin: 47px 20px; background-color: #fff; border: solid 1px #777; box-shadow: 0 0 8px #888; position: relative;">
  <p style=" text-align: center; margin: 13px 25px; font-weight: bold; font-size: 19px;">您的浏览器需要更新,请下载一款免费而优秀的最新版浏览器。</p>
  <table style=" width: 100%; margin-bottom: 10px;">
    <tr>
      <td style="text-align: center; padding: 10px; width: 33%;">
        <a href="http://www.mozilla.com/firefox/" target="_blank">
          <span style=" color: #e25600; text-align: center; text-decoration: underline; font-size: 19px; font-family: 'Open Sans',sans-serif; font-weight: 300;">Firefox--火狐浏览器</span>
        </a>
      </td>
      <td style="text-align: center; padding: 10px; width: 33%;">
          <a class="link bc" href="http://www.google.cn/chrome/browser/desktop/index.html" target="_blank">
            <span style=" color: #e25600; text-align: center; text-decoration: underline; font-size: 19px; font-family: 'Open Sans',sans-serif; font-weight: 300;">Chrome--谷歌浏览器</span>
          </a>
      </td>
      <td style="text-align: center; padding: 10px; width: 33%;">
          <a class="link bi" href="http://windows.microsoft.com/en-HK/internet-explorer/download-ie" target="_blank">
            <span style=" color: #e25600; text-align: center; text-decoration: underline; font-size: 19px; font-family: 'Open Sans',sans-serif; font-weight: 300;">Internet Explorer Edge--IE Edge浏览器</span>
          </a>
      </td>
    </tr>
  </table>
</div>`
}

//  渲染浏览器检测页面
function renderBrowserDetection () {
  const template = getTemplate()
  document.getElementById('root').innerHTML  += template
}


export function render(oldRender) {
  const IEVer = IEVersion()
  if(IEVer === 'edge' || IEVer === -1){ // ie11以下存在，故加载推荐浏览器页面
    oldRender()
  } else {
    renderBrowserDetection()
  }
}

function IEVersion() {
  const { userAgent } = navigator; // 取得浏览器的userAgent字符串
  const isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; // 判断是否IE<11浏览器
  const isEdge = userAgent.indexOf("Edge") > -1 && !isIE; // 判断是否IE的Edge浏览器
  const isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
  if( isIE ) {
      const reIE = new RegExp("MSIE (\\d+\\.\\d+);");
      reIE.test(userAgent);
      const fIEVersion = parseFloat(RegExp["$1"]);
      if(fIEVersion == 7) {
          return 7;
      } else if(fIEVersion == 8) {
          return 8;
      } else if(fIEVersion == 9) {
          return 9;
      } else if(fIEVersion == 10) {
        return 10;
      } else {
        return 6; //IE版本<=7
      }
  } else if (isEdge) {
      return 'edge';//edge
  } else if (isIE11) {
      return 11; //IE11
  } else {
      return -1;//不是ie浏览器
  }
}
