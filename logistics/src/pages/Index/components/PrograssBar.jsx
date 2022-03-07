import React from 'react'

const PrograssBar = ({ yesterdayAdd, todayAdd })=>{
  const total = ( todayAdd + yesterdayAdd ) * 2
  const yesterdayBarWidth = (yesterdayAdd/total)*100 + '%'
  const todayBarWidth = (todayAdd/total)*100 + '%'
  const todayBarLeft = (yesterdayAdd/total)*100 + 50 + '%'
  return(
    <div style={{position: 'relative', backgroundColor: 'rgba(240, 242, 245, 1)', height:'14px', width:'100%'}}>
      <div style={{position: 'absolute', backgroundColor: 'rgba(250, 211, 55, 1)', height:'14px', top:'0px', left: '50%', width: yesterdayBarWidth}}></div>
      <div style={{position: 'absolute', backgroundColor: 'rgba(78, 203, 116, 1)', height:'14px', top:'0px', left: todayBarLeft, width: todayBarWidth }}></div>
    </div>
  )
}
export default PrograssBar
