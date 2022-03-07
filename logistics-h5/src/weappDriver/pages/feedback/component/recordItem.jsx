import React from 'react'
import moment from 'moment'
import CSSModules from 'react-css-modules'
import { Tag, Flex } from 'antd-mobile'
import router from 'umi/router'
import styles from './recordItem.less'
import { replyDist, typeDist } from '@/constants/feedback/feedback'


const RecordItem = ({ item }) =>(
  <div className={styles.recordItem} onClick={()=>router.push(`feedback/detail?feedbackId=${item.feedbackId}`)}>
    <Tag className={styles[replyDist[item.feedbackStatus].className]}>
      {replyDist[item.feedbackStatus].text}
    </Tag>
    <div style={{ marginLeft : '1rem' }}>
      <div className={styles.feedbackType}>{typeDist[item.feedbackType]}</div>
      <div style={{ display : '-webkit-box', wordBreak : 'break-word', WebkitBoxOrient : 'vertical', WebkitLineClamp : '2', overflow : 'hidden', textOverflow : 'ellipsis' }}>
        问题描述：{item.feedbackContent}
      </div>
      <Flex justify='end'>
        <div className={styles.feedbackTime}>{moment(item.createTime).format('YYYY-MM-DD HH:mm')}</div>
      </Flex>
    </div>
  </div>
)

export default CSSModules(styles, { allowMultiple : true })(RecordItem)
