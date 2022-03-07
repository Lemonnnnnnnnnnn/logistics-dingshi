import { getUserInfo } from '@/service/user';
import React, { Component } from 'react';
import { CarItem } from '../dashboard/withDashboard';
import { RespSocketData, Socket } from './socket';

interface CarSocketMsgData {
  carId: number;
  direction: string; // 方向
  gpsTime: number; // GPS时间戳
  height: number;
  latitude: string; // 纬度
  longitude: string; // 经度
  mileage: number;
  parkTime: number; //停车时间 （s）
  parkTimeDescribe: string; // 停车时间文字
  providerUniqueName: string; // 数据提供机构
  speed: number; // 速度
  vehicleNumber: string; // 车牌
}

export interface IEjdSocketProps {
  updateMapRenderCarList: (params: CarSocketMsgData[]) => void;
}

export default class EjdSocket extends Component<IEjdSocketProps> {
  protected socket: Socket;

  timer = null;

  userInfo = getUserInfo();

  componentDidMount() {
    const url = `${window.envConfig.socketUrl}/${this.userInfo.accessToken}`;
    this.socket = new Socket({
      url,
      onMessage: this.messageHandler,
    });
    window.ejdSocket = this.socket;
  }

  componentWillUnmount(): void {
    this.socket?.destroy();
    this.socket = null;
    window.ejdSocket = null;
  }

  messageHandler = (msg: RespSocketData) => {
    const data = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data;
    switch (msg.messageType) {
      case 1:
        const _data: CarSocketMsgData[] = data;
        this.props.updateMapRenderCarList(_data);
        break;
      default:
    }
  };

  render() {
    return null;
  }
}
