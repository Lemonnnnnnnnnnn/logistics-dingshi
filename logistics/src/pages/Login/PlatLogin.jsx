import React, { Component } from 'react';
import Login from './NewLogin';
import { independent } from '@/constants/user/role';

class PlatLogin extends Component {
  render (){
    return (
      <Login isIndepend options={independent} initialValue={1} location={this.props.location} />
    );
  }
}

export default PlatLogin;
