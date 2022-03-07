# 表单引擎使用说明
## 简述
表单是后台管理最常遇到的一种数据管理模式，在管理系统中被大量使用，但是在react中,表单的开发却相对比较复杂，需要绑定数据源，
需要去写大量的模版代码来定义每一个Field内容,需要自己去编大量的验证规则,包括不同的应用场景：新增，修改，查看,造成表单开发的工作量较大，
影响项目的开发效率。
表单组件提供一种相对简易的方式来开发对应的表单功能，通过配置化的方式简化表单开发。

表单组件提供的功能包括：
>* 字段映射：自动绑定props与字段关系
>* 表单组件提供了：新增，修改，查看三种模式，只需设置参数`mode`，不需要再进行额外操作
>* 操作封装：组件对于【新增】【修改】这两个模式提供了对应的保存与提交的默认封装
>* 界面布局：表单组件提供了一套标准的界面布局，但如果需要个性化，表单组件也提供了 

## TODO 待办事务
* ~~根据scope自动绑定state (4月3日)~~
* ~~增加对自定义控件的支持，自定义控件可获得所有相关属性与方法,以及对应的validator支持等 (4月5日)~~
* ~~增加card容器(4月5日)~~
* 添加控件与控件特有属性支持（时间控件，下接选择框 ） （邱伟）
* submit实现   （邱伟）
* ~~增加 新增/修改/详情支持  （范剑秋）~~
* ~~修改增加只读属性支持  （范剑秋）~~
* ~~实现控件连动（范剑秋）~~
* 添加自定义按钮 （邱伟）
* 添加布局属性支持 （邱伟）
* 支持表格查询 （邱伟）
* schema 有效性验证 (优先级低) （邱伟）
* 异步验证支持 (优先级低) (邱伟)
* 去除内置组件，包装组件由业务场景直接引用包装组件，以提供后期性能优化支持 (优先级低) (范剑秋)
* options异步获取内置到form中，而不需要在相关组件（例如select）中去支持
* 增加当前表单对象的获取，传递给各个组件
* 文档完善  (范剑秋,邱伟)

## shema
> shema 是表单组件的配置项，通过对shema的配置，可以动态生成对应的表单,配置的内容主要包括: 
>* 表单中包含哪些字段,每个字段的验证规则等内容
>* 表单操作
```
  const schema = {
    privateKey:'id',         // 主键，用于表单更新操作时使用
    scope:'formDemo',        // 域名，用于绑定store时，获取对应的表单初始化数据，以及保存时获取对应的接口
    fields:[                 // 字段设置
      {
        key:'userName',      // 字段对应的字段名，用于获取与保存数据
        label:'用户名',       // 用于在表单上显示的字段名
        component:'input',   // 表单字段是所使用的组件, 'input' 为当前表单引擎提供的内置的`field组件`类型，同时component也支持自定义方式（详见“自定义表单组件”）
        modifiable:false,    // 在编辑模式下，该字段是否允许修改
        required:true,       // 是否必填
        maxLength:50,        // 最大长度
        minLength:10,        // 最小长度
        placeholder:'请填写用户名', 
        // `watch` 属性用于字段连动， 当 `firstName`字段值发生变动时，触发该方法，return 返回当前字段的最新值 PS: 由于性能问题,目前暂不支持异步操作
        watch:{                   
          'firstName': (value, { oldValue, newValue })=>{
            console.error('oldValue=', oldValue, ' || newValue=', newValue)
            return `${newValue}=1111`   // 如果不想改变当前字段的值，需要返回false
          }
        }
        validator: ({ rule, value, entity, callback })=>{       // 验证方法，用于处理业务化的验证规则
          console.error('userName', entity, value)
          callback(errorInfo)
        },
        ...rest              // 剩余的属性都会直接透传给对应的 component 组件，以满足不同组件的个性化属性需要
      },{
        key:'firstName',
        label:'姓氏',
        component:'input'
        ...
      }
    ],
    operator: {             // 操作属性，用于定义表单上的操作按钮
       onSubmit(entity) {   // 提交操作，如果未定义onSubmit方法，表单会默认调用对应的post(新增模式)/put(编辑模式)方法提交表单数据
         console.info('custom onSubmit', entity)
       }
     }


```
## SchemaForm的使用
SchemaForm是表单引擎的主组件，SchemaForm将根据定义好的`schema`自动生成对应的表单

