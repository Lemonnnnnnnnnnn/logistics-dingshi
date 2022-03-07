import CSSModules from 'react-css-modules';
import React, { useEffect } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import { ActionSheet, Button, Calendar, Toast } from 'antd-mobile';
import zhCN from 'antd-mobile/lib/calendar/locale/zh_CN';
import { Axis, Chart, Geom, Legend, Tooltip } from 'bizgoblin';
import iconArrowDown from '@/assets/consign/arrowDown.png';
import styles from './details.less';
import { getProjectBoardRecent, getProjectBoardSingle } from '@/services/apiService';
import iconArrowUp from '@/assets/consign/arrowUp.png';
import iconHelp from '@/assets/consign/help.png';
import iconClick from '@/assets/consign/hand.png';

@CSSModules(styles, { allowMultiple: true })
export default class Details extends React.Component {
  state = {
    ready: false,
    show: false,
    pickStartTime: undefined,
    pickEndTime: undefined,
    selectedKey: 1,
    beginDate: undefined,
    endDate: undefined,
    data: {
      'planNum': 0,       // 计划量
      'goingNum': 0,      // 在途量
      'handOverNum': 0,   // 交付量
      'dayGrowthRate': 0, // 日均交付增长率
      'goingTransport': 0,        // 在途运单
      'completeTransport': 0,     // 完成运单
      'boardDayDataResps': [],
    },
    'dataChar14Days': [],
    'recent14Days': [],
    'recent6Month': [],
    'dataChar6Month': [],
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


  componentDidMount () {
    const { location: { query: { beginDate, endDate } } } = this.props;
    this.setState({
      pickStartTime: beginDate ? moment(beginDate, 'YYYY-MM-DD') : null,
      pickEndTime: endDate ? moment(endDate, 'YYYY-MM-DD') : null,
      selectedKey: 4,
    });
    this.getFreshData(beginDate, endDate);
  }


  searchButton = () => {
    const { selectedKey, pickStartTime, pickEndTime } = this.state;
    return (
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
            style={{ width: '210px' }}
            value={[pickStartTime, pickEndTime]}
            onOpenChange={this.showCalendar}
            open={false}
          />
        </li>
      </ul>
    );
  };

  message=()=>(
    <div className='as_message'>
      <p><span>计划量：</span>发布日期在所选日期之内的有效预约单的计划数量汇总（指定项目的按项目汇总）；</p>
      <p><span>交付量：</span>签收日期或完成日期在所选日期之内的有效运单的签收或提货数量汇总（指定项目的按项目汇总）； </p>
      <p><span>在途量：</span>当前运单状态为‘提货待审核’、‘运输中’、“已到站”的运单的计划量汇总（指定项目按项目读取，该统计量不随着日期选择变化而改变）</p>
      <p><span>日均交付增长率：</span>[（近3日交付量÷3）-（近7日交付量÷7）]÷（近7日交付量÷7）×100%</p>
    </div>
  )

  onOpenHelpTips = () => {
    ActionSheet.showActionSheetWithOptions({
      options:['关闭'],
      className:'help_as',
      cancelButtonIndex: 0,
      title: '指标说明',
      message: this.message(),
      maskClosable: true,
      'data-seed': 'logId',
      wrapProps :{
        onTouchStart: e => e.preventDefault(),
      }
    });
  }

  /* 数据统计展示 */
  dataStatisticsComp = () => {
    const { data: { planNum, goingNum, handOverNum, dayGrowthRate, goingTransport, completeTransport } } = this.state;
    return (
      <div styleName='data_statistics'>
        <div styleName='help'>
          <img src={iconHelp} alt="" onClick={this.onOpenHelpTips} />
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
                <span styleName='rang_text'>{completeTransport}</span>
                <img src={iconClick} alt="" />
              </div>
            </div>
            <p>完成运单</p>
          </div>

          <div styleName='flex_col col-7 col_align_center ' onClick={this.waybillSearchOnTheWay}>
            <div styleName='rang_width_60 rang border_color_yellow'>
              <div styleName='rang_nav link_text'>
                <span styleName='rang_text'>{goingTransport}</span>
                <img src={iconClick} alt="" />
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
                <span styleName='rang_text'>{(Math.abs(dayGrowthRate) * 100).toFixed(2)}%</span>
              </div>
            </div>
            <p>日均交付增长率</p>
          </div>
        </div>

      </div>
    );
  };

  // transportType：1 在途  2完成

  waybillSearchOnTheWay = () => {
    const { data: { projectId, projectName } } = this.state;
    const transportImmediateStatus = '6,21,7';
    window.location.href = `/WeappConsign/main/staging?initialPage=1&transportPage=7&transportType=1&projectId=${projectId}&projectName=${projectName}&transportImmediateStatus=${transportImmediateStatus}`;
  };

  waybillSearchFinish = () => {
    const { data: { projectId, projectName }, beginDate, endDate } = this.state;
    window.location.href = `/WeappConsign/main/staging?initialPage=1&transportPage=7&transportType=2&projectId=${projectId}&projectName=${projectName}&transportNotInImmediateStatus=3&handOverStartTime=${beginDate}&handOverEndTime=${endDate}`;
  };

  waybillSearch = (e) => {
    const { data: { projectId, projectName } } = this.state;
    const dayType = Number(e.currentTarget.getAttribute('daytype'));
    const beginDate = moment(new Date()).subtract(dayType === 1 ? 14 : 6, (dayType === 1 ? 'days' : 'months')).startOf((dayType === 1 ? 'days' : 'months')).format('YYYY/MM/DD');
    const endDate = moment(new Date()).subtract(dayType === 1 ? 1 : 1, (dayType === 1 ? 'days' : 'months')).endOf((dayType === 1 ? 'days' : 'months')).format('YYYY/MM/DD');
    const transportNotInImmediateStatus = '1,13,3';
    window.location.href = `/WeappConsign/main/staging?initialPage=1&transportPage=7&transportType=2&projectId=${projectId}&projectName=${projectName}&dayType=${dayType}&transportNotInImmediateStatus=${transportNotInImmediateStatus}&startDistributTime=${beginDate}&endDistributTime=${endDate}`;
  };


  marker = (x, y, r, ctx) => {
    ctx.lineWidth = 1;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.moveTo(x - r - 3, y);
    ctx.lineTo(x + r + 3, y);
    ctx.stroke();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.fill();
  };

  lineChartComp = (dayType, recentData) => {
    const { dataChar14Days, dataChar6Month } = this.state;
    return (
      <>
        <div styleName='card'>
          <p styleName='title'>近{dayType === 1 ? '14天' : '6个月'}</p>
          <div styleName='num' daytype={dayType} onClick={this.waybillSearch}>
            <div styleName='rang_width_60 rang border_color_green'>
              <div styleName='rang_nav link_text'>
                <span styleName='rang_text'>{recentData.transportNum}</span>
                <img src={iconClick} alt="" />
              </div>
            </div>
            <p>总运单数:</p>
          </div>
          <div styleName='chart'>
            <Chart
              width="100%"
              padding={[ 60, 10, 25, 50]}
              data={dayType === 1 ? dataChar14Days : dataChar6Month}
              pixelRatio={window.devicePixelRatio * 2}
            >
              <Axis dataKey="monthDate" />
              <Axis dataKey="planNum" />
              <Tooltip showCrosshairs />
              <Legend marker={this.marker} position="top" itemWidth="100" />
              <Geom geom="line" position="monthDate*num" shape="smooth" color={['name', ['#3493ff', '#ffb917', '#949494']]} />
              <Geom
                geom="point"
                position="monthDate*num"
                color={['name', ['#3493ff', '#ffb917', '#949494']]}
                style={{ lineWidth: 1, stroke: '#FFF' }}
              />
            </Chart>
          </div>
          <div styleName='data_num flex_row'>
            <div styleName='flex_col col-12 col_align_center'>
              <p styleName='title'>计划量</p>
              <p styleName='num_text'>{recentData.planNum}</p>
              <p styleName='title'>日均计划</p>
              <p styleName='num_text'>{recentData.dayPlanNum}</p>
              <p styleName='title'>计划峰值</p>
              <p styleName='num_text'>{recentData.planNumMax}</p>
              <p styleName='title'>计划最少</p>
              <p styleName='num_text'>{recentData.planNumMin}</p>
            </div>
            <div styleName='flex_col col-12 col_align_center'>
              <p styleName='title'>交付量</p>
              <p styleName='num_text'>{recentData.handOverNum}</p>
              <p styleName='title'>日均交付</p>
              <p styleName='num_text'>{recentData.dayHandOverNum}</p>
              <p styleName='title'>交付峰值</p>
              <p styleName='num_text'>{recentData.handOverNumMax}</p>
              <p styleName='title'>交付最少</p>
              <p styleName='num_text'>{recentData.handOverNumMin}</p>
            </div>
          </div>
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
    const { location: { query: { projectId } } } = this.props;

    this.setState({
      beginDate, endDate,
    });

    getProjectBoardSingle({
      createDateStart: `${beginDate} 00:00:00`,
      createDateEnd: `${endDate} 23:59:59`,
      projectId,
    }).then(res => {
      this.setState({
        data: res,
        ready: true,
      }, () => {
        this.toastHide();
      });
    });

    this.projectBoardRecent(1, projectId);
    this.projectBoardRecent(2, projectId);
  };


  projectBoardRecent = (dayType, projectId) => {
    getProjectBoardRecent({ dayType, projectId }).then(res => {
      const dataChar14Days = [];
      const dataChar6Month = [];
      if (res.dayType === 1) {
        res.diagramDataRespList.forEach(_item => {
          dataChar14Days.push({
            monthDate: _item.monthDate.substring(5, _item.monthDate.length),
            name: '计划量',
            num: _item.planNum, // 99999
          });

          dataChar14Days.push({
            monthDate: _item.monthDate.substring(5, _item.monthDate.length),
            name: '交付量',
            num: _item.handOverNum,
          });

          dataChar14Days.push({
            monthDate: _item.monthDate.substring(5, _item.monthDate.length),
            name: '日均交付量',
            num: res.dayHandOverNum,
          });
        });
        this.setState({
          recent14Days: res,
          dataChar14Days,
        });
      }

      if (res.dayType === 2) {
        res.diagramDataRespList.forEach(_item => {
          dataChar6Month.push({
            monthDate: _item.monthDate,
            name: '计划量',
            num: _item.planNum,
          });
          dataChar6Month.push({
            monthDate: _item.monthDate,
            name: '交付量',
            num: _item.handOverNum,
          });
          dataChar6Month.push({
            monthDate: _item.monthDate,
            name: '月均交付量',
            num: res.monthHandOverNum?res.monthHandOverNum:0,
          });
        });
        this.setState({
          recent6Month: res,
          dataChar6Month,
        });
      }


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

  releaseAppointment = e => {
    const projectId = e.currentTarget.getAttribute('project-id');
    // router.push(`/WeappConsign/main/release?projectId=${projectId}`);
    window.location.href = `/WeappConsign/main/release?projectId=${projectId}`;
  };


  render () {
    const { ready, show, recent14Days, recent6Month, data: { projectName, projectId, pushPreBooking } } = this.state;
    const now = new Date();
    return (
      ready
      &&
      <>
        <div styleName='container'>
          <div styleName='mr_top15'>
            <div styleName='project_title'>
              <div styleName='flex_row item_title'>
                <div styleName='flex_col col_left '>
                  <p styleName='title'>{projectName}</p>
                </div>
                <div styleName='flex_col col_right item_btn'>
                  {
                    pushPreBooking===1&& <Button
                      styleName='push'
                      color='success'
                      size='small'
                      project-id={projectId}
                      onClick={this.releaseAppointment}
                    >发布预约
                    </Button>
                  }
                </div>
              </div>
            </div>
            {this.searchButton()}
            {this.dataStatisticsComp()}
            {this.lineChartComp(1, recent14Days)}
            {this.lineChartComp(2, recent6Month)}
          </div>
        </div>
        <Calendar
          locale={zhCN}
          onCancel={this.cancelCalendar}
          onConfirm={this.checkData}
          showShortcut
          visible={show}
          minDate={new Date(+now - 86400000 * 30 * 7)}
          maxDate={new Date(now)}
        />
      </>
    );
  }
}
