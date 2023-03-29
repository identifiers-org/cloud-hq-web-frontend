import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import { withFormik } from 'formik';
import { useMatomo } from '@jonkoops/matomo-tracker-react';

import PrefixRegistrationRequestSchema, { PrefixRequestInitialValues } from '../RegistrationPages/PrefixRegistrationRequestSchema';
import PageTitle from "../common/PageTitle";
import RegistrationRequestField from "../RegistrationPages/RegistrationRequestField";
import Spinner from "../common/Spinner";


const PrefixRegistrationRequestPage = (props) => {
  const { trackPageView } = useMatomo();
  useEffect(() => {
    trackPageView();
  })

  const {
    handleChange,
    handleSubmit, handleReset,
    setValues, values,
    isSubmitting
  } = props;

  console.log(values)

  const [institutionIsProvider, setInstitutionIsProvider] = useState(false);
  const handleInstitutionIsProviderChange = (event) => {
    const source = event.target.checked ? values : PrefixRequestInitialValues;
    setValues({
      ...values,
      providerName: source.institutionName,
      providerDescription: source.institutionDescription,
      providerHomeUrl: source.institutionHomeUrl,
      providerLocation: source.institutionLocation
    }, false);
    setInstitutionIsProvider(event.target.checked);
  }

  const [institutionFieldDisabled, setInstitutionFieldDisabled] = useState(false);
  const handleRorAutocomplete = (event) => {
    // TODO get values from ROR endpoint
    setInstitutionFieldDisabled(false)
    handleChange(event);
  };


  return (
    <>
      <PageTitle
        icon="icon-list"
        title="Request prefix form"
        description="Please complete this form to register an identifier prefix that can be recognized by the meta-resolvers at identifiers.org and n2t.net. Completing all fields will enable a swift processing of your request."
      />

      <div className="container py-3">
        <div className="row">
          <div className="mx-auto col-sm-12 col-lg-10">
            <form data-matomo-form="" data-matomo-name="cloud_login"
                  className="form" autoComplete="off"  onSubmit={handleSubmit}>
              <div className="card mb-3">
                <div className="card-header">
                  <h2 className="mb-3"><i className="icon icon-common icon-leaf" /> Namespace Details</h2>
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
                    formsection="Prefix details"
                    label="Namespace Name"
                    registrationType="PREFIX"
                    required={true}
                    type="text"
                  />

                  <RegistrationRequestField
                    id="description"
                    description="Short description of the ID space in one or multiple sentences."
                    example="The Protein Data Bank is the single worldwide archive of structural
                      data of biological macromolecules"
                    formsection="Prefix details"
                    label="Description"
                    registrationType="PREFIX"
                    required={true}
                    rows="5"
                    type="textarea"
                  />

                  <RegistrationRequestField
                    id="requestedPrefix"
                    description="Character string meant to precede the colon in resolved identifiers. No spaces or
                      punctuation, only lowercase alphanumerical characters, underscores and dots."
                    example="pdb"
                    formsection="Prefix details"
                    label="Requested Prefix"
                    registrationType="PREFIX"
                    required={true}
                    type="text"
                  />

                  <RegistrationRequestField
                    id="sampleId"
                    description="An example local identifier."
                    example="2gc4"
                    formsection="Prefix details"
                    label="Sample Id"
                    registrationType="PREFIX"
                    required={true}
                    type="text"
                  />

                  <RegistrationRequestField
                    id="idRegexPattern"
                    description="A regular expression definition of the IDs in this namespace."
                    example="^[0-9][A-Za-z0-9]{3}$"
                    formsection="Prefix details"
                    label="Regex pattern"
                    registrationType="PREFIX"
                    required={true}
                    type="text"
                  />

                  <RegistrationRequestField
                    id="supportingReferences"
                    description="Supporting references (URLs, citations), if any, to published work describing the resource.
                      Enter one per line."
                    example="https://doi.org/10.1093/nar/28.1.235"
                    formsection="Prefix details"
                    label="Supporting references"
                    registrationType="PREFIX"
                    required={false}
                    rows="5"
                    splitByLines={true}
                    type="textarea"
                  />

                  <RegistrationRequestField
                    id="additionalInformation"
                    description="Anything else you wish to tell or ask us."
                    formsection="Prefix details"
                    label="Additional information"
                    registrationType="PREFIX"
                    required={false}
                    rows="5"
                    type="textarea"
                  />
                </div>
              </div>

              <div className="card mb-3">
                <div className="card-header">
                  <h2 className="mb-2"><i className="icon icon-common icon-sitemap" /> Institution details</h2>
                  <p>
                    This section of the form collects the information of the institution that runs the first provider being registered
                    in the new namespace being requested. Examples are EMBL-EBI, Kyoto University
                    or NCBI.
                  </p>
                </div>

                <div className="card-body">
                  <RegistrationRequestField
                    id="institutionName"
                    description="The name of the institution that runs the provider."
                    disabled={institutionFieldDisabled}
                    formsection="Institution details"
                    example="European Bioinformatics Institute, Hinxton, Cambridge, UK"
                    label="Name"
                    registrationType="PREFIX"
                    required={true}
                    type="text"
                  />

                  <RegistrationRequestField
                    id="institutionDescription"
                    description="Short description of the institution in one or multiple sentences."
                    disabled={institutionFieldDisabled}
                    example="The European Bioinformatics Institute (EMBL-EBI) is the part of EMBL
                      dedicated to big data and online services"
                    formsection="Institution details"
                    label="Description"
                    registrationType="PREFIX"
                    required={true}
                    rows="5"
                    type="textarea"
                  />

                  <RegistrationRequestField
                    id="institutionHomeUrl"
                    description="A valid URL for the homepage of the institution."
                    disabled={institutionFieldDisabled}
                    example="https://www.ebi.ac.uk/"
                    formsection="Institution details"
                    label="Home URL"
                    registrationType="PREFIX"
                    required={true}
                    type="text"
                  />

                  <RegistrationRequestField
                    id="institutionLocation"
                    description="The home country of the institution."
                    disabled={institutionFieldDisabled}
                    formsection="Institution details"
                    label="Location"
                    optionlabelfield="countryName"
                    optionsfield="locations"
                    options={props.locationList}
                    registrationType="PREFIX"
                    required={true}
                    type="select"
                  />

                  <RegistrationRequestField
                    id="institutionRorId"
                    description="The ROR ID of the organization"
                    disabled={false}
                    formsection="Institution details"
                    label="ROR ID"
                    registrationType="PREFIX"
                    required={false}
                    type="text"
                    onChange={handleRorAutocomplete}
                  />
                </div>
              </div>

              <div className="card mb-3">
                <div className="card-header">
                  <h2 className="mb-2"><i className="icon icon-common icon-cube" /> Provider details</h2>
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
                          onChange={handleInstitutionIsProviderChange}
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
                    formsection="Provider details"
                    label="Name"
                    registrationType="PREFIX"
                    required={true}
                    type="text"
                  />

                  <RegistrationRequestField
                    id="providerDescription"
                    description="Short description of the provider in one or multiple sentences."
                    disabled={institutionIsProvider}
                    example="ChEBI (Chemical Entities of Biological Interest) at EMBL-EBI"
                    formsection="Provider details"
                    label="Description"
                    registrationType="PREFIX"
                    required={true}
                    rows="5"
                    type="textarea"
                  />

                  <RegistrationRequestField
                    id="providerHomeUrl"
                    description="URL for a home page that describes the role of the provider in the current namespace."
                    disabled={institutionIsProvider}
                    example="https://www.pdbe.org/"
                    formsection="Provider details"
                    label="Home URL"
                    registrationType="PREFIX"
                    required={true}
                    rows="5"
                    type="text"
                  />

                  <RegistrationRequestField
                    id="providerCode"
                    description="This is a unique identifier for the provider within the namespace, for forced resolution requests. No
                      spaces or punctuation, only lowercase alphanumerical characters, underscores and dots."
                    example="pdb"
                    formsection="Provider details"
                    label="Provider code"
                    registrationType="PREFIX"
                    required={true}
                    type="text"
                  />

                  <RegistrationRequestField
                    id="providerUrlPattern"
                    description="A URL-like string specifying a rule for resolving this identifier. The rule should
                      contain the key &#34;{$id}&#34;, which acts as a placeholder for the resolution services."
                    example="https://www.ebi.ac.uk/pdbe/entry/pdb/{$id}"
                    formsection="Provider details"
                    label="URL Pattern"
                    registrationType="PREFIX"
                    required={true}
                    type="text"
                  />

                  <RegistrationRequestField
                    id="providerLocation"
                    description="The location from which the provider is offering its services (main location in case of multiple ones)."
                    disabled={institutionIsProvider}
                    formsection="Provider details"
                    label="Location"
                    optionlabelfield="countryName"
                    optionsfield="locations"
                    options={props.locationList}
                    registrationType="PREFIX"
                    required={true}
                    type="select"
                  />
                </div>
              </div>

              <div className="card mb-3">
                <div className="card-header">
                  <h2 className="mb-2"><i className="icon icon-common icon-user" /> Requester details</h2>
                  <p>
                    Contact details associated with this prefix registration request for identifiers.org curator team to reach out
                     if needed, for both resolution of this request and future updates to the namespace information and/  or the
                     first registered provider.
                  </p>
                </div>

                <div className="card-body">
                  <RegistrationRequestField
                    id="requesterName"
                    description="The full name of the person making this request."
                    field="requesterName"
                    formsection="Requester details"
                    label="Full name"
                    registrationType="PREFIX"
                    required={true}
                    type="text"
                  />

                  <RegistrationRequestField
                    id="requesterEmail"
                    description="The email address of the person making this request."
                    field="requesterEmail"
                    formsection="Requester details"
                    label="Email"
                    registrationType="PREFIX"
                    required={true}
                    type="text"
                  />
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="row">
                    { isSubmitting ? <Spinner noText noCenter /> :
                      <>
                        <div className="col-12 mb-1">
                          <button className="form-control btn btn-primary" type="submit">
                            Submit prefix request
                          </button>
                        </div>
                        <div className="col-sm-12 col-md  -4 mb-1">
                          <button className="form-control btn btn-secondary" onClick={handleReset}>
                            Reset form
                          </button>
                        </div>
                        <div className="col-sm-12 col-md-4 mb-1">
                          <button className="form-control btn btn-secondary">Save contents</button>
                        </div>
                        <div className="col-sm-12 col-md-4 mb-1">
                          <button className="form-control btn btn-secondary">Load previous save</button>
                        </div>
                      </>
                    }
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

const FormWithFormik = withFormik({
  initialValues: PrefixRequestInitialValues,
  enableReinitialize : true,
  validationSchema: PrefixRegistrationRequestSchema,
  handleSubmit: async (values) => console.log(values),
  validateOnChange: true,
  validateOnBlur: true,
  displayName: "PrefixRegistrationForm"
})(PrefixRegistrationRequestPage);

const mapStateToProps = (state) => ({
  locationList: state.locationList
});

export default connect(mapStateToProps)(FormWithFormik);