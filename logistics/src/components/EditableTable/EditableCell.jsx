import React, { createContext } from 'react';

const EditableContext = createContext();
const { Consumer } = EditableContext;

export const { Provider } = EditableContext;

const EditableCell = (props) => {
  const { isEditing, index, record, componentRender, ...restProps } = props;
  return (
    <Consumer>
      {(form) => (
        <td {...restProps}>
          {
            isEditing
              ? componentRender(record, form, index)
              : restProps.children
          }
        </td>
      )}
    </Consumer>
  );
};

export default EditableCell;
