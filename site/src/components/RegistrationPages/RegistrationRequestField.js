import React from 'react';
import {FastField, Field, useFormikContext} from 'formik';

// Components.
import Search from '../HomePage/Search';

// Config.
import { config } from '../../config/Config';

const validationUrlBase = `${config.registryApi}/${config.prefixRegistrationRequestValidationEndpoint}/`;

const RegistrationRequestField = (props) => {
  const id = `form-control-${props.id}`;

  const {errors, values, touched} = useFormikContext();

  return (
    <div className="form-group row">
      <label className="col-md-12 col-md-2 col-lg-3 col-form-label form-control-label" htmlFor={props.id}>
        {props.label}
      </label>
      <div className="col-sm-12 col-md-10 col-lg-9">
        {(() => {
          switch (props.type) {
          case "text":
            case "password": return (
            <Field
              id={props.id}
              as="input"
              type={props.type}
              className="form-control"
              aria-describedby={`${id}-helpblock`}
              disabled={props.disabled}
              placeholder={props.placeholder}
              value = {values[id]}
            />
          )
          case "textarea": return (
            <Field
              id={props.id}
              as="textarea"
              className={"form-control textarea"}
              aria-describedby={`${id}-helpblock`}
              disabled={props.disabled}
              placeholder={props.placeholder}
              rows={props.rows}
              value = {values[id]}
            />
          )
          case "select": return (
            <Field
              id={props.id}
              as="select"
              className={`form-control`}
              aria-describedby={`${id}-helpblock`}
              disabled={props.disabled}
              value = {values[id]}
            >
              <option selected disabled>{props.placeholder || 'Select...'}</option>
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
          // case "search": return (
          //   <Search
          //     id={props.id}
          //     handleChangeAction={handleSearchAction}
          //     handleSuggestionAction={handleSearchAction}
          //     placeholderCaption={props.placeholderCaption}
          //     showSuggestions={props.showSuggestions}
          //     showValidIndicator={props.showValidIndicator}
          //   />
          // )
            }
        })()}
        { touched[props.id] && errors[props.id] && (
            <div className="invalid-feedback bg-warning">
              <span className="text-white ml-1"><i className="icon icon-common icon-exclamation-triangle" /></span>
            </div>
        )}
        <div className={(touched[props.id] && errors[props.id]) ? 'd-block text-danger' : 'd-none'}>
          <i className="icon icon-common icon-times-circle" /> { errors[props.id] }
        </div>
        <small id={`${id}-helpblock`} className="form-text text-muted">
          {props.description}
          {props.example && <span> <strong>Example:</strong> <span className="text-dark">{props.example}</span>.</span>}
        </small>
      </div>

    </div>
  );
}


// // Mapping
// const mapStateToProps = (state, ownProps) => ({
//   field: state[`${ownProps.registrationType.toLowerCase()}RegistrationRequestForm`][ownProps.id]
// });
//
// const mapDispatchToProps = (dispatch, ownProps) => ({
//   setValue: (value) => dispatch(setRegistrationRequestFieldField(ownProps.registrationType, ownProps.id, 'value', value)),
//   setValidity: (validity) => dispatch(setRegistrationRequestFieldField(ownProps.registrationType, ownProps.id, 'valid', validity)),
//   setErrorMessage: (errorMessage) => dispatch(setRegistrationRequestFieldField(ownProps.registrationType, ownProps.id, 'errorMessage', errorMessage)),
//   setLabel: (value) => dispatch(setRegistrationRequestFieldField(ownProps.registrationType, ownProps.id, 'label', value)),
//   validationDone: () => dispatch(setRegistrationRequestFieldField(ownProps.registrationType, ownProps.id, 'requestedValidate' , false))
// });

export default RegistrationRequestField; //connect (mapStateToProps, mapDispatchToProps)(RegistrationRequestField);
