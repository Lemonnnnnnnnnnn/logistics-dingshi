import React from 'react'
// import router from 'umi/router'
import { Button, Modal } from 'antd-mobile'
import { Divider } from 'antd'
import iconPraise from '@/assets/driver/icon-praise.png'
import iconTread from '@/assets/driver/icon-tread.png'
import CSSModules from "react-css-modules";
import styles from './index.less'

@CSSModules(styles)
export default class Index extends React.Component {

  state = {
    open: false,
    item: ''
  }

  customerQuestion = (questions) => {
    return questions.map((item, index) => {
      return <li key={index} styleName='content-style' onClick={()=>this.onOpenChange(item)}>{item.title}</li>
    })
  }

  onClose = key => () => {
    this.setState({
      [key]: false,
    });
  }

  onOpenChange = (...args) => {
    this.setState({ item: args[0] });
    this.setState({ open: !this.state.open });
  }

  render () {
    const { open, item } = this.state
    const questions = [{ title: '怎么绑定银行卡', contentTitle: '怎么绑定银行卡？', content: '这里显示问题的解决方案，或者相关问题的流 程之类的' }, { title: '怎么解绑车辆', contentTitle: '怎么解绑车辆？', content: '' }]
    const questionType = [{ title: '资质', contentTitle: '资质？', content: '' }, { title: '车辆', contentTitle: '车辆？', content: '' }]
    return (
      <div>
        <div styleName='background-div'>
          <div styleName='title-style'>常见问题</div>
          <ul>
            {this.customerQuestion(questions)}
          </ul>
        </div>
        <div styleName='background-div'>
          <div styleName='title-style'>问题分类</div>
          <ul>
            {this.customerQuestion(questionType)}
          </ul>
        </div>
        <Button
          style={{
            margin: '0 15px',
            width: 'calc(100vw - 30px)',
            height: '47px',
            background: 'rgba(46,122,245,1)',
            borderRadius: '4px',
            color: 'white',
            fontSize: '17px',
            position: 'absolute',
            bottom: '15px'
          }}
          href="tel:028-61676700"
        >
          联系客服
        </Button>
        <Modal
          popup
          visible={open}
          onClose={this.onClose('open')}
          animationType="slide-up"
          style={{ height: '80%' }}
          // afterClose={() => { alert('afterClose'); }}
        >
          <div style={{ padding: '15px 15px 30px 0' }}>
            <div style={{ paddingLeft: '15px'}}>
              <div style={{ textAlign: 'left' }}>
                <div styleName='title-style'>
                  {item.contentTitle}
                </div>
                <div styleName='content-style'>
                  {item.content}
                </div>
              </div>
            </div>
            <div style={{ position: 'fixed', height: '100px', width: '100%', bottom: '0', background: 'rgba(255,255,255,1)' }}>
              <div style={{ padding: '0 36px 0 36px' }}>
                <Divider style={{ paddingRight: '15px', paddingLeft: '15px', fontSize: '14px', color: '#999999', opacity: '1' }}>回答问题是否有帮助</Divider>
              </div>
              <img src={iconPraise} styleName='image-right' onClick={this.onClose('open')} alt="图片加载失败" />
              <span styleName='help-txt' onClick={this.onClose('open')}>有帮助</span>
              <span style={{ paddingRight: '60px' }} />
              <img src={iconTread} styleName='image-right' onClick={this.onClose('open')} alt="图片加载失败" />
              <span styleName='help-txt' onClick={this.onClose('open')}>无帮助</span>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}
