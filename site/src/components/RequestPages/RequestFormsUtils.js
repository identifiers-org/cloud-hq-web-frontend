import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import {PrefixRequestInitialValues} from "./PrefixRegistrationRequestSchema";
import getInstitutionForRORIDFromRegistry from "../../utils/getInstitutionRorIdFromRegistry";
import {swalError} from "../../utils/swalDialogs";
import {getNamespacesFromRegistry} from "../../actions/NamespaceList";

export const handleInstitutionIsProviderChange = (values, setValues, setInstitutionIsProvider) =>
  (event) => {
    const source = event.target.checked ? values : PrefixRequestInitialValues;
    setValues({
      ...values,
      providerName: source.institutionName,
      providerDescription: source.institutionDescription,
      providerHomeUrl: source.institutionHomeUrl,
      providerLocation: source.institutionLocation
    }, true);
    setInstitutionIsProvider(event.target.checked);
  }

export const handleRorAutocomplete = (handleChange, errors, values, setValues, touched, setTouched) =>
  (event) => {
    handleChange(event);
    if (errors.institutionRorId === undefined) {
      getInstitutionForRORIDFromRegistry(event.currentTarget.value)
        .then(rorIdInformation => {
          if (rorIdInformation !== null) {
            setValues({
              ...values,
              institutionName: rorIdInformation.name,
              institutionHomeUrl: rorIdInformation.homeUrl,
              institutionDescription: values.institutionDescription ?
                values.institutionDescription : rorIdInformation.description,
              institutionLocation: rorIdInformation.location.countryCode
            }, true)
            setTouched({
              ...touched,
              institutionName: true,
              institutionHomeUrl: true,
              institutionDescription: true,
              institutionLocation: true
            })
          }
        }).catch(e => swalError.fire({icon: "error", text: e.message}))
    }
  }

const BasePrefixAutoCompleter = (props) => {
  const [ selected, setSelected ] = useState(false);
  const [ focused, setFocused ] = useState(false)

  const onWatchedChanged = () => {
    const watched = document.getElementById(props.watchedId);
    setSelected(false)
    props.getNamespacesFromRegistry({content: watched.value});
  }

  const onClick = (event) => {
    setSelected(true);
    props.setValue(event.target.innerText)
  }

  const onSuggestionMouseOver = (e) =>
    e.target.classList.add("suggestion__selected", "text-white")

  const onSuggestionMouseOut = (e) =>
    e.target.classList.remove("suggestion__selected", "text-white")

  const onFocus = () =>
    setFocused(true);

  const onLoseFocus = () =>
    setTimeout(() => setFocused(false), 500);
  //Delay to make sure element stays on screen for click

  useEffect(() => {
    const watched = document.getElementById(props.watchedId);
    if (watched.value) new Promise(() => onWatchedChanged());
    watched.addEventListener('input', onWatchedChanged);
    watched.addEventListener('focus', onFocus);
    watched.addEventListener('blur', onLoseFocus);
    return () => {
      watched.removeEventListener('input', onWatchedChanged);
      watched.removeEventListener('focus', onFocus);
      watched.removeEventListener('blur', onLoseFocus);
    }
  });

  if (selected || !focused)
    return undefined
  else {
    return (
      <div className="inline-search-container">
        <div className="suggestions-box">
          <div className="row mx-1">
            <div className="col align-self-end"><p className="text-muted text-right my-0"><small>Suggestions</small></p>
            </div>
          </div>
          { props.namespaceList.length === 0 ? <span className="suggestion">No namespaces found</span> :
            <ul className="suggestion-list pb-2">
              { props.namespaceList.map(suggestion =>
                <li key={`sugg-${suggestion.prefix}`} className="suggestion" onClick={onClick}
                    onMouseOver={onSuggestionMouseOver}
                    onMouseOut={onSuggestionMouseOut}>
                  <span>{suggestion.prefix}</span>
                </li>
              )}
            </ul>
          }
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  namespaceList: state.registryBrowser.namespaceList
});
const mapDispatchToProps = (dispatch) => ({
  getNamespacesFromRegistry: (params) => dispatch(getNamespacesFromRegistry(params))
});
export const PrefixAutoCompleter = connect(mapStateToProps, mapDispatchToProps)(BasePrefixAutoCompleter)

