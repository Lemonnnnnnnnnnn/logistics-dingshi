
function invokeNative (methodName) {
  if (!window.ejdObject) {
    throw new Error('ejdObject不存在')
  }

  const params = ([]).slice.call(arguments, 1)
  return new Promise((resolve, reject) => {
    try {
      const result = window.ejdObject[methodName](...params)
      resolve(result)
    } catch (error) {
      reject(error)
    }
  })
}

const nativeApi = {
  onBackHome: () => invokeNative('onBackHome'),
  onPwdChanged:() => invokeNative('onPwdChanged'),
  onShowTrack: params => invokeNative('onShowTrack', params),
  onLoginOccupied: () => invokeNative('onLoginOccupied'),
  showHeader:() => invokeNative('showHeader'),
  hideHeader:() => invokeNative('hideHeader'),
  onPhoneCall: number => invokeNative('onPhoneCall', number),
  onShipmentResign: transportId => invokeNative('onPhoneCall', transportId)
}

export default nativeApi
