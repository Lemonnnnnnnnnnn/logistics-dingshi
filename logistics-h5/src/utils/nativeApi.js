function invokeNative (methodName) {
  if (!window.ejdObject) {
    console.log(`没有${methodName}原生api`)
    return false
    // throw new Error('ejdObject不存在')
  }
  const params = ([]).slice.call(arguments, 1)
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('返回数据超时'))
    }, 10000);
    try {
      // const result = window.webkit.messageHandlers[methodName].postMessage(params.length? ...params: null)
      const result = window.ejdObject[methodName](...params)
      resolve(result)
    } catch (error) {
      clearTimeout(timer)
      reject(error)
    }
  })
}

const nativeApi = {
  toLoginPage: () => invokeNative('toLoginPage'),
  onBackHome: () => invokeNative('onBackHome'),
  onPwdChanged:() => invokeNative('onPwdChanged'),
  onShowTrack: params => invokeNative('onShowTrack', params),
  onSaveLoading: params => invokeNative('onSaveLoading', params),
  onSaveSign: params => invokeNative('onSaveSign', params),
  onLoginOccupied: () => invokeNative('onLoginOccupied'),
  showHeader:() => invokeNative('showHeader'),
  hideHeader:() => invokeNative('hideHeader'),
  onPhoneCall: number => invokeNative('onPhoneCall', number),
  onShipmentResign: transportId => invokeNative('onShipmentResign', transportId),
  toCompleteInfo: (...args) => invokeNative('toCompleteInfo', ...args),
  getGpsLocation: () => invokeNative('getGpsLocation'),
  toTransportPage: () => invokeNative('toTransportPage'),
  toDeliveryPage: () => invokeNative('toDeliveryPage'),
  refreshTransportList: () => invokeNative('refreshTransportList'),
  onSuccess: type => invokeNative('onSuccess', type),
  onFinish: () => invokeNative('onFinish')
}

export default nativeApi
