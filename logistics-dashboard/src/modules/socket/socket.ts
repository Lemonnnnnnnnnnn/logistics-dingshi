type MessageHandler = (data: RespSocketData) => void;

interface SocketParams {
  onMessage?: MessageHandler;
  onError?: (msg: string) => void;
  url: string;
  onOpen?: () => void;
}

export type RespSocketData = {
  messageType: 1 | 2;
  data: string;
};

export type ReqSocketData = {
  type: 1 | 2;
  content?: string;
  message?: string;
};

export class Socket {
  protected socket: WebSocket;
  onMessage: MessageHandler;
  onError: (msg: string) => void;
  protected url: string;

  constructor({ onError, onMessage, url }: SocketParams) {
    if (!('WebSocket' in window)) {
      onError && onError('您的浏览器不支持websocket.');
      return;
    }
    this.url = url;
    this.onMessage = onMessage;
    this.onError = onError;
    this.init();
  }

  protected init() {
    let socket = new WebSocket(this.url),
      onMessage = this.onMessage;
    this.socket = socket;

    socket.onopen = () => {
      this.sendMessage({
        type: 2,
      });
    };
    socket.onmessage = ({ data }) => {
      this.heartCheck.start();
      try {
        let result: RespSocketData = JSON.parse(data);
        // messageType等于2时为无效数据
        if (result.messageType !== 2) {
          onMessage && onMessage(result);
        }
      } catch (e) {
        console.error(e);
      }
    };
    socket.onerror = (e) => {
      this.errorHandler();
    };
  }

  // websocket连接出错
  protected errorHandler() {
    let onError = this.onError;
    onError && onError('websocket连接失败');
  }

  // 定时任务
  protected heartCheck = (() => {
    let timeout = 55000,
      timer = null;

    return {
      start: () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          this.sendMessage({
            type: 2,
          });
        }, timeout);
      },
    };
  })();

  sendMessage(data: ReqSocketData) {
    let socket = this.socket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  }

  destroy() {
    this.socket && this.socket.close();
    this.socket = null;
    this.onMessage = null;
    this.onError = null;
  }
}