SchemaForm的主要属性包括：

| 属性 | 说明 | 可选参数 | 默认 |
|:----|:----|:----|:----|
/schema|表单配置|--|--|
|mode|表单模式|add（新增）/modify（修改）/detail(详情) |detail|
|entity|表单实体对象,用于初始化表单数据| |--|
|onSubmit|新增表单事件| |--|

SchemaForm提供两种使用方式,一种简单模式,SchemaForm不需要任何子组件，完全根据schema配置生成表单，另一种方式支持个性化的表单布局。

### 简单模式

```reactjs
export default class FormDemo extends Component {
  render() {
    return (
      <SchemaForm schema={schema} entity={entity} onSubmit={onSumbit} mode={FORM_MODE.MODIFY} />
    )
  }
}

```

### 个性化布局模式

个性化布局模式支持对表单布局的自定义，包括可以增加一些卡片，对字段位置的设定，增加一些装饰元素等

```reactjs

export default class FormDemo extends Component {
  render() {
    return (
      <SchemaForm schema={schema} entity={entity} onSubmit={onSumbit} mode={FORM_MODE.MODIFY}>
        <FormCard title="基础信息" {...this.props}>         // FormCard 是表单卡片容器
          <FormItem fields="userName" />                   // 通过FormItem 设置当前位置要展现的表单字段， fields定义要显示的字段
          <FormItem fields='password' />
          <FormItem fields='realName' />
          <FormItem fields='phone' />
          <FormItem fields='phoneList' />
        </FormCard>
        <Row>                         // 也可以随意表单的布局结构与字段位置
          <FormItem fields='area' {...this.props} />
        </Row>
      </SchemaForm>
    )
  }
}

```

### Field组件
表单组件中内置了许多其于antd的内置组件，内置组件是在antd组件的基础上，增加了Form.Item绑定，以及form.getFieldDecorator的包装
当前支持的组件有(持续增加中)：

| 组件 | 说明 |
|:----:|:----:|
|input|输入框|
|DatePicker|日期选择器|
|TimePicker|时间选择器|
|Radio|单选框|
|Select|下拉选择框|
|TextArea|文本框|

### 自定义表单组件
除了上面表单引擎内置的组件外，表单引擎还提供对自定义组件的支持，以满足不同业务场景的需要。
表单引擎会把所有相关属性与方法传递组自定义组件,主要属性与方法有：

| 属性/方法 | 说明 |
|:----:|:----|
|form|表单对象|
|mode|当前表单模式|
|field|当前字段配置|
|value|当前字段值|
|onChange|当修改了字段值时，通过调用onchange方法将最新的字段值提交给表单，在onChange方法中将自动调用validator对字段值进行校验|
|其他属性与方法||

>在自定义表单中,需要使用`ItemWrapper`对组件进行包装,以建立与`Form`表单的绑定关系

```reactjs

export default class PhoneList extends React.Component {
  render () {
    const { value, onChange } = this.props
    const _add = () =>{
      onChange([...value, '111111111'])
    }
    const _decrease = () =>{
      const newValue = [...value]
      newValue.pop()
      onChange(newValue)
    }
    return (
      <ItemWrapper {...this.props}>
        <div>
          <div>{
            value && value.map(phone => <div>{phone}</div>)
          }
          </div>
          <Button onClick={_add}>添加</Button>
          <Button onClick={_decrease}>减少</Button>
        </div>
      </ItemWrapper>
    )
  }
}

```

## BindStore 绑定状态管理模块
通过`BindStore`高阶组件，配合`BindStore`使用，可以实现与对应的modal模块的绑定,将modal模块中对应的`entity`与对应的`action`操作传递给表单引擎，
表单引擎将自动绑定数据源，并在新增或编辑保存时，自动提交数据。`BindStore`接收一个参数，为状态管理中的模块名
```reactjs
// todo 根据 scope 自动绑定state与对应的action方法,并支持添加个性化action与属性（用户可以通过connect自行添加）
@BindStore('FormDemo')   // BindStore的参数为状态管理中的模块名
export default class FormDemo extends Component {
  render() {
    <SchemaForm schema={schema} {...this.props} mode={FORM_MODE.MODIFY}>
    </SchemaForm>
  }
}
```

