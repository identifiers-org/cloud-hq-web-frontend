import React, {useState, useEffect} from "react";
import {connect} from 'react-redux';
import {Form} from "formik";

import RegistrationRequestField from "./RegistrationRequestField";
import {LoadFormButton, SaveFormButton} from "./LocalStorageFormikButtons";
import {handleInstitutionIsProviderChange, handleRorAutocomplete} from "./RequestFormsUtils"

import Spinner from "../common/Spinner";
import {config} from "../../config/Config";

export const submitPrefixRequest = (values) => {
  const requestBody = {
    apiVersion: "1.0",
    payload: {
      ...values,
      supportingReferences: values.supportingReferences.split(/\/r?\/n/),
      requester: {
        name: values.requesterName,
        email: values.requesterEmail
      }
    }
  };

  const fetch_options = {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify(requestBody)
  };

  // Make request and update the store.
  const requestUrl = `${config.registryApi}/${config.prefixRequestEndpoint}`;
  return fetch(requestUrl, fetch_options)
}

const PrefixRequestForm = (props) => {
  const {
    values, setValues,
    touched, errors, setTouched,
    handleSubmit, handleChange,
    isSubmitting, submitCount
  } = props;

  useEffect(() => {
    if (submitCount > 0) {
      const elem = document.querySelector('.is-invalid');
      elem && elem.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
    }

    const localHandleRorAutocomplete = handleRorAutocomplete(
      handleChange, errors,
      values, setValues,
      touched, setTouched
    )
    const rorIdInput = document.querySelector("#institutionRorId");
    rorIdInput.addEventListener('change', localHandleRorAutocomplete);
    return () => rorIdInput.removeEventListener('change', localHandleRorAutocomplete);
  });

  const [institutionIsProvider, setInstitutionIsProvider] = useState(false);

  return (
    <Form data-matomo-form="" data-matomo-name="cloud_login"
          className="form" autoComplete="off" onSubmit={handleSubmit}>
      <div className="card mb-3">
        <div className="card-header">
          <h2 className="mb-3"><i className="icon icon-common icon-leaf"/> Namespace Details</h2>
          <p className="text-muted">
            This section collects information related to the new ID space that is being requested,
            including its requested prefix, e.g.&nbsp;
            <span className="text-dark">pdb</span>,&nbsp;
            <span className="text-dark">uniprot</span> or&nbsp;
            <span className="text-dark">kegg.genes</span>.
          </p>
        </div>

        <div className="card-body">
          <RegistrationRequestField
            id="name"
            description="The name of the new ID space."
            example="Protein Data Bank"
            label="Namespace Name"
            type="text"
            errors={errors}
            touched={touched}
          />

          <RegistrationRequestField
            id="description"
            description="Short description of the ID space in one or multiple sentences."
            example="The Protein Data Bank is the single worldwide archive of structural
                        data of biological macromolecules"
            label="Description"
            rows="5"
            type="textarea"
            errors={errors}
            touched={touched}
          />

          <RegistrationRequestField
            id="requestedPrefix"
            description="Character string meant to precede the colon in resolved identifiers. No spaces or
                        punctuation, only lowercase alphanumerical characters, underscores and dots."
            example="pdb"
            label="Requested Prefix"
            type="text"
            errors={errors}
            touched={touched}
          />

          <RegistrationRequestField
            id="sampleId"
            description="An example local identifier."
            example="2gc4"
            label="Sample Id"
            type="text"
            errors={errors}
            touched={touched}
          />

          <RegistrationRequestField
            id="idRegexPattern"
            description="A regular expression definition of the IDs in this namespace."
            example="^[0-9][A-Za-z0-9]{3}$"
            label="Regex pattern"
            type="text"
            errors={errors}
            touched={touched}
          />

          <RegistrationRequestField
            id="supportingReferences"
            description="Supporting references (URLs, citations), if any, to published work describing the resource.
                        Enter one per line."
            example="https://doi.org/10.1093/nar/28.1.235"
            label="Supporting references"
            rows="5"
            type="textarea"
            errors={errors}
            touched={touched}
          />

          <RegistrationRequestField
            id="additionalInformation"
            description="Anything else you wish to tell or ask us."
            label="Additional information"
            required={false}
            rows="5"
            type="textarea"
            errors={errors}
            touched={touched}
          />
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h2 className="mb-2"><i className="icon icon-common icon-sitemap"/> Institution details</h2>
          <p>
            This section of the form collects the information of the institution that runs the first provider being
            registered
            in the new namespace being requested. Examples are EMBL-EBI, Kyoto University
            or NCBI.
          </p>
        </div>

        <div className="card-body">
          <RegistrationRequestField
            id="institutionRorId"
            description="The ROR ID of the organization."
            example={<a href="https://ror.org/02catss52" target="_blank">https://ror.org/02catss52</a>}
            label="ROR ID"
            type="text"
            errors={errors}
            touched={touched}
          />

          <RegistrationRequestField
            id="institutionName"
            description="The name of the institution that runs the provider."
            example="European Bioinformatics Institute, Hinxton, Cambridge, UK"
            label="Name"
            type="text"
            errors={errors}
            touched={touched}
          />

          <RegistrationRequestField
            id="institutionDescription"
            description="Short description of the institution in one or multiple sentences."
            example="The European Bioinformatics Institute (EMBL-EBI) is the part of EMBL
                        dedicated to big data and online services"
            label="Description"
            rows="5"
            type="textarea"
            errors={errors}
            touched={touched}
          />

          <RegistrationRequestField
            id="institutionHomeUrl"
            description="A valid URL for the homepage of the institution."
            example={<a href="https://www.ebi.ac.uk/" target="_blank">https://www.ebi.ac.uk/</a>}
            label="Home URL"
            type="text"
            errors={errors}
            touched={touched}
          />

          <RegistrationRequestField
            id="institutionLocation"
            description="The home country of the institution."
            label="Location"
            optionlabelfield="countryName"
            optionsfield="locations"
            options={props.locationList}
            type="select"
            errors={errors}
            touched={touched}
          />
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h2 className="mb-2"><i className="icon icon-common icon-cube"/> Provider details</h2>
          <p>
            This section collects information related to the first provider being registered in this new namespace.
          </p>
        </div>

        <div className="card-body">
          <div className="form-group row">
            <label
              className="col-lg-3 col-form-label form-control-label"
              htmlFor="institutionIsProvider"
            >
              Copy Institution details
            </label>
            <div className="col col-lg-9">
              <div className="form-check">
                <input
                  className="form-check-input"
                  defaultChecked={institutionIsProvider}
                  onChange={handleInstitutionIsProviderChange(values, setValues, setInstitutionIsProvider)}
                  type="checkbox"
                />
                <label
                  id="institutionIsProvider-helpblock"
                  className="form-text"
                  htmlFor="institutionIsProvider"
                >
                  Tick this box to copy the details provided for the owning institution of the provider. Please,
                  keep in mind that 'URL Pattern' and 'Provider code' will need to be filled after the autofill.
                </label>
              </div>
            </div>
          </div>

          <RegistrationRequestField
            id="providerName"
            description="The name of the provider."
            disabled={institutionIsProvider}
            example="ChEBI (Chemical Entities of Biological Interest)"
            label="Name"
            type="text"
            errors={errors}
            touched={touched}
          />

          <RegistrationRequestField
            id="providerDescription"
            description="Short description of the provider in one or multiple sentences."
            disabled={institutionIsProvider}
            example="ChEBI (Chemical Entities of Biological Interest) at EMBL-EBI"
            label="Description"
            rows="5"
            type="textarea"
            errors={errors}
            touched={touched}
          />

          <RegistrationRequestField
            id="providerHomeUrl"
            description="URL for a home page that describes the role of the provider in the current namespace."
            disabled={institutionIsProvider}
            example="https://www.pdbe.org/"
            label="Home URL"
            type="text"
            errors={errors}
            touched={touched}
          />

          <RegistrationRequestField
            id="providerLocation"
            description="The location from which the provider is offering its services (main location in case of multiple ones)."
            disabled={institutionIsProvider}
            label="Location"
            optionlabelfield="countryName"
            optionsfield="locations"
            options={props.locationList}
            type="select"
            errors={errors}
            touched={touched}
          />

          <RegistrationRequestField
            id="providerCode"
            description="This is a unique identifier for the provider within the namespace, for forced resolution requests. No
                        spaces or punctuation, only lowercase alphanumerical characters, underscores and dots."
            example="pdb"
            label="Provider code"
            type="text"
            errors={errors}
            touched={touched}
          />

          <RegistrationRequestField
            id="providerUrlPattern"
            description="A URL-like string specifying a rule for resolving this identifier. The rule should
                        contain the key &#34;{$id}&#34;, which acts as a placeholder for the resolution services."
            example="https://www.ebi.ac.uk/pdbe/entry/pdb/{$id}"
            label="URL Pattern"
            type="text"
            errors={errors}
            touched={touched}
          />

          <RegistrationRequestField
            id="protectedUrls"
            description="Do links require users to authenticate to access information?"
            label="Are links protected?"
            type="checkbox"
            errors={errors}
            touched={touched}
          />

          {values.protectedUrls && <>
            <RegistrationRequestField
              id="authHelpDescription"
              description="A short text describing the need for authentication and how to authenticate.
                           This should be a little paragraph to give some information to users.
                           The URL bellow should be where users find further details."
              label="Authentication description"
              type="textarea"
              disabled={!values.protectedUrls}
              errors={errors}
              touched={touched}
            />

            <RegistrationRequestField
              id="authHelpUrl"
              description="URL for users to get details on how to authenticate to access resource"
              label="Authentication details URL"
              type="text"
              disabled={!values.protectedUrls}
              errors={errors}
              touched={touched}
            />
          </>}
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h2 className="mb-2"><i className="icon icon-common icon-user"/> Requester details</h2>
          <p>
            Contact details associated with this prefix registration request for identifiers.org curator team to reach out
            if needed, for both resolution of this request and future updates to the namespace information and/ or the
            first registered provider.
          </p>
        </div>

        <div className="card-body">
          <RegistrationRequestField
            id="requesterName"
            description="The full name of the person making this request."
            field="requesterName"
            label="Full name"
            type="text"
            errors={errors}
            touched={touched}
          />

          <RegistrationRequestField
            id="requesterEmail"
            description="The email address of the person making this request."
            field="requesterEmail"
            label="Email"
            type="text"
            errors={errors}
            touched={touched}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row">
            {isSubmitting ? <center className="col-12"><Spinner noText/></center> :
              <>
                <div className="col-12 col-lg-6 mb-1">
                  <button className="form-control btn btn-primary" type="submit">
                    Submit prefix request
                  </button>
                </div>
                <div className="col-sm-12 col-md-6 col-lg-3 mb-1">
                  <SaveFormButton />
                </div>
                <div className="col-sm-12 col-md-6 col-lg-3 mb-1">
                  <LoadFormButton />
                </div>
              </>
            }
          </div>
        </div>
      </div>
    </Form>
  )
}

const mapStateToProps = (state) => ({
  locationList: state.locationList
});

export default connect(mapStateToProps)(PrefixRequestForm);