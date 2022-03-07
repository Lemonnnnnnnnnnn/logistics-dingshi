import React from 'react';

const initStyle = {
  position: 'absolute',
  background: "red",
  color: "#fff",
  fontSize: '8px',
  padding: '4px',
  borderRadius: '5px',
  left: '-10px'
}

const ExpiredTag = ({ style }) => {
  console.log(style)
  return (
    <div style={{ ...initStyle, ...style }}>已过期
    </div>
  )
}

export default ExpiredTag;