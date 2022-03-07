import React, { Component } from 'react';
import { Carousel } from 'antd-mobile'
import router from 'umi/router'
import TodoList from './todoList'
import { getUserInfo } from '@/services/user'
import { getProjectList } from '@/services/apiService'
import homePic1 from '@/assets/home_banner_pic1.png'
import creatGoodsPlansIcon from '@/assets/home_icon_refuse.png'
import goodsPlansListIcon from '@/assets/home_icon_ underway.png'
import transportListIcon from '@/assets/home_icon_confirmed.png'
import styles from './index.css'

class Index extends Component {
  // static shouldJudgeWhetherRedirect = true

  state = {
    loading: false,
    picsData: [homePic1],
  }

  renderFuncList = () => {
    const funcItemStyle = {
      display: 'inline-block',
      textAlign: 'center'
    }
    const listConfig = [
      {
        imgSrc: creatGoodsPlansIcon,
        text: '创建计划单',
        onClick: () => {
          router.push('/weapp/createGoodsPlans')
        }
      },
      {
        imgSrc: goodsPlansListIcon,
        text: '计划单列表',
        onClick: () => {
          router.push('goodsplansList?initialPage=0')
        }
      },
      {
        imgSrc: transportListIcon,
        text: '运单列表',
        onClick: () => {
          router.push('goodsplansList?initialPage=1')
        }
      }

    ]
    return (

      <div className={styles.featureWrap}>
        {
          listConfig.map(item => (
            <div style={funcItemStyle} key={item.text} onClick={item.onClick}>
              <div>
                <img alt="" src={item.imgSrc} />
              </div>
              <span>{item.text}</span>
            </div>
          ))
        }
      </div>
    )
  }

  render () {
    const { picsData, loading } = this.state
    return loading
      ? ''
      : (
        <div>
          <Carousel className={styles.carouselWrap} frameOverflow="visible">
            {picsData.map(value => <img src={value} key={value} alt="" />)}
          </Carousel>
          {this.renderFuncList()}
          <TodoList />
        </div>
      );
  }
}

window.Index = Index

export default Index;
