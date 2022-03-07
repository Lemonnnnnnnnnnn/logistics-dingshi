import React from 'react';
import { Modal, Timeline } from "antd";
import moment from 'moment';
import { getOssImg } from "../../../../utils/utils";
import ImageDetail from '../../../../components/image-detail';

export default class TangibleEvents extends React.PureComponent{

  state={
    visible:false,
    imgSrc:[],
    index:0
  }

  renderPrebookingEvent = ({ createUserName, organizationName, createTime, tangibleEventDetail, signPictureDentryid, tangibleEventType }, index) => (
    <Timeline.Item key={index}>
      <>
        <div className="color-gray">{moment(createTime).format('YYYY-MM-DD HH:mm')}</div>
        {
          tangibleEventType !== 9
            ? <div>{`${createUserName} ${organizationName || ''} ${ tangibleEventDetail }`}</div>
            : <div>{`系统自动操作 ${ tangibleEventDetail }`}</div>
        }
        {signPictureDentryid&&<div>{this.renderPictures(signPictureDentryid)}</div>}
      </>
    </Timeline.Item>
  )

  renderPictures = pictureDentryid =>{
    const _pictureDentryid = pictureDentryid.split('<zf>'); // [ 过磅单图片string, 签收单图片string ]
    const pictureArrays = _pictureDentryid.map(item => item.split(',')).reverse(); // [ [过磅单图片数组], [签收单图片数组] ]
    return pictureArrays.map((pictureArray) =>
      (
        <React.Fragment key={pictureArray}>
          {pictureArray.map((picture) =>
            <img onClick={()=>this.openImageDetail(pictureArray)} style={{ marginRight:'10px', marginBottom:'10px' }} key={picture} alt={picture} src={getOssImg(picture, { width:'200', height:'200' })} />
          )}
          <br />
        </React.Fragment>
      )
    );
  }

  openImageDetail = (pictureArray=[], index ) =>{
    const imgSrc = pictureArray.map(item=>getOssImg(item));
    this.setState({
      imgSrc,
      index,
      visible:true
    });
  }

  render () {
    const { value = [] } = this.props;
    const { visible, imgSrc=[], index=0 } = this.state;
    value.sort((prev, next) => moment(next.createTime) > moment(prev.createTime) ? 1 : -1);
    return (
      <>
        <Modal
          title='图片'
          footer={null}
          width={648}
          maskClosable={false}
          destroyOnClose
          visible={visible}
          onCancel={() => this.setState({ visible: false, index:0, imgSrc:[] })}
        >
          <ImageDetail index={index} imageData={imgSrc} />
        </Modal>
        <Timeline>
          {value.map(this.renderPrebookingEvent)}
        </Timeline>
      </>
    );
  }
}
