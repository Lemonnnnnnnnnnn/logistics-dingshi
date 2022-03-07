## 应用内容说明

- 托运的小程序实际代码










## 工程 相关

  - **安装依赖**： npm i 
  - **启动开发**： npm run dev
  - **打包**：npm run build

    dist默认打包`production`环境，如需打包其他环境：

    1. `package.json`的scripts中添加`build:xxx`任务，设置UMI_ENV为对应的环境`env`
    2. 在`/filters`中创建同UMI_ENV同名的文件`[env].js`


## 开发相关

### 添加功能模块

  1. **添加请求**： 参考`/mock/**.js` [可选]
  2. **添加service**: 参考`/src/services**.js`
  3. **编写model**： 参考`/src/models/article.js`
    1. `src/models/**/*.js`为全局模型，在项目启动时全量加载
    2. `src/pages/**/models/**/*.js`为局部模型，在该页面加载是异步载入  
  4. **编写页面**:  在`pages`目录中添加页面
  5. **添加路由**： 参考`/config/config.js`中的routes配置，component起始路径为`pages/`

### 组件与页面权限

  1. **路由权限**： 在`/config/config.js`的routes中，给对应路由添加`authority`参数，如`[auth_1]`，当无权限时不渲染该路由
  2. **组件权限**： 
    1. 引入`import Authorized from '@/utils/Authorized'`
    2. 使用`Authorized`包裹需要权限的组件，参考`Private.jsx`，[文档地址](https://pro.ant.design/components/Authorized-cn/)
  

 ### 文件名备注
|文件路径|说明|备注|
|:---|:---|:---|
|/src/weapp|公共功能|？暂定|
|/src/weappConsign|托运端|---|
|/src/weappDriver|司机端|---|
  
### 原型信息
#### 托运端 首页数据统计原型
> [查看原型](https://lanhuapp.com/web/#/item/project/product?tid=c4004a94-4044-40e5-81a1-4837607f0b92&pid=4bf634e3-030d-405c-ba79-0b3a3163c8e3&versionId=6e53ed29-0688-4e14-96bf-764e77902ab4&docId=4c4da2a6-9b69-425b-a119-18b58630d045&docType=axure&pageId=eb0547023a9b44b998037bdb7d8744c8&image_id=4c4da2a6-9b69-425b-a119-18b58630d045&parentId=e86a5e52-e419-4368-b07d-dfe138dae562) 
1. 单个项目数据概览时：在途运单、完成运单 需要点击跳转到 对应运单状态下
2. 排序按单个标记排序，不做双重排序
3. 原型只需要看左侧即可，右侧为废弃数据

### 项目中目前引入库分析
1. [UI 框架 Ant Design Mobile](https://mobile.ant.design/components/button)、[antd-mobile-v2.x](https://antd-mobile-v2.surge.sh/index-cn)
2. [PC端图表库 BizCharts](https://www.bizcharts.net/product/BizCharts4/gallery)、 [图表库移动端 bizgoblin doc ](https://bizcharts.net/product/bizgoblin/category/51/page/54)  [移动端图表库 图表demo](https://bizcharts.net/product/bizgoblin/gallery)  
3. 图标使用 icon: 直接使用图片或者矢量图引入
4. 样式语言: less
5. [时间周期库 moment.js](http://momentjs.cn/)
6. [form表单 schema-form 组件库](https://gitee.com/amazeBird/schema-form/blob/master/doc/SchemaForm.md) 

### 业务相关
