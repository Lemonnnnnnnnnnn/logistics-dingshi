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
  