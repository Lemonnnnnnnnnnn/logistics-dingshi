import React, { useState, useCallback, useMemo } from "react";
import { Button, Form, Input, Select } from "antd";
import TableX from "../../components/tableX";
import EditTable from "../../components/tableX/edit-table";
import MapInput from "../../components/map-input";
import UploadX from "../../components/uploadX";
import { UpdateType } from "@/declares";
import SearchBar from "@/components/sort-bar";

const Home = () => {
  const [searchObj, setSearchObj] = useState({
    createTime: [],
    feedbackPort: "342342",
    feedbackContent: undefined,
    feedbackStatus: undefined
  });
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [pageObj, setPageObj] = useState({ current: 1, pageSize: 10 });
  const [data, setData] = useState([
    {
      id: 1,
      name: "a",
      age: 18,
      address: "a",
      phone: "1",
      price: 1,
      a: 1,
      b: 1,
      c: 1
    },
    {
      id: 2,
      name: "b",
      age: 19,
      address: "b",
      phone: "2",
      price: 2,
      a: 2,
      b: 2,
      c: 2
    }
  ]);
  const onSearch = val => {
    console.log("onSearch", val);
  };
  const onReset = useCallback(
    val => {
      setSearchObj({
        createTime: [],
        feedbackPort: undefined,
        feedbackContent: undefined,
        feedbackStatus: undefined
      });
    },
    [searchObj]
  );
  const searchOptions = [
    {
      label: "招标状态",
      key: 1,
      options: [
        { title: "即将开始", key: 17 },
        { title: "投标中", key: 18 },
        { title: "待开标", key: 19 },
        { title: "已开标", key: 20 },
        { title: "已撤回", key: 21 }
      ]
    },
    {
      label: "地区",
      key: 2,
      options: [
        { title: "四川", key: 1 },
        { title: "吉林", key: 2 },
        { title: "黑龙江", key: 3 },
        { title: "辽宁", key: 4 },
        { title: "北京", key: 5 },
        { title: "河北", key: 6 },
        { title: "天津", key: 7 },
        { title: "内蒙古", key: 8 },
        { title: "山西", key: 9 },
        { title: "上海", key: 10 },
        { title: "北京", key: 11 },
        { title: "河北", key: 12 },
        { title: "天津", key: 13 },
        { title: "内蒙古", key: 14 },
        { title: "山西", key: 15 },
        { title: "上海", key: 16 }
      ]
    },
    {
      label: "货品类目",
      key: 3,
      options: [
        { title: "钢材", key: 17 },
        { title: "水泥熟料", key: 18 },
        { title: "渣土", key: 19 },
        { title: "废钢", key: 20 },
        { title: "砂石", key: 21 }
      ]
    }
  ];
  const searchList = useMemo(
    () => [
      {
        label: "提交日期",
        key: "createTime",
        type: "time"
      },
      {
        label: "反馈端口",
        key: "feedbackPort",
        placeholder: "请选择反馈端口",
        type: "input"
      },
      {
        label: "问题详情",
        key: "feedbackContent",
        placeholder: "请输入问题详情",
        type: "input"
      },
      {
        label: "状态",
        key: "feedbackStatus",
        placeholder: "请选择状态",
        type: "select",
        showSearch: true,
        options: [
          { key: -1, value: -1, label: "全部" },
          {
            label: "待回复",
            key: 1,
            value: 1
          },
          {
            label: "已回复",
            key: 2,
            value: 2
          }
        ]
      }
    ],
    [searchObj]
  );
  const buttonList = [
    {
      label: "查询",
      btnType: "primary",
      key: "search",
      type: "search",
      onClick: onSearch
    },
    {
      label: "重置",
      key: "reset",
      onClick: onReset
    },
    {
      label: "导出Excel",
      key: "export",
      btnType: "primary",
      onClick: onSearch
    }
  ];
  const onSelectChange = selectedRowKeys => {
    setSelectedRowKeys(selectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };
  const pagination = {
    ...pageObj,
    total: 90,
    onChange: (current: number, pageSize?: number) => {
      setPageObj({ current, pageSize: pageSize || pageObj.pageSize });
    }
  };
  const columns1 = [
    {
      title: "Name",
      dataIndex: "name",

      editRender: (text, row, index) => {
        return (
          <Form.Item name={"name"}>
            <Input />
          </Form.Item>
        );
      }
    },
    {
      title: "Age",
      dataIndex: "age",

      editRender: (text, row, index) => {
        return (
          <Form.Item name={"age"}>
            <Input />
          </Form.Item>
        );
      }
    },
    {
      title: "address",

      dataIndex: "address",
      editRender: (text, row, index) => {
        return (
          <Form.Item name={"address"}>
            <Input />
          </Form.Item>
        );
      }
    },
    {
      title: "phone",

      dataIndex: "phone",
      editRender: (text, row, index) => {
        return (
          <Form.Item name={"phone"}>
            <Input />
          </Form.Item>
        );
      }
    },
    {
      title: "price",
      dataIndex: "price",

      editRender: (text, row, index) => {
        return (
          <Form.Item name={"price"}>
            <Input />
          </Form.Item>
        );
      }
    },
    {
      title: "a",
      dataIndex: "a",

      editRender: (text, row, index) => {
        return (
          <Form.Item name={"a"}>
            <Input />
          </Form.Item>
        );
      }
    },
    {
      title: "b",
      dataIndex: "b",
      width: 200,

      editRender: (text, row, index) => {
        return (
          <Form.Item name={"b"}>
            <Select style={{ width: "100%" }}>
              <Select.Option value={"1"}>23423</Select.Option>
            </Select>
          </Form.Item>
        );
      }
    },
    {
      title: "c",
      dataIndex: "c",

      editRender: (text, row, index) => {
        return (
          <Form.Item name={"c"}>
            <Input />
          </Form.Item>
        );
      }
    }
  ];
  const columns2 = [
    {
      title: "Name",
      dataIndex: "name",

      render: (text, row, index) => {
        return (
          <Form.Item name={`name${index}`} initialValue={text}>
            <Input />
          </Form.Item>
        );
      }
    },
    {
      title: "Age",
      dataIndex: "age"
    },
    {
      title: "address",
      dataIndex: "age"
    },
    {
      title: "phone",
      dataIndex: "age"
    },
    {
      title: "price",
      dataIndex: "age"
    },
    {
      title: "a",
      dataIndex: "age"
    },
    {
      title: "b",
      dataIndex: "age"
    },
    {
      title: "c",
      dataIndex: "age",
      render: (text, row, index) => {
        return (
          <Form.Item name={`c${index}`} initialValue={text}>
            <Input />
          </Form.Item>
        );
      }
    },
    {
      title: "操作",
      dataIndex: "option",
      render: () => (
        <div style={{ color: "#1890ff" }}>
          <span
            style={{ marginRight: "10px" }}
            onClick={row => {
              console.log(row, searchObj, pageObj);
            }}
          >
            增加
          </span>
          <span>删除</span>
        </div>
      )
    }
  ];
  const columns3 = [
    {
      title: "Name",
      dataIndex: "name",
      fixed: true // 是否固定
    },
    {
      title: "Age",
      dataIndex: "age"
    },
    {
      title: "address",
      dataIndex: "age"
    },
    {
      title: "phone",
      dataIndex: "age"
    },
    {
      title: "price",
      dataIndex: "age"
    },
    {
      title: "a",
      dataIndex: "age"
    },
    {
      title: "b",
      dataIndex: "age"
    },
    {
      title: "c",
      dataIndex: "age"
    },
    {
      title: "操作",
      fixed: "right", // 是否固定
      width: 150,
      dataIndex: "option",
      render: () => (
        <div style={{ color: "#1890ff" }}>
          <span
            style={{ marginRight: "10px" }}
            onClick={row => {
              console.log(row, searchObj, pageObj);
            }}
          >
            增加
          </span>
          <span>删除</span>
        </div>
      )
    }
  ];
  return (
    <div
      style={{
        width: "1200px",
        margin: "0 auto",
        marginTop: "100px"
      }}
    >
      <div>
        <p>搜索组件</p>
        <SearchBar searchOptions={searchOptions} />
      </div>
      <div style={{ marginTop: "20px" }}>
        <p>可编辑行的表格</p>
        <Form form={form} component={false}>
          <EditTable
            hasAdd={true}
            loading={false}
            rowKey="id"
            columns={columns1}
            dataSource={data}
            setDatas={list => setData(list)}
          />
        </Form>
      </div>
      <div style={{ marginTop: "20px" }}>
        <p>部分列可编辑</p>
        <Form form={form} component={false}>
          <TableX
            loading={false}
            rowSelection={rowSelection}
            rowKey="id"
            columns={columns2}
            dataSource={data}
          />
          <Button
            onClick={() => {
              form.validateFields().then(values => {
                console.log(values);
              });
            }}
          >
            保存
          </Button>
        </Form>
      </div>
      <div style={{ marginTop: "20px" }}>
        <p>可横向滚动、分页、有搜索条件的表格</p>
        <TableX
          loading={false}
          searchList={searchList}
          buttonList={buttonList}
          scroll={{ x: "130%", y: 500 }} // 有左右滚动条
          pagination={pagination} // 有分页
          searchObj={searchObj}
          rowSelection={rowSelection}
          rowKey="id"
          columns={columns3}
          dataSource={data}
        />
      </div>
      <div style={{ marginTop: "20px" }}>
        <p>地图组件</p>
        <MapInput
          placeholder="地址"
          name="address"
          title="地址"
          form={form}
          rules={[{ required: true }]}
        />
      </div>
      <div style={{ marginTop: "20px" }}>
        <p>下载组件(不指定类型)</p>
        <UploadX
          onUpload={res => {
            const old = form.getFieldValue("upload") || [];
            form.setFieldsValue({ upload: [...old, res] });
          }}
          title="上传文件"
          showDownload
          maxLength={5} // 最多可以上传多少个文件
          extra="支持：doc .docx .pdf .jpg.gif等，单个文件最大50M，最多上传5个。" // 提示语
          renderMode={UpdateType.Btn}
        />
      </div>
      <div style={{ marginTop: "20px" }}>
        <p>下载组件(上传图片)</p>
        <UploadX
          onUpload={res => {
            const old = form.getFieldValue("upload") || [];
            form.setFieldsValue({ upload: [...old, res] });
          }}
          title="上传"
          renderMode={UpdateType.Img}
          accept="image/jpeg, image/jpg, image/png"
          fileSuffix={["jpeg", "jpg", "png"]}
        />
      </div>
      <div style={{ marginTop: "20px" }}>
        <p>下载组件(上传文档)</p>
        <UploadX
          onUpload={res => {
            const old = form.getFieldValue("upload") || [];
            form.setFieldsValue({ upload: [...old, res] });
          }}
          title="上传"
          renderMode={UpdateType.Btn}
          accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document" // 主要根据这个来限制上传类型
          fileSuffix={["doc", "docx", "pdf"]}
        />
      </div>
    </div>
  );
};

export default Home;
