import React, { Component } from 'react';
import { Item } from '@gem-mine/antd-schema-form';

const formLabel = {
  display: 'inline-block'
};

export default class PictureGroup extends Component{
  render (){
    return (
      <>
        <Item style={formLabel} field='picture1' />
        <Item style={formLabel} field='picture2' />
        <Item style={formLabel} field='picture3' />
      </>
    );
  }
}
