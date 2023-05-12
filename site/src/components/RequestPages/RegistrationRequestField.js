import React from 'react';
import {Field} from 'formik';

const RegistrationRequestField = (props) => {
  const id = `form-control-${props.id}`;
  const validityClass = props.touched[props.id] ? (props.errors[props.id] ? 'is-invalid' : 'is-valid') : '';

  let PreparedAutocompleter;
  if (props.autocompleter) {
    PreparedAutocompleter = React.createElement(
      props.autocompleter, {
        watchedId: props.id,
        setValue: props.autocompleterSetValue
      },
    )
  }

  return (
    <div className="form-group row">
      <label className="col-md-12 col-md-2 col-lg-3 col-form-label form-control-label" htmlFor={props.id}>
        {props.label}
      </label>
      <div className="col-sm-12 col-md-10 col-lg-9">
        {(() => {
          switch (props.type) {
            case "text":
            case "password":
            case "checkbox":
              return (
                <Field
                  as="input"
                  id={props.id}
                  name={props.id}
                  type={props.type}
                  className={`form-control ${validityClass}`}
                  style={props.type === "checkbox" ? {width: "initial"} : {}}
                  aria-describedby={`${id}-helpblock`}
                  disabled={props.disabled}
                  placeholder={props.placeholder}
                />
              )
            case "textarea":
              return (
                <Field
                  as="textarea"
                  id={props.id}
                  name={props.id}
                  className={"form-control textarea " + validityClass}
                  aria-describedby={`${id}-helpblock`}
                  disabled={props.disabled}
                  placeholder={props.placeholder}
                  rows={props.rows}
                />
              )
            case "select":
              return (
                <Field
                  as="select"
                  id={props.id}
                  name={props.id}
                  type={props.type}
                  className={"form-control " + validityClass}
                  aria-describedby={`${id}-helpblock`}
                  disabled={props.disabled}
                >
                  <option value="" disabled>{props.placeholder || 'Select...'}</option>
                  {
                    props.options.map(option => (
                      <option
                        value={option.shortId}
                        key={`option-${option.shortId}`}
                      >
                        {option.label}
                      </option>
                    ))
                  }
                </Field>
              )
          }
        })()}
        { props.autocompleter && PreparedAutocompleter }
        <div className={(props.touched[props.id] && props.errors[props.id]) ? 'd-block text-danger' : 'd-none'}>
          <i className="icon icon-common icon-times-circle" /> { props.errors[props.id] }
        </div>
        <small id={`${id}-helpblock`} className="form-text text-muted">
          {props.description}
          {props.example && <span> <strong>Example:</strong> <span className="text-dark">{props.example}</span>.</span>}
        </small>
      </div>

    </div>
  );
}

export default RegistrationRequestField;