import { LoadingOutlined } from "@ant-design/icons";
import * as React from "react";
import * as Loadable from "react-loadable";

class Loading extends React.PureComponent<Loadable.LoadingComponentProps> {
  render() {
    return (
      <div
        style={{
          textAlign: "center",
          color: "rgb(24, 144, 255)",
          height: 600,
          lineHeight: "60px"
        }}
      >
        加载中……
        <LoadingOutlined />
      </div>
    );
  }
}

export default Loading;
