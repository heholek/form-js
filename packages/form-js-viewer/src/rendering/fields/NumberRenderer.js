import Description from './Description';
import Errors from './Errors';
import Label from './Label';

import {
  generateIdForType,
  idToLabel
} from '../../util';


export default function NumberRenderer(props) {
  const {
    dataPath,
    disabled,
    errors = [],
    field,
    value
  } = props;

  const onChange = ({ target }) => {
    props.onChange({
      dataPath,
      value: target.value
    });
  };

  return <div class="fjs-form-field">
    <Label label={ field.label } required={ field.validate && field.validate.required } />
    <input
      class="fjs-input"
      type="number"
      disabled={ disabled }
      value={ value }
      onInput={ onChange } />
    <Description description={ field.description } />
    <Errors errors={ errors } />
  </div>;
}

NumberRenderer.create = function(options = {}) {
  const type = 'number';

  const id = generateIdForType(type);

  return {
    type,
    id,
    label: idToLabel(id),
    ...options
  };
};

NumberRenderer.type = 'number';

NumberRenderer.label = 'Number';