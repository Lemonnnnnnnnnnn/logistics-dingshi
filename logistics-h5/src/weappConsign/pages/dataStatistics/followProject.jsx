import CSSModules from 'react-css-modules';
import React from 'react';
import { Button, Checkbox, Toast, Modal } from 'antd-mobile';
import router from 'umi/router';
import { push } from 'umi/src/router';
import iconClose from '@/assets/consign/close.png';
// import iconCloseActive from '@/assets/consign/close_red.png';
import iconOk from '@/assets/consign/tick2.png';
import iconDel from '@/assets/consign/del.png';
import styles from './followProject.less';
import { delProjectAttentions, getProjectAttentions, postProjectAttentions } from '@/services/apiService';

@CSSModules(styles, { allowMultiple: true })
export default class FollowProject extends React.Component {
  state = {
    data: {
      projectAttentionResps: [],
      projectNotAttentionResps: [],
    },
    chooseProjectIds: [],
    ready: false,
  };

  constructor (props) {
    super(props);
  }

  componentDidMount () {
    this.getProjectAttentionsList();
  }

  getProjectAttentionsList = () => {
    Toast.loading('数据加载中...', 0);
    getProjectAttentions().then(res => {
      this.setState({
        ready: true,
        data: res,
      }, () => {
        this.toastHide();
      });
    });
  };

  toastHide = () => {
    setTimeout(() => {
      Toast.hide();
    }, 300);
  };

  save = () => {
    // router.goBack()

    const { chooseProjectIds } = this.state;
    if (chooseProjectIds.length <= 0) {
      router.goBack();
      return;
    }

    postProjectAttentions({
      projectIdList: chooseProjectIds,
    }).then(() => {
      this.getProjectAttentionsList();
    }).then(() => {
      router.goBack();
    });
  };

  unChooseProject = (e) => {
    const projectId = e.currentTarget.getAttribute('projectid');
    delProjectAttentions({
      projectIdList: [projectId],
    }).then(() => {
      this.getProjectAttentionsList();
    });
  };


   unChooseProjectAllTips= ()=>{
     Modal.alert('', '确定要全部移除吗？此操作不可逆！', [
       { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
       { text: '全部移除', onPress: () => this.unChooseProjectAll() },
     ]);
   }

  unChooseProjectAll=()=>{
    const itemArr=[]
    const { data: { projectAttentionResps } } = this.state;
    projectAttentionResps.map(item => (
      itemArr.push(item.projectId)
    ))
    delProjectAttentions({
      projectIdList: itemArr,
    }).then(() => {
      this.getProjectAttentionsList();
    });
  }

  chooseProject = (e) => {
    const project = e.currentTarget.getAttribute('project');
    const { chooseProjectIds } = this.state;
    const projectInfo = JSON.parse(project);
    const arrIndex = chooseProjectIds.indexOf(projectInfo.projectId);
    if (arrIndex > -1) {
      chooseProjectIds.splice(arrIndex, 1);
    } else {
      chooseProjectIds.push(projectInfo.projectId);
    }

    this.setState({
      chooseProjectIds,
    });
  };

  onChangeAll=(e)=>{
    console.log( e)
    const { target:{ checked } } =e
    const { data: { projectNotAttentionResps } } = this.state;
    if (!checked){
      this.setState({
        chooseProjectIds:[]
      })
    }
    if (checked){
      const itemArr=[]
      projectNotAttentionResps.map(item => (
        itemArr.push(item.projectId)
      ))
      this.setState({
        chooseProjectIds:itemArr
      })
    }



  }

  render () {
    const { ready, chooseProjectIds, data: { projectAttentionResps, projectNotAttentionResps } } = this.state;
    return (
      ready
      &&
      <>
        <div styleName='container'>
          <div styleName='already'>
            <div styleName='title'>
              已关注项目
              <div styleName='un_choose_all'>
                <Button block color='primary' size='small' styleName='choose_btn' onClick={this.unChooseProjectAllTips}>
                  <img src={iconDel} />
                  全部移除
                </Button>
              </div>
            </div>
            <div styleName='card'>
              {
                projectAttentionResps.map(item => (
                  <div styleName='item' projectid={item.projectId} onClick={this.unChooseProject}>
                    <div>{item.projectName}</div>
                    <img src={iconClose} alt="" />
                  </div>
                ))
              }
            </div>
          </div>
          <div styleName='not'>
            <div styleName=' title'>
              添加关注项目
              <div styleName='choose_all'>
                <Checkbox.AgreeItem className='choose_checkbox' onChange={this.onChangeAll}>全选</Checkbox.AgreeItem>
              </div>
            </div>
            <div styleName='card'>
              {
                projectNotAttentionResps.map(item => (
                  <div
                    styleName={chooseProjectIds.indexOf(item.projectId) >= 0 ? 'item active' : 'item'}
                    project={JSON.stringify(item)}
                    onClick={this.chooseProject}
                  >
                    <div>{item.projectName}</div>
                    {chooseProjectIds.indexOf(item.projectId) >= 0 ? (
                      <img src={iconOk} alt='图标' />
                    ) : null
                    }
                  </div>
                ))
              }

            </div>
          </div>

          <Button block color='primary' size='middle' styleName='save_btn' onClick={this.save}>
            保存
          </Button>

        </div>
      </>
    );
  }
}
