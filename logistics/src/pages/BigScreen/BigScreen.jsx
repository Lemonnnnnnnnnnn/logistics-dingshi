import React, { Component } from "react";

export default class BigScreen extends Component {

  state = {
    url : 'dsBigScreen'
  }

  componentDidMount() {
    const { url } = this.state;
    window.open(url, "_blank");
  }

  render() {
    const { url } = this.state;
    return (
      <a href={url} target='_blank' rel="noreferrer">打开调度大屏</a>
    );
  }
}
