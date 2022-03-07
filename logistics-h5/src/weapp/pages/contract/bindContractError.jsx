import React from 'react'
import { Button } from 'antd-mobile'
import router from 'umi/router'
import styles from './bindContractError.css'
import img from '@/assets/add_contract_error.png'

export default class BindContract extends React.Component {

  back = ()=>router.goBack()

  renderError = () => {
    const { location:{ query:{ error } } } = this.props
    const errorWord = {
      notFound:'没找到对应合同',
      isUsed:'授权码已被使用',
      noSameOrganization:'无权限访问'
    }[error]||'服务器故障'
    return <>{`${errorWord}，如有疑问请联系`}<br />平台工作人员：028-61676700</>
  }

  back = () => {
    router.goBack()
  }

  render () {
    const { location:{ query:{ word } } } = this.props

    return (
      <div className={styles.layout}>
        <div className={styles.imgWrap}><img src={img} alt="" /></div>
        <h3 className={styles.title}>{word || '添加失败'}</h3>
        <h4 className={styles.description}>{this.renderError()}</h4>
        <Button className={styles.button} onClick={this.back} type="primary">返回</Button>
      </div>
    )
    // return (
    //   <>
    //     {this.renderError()}
    //   </>
    // )
  }
}
