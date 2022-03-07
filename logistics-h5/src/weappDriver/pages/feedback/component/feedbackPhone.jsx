import React, { useEffect, useState } from 'react'
import { InputItem } from 'antd-mobile'

const FeedbackPhone = ({ onChange, value, defaultValue })=>{
  const [show, setShow] = useState(false)
  const [phone, setPhone] = useState('')
  const [encryptionPhone, setEncryptionPhone] = useState('')

  useEffect(()=>{
    setPhone(value || defaultValue)
  }, [value, defaultValue])

  useEffect(()=>{
    const _renderPhone = fakeEncryption(phone)
    setEncryptionPhone(_renderPhone)
  }, [phone])


  const fakeEncryption = (data) =>{
    if (!data) return
    const len = data.length / 3
    let midStr = ''
    for (let i = 0 ; i < len ; i ++){
      midStr += '*'
    }
    return data.substr(0, len) + midStr + data.substr(len * 2)
  }


  const onHandleInput = (val)=>{
    onChange(val)
  }

  return (
    <div>
      联系方式：
      <InputItem placeholder='请输入联系方式' value={show ? phone : encryptionPhone} onChange={onHandleInput} onFocus={()=>setShow(true)} onBlur={()=>setShow(false)} />
    </div>
  )
}

export default FeedbackPhone
