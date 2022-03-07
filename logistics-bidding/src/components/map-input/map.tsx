import React, { Component } from "react";
import { Map, Marker } from "react-amap";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import { message, Input } from "antd";
import axios from "axios";

interface IProps {
  long: any;
  lat: any;
  onMarkerAddress: (a: any, b: any, c?: any, d?: any) => void;
}

export default class CustomMap extends Component<IProps> {
  autoCompleteDom: any;
  hasAddedListener: boolean;
  mapEvents:
    | { created: (map: any) => void; click: (info: any) => void }
    | undefined;
  constructor(props: IProps | Readonly<IProps>) {
    super(props);
    this.state = {
      mounted: false,
      mapConfig: {
        zoom: 10,
        center: {
          longitude: 104.07,
          latitude: 30.67
        }
      },
      position: {},
      searchValue: ""
    };
    window.amapkey = "453fb255276691550af1e98c17bbddc7";
    this.autoCompleteDom = undefined;
    this.hasAddedListener = false;
  }

  componentDidMount() {
    const { long, lat } = this.props;
    // tslint:disable-next-line:no-this-assignment
    const self = this;
    this.mapEvents = {
      created: map => {
        self.map = map;
        //  扩展插件 自动补全信息
        window.AMap.plugin("AMap.Autocomplete", () => {
          this.autoCompleteDom = new window.AMap.Autocomplete({
            input: "searchinput"
          });
        });

        // 扩展插件 地理编码和逆地理编码
        window.AMap.plugin(["AMap.Geocoder"], () => {
          self.geocoder = null;
          self.geocoder = new window.AMap.Geocoder({
            radius: 1000, // 以已知坐标为中心点，radius为半径，返回范围内兴趣点和道路信息
            extensions: "all" // 返回地址描述以及附近兴趣点和道路信息，默认"base"
          });
        });
      },
      click: info => {
        const lnglat = [info.lnglat.lng, info.lnglat.lat];
        self.geocoder.getAddress(
          lnglat,
          (
            status: string,
            result: {
              info: string;
              regeocode: {
                formattedAddress: any;
                addressComponent: {
                  adcode: any;
                  province: any;
                  city: any;
                  district: any;
                };
              };
            }
          ) => {
            if (status === "complete" && result.info === "OK") {
              if (
                result &&
                result.regeocode &&
                result.regeocode.formattedAddress
              ) {
                if (this.props.onMarkerAddress) {
                  this.props.onMarkerAddress(
                    lnglat.join(),
                    result.regeocode.formattedAddress,
                    result.regeocode.addressComponent.adcode,
                    `${result.regeocode.addressComponent.province}${result.regeocode.addressComponent.city}${result.regeocode.addressComponent.district}`
                  );
                }
              } else {
                message.error("获取当前位置信息失败");
              }
            }
          }
        );
        this.setState({
          position: {
            longitude: info.lnglat && info.lnglat.lng,
            latitude: info.lnglat && info.lnglat.lat
          }
        });
      }
    };
    this.setState({ mounted: true });
    if (long && lat) {
      this.refreshMarker(long, lat);
    }
  }

  componentWillReceiveProps(nextProps: IProps) {
    if (
      !isEqual(this.props.long, nextProps.long) ||
      !isEqual(this.props.lat, nextProps.lat)
    ) {
      if (nextProps.long && nextProps.lat) {
        this.refreshMarker(nextProps.long, nextProps.lat);
      }
    }
  }

  refreshMarker = (long: any, lat: any) => {
    this.setState(
      {
        position: {
          longitude: long,
          latitude: lat
        }
      },
      () => this.getAddress(long, lat)
    );
  };

  getAddress = (long: any, lat: any) => {
    const location = `${long},${lat}`;
    axios
      .post(
        `https://restapi.amap.com/v3/geocode/regeo?output=json&location=${location}&key=b81544224ed3cba7532d10d0da5b153a&radius=3000&extensions=all`,
        { noAuth: true }
      )
      .then(async results => {
        if (results && results.info === "OK") {
          this.setState({
            mapConfig: {
              zoom: 10,
              center: {
                longitude: long,
                latitude: lat
              }
            }
          });
          if (this.props.onMarkerAddress) {
            this.props.onMarkerAddress(
              location,
              results.regeocode.formatted_address
            );
          }
        }
      });
  };

  fetchPlaceSearch = () => {
    const { searchValue } = this.state;
    return (
      <div style={{ marginBottom: 10 }}>
        <Input
          id="searchinput"
          value={searchValue}
          style={{ width: 300 }}
          onChange={this.inputChange}
          placeholder="请输入需要搜索的地址"
          onClick={this.addListener}
        />
      </div>
    );
  };

  addListener = () => {
    if (!this.hasAddedListener) {
      // 绑定监听搜索选择信息事件
      window.AMap.event.addListener(this.autoCompleteDom, "select", e => {
        if (e.poi.location) {
          // 如果存在当前地理位置的坐标
          const {
            poi: {
              location: { lng: longitude, lat: latitude },
              name: addressName,
              adcode,
              district
            }
          } = e;
          const center = {
            longitude,
            latitude
          };
          if (this.props.onMarkerAddress) {
            this.props.onMarkerAddress(
              `${longitude},${latitude}`,
              addressName,
              adcode,
              district
            );
          }
          this.setState({
            searchValue: addressName,
            mapConfig: {
              zoom: 15,
              center
            },
            position: center
          });
        } else {
          // 不存在进行地址位置解析然后获取对应的坐标点
          this.geocoder.getLocation(
            e.poi.name,
            (status: string, result: { info: string; geocodes: any[] }) => {
              if (status === "complete" && result.info === "OK") {
                // 解析数据返回成功
                const msg = result && result.geocodes && result.geocodes[0];

                msg
                  ? this.setState(
                      {
                        mapConfig: {
                          zoom: 15,
                          center: {
                            longitude: msg.location.lng,
                            latitude: msg.location.lat
                          }
                        },
                        position: {
                          longitude: msg.location.lng,
                          latitude: msg.location.lat
                        }
                      },
                      () => {
                        if (this.props.onMarkerAddress) {
                          this.props.onMarkerAddress(
                            `${msg.location.lng},${msg.location.lat}`,
                            msg.formattedAddress
                          );
                        }
                      }
                    )
                  : message.error("获取当前位置解析失败");
              }
            }
          );
        }
      });
      this.hasAddedListener = true;
    }
  };

  inputChange = (e: { target: { value: any } }) => {
    this.setState({ searchValue: e.target.value });
  };

  render() {
    const { mapConfig, position, mounted } = this.state;
    return (
      <div style={{ width: "100%", height: "calc(100% - 60px)" }}>
        {this.fetchPlaceSearch()}
        {mounted ? (
          <Map
            ref={dom => (this._map = dom)}
            events={this.mapEvents}
            {...mapConfig}
          >
            <Marker visible={!isEmpty(position)} position={position} />
          </Map>
        ) : null}
      </div>
    );
  }
}
