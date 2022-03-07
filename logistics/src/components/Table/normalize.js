import { forEach, isNumber } from '@/utils/utils';

const TABLE_TYPE = {
  FLEXIBLE:'flexible',   // 弹性的，可伸缩的
  FIXED:'fixed'          // 固定宽度的
};

/**
 * 提供一种
 *
 */
export default class NormalizeTable {

  constructor (schema){
    const { variable = false, minWidth=0, minHeight=0 } = schema;
    this.schema = schema;
    if (variable === false) return;
    this.scroll = {
      scroll:{
        x:minWidth,
        y:minHeight
      }
    };
    delete schema.scroll;
    const { columns } = schema;
    forEach(columns, (column)=>{
      if (column.fixed){
        column.$fixed = column.fixed;
        delete column.fixed;
      }
    });
  }

  ifVariable (){
    return !!this.schema.variable;
  }

  ifScroll () {
    return !this.ifVariable() || this.tableType===TABLE_TYPE.FLEXIBLE;
  }

  getScroll (){
    if (!this.ifVariable() || this.tableType===TABLE_TYPE.FLEXIBLE) { // 增加仅对高度的滚动
      return { ...this.scroll };
    }
    if (this.schema.minHeight > 0 && this.clientHeight > this.schema.minHeight) {
      this.tableType = TABLE_TYPE.FLEXIBLE;
      const scroll = {
        scroll: {
          y: this.schema.minHeight
        }
      };
      return { ...scroll };
    }
    return {};
    // return ( !this.ifVariable() || this.tableType===TABLE_TYPE.FLEXIBLE)? this.scroll:{}
  }

  format (tableSize, clientHeight){
    this.clientHeight = clientHeight;
    if (this.schema.variable === false) return this.schema;
    if (tableSize<this.schema.minWidth && this.tableType!==TABLE_TYPE.FLEXIBLE) {
      this.tableType = TABLE_TYPE.FLEXIBLE;
      const newColumns = NormalizeTable.formatFlexible(this.schema.columns);
      return { ...this.schema, columns:newColumns };
    }

    if (tableSize>=this.schema.minWidth && this.tableType !== TABLE_TYPE.FIXED) {
      this.tableType = TABLE_TYPE.FIXED;
      const newColumns = NormalizeTable.formatFixed(this.schema.columns);
      return { ...this.schema, columns:newColumns };
    }
  }

  // 弹性表格格式化
  static formatFlexible (columns){
    return columns.map((column)=>({ ...column, fixed:column.$fixed }));
  }

  // 固定表格格式化
  static formatFixed (columns){
    return columns.map((column)=>({ ...column }));
  }
}
