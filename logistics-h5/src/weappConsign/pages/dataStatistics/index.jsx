import React from 'react';
import { Calendar, Toast, Button, ActionSheet } from 'antd-mobile';
import moment from 'moment';
import { DatePicker } from 'antd';
import CSSModules from 'react-css-modules';
import zhCN from 'antd-mobile/lib/calendar/locale/zh_CN';
import router from 'umi/router';
import { getProjectBoard, getProjectBoardAttention } from '@/services/apiService';
import { getAuthority } from '@/utils/authority';
import auth from '@/constants/authCodes';
import iconArrowDown from '@/assets/consign/arrowDown.png';
import iconArrowUp from '@/assets/consign/arrowUp.png';

import iconSort1 from '@/assets/consign/sort_1.png';
import iconSort2 from '@/assets/consign/sort_2.png';
import iconSort3 from '@/assets/consign/sort_3.png';
import iconHelp from '@/assets/consign/help.png';
import iconClick from '@/assets/consign/hand.png';

import followEmpty from '@/assets/consign/follow_empty.png';
import styles from './index.less';

@CSSModules(styles, { allowMultiple: true })
export default class Index extends React.Component {
  state = {
    ready: false,
    show: false,
    pickStartTime: undefined,
    pickEndTime: undefined,
    selectedKey: 1,
    sortInfo: {
      type: 0,
      plannedStatus: 1,
      onTheWayStatus: 1,
      finishStatus: 1,
    },
    scrollTop: 0,
    beginDate: undefined,
    endDate: undefined,
    selectType: 2, // 查询类型(1.所有项目,2.我关注的项目)
    showAllPro: false,
    data: {
      'planNum': null,               // 计划量
      'goingNum': null,              // 在途量
      'handOverNum': null,           // 交付量
      'dayGrowthRate': null,         // 日均交付增长率
      'goingTransport': null,        // 在途运单
      'completeTransport': null,     // 完成运单
    },
    'projectBoardDetailResps': [], // 项目看板明细列表
  };

  cycleData = [
    {
      key: 1,
      text: '今日',
      createDateStart: moment(new Date()).startOf('day').format('YYYY/MM/DD'),
      creatDateEnd: moment(new Date()).endOf('day').format('YYYY/MM/DD'),
    }, {
      key: 2,
      text: '昨天',
      createDateStart: moment(new Date()).subtract(1, 'days').startOf('day').format('YYYY/MM/DD'),
      creatDateEnd: moment(new Date()).subtract(1, 'day').endOf('day').format('YYYY/MM/DD'),
    }, {
      key: 3,
      text: '当周',
      createDateStart: moment(new Date()).startOf('week').format('YYYY/MM/DD'),
      creatDateEnd: moment(new Date()).endOf('day').format('YYYY/MM/DD'),
    },
  ];


  constructor(props) {
    super(props);
  }


  searchButton = () => {
    const { selectedKey, pickStartTime, pickEndTime } = this.state;
    return (
      <div styleName='search_ul_box'>
        <ul styleName='search_ul'>
          {this.cycleData.map(item => (
            <li
              key={item.key}
              starttime={item.createDateStart}
              endtime={item.creatDateEnd}
              dateindex={item.key}
              onClick={this.searchReportForms}
              styleName={selectedKey === item.key ? 'search_li active' : 'search_li'}
            >{item.text}
            </li>
          ))}
          <li>
            <DatePicker.RangePicker
              initalMonths={6}
              style={{ width: '210px' }}
              value={[pickStartTime, pickEndTime]}
              onOpenChange={this.showCalendar}
              open={false}
            />
          </li>
        </ul>
      </div>
    );
  };

  dataTypeChoose = (e) => {
    const type = Number(e.currentTarget.getAttribute('type'));
    const { beginDate, endDate } = this.state;
    this.setState({
      selectType: type,
    }, () => {
      this.getFreshData(beginDate, endDate);
    });
  };


