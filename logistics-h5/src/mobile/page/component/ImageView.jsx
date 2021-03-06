/* eslint-disable */
import PropTypes from 'prop-types';

module.exports =
/** *** */ (function (modules) { // webpackBootstrap
    /** *** */ 	// The module cache
    /** *** */ 	const installedModules = {};

    /** *** */ 	// The require function
    /** *** */ 	function __webpack_require__ (moduleId) {

      /** *** */ 		// Check if module is in cache
      /** *** */ 		if (installedModules[moduleId])
      /** *** */ 			return installedModules[moduleId].exports;

      /** *** */ 		// Create a new module (and put it into the cache)
      /** *** */ 		const module = installedModules[moduleId] = {
        /** *** */ 			exports: {},
        /** *** */ 			id: moduleId,
        /** *** */ 			loaded: false
        /** *** */ 		};

      /** *** */ 		// Execute the module function
      /** *** */ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

      /** *** */ 		// Flag the module as loaded
      /** *** */ 		module.loaded = true;

      /** *** */ 		// Return the exports of the module
      /** *** */ 		return module.exports;
      /** *** */ 	}


    /** *** */ 	// expose the modules object (__webpack_modules__)
    /** *** */ 	__webpack_require__.m = modules;

    /** *** */ 	// expose the module cache
    /** *** */ 	__webpack_require__.c = installedModules;

    /** *** */ 	// __webpack_public_path__
    /** *** */ 	__webpack_require__.p = "";

    /** *** */ 	// Load entry module and return exports
    /** *** */ 	return __webpack_require__(0);
    /** *** */ })
  /** ********************************************************************* */
  /** *** */ ([
    /* 0 */
    /** */ function (module, exports, __webpack_require__) {



      Object.defineProperty(exports, "__esModule", {
	    value: true
      });
      exports.SingleImgView = undefined;

      const _createClass = function () { function defineProperties (target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

      const _react = __webpack_require__(1);

      const _react2 = _interopRequireDefault(_react);

      const _alloyfinger = __webpack_require__(2);

      const _alloyfinger2 = _interopRequireDefault(_alloyfinger);

      const _transform = __webpack_require__(3);

      const _transform2 = _interopRequireDefault(_transform);

      const _components = __webpack_require__(4);

      const _reactSingleton = __webpack_require__(5);

      const _reactSingleton2 = _interopRequireDefault(_reactSingleton);

      __webpack_require__(6);

      function _interopRequireDefault (obj) { return obj && obj.__esModule ? obj : { default: obj }; }

      function _classCallCheck (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

      function _possibleConstructorReturn (self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

      function _inherits (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${ typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /** ********************************************************************************************
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *  This component is designed for Tribe Project in QQ mobile as a Imageviewer
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *  You can use it as a independent component in your App
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *  @ examples  you can find examples in folder examples or README.md
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *  @ param(array)       imagelist: The list of images to view
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *  @ param(bool)        disablePinch: Disable pinch function
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *  @ param(bool)        disableRotate: Disable rotate function
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *  @ param(bool)        disableDoubleTap: Disable double tap function
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *  @ param(function)    longTap: Events called after the long tap
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *  @ param(function)    close: the function to close the viewer
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *  Copyright by nemoliao( liaozksysu@gmail.com), nemo is a member of AlloyTeam in Tencent.
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                ********************************************************************************************* */


      const MARGIN = 40;

      const ImageView = function (_Component) {
	    _inherits(ImageView, _Component);

	    function ImageView (props) {
	        _classCallCheck(this, ImageView);

	        const _this = _possibleConstructorReturn(this, (ImageView.__proto__ || Object.getPrototypeOf(ImageView)).call(this));

	        _this.initScale = 1;
	        _this.screenWidth = window.innerWidth || window.screen.availWidth;
	        _this.screenHeight = window.innerHeight || window.screen.availHeight;
	        _this.list = null;
	        _this.ob = null;
	        _this.focused = null;

	        _this.arrLength = props.imagelist.length;
	        _this.state = {
	            current: props.current
	        };
	        return _this;
	    }

	    _createClass(ImageView, [{
	        key: 'render',
	        value: function render () {
	            const _this2 = this;

	            return _react2.default.createElement(
	                'div',
	                { className: 'imageview' },
	                _react2.default.createElement(
	                    _alloyfinger2.default,
	                    {
	                        onSingleTap: this.onSingleTap.bind(this),
	                        onPressMove: this.onPressMove.bind(this),
	                        onSwipe: this.onSwipe.bind(this) },
	                    _react2.default.createElement(
	                        'ul',
	                        { id: 'imagelist', ref: 'imagelist', className: 'imagelist' },
	                        this.props.imagelist.map((item, i) => _react2.default.createElement(
	                                'li',
	                                { className: 'imagelist-item', key: `img${ i}` },
	                                _react2.default.createElement(
	                                    _alloyfinger2.default,
	                                    {
	                                        onPressMove: _this2.onPicPressMove.bind(_this2),
	                                        onMultipointStart: _this2.onMultipointStart.bind(_this2),
	                                        onLongTap: _this2.onLongTap.bind(_this2),
	                                        onPinch: _this2.onPinch.bind(_this2),
	                                        onRotate: _this2.onRotate.bind(_this2),
	                                        onMultipointEnd: _this2.onMultipointEnd.bind(_this2),
	                                        onDoubleTap: _this2.onDoubleTap.bind(_this2) },
	                                    _react2.default.createElement(_components.CenterImage, { id: `view${ i}`, className: 'imagelist-item-img', lazysrc: item, index: i, current: _this2.state.current })
	                                )
	                            ))
	                    )
	                ),
	                this.props.disablePageNum ? null : _react2.default.createElement(
	                    'div',
	                    { className: 'page' },
	                    this.state.current + 1,
	                    ' / ',
	                    this.arrLength
	                )
	            );
	        }
	    }, {
	        key: 'componentDidMount',
	        value: function componentDidMount () {
	            const current = this.state.current;


	            this.arrLength = this.props.imagelist.length;
	            this.list = this.refs.imagelist;
	            this.ob = document.getElementById(`view${ current}`);

	            (0, _transform2.default)(this.list);
	            current && this.changeIndex(current, false);
	            this.ob && (0, _transform2.default)(this.ob);
	        }
	    }, {
	        key: 'onSingleTap',
	        value: function onSingleTap () {
	            this.props.close && this.props.close();
	        }
	    }, {
	        key: 'onPressMove',
	        value: function onPressMove (evt) {
	            const current = this.state.current;


	            this.endAnimation();

	            if (!this.focused) {
	                if (current === 0 && evt.deltaX > 0 || current === this.arrLength - 1 && evt.deltaX < 0) {
	                    this.list.translateX += evt.deltaX / 3;
	                } else {
	                    this.list.translateX += evt.deltaX;
	                }
	            }

	            evt.preventDefault();
	        }
	    }, {
	        key: 'onPicPressMove',
	        value: function onPicPressMove (evt) {
	            this.endAnimation();

	            const deltaX = evt.deltaX;


            const deltaY = evt.deltaY;


	            if (this.ob && this.checkInArea(deltaX, deltaY)) {
	                this.ob.translateX += deltaX;
	                this.ob.translateY += deltaY;
	                this.focused = true;
	            } else {
	                this.focused = false;
	            }
	        }
	    }, {
	        key: 'onSwipe',
	        value: function onSwipe (evt) {
	            const direction = evt.direction;
	            let current = this.state.current;

	            if (this.focused) {
	                return false;
	            }
	            switch (direction) {
	                case 'Left':
	                    current < this.arrLength - 1 && ++current && this.bindStyle(current);
	                    break;
	                case 'Right':
	                    current > 0 && current-- && this.bindStyle(current);
	                    break;
	            }
	            this.changeIndex(current);
	        }
	    }, {
	        key: 'onMultipointStart',
	        value: function onMultipointStart () {
	            this.endAnimation();
	        }
	    }, {
	        key: 'onPinch',
	        value: function onPinch (evt) {
	            if (this.props.disablePinch) {
	                return false;
	            }
	            this.ob.scaleX = this.ob.scaleY = this.initScale * evt.scale;
	            this.ob.style.webkitTransition = 'cubic-bezier(.15,.01,.88,1)';
	        }
	    }, {
	        key: 'onRotate',
	        value: function onRotate (evt) {
	            if (this.props.disableRotate) {
	                return false;
	            }
	            this.ob.rotateZ += evt.angle;
	            this.ob.style.webkitTransition = 'cubic-bezier(.15,.01,.88,1)';
	        }
	    }, {
	        key: 'onLongTap',
	        value: function onLongTap () {
	            this.props.longTap && this.props.longTap();
	        }
	    }, {
	        key: 'onMultipointEnd',
	        value: function onMultipointEnd (evt) {
	            // translate to normal
	            this.changeIndex(this.state.current);

	            if (!this.ob) {
	                return;
	            }

	            // scale to normal
	            if (this.ob.scaleX < 1) {
	                this.setScale(1);
	            }
	            if (this.ob.scaleX > 2) {
	                this.setScale(2);
	            }

	            // rotate to normal
	            let rotation = this.ob.rotateZ % 360;


            const rate = this.ob.getAttribute('rate');

	            if (rotation < 0) {
	                rotation = 360 + rotation;
	            }
	            this.ob.rotateZ = rotation;

	            if (rotation > 0 && rotation < 45) {
	                this.ob.rotateZ = 0;
	                this.setScale(1);
	            } else if (rotation >= 315) {
	                this.ob.rotateZ = 360;
	                this.setScale(1);
	            } else if (rotation >= 45 && rotation < 135) {
	                this.ob.rotateZ = 90;
	                this.setScale(rate);
	            } else if (rotation >= 135 && rotation < 225) {
	                this.ob.rotateZ = 180;
	                this.setScale(1);
	            } else if (rotation >= 225 && rotation < 315) {
	                this.ob.rotateZ = 270;
	                this.setScale(rate);
	            }
	        }
	    }, {
	        key: 'onDoubleTap',
	        value: function onDoubleTap (evt) {
	            if (this.props.disableDoubleTap) {
	                return false;
	            }

	            const origin = evt.origin;


            const originX = origin[0] - this.screenWidth / 2 - document.body.scrollLeft;


            const originY = origin[1] - this.screenHeight / 2 - document.body.scrollTop;


	            if (this.ob.scaleX === 1) {
	                this.ob.translateX = this.ob.originX = originX;
	                this.ob.translateY = this.ob.originY = originY;
	                this.setScale(2);
	            } else {
	                this.ob.translateX = this.ob.originX;
	                this.ob.translateY = this.ob.originY;
	                this.setScale(1);
	            }
	        }
	    }, {
	        key: 'bindStyle',
	        value: function bindStyle (current) {
	            const _this3 = this;

	            this.setState({ current }, () => {
	                _this3.ob && _this3.restore();
	                _this3.ob = document.getElementById(`view${ current}`);
	                if (_this3.ob && !_this3.ob.scaleX) {
	                    (0, _transform2.default)(_this3.ob);
	                }
	            });
	        }
	    }, {
	        key: 'changeIndex',
	        value: function changeIndex (current) {
	            const ease = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

	            ease && (this.list.style.webkitTransition = '300ms ease');
	            this.list.translateX = -current * (this.screenWidth + MARGIN);
	        }
	    }, {
	        key: 'setScale',
	        value: function setScale (size) {
	            this.ob.style.webkitTransition = '300ms ease-in-out';
	            this.ob.scaleX = this.ob.scaleY = size;
	        }
	    }, {
	        key: 'restore',
	        value: function restore () {
	            this.ob.translateX = this.ob.translateY = 0;
	            this.ob.rotateZ = 0;
	            this.ob.scaleX = this.ob.scaleY = 1;
	            this.ob.originX = this.ob.originY = 0;
	        }
	    }, {
	        key: 'endAnimation',
	        value: function endAnimation () {
	            this.list.style.webkitTransition = '0';
	            this.ob && this.ob.style && (this.ob.style.webkitTransition = '0');
	        }
	    }, {
	        key: 'checkInArea',
	        value: function checkInArea () {
	            const deltaX = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	            const deltaY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	            const _ob = this.ob;


            const scaleX = _ob.scaleX;


            const translateX = _ob.translateX;


            const translateY = _ob.translateY;


            const originX = _ob.originX;


            const originY = _ob.originY;


            const rate = this.ob.getAttribute('rate');


	            if (scaleX !== 1 || scaleX !== rate) {
	                const rangeLeft = (scaleX - 1) * this.screenWidth / 2 + originX;


              const rangeRight = -(scaleX - 1) * this.screenWidth / 2 + originX;


              const rangeUp = (scaleX - 1) * this.screenHeight / 2 + originY;


              const rangeDown = -(scaleX - 1) * this.screenHeight / 2 + originY;

	                if (translateX - originX + deltaX <= rangeLeft && translateX - originX + deltaX >= rangeRight && translateY - originY + deltaY <= rangeUp && translateY - originY + deltaY >= rangeDown) {
	                    return true;
	                }
	            }
	            return false;
	        }
	    }]);

	    return ImageView;
      }(_react.Component);

      ImageView.defaultProps = {
	    current: 0,
	    disablePageNum: false
      };
      ImageView.propTypes = {
	    current: PropTypes.number,
	    imagelist: PropTypes.array.isRequired,
	    disablePageNum: PropTypes.bool,
	    disablePinch: PropTypes.bool,
	    disableRotate: PropTypes.bool,
	    disableDoubleTap: PropTypes.bool,
	    longTap: PropTypes.func,
	    close: PropTypes.func.isRequired
      };
      exports.SingleImgView = new _reactSingleton2.default(ImageView);

      exports.default = ImageView;

      /** */ },
    /* 1 */
    /** */ function (module, exports) {

      module.exports = require("react");

      /** */ },
    /* 2 */
    /** */ function (module, exports, __webpack_require__) {



      Object.defineProperty(exports, "__esModule", {
	    value: true
      });

      const _createClass = function () { function defineProperties (target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

      const _react = __webpack_require__(1);

      const _react2 = _interopRequireDefault(_react);

      function _interopRequireDefault (obj) { return obj && obj.__esModule ? obj : { default: obj }; }

      function _classCallCheck (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

      function _possibleConstructorReturn (self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

      function _inherits (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${ typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* AlloyFinger v0.1.0
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * By dntzhang
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Reedited by nemoliao
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Github: https://github.com/AlloyTeam/AlloyFinger
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

      const AlloyFinger = function (_Component) {
	    _inherits(AlloyFinger, _Component);

	    function AlloyFinger (props) {
	        _classCallCheck(this, AlloyFinger);

	        const _this = _possibleConstructorReturn(this, (AlloyFinger.__proto__ || Object.getPrototypeOf(AlloyFinger)).call(this, props));

	        _this.preV = { x: null, y: null };
	        _this.pinchStartLen = null;
	        _this.scale = 1;
	        _this.isDoubleTap = false;
	        _this.delta = null;
	        _this.last = null;
	        _this.now = null;
	        _this.end = null;
	        _this.multiTouch = false;
	        _this.tapTimeout = null;
	        _this.longTapTimeout = null;
	        _this.singleTapTimeout = null;
	        _this.swipeTimeout = null;
	        _this.x1 = _this.x2 = _this.y1 = _this.y2 = null;
	        _this.preTapPosition = { x: null, y: null };
	        return _this;
	    }

	    _createClass(AlloyFinger, [{
	        key: 'getLen',
	        value: function getLen (v) {
	            return Math.sqrt(v.x * v.x + v.y * v.y);
	        }
	    }, {
	        key: 'dot',
	        value: function dot (v1, v2) {
	            return v1.x * v2.x + v1.y * v2.y;
	        }
	    }, {
	        key: 'getAngle',
	        value: function getAngle (v1, v2) {
	            const mr = this.getLen(v1) * this.getLen(v2);
	            if (mr === 0) return 0;
	            let r = this.dot(v1, v2) / mr;
	            if (r > 1) r = 1;
	            return Math.acos(r);
	        }
	    }, {
	        key: 'cross',
	        value: function cross (v1, v2) {
	            return v1.x * v2.y - v2.x * v1.y;
	        }
	    }, {
	        key: 'getRotateAngle',
	        value: function getRotateAngle (v1, v2) {
	            let angle = this.getAngle(v1, v2);
	            if (this.cross(v1, v2) > 0) {
	                angle *= -1;
	            }

	            return angle * 180 / Math.PI;
	        }
	    }, {
	        key: '_resetState',
	        value: function _resetState () {
	            this.setState({
	                x: null,
	                y: null,
	                swiping: false,
	                start: 0
	            });
	        }
	    }, {
	        key: '_emitEvent',
	        value: function _emitEvent (name) {
	            if (this.props[name]) {
	                let _props;

	                for (var _len = arguments.length, arg = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	                    arg[_key - 1] = arguments[_key];
	                }

	                (_props = this.props)[name].apply(_props, arg);
	            }
	        }
	    }, {
	        key: '_handleTouchStart',
	        value: function _handleTouchStart (evt) {
            evt.persist()
	            const _this2 = this;

	            if (!evt.touches) return;
	            this.now = Date.now();
	            this.x1 = evt.touches[0].pageX;
	            this.y1 = evt.touches[0].pageY;
	            this.delta = this.now - (this.last || this.now);
	            if (this.preTapPosition.x !== null) {
	                this.isDoubleTap = this.delta > 0 && this.delta <= 250 && Math.abs(this.preTapPosition.x - this.x1) < 30 && Math.abs(this.preTapPosition.y - this.y1) < 30;
	            }
	            this.preTapPosition.x = this.x1;
	            this.preTapPosition.y = this.y1;
	            this.last = this.now;
	            const preV = this.preV;


            const len = evt.touches.length;

	            if (len > 1) {
	                this._cancelLongTap();
	                this._cancelSingleTap();
	                const v = { x: evt.touches[1].pageX - this.x1, y: evt.touches[1].pageY - this.y1 };
	                preV.x = v.x;
	                preV.y = v.y;
	                this.pinchStartLen = this.getLen(preV);
	                this._emitEvent('onMultipointStart', evt);
	            }
	            this.longTapTimeout = setTimeout(() => {
	                _this2._emitEvent('onLongTap', evt);
	            }, 750);
	        }
	    }, {
	        key: '_handleTouchMove',
	        value: function _handleTouchMove (evt) {
	            const preV = this.preV;


            const len = evt.touches.length;


            const currentX = evt.touches[0].pageX;


            const currentY = evt.touches[0].pageY;
	            this.isDoubleTap = false;
	            if (len > 1) {
	                const v = { x: evt.touches[1].pageX - currentX, y: evt.touches[1].pageY - currentY };
	                if (preV.x !== null) {
	                    if (this.pinchStartLen > 0) {
	                        evt.scale = this.getLen(v) / this.pinchStartLen;
	                        this._emitEvent('onPinch', evt);
	                    }
	                    evt.angle = this.getRotateAngle(v, preV);
	                    this._emitEvent('onRotate', evt);
	                }
	                preV.x = v.x;
	                preV.y = v.y;
	                this.multiTouch = true;
	            } else {
	                if (this.x2 !== null) {
	                    evt.deltaX = currentX - this.x2;
	                    evt.deltaY = currentY - this.y2;
	                } else {
	                    evt.deltaX = 0;
	                    evt.deltaY = 0;
	                }
	                this._emitEvent('onPressMove', evt);
	            }
	            this._cancelLongTap();
	            this.x2 = currentX;
	            this.y2 = currentY;

	            if (len > 1) {
	                evt.preventDefault();
	            }
	        }
	    }, {
	        key: '_handleTouchCancel',
	        value: function _handleTouchCancel () {
	            clearInterval(this.singleTapTimeout);
	            clearInterval(this.tapTimeout);
	            clearInterval(this.longTapTimeout);
	            clearInterval(this.swipeTimeout);
	        }
	    }, {
	        key: '_handleTouchEnd',
	        value: function _handleTouchEnd (evt) {
            evt.persist()
	            const _this3 = this;

	            this.end = Date.now();
	            this._cancelLongTap();

	            if (evt.touches.length < 2) {
	                this._emitEvent('onMultipointEnd', evt);
	            }

	            evt.origin = [this.x1, this.y1];
	            if (this.multiTouch === false) {
	                if (this.x2 && Math.abs(this.x1 - this.x2) > 30 || this.y2 && Math.abs(this.preV.y - this.y2) > 30) {
	                    evt.direction = this._swipeDirection(this.x1, this.x2, this.y1, this.y2);
	                    evt.distance = Math.abs(this.x1 - this.x2);
	                    this.swipeTimeout = setTimeout(() => {
	                        _this3._emitEvent('onSwipe', evt);
	                    }, 0);
	                } else {
	                    this.tapTimeout = setTimeout(() => {
	                        _this3._emitEvent('onTap', evt);
	                        if (_this3.isDoubleTap) {
	                            _this3._emitEvent('onDoubleTap', evt);
	                            clearTimeout(_this3.singleTapTimeout);
	                            _this3.isDoubleTap = false;
	                        } else {
	                            _this3.singleTapTimeout = setTimeout(() => {
	                                _this3._emitEvent('onSingleTap', evt);
	                            }, 250);
	                        }
	                    }, 0);
	                }
	            }

	            this.preV.x = 0;
	            this.preV.y = 0;
	            this.scale = 1;
	            this.pinchStartLen = null;
	            this.x1 = this.x2 = this.y1 = this.y2 = null;
	            this.multiTouch = false;
	        }
	    }, {
	        key: '_cancelLongTap',
	        value: function _cancelLongTap () {
	            clearTimeout(this.longTapTimeout);
	        }
	    }, {
	        key: '_cancelSingleTap',
	        value: function _cancelSingleTap () {
	            clearTimeout(this.singleTapTimeout);
	        }
	    }, {
	        key: '_swipeDirection',
	        value: function _swipeDirection (x1, x2, y1, y2) {
	            if (Math.abs(x1 - x2) > 80 || this.end - this.now < 250) {
	                return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? x1 - x2 > 0 ? 'Left' : 'Right' : y1 - y2 > 0 ? 'Up' : 'Down';
	            }
	                return 'Nochange';

	        }
	    }, {
	        key: 'render',
	        value: function render () {
	            return _react2.default.cloneElement(_react2.default.Children.only(this.props.children), {
	                onTouchStart: this._handleTouchStart.bind(this),
	                onTouchMove: this._handleTouchMove.bind(this),
	                onTouchCancel: this._handleTouchCancel.bind(this),
	                onTouchEnd: this._handleTouchEnd.bind(this)
	            });
	        }
	    }]);

	    return AlloyFinger;
      }(_react.Component);

      exports.default = AlloyFinger;

      /** */ },
    /* 3 */
    /** */ function (module, exports) {



      /* transformjs
	 * By dntzhang
	 */

      const Matrix3D = function Matrix3D (n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
	    this.elements = window.Float32Array ? new Float32Array(16) : [];
	    const te = this.elements;
	    te[0] = n11 !== undefined ? n11 : 1;te[4] = n12 || 0;te[8] = n13 || 0;te[12] = n14 || 0;
	    te[1] = n21 || 0;te[5] = n22 !== undefined ? n22 : 1;te[9] = n23 || 0;te[13] = n24 || 0;
	    te[2] = n31 || 0;te[6] = n32 || 0;te[10] = n33 !== undefined ? n33 : 1;te[14] = n34 || 0;
	    te[3] = n41 || 0;te[7] = n42 || 0;te[11] = n43 || 0;te[15] = n44 !== undefined ? n44 : 1;
      };

      Matrix3D.DEG_TO_RAD = Math.PI / 180;

      Matrix3D.prototype = {
	    set: function set (n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
	        const te = this.elements;
	        te[0] = n11;te[4] = n12;te[8] = n13;te[12] = n14;
	        te[1] = n21;te[5] = n22;te[9] = n23;te[13] = n24;
	        te[2] = n31;te[6] = n32;te[10] = n33;te[14] = n34;
	        te[3] = n41;te[7] = n42;te[11] = n43;te[15] = n44;
	        return this;
	    },
	    identity: function identity () {
	        this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
	        return this;
	    },
	    multiplyMatrices: function multiplyMatrices (a, be) {

	        const ae = a.elements;
	        const te = this.elements;
	        const a11 = ae[0];


          const a12 = ae[4];


          const a13 = ae[8];


          const a14 = ae[12];
	        const a21 = ae[1];


          const a22 = ae[5];


          const a23 = ae[9];


          const a24 = ae[13];
	        const a31 = ae[2];


          const a32 = ae[6];


          const a33 = ae[10];


          const a34 = ae[14];
	        const a41 = ae[3];


          const a42 = ae[7];


          const a43 = ae[11];


          const a44 = ae[15];

	        const b11 = be[0];


          const b12 = be[1];


          const b13 = be[2];


          const b14 = be[3];
	        const b21 = be[4];


          const b22 = be[5];


          const b23 = be[6];


          const b24 = be[7];
	        const b31 = be[8];


          const b32 = be[9];


          const b33 = be[10];


          const b34 = be[11];
	        const b41 = be[12];


          const b42 = be[13];


          const b43 = be[14];


          const b44 = be[15];

	        te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
	        te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
	        te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
	        te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

	        te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
	        te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
	        te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
	        te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

	        te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
	        te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
	        te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
	        te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

	        te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
	        te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
	        te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
	        te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

	        return this;
	    },
	    // ???????????????90??????????????????Math.cos??????????????????????????????0??????????????????
	    _rounded: function _rounded (value, i) {
	        i = Math.pow(10, i || 15);
	        // default
	        return Math.round(value * i) / i;
	    },
	    appendTransform: function appendTransform (x, y, z, scaleX, scaleY, scaleZ, rotateX, rotateY, rotateZ, skewX, skewY, originX, originY, originZ) {

	        const rx = rotateX * Matrix3D.DEG_TO_RAD;
	        const cosx = this._rounded(Math.cos(rx));
	        const sinx = this._rounded(Math.sin(rx));
	        const ry = rotateY * Matrix3D.DEG_TO_RAD;
	        const cosy = this._rounded(Math.cos(ry));
	        const siny = this._rounded(Math.sin(ry));
	        const rz = rotateZ * Matrix3D.DEG_TO_RAD;
	        const cosz = this._rounded(Math.cos(rz * -1));
	        const sinz = this._rounded(Math.sin(rz * -1));

	        this.multiplyMatrices(this, [1, 0, 0, x, 0, cosx, sinx, y, 0, -sinx, cosx, z, 0, 0, 0, 1]);

	        this.multiplyMatrices(this, [cosy, 0, siny, 0, 0, 1, 0, 0, -siny, 0, cosy, 0, 0, 0, 0, 1]);

	        this.multiplyMatrices(this, [cosz * scaleX, sinz * scaleY, 0, 0, -sinz * scaleX, cosz * scaleY, 0, 0, 0, 0, 1 * scaleZ, 0, 0, 0, 0, 1]);

	        if (skewX || skewY) {
	            this.multiplyMatrices(this, [this._rounded(Math.cos(skewX * Matrix3D.DEG_TO_RAD)), this._rounded(Math.sin(skewX * Matrix3D.DEG_TO_RAD)), 0, 0, -1 * this._rounded(Math.sin(skewY * Matrix3D.DEG_TO_RAD)), this._rounded(Math.cos(skewY * Matrix3D.DEG_TO_RAD)), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
	        }

	        if (originX || originY || originZ) {
	            this.elements[12] -= originX * this.elements[0] + originY * this.elements[4] + originZ * this.elements[8];
	            this.elements[13] -= originX * this.elements[1] + originY * this.elements[5] + originZ * this.elements[9];
	            this.elements[14] -= originX * this.elements[2] + originY * this.elements[6] + originZ * this.elements[10];
	        }
	        return this;
	    }
      };

      function observe (target, props, callback) {
	    for (let i = 0, len = props.length; i < len; i++) {
	        const prop = props[i];
	        watch(target, prop, callback);
	    }
      }

      function watch (target, prop, callback) {
	    Object.defineProperty(target, prop, {
	        get: function get () {
	            return this[`__${ prop}`];
	        },
	        set: function set (value) {
	            if (value !== this[`__${ prop}`]) {
	                this[`__${ prop}`] = value;
	                callback();
	            }
	        }
	    });
      }

      const Transform = function Transform (element) {

	    observe(element, ["translateX", "translateY", "translateZ", "scaleX", "scaleY", "scaleZ", "rotateX", "rotateY", "rotateZ", "skewX", "skewY", "originX", "originY", "originZ"], () => {
	        const mtx = element.matrix3D.identity().appendTransform(element.translateX, element.translateY, element.translateZ, element.scaleX, element.scaleY, element.scaleZ, element.rotateX, element.rotateY, element.rotateZ, element.skewX, element.skewY, element.originX, element.originY, element.originZ);
	        element.style.transform = element.style.msTransform = element.style.OTransform = element.style.MozTransform = element.style.webkitTransform = `perspective(${ element.perspective }px) matrix3d(${ Array.prototype.slice.call(mtx.elements).join(",") })`;
	    });

	    observe(element, ["perspective"], () => {
	        element.style.transform = element.style.msTransform = element.style.OTransform = element.style.MozTransform = element.style.webkitTransform = `perspective(${ element.perspective }px) matrix3d(${ Array.prototype.slice.call(element.matrix3D.elements).join(",") })`;
	    });

	    element.matrix3D = new Matrix3D();
	    element.perspective = 500;
	    element.scaleX = element.scaleY = element.scaleZ = 1;
	    // ??????image?????????x\y\z???????????????translate??????
	    element.translateX = element.translateY = element.translateZ = element.rotateX = element.rotateY = element.rotateZ = element.skewX = element.skewY = element.originX = element.originY = element.originZ = 0;
      };

      module.exports = Transform;

      /** */ },
    /* 4 */
    /** */ function (module, exports, __webpack_require__) {



      Object.defineProperty(exports, "__esModule", {
	    value: true
      });
      exports.CenterImage = undefined;

      const _extends = Object.assign || function (target) { for (let i = 1; i < arguments.length; i++) { const source = arguments[i]; for (const key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

      const _createClass = function () { function defineProperties (target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

      const _react = __webpack_require__(1);

      const _react2 = _interopRequireDefault(_react);

      function _interopRequireDefault (obj) { return obj && obj.__esModule ? obj : { default: obj }; }

      function _objectWithoutProperties (obj, keys) { const target = {}; for (const i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

      function _classCallCheck (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

      function _possibleConstructorReturn (self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

      function _inherits (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${ typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

      const PRELOADNUM = 3;

      const CenterImage = exports.CenterImage = function (_Component) {
	    _inherits(CenterImage, _Component);

	    function CenterImage () {
	        let _ref;

	        let _temp; let _this; let _ret;

	        _classCallCheck(this, CenterImage);

	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments[_key];
	        }

	        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = CenterImage.__proto__ || Object.getPrototypeOf(CenterImage)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
	            loading: true,
	            error: false,
	            loaded: false
	        }, _temp), _possibleConstructorReturn(_this, _ret);
	    }

	    _createClass(CenterImage, [{
	        key: "render",
	        value: function render () {
	            const _state = this.state;


            const loading = _state.loading;


            const error = _state.error;


            const _props = this.props;


            const index = _props.index;


            const current = _props.current;


            const lazysrc = _props.lazysrc;


            const childProps = _objectWithoutProperties(_props, ["index", "current", "lazysrc"]);


            const img = _react2.default.createElement("img", _extends({ onLoad: this.onImgLoad.bind(this), src: lazysrc }, childProps));

	            // init first image, others have been preloaded


	            if (index === current) {
	                return img;
	            }
	            if (loading) {
	                return _react2.default.createElement(Loading, null);
	            }
	            if (error) {
	                return _react2.default.createElement(Error, null);
	            }

	            return img;
	        }
	    }, {
	        key: "componentWillMount",
	        value: function componentWillMount () {
	            this.loadImg();
	        }
	    }, {
	        key: "componentWillReceiveProps",
	        value: function componentWillReceiveProps (nextProps) {
	            !this.state.loaded && this.loadImg();
	        }
	    }, {
	        key: "loadImg",
	        value: function loadImg () {
	            const _this2 = this;

	            const _props2 = this.props;


            const index = _props2.index;


            const current = _props2.current;


            const lazysrc = _props2.lazysrc;


	            if (lazysrc && index <= current + PRELOADNUM && index >= current - PRELOADNUM) {
	                const img = new Image();

	                img.src = lazysrc;
	                img.onload = function () {
	                    _this2.setState({
	                        loading: false
	                    });
	                };
	                img.onerror = function () {
	                    _this2.setState({
	                        loading: false,
	                        error: true
	                    });
	                };
	            }
	        }
	    }, {
	        key: "onImgLoad",
	        value: function onImgLoad (e) {

	            this.setState({ loaded: true });

	            const target = e.target;


            const h = target.naturalHeight;


            const w = target.naturalWidth;


            const r = h / w;


            const height = window.innerHeight || window.screen.availHeight;


            const width = window.innerWidth || window.screen.availWidth;


            const rate = height / width;

	            const imgStyle = {};

	            if (r > rate) {
	                imgStyle.height = `${height }px`;
	                imgStyle.width = `${w * height / h }px`;
	                imgStyle.left = `${width / 2 - w * height / h / 2 }px`;
	            } else if (r < rate) {
	                imgStyle.width = `${width }px`;
	                imgStyle.height = `${h * width / w }px`;
	                imgStyle.top = `${height / 2 - h * width / w / 2 }px`;
	            } else {
	                imgStyle.width = width;
	                imgStyle.height = height;
	            }

	            target.setAttribute('style', `width:${ imgStyle.width }; height:${ imgStyle.height }; left:${ imgStyle.left }; top:${ imgStyle.top };`);
	            target.setAttribute('rate', 1 / r);
	        }
	    }]);

	    return CenterImage;
      }(_react.Component);

      var Loading = function Loading () {
	    return _react2.default.createElement(
	        "div",
	        { className: "spinner" },
	        _react2.default.createElement("div", { className: "double-bounce1" }),
	        _react2.default.createElement("div", { className: "double-bounce2" })
	    );
      };

      var Error = function Error () {
	    return _react2.default.createElement(
	        "div",
	        { className: "errorpage" },
	        "\u52A0\u8F7D\u5931\u8D25"
	    );
      };

      /** */ },
    /* 5 */
    /** */ function (module, exports) {

      module.exports = require("react-singleton");

      /** */ },
    /* 6 */
    /** */ function (module, exports) {

      // removed by extract-text-webpack-plugin

      /** */ }
    /** *** */ ]);
