import {
  generateIdForType,
  idToLabel
} from '../../util';


export default function ButtonRenderer(props) {
  const {
    disabled,
    field
  } = props;

  const { action = 'submit' } = field;

  return <div class="fjs-form-field">
    <button class="fjs-button" type={ action } disabled={ disabled }>{ field.label }</button>
  </div>;
}

ButtonRenderer.create = function(options = {}) {
  const type = 'button';

  const id = generateIdForType(type);

  return {
    type,
    id,
    label: idToLabel(id),
    ...options
  };
};

ButtonRenderer.type = 'button';

ButtonRenderer.label = 'Button';