  message = () => (
    <div className='as_message'>
      <p><span>计划量：</span>发布日期在所选日期之内的有效预约单的计划数量汇总（指定项目的按项目汇总）；</p>
      <p><span>交付量：</span>签收日期或完成日期在所选日期之内的有效运单的签收或提货数量汇总（指定项目的按项目汇总）； </p>
      <p><span>在途量：</span>当前运单状态为‘提货待审核’、‘运输中’、“已到站”的运单的计划量汇总（指定项目按项目读取，该统计量不随着日期选择变化而改变）</p>
      <p><span>日均交付增长率：</span>[（近3日交付量÷3）-（近7日交付量÷7）]÷（近7日交付量÷7）×100%</p>
      <p><span>所有项目：</span>统计我司目前所有在运行的项目情况</p>
      <p><span>我关注的项目：</span>对已关注的项目进行汇总统计</p>
      <p>注：点击具体项目进入该项目数据统计页面</p>
    </div>
  );

  onOpenHelpTips = () => {
    ActionSheet.showActionSheetWithOptions({
      options: ['关闭'],
      className: 'help_as',
      cancelButtonIndex: 0,
      title: '指标说明',
      message: this.message(),
      maskClosable: true,
      'data-seed': 'logId',
      wrapProps: {
        onTouchStart: e => e.preventDefault(),
      },
    });
  };

