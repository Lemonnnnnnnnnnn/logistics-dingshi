import React, { Component } from 'react';
import { Item, FormButton, FORM_MODE, Observer, SchemaForm } from '@gem-mine/antd-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton';

class Demo extends Component {

  constructor (props) {
    super(props)
    this.expensesSchema = {
      // expensesItems: {
      //   type:
      // }
    }
  }

  render () {
    return (
      <SchemaForm schema={this.expensesSchema}>
        <Item field='expensesItems' />
        <div style={{ paddingRight: '20px', textAlign: 'right' }}>
          <DebounceFormButton label="保存" type="primary" onClick={this.saveExpensesModal} />
        </div>
      </SchemaForm>
    );
  }
}

export default Demo;
