import Description from './Description';
import Errors from './Errors';
import Label from './Label';

import {
  generateIdForType,
  idToLabel
} from '../../util';


export default function TextfieldRenderer(props) {
  const {
    dataPath,
    disabled,
    errors = [],
    field,
    value = ''
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
      type="text"
      value={ value }
      onInput={ onChange }
      disabled={ disabled } />
    <Description description={ field.description } />
    <Errors errors={ errors } />
  </div>;
}

TextfieldRenderer.create = function(options = {}) {
  const type = 'textfield';

  const id = generateIdForType(type);

  return {
    type,
    id,
    label: idToLabel(id),
    ...options
  };
};

TextfieldRenderer.type = 'textfield';

TextfieldRenderer.label = 'Textfield';