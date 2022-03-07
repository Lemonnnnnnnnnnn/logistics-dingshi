import React from 'react'

export default ({ value, ...restProps }) => {
  const { ossEndpoint, ossBucket } = window.envConfig
  const imgUrl = `http://${ossBucket}.${ossEndpoint}/${value}`
  return <img {...restProps} />
}
