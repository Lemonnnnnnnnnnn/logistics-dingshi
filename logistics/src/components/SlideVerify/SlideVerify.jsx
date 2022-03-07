import React from 'react';
import classnames from 'classnames';
import { Icon } from 'antd';
import { isFunction } from 'util';
import { getSlideVerify } from '@/services/apiService';
import styles from './slideVerify.css';

const blockWidth = 56;
const defaultDisplayWidth = 300;
const base64JPGHeader = 'data:image/jpg;base64,';
const BIGIMAGE = 'bigImage';
const SMALLIMAGE = 'smallImage';
export default class SlideVerify extends React.Component {
  state = {
    init: false, // 是否初始化
    sliding: false, // 是否正在滑动
    startSlidePositionX: undefined, // 滑动的初始位置
    slideDistance: undefined, // 移动的距离
    scale: undefined, // 缩放比例，默认图片较大因此需要缩放
    bigImgDisplayWidth: undefined, // 大图的渲染width（根据scale和原图width计算）
    smallImgDisplayWidth: undefined, // 小图的渲染width
    bigImage: undefined, // 大图url
    smallImage: undefined, // 小图url
    imageToken: undefined, // token_storage，登录时需传给服务端
    slideY: undefined // 小图的Y轴位置（缩放后的）
  }

  componentDidMount () {
    this.registerSlideEvent();
    this.initSlide();
  }

  componentWillUnmount () {
    this.unregisterSlideEvent();
  }

  registerSlideEvent = () => {
    window.addEventListener('mousemove', this.onSliding);
    window.addEventListener('mouseup', this.endSliding);
  }

  unregisterSlideEvent = () => {
    window.removeEventListener('mousemove', this.onSliding);
    window.removeEventListener('mouseup', this.endSliding);
  }

  initSlide = () => getSlideVerify()
    .then(this.loadAllImage)
    .then(result => {
      const [{ bigImageWidth, bigImage, slideY, imageToken }, { smallImageWidth, smallImage }] = result;
      const { width = defaultDisplayWidth } = this.props;
      const scale = width / bigImageWidth;
      const metaData = {};
      metaData.slideY = scale * slideY;
      metaData.bigImgDisplayWidth = scale * bigImageWidth;
      metaData.smallImgDisplayWidth = scale * smallImageWidth;
      metaData.bigImage = bigImage;
      metaData.smallImage = smallImage;
      this.setState({ init: true, scale, imageToken, ...metaData });
    })

  loadAllImage = metaData => Promise.all([this.loadImage(metaData, BIGIMAGE), this.loadImage(metaData, SMALLIMAGE)])

  // loadImage仅resolve Target
  loadImage = (metaData, loadImageType = BIGIMAGE) => new Promise(resolve => {
    const { imageToken } = metaData;
    const iamge = metaData[loadImageType];
    const img = new Image();
    metaData[loadImageType] = `${base64JPGHeader}${iamge}`;
    img.src = metaData[loadImageType];
    img.onload= ({ target }) => {
      const imageWidth = target.width;
      if (loadImageType === BIGIMAGE) {
        resolve({ imageToken, bigImageWidth: imageWidth, bigImage: metaData[loadImageType], slideY: metaData.slideY });
      }
      resolve({ smallImageWidth: imageWidth, smallImage: metaData[loadImageType] });
    };
  })

  startSliding = ({ clientX }) => {
    const { startSlidePositionX } = this.state;
    const nextState = { sliding: true };

    !startSlidePositionX && (nextState.startSlidePositionX = clientX);
    this.setState(nextState);
  }

  onSliding = ({ clientX }) => {
    const { width = defaultDisplayWidth } = this.props;
    const { sliding, startSlidePositionX } = this.state;
    if (!sliding) return;

    const validDistance = Math.min(Math.max(clientX - startSlidePositionX, 0), width - blockWidth);
    this.setState({
      slideDistance: validDistance
    });
  }

  // todo 验证？目前是直接把token和distance传给登录接口，是否改成客户端验证？
  // 若传给接口，distance需要使用scale还原，需对接外部onChange
  // 若客户端验证，需不全后续交互如展示验证结果
  validate = () => {
    const { slideDistance, scale, imageToken: slideToken } = this.state;
    const { validate } = this.props;

    isFunction(validate) && validate({ slideX: (slideDistance / scale).toFixed(0), slideToken });
  }

  endSliding = () => this.state.sliding && this.setState({ sliding: false }, () => this.validate())

  renderSlideVerify = () => {
    const { style: wrapStyle = {} } = this.props;
    const { bigImage, smallImage, slideY, bigImgDisplayWidth, smallImgDisplayWidth, slideDistance = 0, sliding } = this.state;
    const maskCls = classnames(styles.slideMask, { [styles.sliding]: sliding });
    const bigImgStyle = { width: `${bigImgDisplayWidth}px` };
    const smallImgStyle = { width: `${smallImgDisplayWidth}px`, top: `${slideY}px`, left: `${slideDistance}px` };
    const iconStyle = { fontSize: '30px', lineHeight: '60px' };
    const slideBlockStyle = { left: `${slideDistance}px` };
    const maskStyle = { width: `${slideDistance + blockWidth / 2}px` };

    return (
      <div className={styles.slideVerifyWrap} style={wrapStyle}>
        <div className={styles.imgWrap}>
          <img className={styles.bigImg} src={bigImage} alt="" style={bigImgStyle} />
          <img className={styles.smallImg} src={smallImage} alt="" style={smallImgStyle} />
        </div>
        <div className={styles.slideBar}>
          <div className={maskCls} style={maskStyle}>
            <div onMouseDown={this.startSliding} className={styles.slideBlock} style={slideBlockStyle}>
              <Icon type="menu" style={iconStyle} rotate={90} />
            </div>
          </div>
          <span className={styles.tips}>向右滑动填充拼图</span>
        </div>
      </div>
    );
  }

  renderEmpty = () => 'loading'

  render () {
    const { init } = this.state;

    return init
      ? this.renderSlideVerify()
      : this.renderEmpty();
  }
}