  /* 数据统计展示 */
  dataStatisticsComp = () => {
    const { selectType, showAllPro, data: { planNum, goingNum, handOverNum, dayGrowthRate, goingTransport, completeTransport } } = this.state;

    return (
      <>
        <div styleName='data_statistics'>
          <div styleName='help'>
            <img src={iconHelp} alt="" onClick={this.onOpenHelpTips}/>
          </div>
          <div styleName='data_type'>
            {
              showAllPro &&
              <div>
                <span styleName={selectType === 1 ? 'active' : ''} type={1} onClick={this.dataTypeChoose}>所有项目</span>
                <span styleName={selectType === 2 ? 'active' : ''} type={2} onClick={this.dataTypeChoose}>我关注的项目</span>
              </div>
            }
          </div>
          <div styleName='flex_row num_box'>
            <div styleName='flex_col col-8 '>
              <p styleName='title'>计划量</p>
              <p styleName='text'>{planNum}</p>
            </div>
            <div styleName='flex_col col-8 '>
              <p styleName='title'>在途量</p>
              <p styleName='text'>{goingNum}</p>
            </div>
            <div styleName='flex_col col-8 '>
              <p styleName='title'>交付量</p>
              <p styleName='text'>{handOverNum}</p>
            </div>
          </div>

          <div styleName='flex_row mr_top15 rang_box'>

            <div styleName='flex_col col-7 col_align_center ' onClick={this.waybillSearchFinish}>
              <div styleName='rang_width_60 rang border_color_green'>
                <div styleName='rang_nav link_text'>
                  <span styleName='rang_text '>{completeTransport}</span>
                  <img src={iconClick} alt=""/>
                </div>
              </div>
              <p>完成运单</p>
            </div>

            <div styleName='flex_col col-7 col_align_center ' onClick={this.waybillSearchOnTheWay}>
              <div styleName='rang_width_60 rang border_color_yellow'>
                <div styleName='rang_nav link_text'>
                  <span styleName='rang_text '>{goingTransport}</span>
                  <img src={iconClick} alt=""/>
                </div>
              </div>
              <p>在途运单</p>
            </div>

            <div styleName='flex_col col-10 col_align_center'>
              <div styleName='rang_width_80 rang border_color_gray'>
                <div styleName='rang_nav'>
                  <img
                    styleName='img_trans180'
                    src={dayGrowthRate >= 0 ? iconArrowDown : iconArrowUp}
                    alt="图标"
                  />
                  <span styleName='rang_text'>{(Math.abs(dayGrowthRate) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
              <p>日均交付增长率</p>
            </div>
          </div>
        </div>
      </>
    );
  };


  // transportType：1 在途  2完成
  waybillSearchOnTheWay = () => {
    // ‘提货待审核’、‘运输中’、“已到站
    const transportImmediateStatus = '6,21,7';
    const { projectBoardDetailResps, selectType } = this.state;
    const projectIdList = [];
    if (selectType === 2) {
      projectBoardDetailResps.map(item => (
        projectIdList.push(item.projectId)
      ));
    }
    window.location.href = `/WeappConsign/main/staging?initialPage=1&transportPage=7&transportType=1&transportImmediateStatus=${transportImmediateStatus}&projectIdList=${projectIdList.join(',')}`;
  };

  waybillSearchFinish = () => {
    const { beginDate, endDate, projectBoardDetailResps, selectType } = this.state;
    const transportNotInImmediateStatus = '3';
    const projectIdList = [];
    if (selectType === 2) {
      projectBoardDetailResps.map(item => (
        projectIdList.push(item.projectId)
      ));
    }
    window.location.href = `/WeappConsign/main/staging?initialPage=1&transportPage=7&transportType=2&transportNotInImmediateStatus=${transportNotInImmediateStatus}&handOverStartTime=${beginDate}&handOverEndTime=${endDate}&projectIdList=${projectIdList.join(',')}`;
  };

  detail = (e) => {
    const projectId = e.currentTarget.getAttribute('project-id');
    const { beginDate, endDate } = this.state;
    router.push(`/WeappConsign/dataStatistics/detail?projectId=${projectId}&beginDate=${beginDate}&endDate=${endDate}`);
  };

  releaseAppointment = e => {
    const projectId = e.currentTarget.getAttribute('project-id');
    window.location.href = `/WeappConsign/main/release?projectId=${projectId}`;
  };

  /**
   * 排序 orderBy
   * @param e
   */
  sortBy = (e) => {
    const type = Number(e.currentTarget.getAttribute('type'));
    const { sortInfo: { plannedStatus, onTheWayStatus, finishStatus }, projectBoardDetailResps } = this.state;

    this.setState(
      {
        sortInfo: {
          type,
          plannedStatus: type === 1 ? (plannedStatus === 1 ? 2 : (plannedStatus === 2 ? 3 : 1)) : 1,
          onTheWayStatus: type === 2 ? (onTheWayStatus === 1 ? 2 : (onTheWayStatus === 2 ? 3 : 1)) : 1,
          finishStatus: type === 3 ? (finishStatus === 1 ? 2 : (finishStatus === 2 ? 3 : 1)) : 1,
        },
      },
    );

    switch (type) {
      case 1:
        projectBoardDetailResps.sort(this.compare('planNum', plannedStatus !== 1));
        break;
      case 2:
        projectBoardDetailResps.sort(this.compare('goingNum', onTheWayStatus !== 1));
        break;
      case 3:
        projectBoardDetailResps.sort(this.compare('handOverNum', finishStatus !== 1));
        break;
      default:
        console.log('not type');
    }

  };

  // key:  用于排序的数组的key值
  // desc： 布尔值，为true是升序排序，false是降序排序
  compare = (key, desc) =>
    (a, b) => {
      const value1 = a[key];
      const value2 = b[key];
      if (desc === true) {
        // 升序排列
        return value1 - value2;
      }
      // 降序排列
      return value2 - value1;
    };


  /**
   * 排序组件
   * @returns {*}
   */
  followProjectComp = () => {
    const { scrollTop, sortInfo: { plannedStatus, onTheWayStatus, finishStatus }, projectBoardDetailResps } = this.state;
    const pImgUrl = plannedStatus === 2 ? iconSort2 : (plannedStatus === 3 ? iconSort3 : iconSort1);
    const oImgUrl = onTheWayStatus === 2 ? iconSort2 : (onTheWayStatus === 3 ? iconSort3 : iconSort1);
    const fImgUrl = finishStatus === 2 ? iconSort2 : (finishStatus === 3 ? iconSort3 : iconSort1);

    const followProjectFixed = {
      width: '99vw',
      position: scrollTop >= 100 ? 'absolute' : '',
      top: '40px',
      left: 0,
      backgroundColor: '#f5f5f5',
      padding: '0 15px',
      zIndex: 999,
    };


    return (
      <>
        <div styleName='follow_project '>
          <div styleName='flex_row sort_btn' style={{ ...followProjectFixed }}>
            <div styleName='flex_col col-8 '>
              <p styleName='title'>排序</p>
            </div>
            <div styleName='flex_col col-5 '>
              <p styleName='sub_title' type={1} onClick={this.sortBy}>
                计划量
                <img src={pImgUrl} alt="图标"/>
              </p>
            </div>
            <div styleName='flex_col col-5 '>
              <p styleName='sub_title' type={2} onClick={this.sortBy}>在途量
                <img src={oImgUrl} alt="图标"/>
              </p>
            </div>
            <div styleName='flex_col col-5 '>
              <p styleName='sub_title' type={3} onClick={this.sortBy}>交付量
                <img src={fImgUrl} alt="图标"/>
              </p>
            </div>
          </div>
          {projectBoardDetailResps && projectBoardDetailResps.length <= 0 &&
          <div styleName='follow_card_no'>
            <img src={followEmpty} alt="图标"/>
            <p>暂无关注的项目，</p>
            <p>点击下方的关注按钮立即添加!</p>
          </div>
          }
          {projectBoardDetailResps && projectBoardDetailResps.length > 0 &&
          <div styleName='follow_card'>
            {projectBoardDetailResps.map(item => (
              <div styleName='follow_card_item' key={item.projectId}>
                <div styleName='flex_row item_title'>
                  <div styleName='flex_col col-12 '>
                    <p styleName='title'>{item.projectName}</p>
                  </div>
                  {
                    item.pushPreBooking === 1 &&
                    <div styleName='flex_col col-12 item_btn'>
                      <Button
                        styleName='push'
                        color='success'
                        size='small'
                        project-id={item.projectId}
                        onClick={this.releaseAppointment}
                      >发布预约
                      </Button>
                    </div>
                  }
                </div>

                <div styleName='flex_row item_body' project-id={item.projectId} onClick={this.detail}>
                  <div styleName='flex_col col-6 '>
                    <p styleName='title'>计划量</p>
                    <p styleName='num'>{item.planNum}</p>
                  </div>
                  <div styleName='flex_col col-6 '>
                    <p styleName='title'>在途量</p>
                    <p styleName='num'>{item.goingNum}</p>
                  </div>
                  <div styleName='flex_col col-6 '>
                    <p styleName='title'>交付量</p>
                    <p styleName='num'>{item.handOverNum}</p>
                  </div>
                  <div styleName='flex_col col-7 '>
                    <p styleName='title'>
                      <img
                        styleName='img_trans180'
                        src={item.dayGrowthRate >= 0 ? iconArrowDown : iconArrowUp}
                        alt="图标"
                      />
                      <span>{(Math.abs(item.dayGrowthRate) * 100).toFixed(2)}</span>%
                    </p>
                    <p styleName='db'>日均交付增长率</p>
                  </div>
                </div>


              </div>
            ))}
          </div>
          }
          {projectBoardDetailResps && projectBoardDetailResps.length > 0 &&
          <div styleName='no_more_data'>没有更多数据</div>
          }
        </div>
      </>
    );
  };


  searchReportForms = e => {
    const selectedKey = Number(e.currentTarget.getAttribute('dateindex'));
    this.setState({
      selectedKey,
      pickStartTime: undefined,
      pickEndTime: undefined,
    });
    const createDateStart = e.currentTarget.getAttribute('starttime');
    const createDateEnd = e.currentTarget.getAttribute('endtime');
    this.getFreshData(createDateStart, createDateEnd);
  };

  checkData = (start, end) => {
    const pickStartTime = moment(start).startOf('day');
    const pickEndTime = moment(end).endOf('day');
    pickStartTime.format('YYYY/MM/DD');
    this.dateIndex = 6;
    this.setState({
      selectedKey: undefined,
      pickStartTime,
      pickEndTime,
      show: false,
    });
    this.getFreshData(pickStartTime.format('YYYY/MM/DD'), pickEndTime.format('YYYY/MM/DD'));
  };

  /* 刷新 */
  getFreshData = (beginDate = moment(new Date()).startOf('day').format('YYYY/MM/DD'), endDate = moment(new Date()).endOf('day').format('YYYY/MM/DD')) => {
    Toast.loading('数据加载中...', 0);

    this.setState({
      beginDate, endDate,
    });

    const { selectType } = this.state;
    getProjectBoard(
      {
        createDateStart: `${beginDate} 00:00:00`,
        createDateEnd: `${endDate} 23:59:59`,
        selectType,
      }).then(res => {
      this.setState({
        data: res,
        sortInfo: {
          type: 0,
          plannedStatus: 1,
          onTheWayStatus: 1,
          finishStatus: 1,
        },
      });
    }).then(() => {
      this.getProjectBoardAttention(beginDate, endDate);
    }).then(() => {
      const dataStatisticsInfo = {
        beginDate,
        endDate,
        selectedKey: this.state.selectedKey,
        selectType,
      };
      localStorage.setItem('dataStatisticsInfo', JSON.stringify(dataStatisticsInfo));

    });


    // this.toastHide()
  };

  getProjectBoardAttention = (beginDate, endDate) => {
    getProjectBoardAttention({
      createDateStart: `${beginDate} 00:00:00`,
      createDateEnd: `${endDate} 23:59:59`,
    }).then(res => {
      this.setState({
        projectBoardDetailResps: res.projectBoardDetailResps ? res.projectBoardDetailResps : [],
        ready: true,
      }, () => {
        this.toastHide();
      });
    });
  };


  toastHide = () => {
    setTimeout(() => {
      Toast.hide();
    }, 300);
  };

  showCalendar = () => {
    this.setState({
      show: true,
    });
  };

  cancelCalendar = () => {
    this.setState({
      show: false,
    });
  };

  componentDidMount() {
    /* 权限判断 */
    const { WECHAT_CONSIGNMENT_ACCOUNT_ALL_PRO } = auth;
    const ownedPermissions = getAuthority();
    const spacialAuthes = [WECHAT_CONSIGNMENT_ACCOUNT_ALL_PRO];  // 能够查看全部项目预约单运单的权限
    const check = spacialAuthes.some(auth => ownedPermissions.indexOf(auth) > -1);

    this.setState({
      selectType: check ? 1 : 2,
      showAllPro: !!check,
    }, () => {
      this.initPage();
    });
  }

  initPage = () => {
    const dataStatisticsInfo = localStorage.getItem('dataStatisticsInfo');
    if (dataStatisticsInfo !== undefined && dataStatisticsInfo !== null) {
      const dataStatisticsInfoJson = JSON.parse(dataStatisticsInfo);
      const { selectedKey, selectType, beginDate, endDate } = dataStatisticsInfoJson;

      this.setState({
        selectedKey,
        selectType,
        pickStartTime: (selectedKey >= 4 && beginDate) || (!selectedKey && beginDate) ? moment(beginDate, 'YYYY-MM-DD') : null,
        pickEndTime: (selectedKey >= 4 && endDate) || (!selectedKey && endDate) ? moment(endDate, 'YYYY-MM-DD') : null,
      }, () => {
        this.getFreshData(beginDate, endDate);
      });
    } else {
      this.getFreshData();
    }

    this.setState({
      ready: true,
    }, () => {
      window.addEventListener('scroll', this.handleScroll, true);
    });
  };


  handleScroll = (event) => {
    // 滚动的高度
    const scrollTop = event.srcElement ? event.srcElement.scrollTop : 0;
    this.setState({
      scrollTop: scrollTop <= 0 ? 0 : scrollTop,
    });

  };


  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll, true);
  }

  routerToFollowProjectPage = () => {
    router.push('/WeappConsign/followProject');
  };

  render() {
    const { ready, show } = this.state;
    const now = new Date();
    const height = document.documentElement.clientHeight - 80;
    const dataNavStyle = {
      width: '100vw',
      padding: '40px 15px 0 15px',
      overflowY: 'auto',
      height: `${height}px`,
    };

    return (
      ready
      &&
      <>
        <div styleName='data_container'>
          <div styleName='mr_top15'>
            {this.searchButton()}
          </div>
          <div style={{ ...dataNavStyle }}>
            {this.dataStatisticsComp()}
            {this.followProjectComp()}
          </div>
          <div styleName='follow_btn_panel'>
            <Button block color='primary' size='middle' styleName='follow_btn' onClick={this.routerToFollowProjectPage}>
              添加/取消关注的项目
            </Button>
          </div>
        </div>
        <Calendar
          locale={zhCN}
          onCancel={this.cancelCalendar}
          onConfirm={this.checkData}
          showShortcut
          visible={show}
          initalMonths={12}
          minDate={new Date(+now - 86400000 * 30 * 7)}
          maxDate={new Date(now)}
        />

      </>
    );
  }
}
