import React from 'react'
import router from 'umi/router'
const OtherStateOrderItem=({ color, item, count, url}) => {
  return(
    <div style={{ marginBottom: '25px', cursor: 'pointer' }} onClick = {()=>{router.push(url)}}>
      <div style={{ display: 'inline-block', width: '9px', height: '9px', borderRadius: '9px', backgroundColor: `${color}`, marginRight: '9px'}}></div>
      {item}
      <span style={{float:'right'}}>{count}</span>
    </div>
  )
}

const OtherStateOrdersList = ({ otherStateOrderDate: data })=>{
  const colorArr = ['red', 'blue', 'green', 'black']
  const newData = data.map((item, index)=>{
    item.color = colorArr[index]
    item.url = urlArr[index]
    return item
  })
  return(
    <div style={{ paddingLeft: '70px', marginLeft: '-100px', borderLeft:'1px solid #ccc', display: 'inline-block', width: '20%', position:'relative', top: '-210px', height: '230px'}}>
      {newData.map(item=><OtherStateOrderItem {...item} />)}
    </div>
  )
}

export default OtherStateOrdersList
