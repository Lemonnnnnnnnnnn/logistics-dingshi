import React, { Component } from 'react';
import { Icon, Row, Col } from 'antd';
import CssModule from 'react-css-modules';
import Zmage from 'react-zmage';
import styles from './index.css';

/**
 * @author 任卓
 * @export 图片展示组件
 * @class ImageDetail
 * @extends {Component}
 */
@CssModule(styles, { allowMultiple: true })
export default class ImageDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      index: props.index || 0,
      onBrowsing: false,
    };
    this.PRE = 'pre';
    this.NEXT = 'next';
  }

  // componentWillReceiveProps (nextProps) {
  //   debugger
  //   if (this.props.index !== nextProps.index) {
  //     this.setState({ index: nextProps.index })
  //   }
  // }

  static getDerivedStateFromProps(props, state) {
    if (props.imageData.length <= state.index) {
      state.index = props.index || 0;
    }
    return state;
  }

  /**
   * 图片改变
   * @memberof ImageDetail
   */
  onChange = type => (
    () => {
      const { index } = this.state;
      const { imageData, onImgChange } = this.props;
      let _index = type === this.PRE ? index - 1 : index + 1;
      const imgLength = imageData.length;
      if (_index >= imgLength) {
        _index = 0;
      } else if (_index < 0) {
        _index = imgLength - 1;
      }
      this.setState({
        index: _index,
      });
      onImgChange && onImgChange(_index);
    }
  );

  /**
   * zImage 组件方法图片
   * @memberof ImageDetail
   */
  onBrowsing = browsing => {
    this.setState({
      onBrowsing: browsing,
    });
  };

  /**
   * zImage 组件切换页面
   * @memberof ImageDetail
   */
  onSwitching = paging => {
    this.setState({ index: paging });
  };

  noBrowsingImage = url => {
    const { width, height } = this.props;
    if (url.indexOf('x-oss-process=image') > -1) {
      return `${url}/resize,w_${width || 500},h_${height || 300}`;
    }
    return `${url}?x-oss-process=image/resize,w_${width || 500},h_${height || 300}`;
  };

  render() {
    const { index, onBrowsing = false } = this.state;
    const { imageData, width, height } = this.props;
    if (!imageData.length) { // 如果传入进来的是个空数组或者无，返回空
      return (
        <div style={{ height: '300px', width: '300px', background: 'rgba(242, 242, 242, 1)', position: 'relative', marginBottom: '30px' }}>
          <div style={{ lineHeight: '300px', textAlign: 'center', height: '100%' }}>单据正在自动生成...</div>
        </div>);
    }
    const setImg = imageData.map(item => ({
      src: onBrowsing ? item : this.noBrowsingImage(item),
      alt: '图片',
    }));
    const imgLength = imageData.length;
    const boxStyle = {
      width: width + 100 || 600,
      height: height + 100 || 400,
    };
    return (
      <div style={{ textAlign: 'center' }}>
        <div>
          <div style={boxStyle}>
            {imgLength !== 1 &&
            <span
              styleName='pagination prev'
              onClick={this.onChange(this.PRE)}
            >
              <Icon type='left' />
            </span>
            }
            <span styleName='image-box'>
              <Zmage
                src={setImg[index].src}
                set={setImg}
                defaultPage={index}
                onBrowsing={this.onBrowsing}
                onSwitching={this.onSwitching}
              />
            </span>
            {imgLength !== 1 &&
            <span
              styleName='pagination next'
              onClick={this.onChange(this.NEXT)}
            >
              <Icon type='right' />
            </span>
            }
          </div>
          <ul style={{ width: boxStyle.width }} styleName='img-dots'>
            {
              imageData.map((img, _index) => {
                const activeCls = img === imageData[index] ? styles.on : '';
                return <li key={_index} className={activeCls} styleName='img-dot-item' />;
              })
            }
          </ul>
        </div>


      </div>
    );
  }
}
