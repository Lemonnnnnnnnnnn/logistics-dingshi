import React, { Component } from 'react';

class GoodsInput extends Component {
  render() {
    const { goodsName = '', categoryId = [] } = this.props.formData;
    const { category } = this.props;
    const categoryArray = category(); // 拍平的类目
    // const [first='',second='',third=''] = categoryId
    const usedCategory =categoryArray.filter(item=>{
      const check =categoryId.indexOf(item.categoryId);
      return check>=0;
    });
    const categoryName = usedCategory.reduce((finalName, current)=>`${finalName}${current.categoryName}-`, '');
    // const [first='',second='',third=''] = usedCategory
    // const categoryName =usedCategory.length?`${first.categoryName}${second.categoryName}${third.categoryName}`:''
    return (
      <div>{`${categoryName}${goodsName}`}</div>
    );
  }
}

export default GoodsInput;
