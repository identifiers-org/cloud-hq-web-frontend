import React from 'react';
import { connect } from 'react-redux'

import Swal from 'sweetalert2';

// Actions.
import { setValidation, reset, setRegistrationRequestFieldField, resetValidityStatus } from '../../actions/RegistrationRequestField';
import { getInstitutionFromRegistry } from '../../actions/InstitutionList';

// Config.
import { config } from '../../config/Config';

// Components.
import PageTitle from '../common/PageTitle';
import RequestField from '../common/RegistrationRequestField';
import RORIDInput from '../common/RORIDInput';


/* TODO: This class has to be completely refactored.
 *
 *  - Use validation logic implemented in prefix registration request field reducer
 *    ( Take care about validation requirements ).
 *  - Take UI state to that reducer.
 *  - Streamline and reduce size if possible.
 */
class PrefixRegistrationRequestPage extends React.Component  {
  constructor(props) {
    super(props);

    this.state = {
      institutionIsProvider: false,
      institutionSelect: config.enableRegistrationRequestInstitutionDropdownSelection ? true : false,
      institutionEnterRORID: false,
      institutionCreate: config.enableRegistrationRequestInstitutionDropdownSelection ? false : true,
      institutionSelected: '',
      institutionRORID: '',
      institutionRORIDId: 0,
      valid: false,
      invalidFields: [],
      fields: [
        'name', 'description', 'requestedPrefix', 'sampleId', 'idRegexPattern', 'supportingReferences', 'additionalInformation',
        'institutionName', 'institutionDescription', 'institutionHomeUrl', 'institutionLocation',
        'providerName', 'providerDescription', 'providerCode', 'providerHomeUrl', 'providerUrlPattern', 'providerLocation',
        'requesterName', 'requesterEmail'
      ],
      optionalFields: ['supportingReferences', 'additionalInformation'],
      speacialPayloads: [
        {requester: this.createRequesterPayload}
      ],
      submitted: false,
      result: undefined
    }

    this.initForm();
  }


  //
  // Form init method. Configures validation status of fields.
  //
  initForm = () => {
    // Fields that should be NOT validated right away.
    this.props.setValidation('sampleId', false);

    // Fields that should never be validated.
    this.props.setValidation('supportingReferences', false);
    this.props.setValidation('additionalInformation', false);
  }

  //
  // Form update method.
  //
  updateForm = async (newProps) => {
    // Do not update submitted forms.
    if (this.submitted) {
      return;
    }

    // Validate idRegenPattern if it is not empty if sampleId has changed.
    if (!this.fieldIsEmpty('idRegexPattern', newProps) && this.fieldHasChanged('sampleId', newProps)) {
      await this.props.validate('idRegexPattern');
    }

    // Validate sampleId if it is not empty and providerUrlPattern has changed.
    if (!this.fieldIsEmpty('sampleId', newProps) && this.fieldHasChanged('providerUrlPattern', newProps)) {
      await this.props.validate('sampleId');
    }

    // Enable validation of sampleId only when providerUrlPattern is not empty.
    this.changeValidity('sampleId', !this.fieldIsEmpty('providerUrlPattern', newProps));

    // Propagate changes and validate for disabled provider fields if institutionIsProvider.
    if (this.state.institutionIsProvider && this.fieldHasChanged('institutionName', newProps)) {
      await this.props.setValue('providerName', newProps.institutionName.value);
      if (newProps.institutionName.value !== '') {
        await this.props.validate('providerName');
      }
    }

    if (this.state.institutionIsProvider && this.fieldHasChanged('institutionDescription', newProps)) {
      await this.props.setValue('providerDescription', newProps.institutionDescription.value);
      if (newProps.institutionDescription.value !== '') {
        await this.props.validate('providerDescription');
      }
    }

    if (this.state.institutionIsProvider && this.fieldHasChanged('institutionHomeUrl', newProps)) {
      await this.props.setValue('providerHomeUrl', newProps.institutionHomeUrl.value);
      if (newProps.institutionHomeUrl.value !== '') {
        await this.props.validate('providerHomeUrl');
      }
    }

    if (this.state.institutionIsProvider && this.fieldHasChanged('institutionLocation', newProps)) {
      await this.props.setValue('providerLocation', newProps.institutionLocation.value);
      if (newProps.institutionLocation.value !== '') {
        await this.props.validate('providerLocation');
      }
    }

    // Calculate validity of the whole form.
    const invalidFields = this.getInvalidFields();
    const valid = invalidFields.length === 0;

    if (valid !== this.state.valid || invalidFields !== this.state.invalidFields) {
      this.setState({valid, invalidFields});
    }
  }

  // Form update helpers: checks if a field has changed / is empty.
  fieldHasChanged = (field, newProps) => this.props[field].value !== newProps[field].value;
  fieldIsEmpty = (field, newProps) => this.props[field].value.length === 0 && newProps[field].value.length === 0;
  changeValidity = (field, validity) => this.props[field].shouldValidate !== validity ? this.props.setValidation(field, validity) : undefined;


  // Form update hook. Will update anytime new props are received.
  componentDidUpdate = (prevProps) => {
    const { state: { fields }, updateForm } = this;

    // Update form if a field changed.
    fields.forEach(field => {
      if (this.props[field] !== prevProps[field]) {
        updateForm(this.props);
      }
    });
  }


  //
  // Form validity checker. Will check required fields validity value, and return those that are invalid.
  //
  getInvalidFields() {
    const fieldsToCheck = this.state.fields.filter(f => !this.state.optionalFields.includes(f));

    return fieldsToCheck.filter(f => this.props[f].valid !== true);
  }


  // Institution is provider check handler. Will copy values from institution to provider fields, enable validation and
  // request a validation.
  handleInstitutionIsProvider = (event) => {
    const institutionIsProvider = event.target.checked;

    this.setState({institutionIsProvider});

    if (institutionIsProvider) {
      this.props.setValue('providerName', this.props.institutionName.value);
      this.props.setValidation('providerName', true);
      this.props.validate('providerName');
      this.props.setValue('providerDescription', this.props.institutionDescription.value);
      this.props.setValidation('providerDescription', true);
      this.props.validate('providerDescription');
      this.props.setValue('providerHomeUrl', this.props.institutionHomeUrl.value);
      this.props.setValidation('providerHomeUrl', true);
      this.props.validate('providerHomeUrl');
      this.props.setValue('providerLocation', this.props.institutionLocation.value);
      this.props.setValidation('providerLocation', true);
      this.props.validate('providerLocation');
    }
  }


  // TODO: This should be an action.
  // Handle submit of the form. Supposedly, all fields are valid, as validators would disable this otherwise.
  // But still, some error cases must be treated.
  handleSubmit = () => {
    this.setState({submitted: true}, async () => {
      let body = {
        apiVersion: config.apiVersion,
        payload: this.state.fields.reduce((o, f) => {
          o[f] = this.props[f].value;
          return o;
        }, {})
      };

      // Fix for location not using hateoas link.
      body.payload.institutionLocation = body.payload.institutionLocation.split('/').pop();
      body.payload.providerLocation = body.payload.providerLocation.split('/').pop();

      // Add special payloads.
      this.state.speacialPayloads.forEach(sp => {
        Object.keys(sp).forEach(k => {
          body.payload = {
            ...body.payload,
            ...sp[k]()
          };
        })
      });

      // Add ror id.
      if (this.state.institutionEnterRORID) {
        body.payload['institutionRorId'] = this.state.institutionRORID;
      }

      const init = {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(body)
      };

      // Make request and update the store.
      const requestUrl = `${config.registryApi}/${config.prefixRequestEndpoint}`;
      const response = await fetch(requestUrl, init);
      const responseStatusCode = response.status;
      const json = await response.json();
      const res = { valid: responseStatusCode === 200, errorMessage: json.errorMessage };

      if (res.valid) {
        // Scroll to top.
        window.scrollTo(0, 0);

        // Empty form.
        this.state.fields.forEach(id => {
          this.props.reset(id);
        });

        this.setState({ valid: false, submitted: false });

        await Swal.fire({
          title: 'Prefix registration request sent',
          text: 'Thank you. We will contact you shortly with more information about your request.',
          type: 'success'
        });

        this.props.history.push('/');
      }
      else {
        this.setState({ submitted: false });
        Swal.fire({
          title: 'Error',
          text: 'Please, try again later. The form contents will be saved until you navigate away from identifiers.org.',
          type: 'error'
        });
      }
    });
  };

  // Custom requester payload creation (for validation and submittal).
  createRequesterPayload = () => {
    return {
      requester: {
        name: this.props.requesterName.value,
        email: this.props.requesterEmail.value
      }
    };
  };


  //
  // Helper functions for institution fields.
  //
  // Set institution fields given an institution.
  setInstitutionFields = institution => {
    const { setValue, setValidation, validate } = this.props;

    // Fixes countryCode coming from a ROR ID.

    setValue('institutionName', institution.name);
    setValidation('institutionName', true);
    validate('institutionName');
    setValue('institutionDescription', institution.description);
    setValidation('institutionDescription', true);
    validate('institutionDescription');
    setValue('institutionHomeUrl', institution.homeUrl);
    setValidation('institutionHomeUrl', true);
    validate('institutionHomeUrl');
    setValue('institutionLocation', institution.location.id || institution.location.countryCode);
    setValidation('institutionLocation', true);
    validate('institutionLocation');
  }

  // Reset institution fields.
  resetInstitutionFieldsValidityStatus = () => {
    const { setValue, resetValidityStatus } = this.props;
    setValue('institutionName', '');
    resetValidityStatus('institutionName');
    setValue('institutionDescription', '');
    resetValidityStatus('institutionDescription');
    setValue('institutionHomeUrl', '');
    resetValidityStatus('institutionHomeUrl');
    setValue('institutionLocation', '');
    resetValidityStatus('institutionLocation');
  };


  //
  // Handlers for institution fields.
  //
  handleSelectInstitution = async e => {
    const { getInstitutionFromRegistry } = this.props;
    const institutionId = e.target.value;
    const institution = await getInstitutionFromRegistry(institutionId);

    this.setState({institutionSelected: institutionId});
    this.setInstitutionFields(institution);
  };

  handleClickCreateInstitutionRadio = () => {
    this.setState({
    institutionCreate: true,
    institutionEnterRORID: false,
    institutionSelect: false,
    institutionSelected: '',
    institutionRORID: ''
  });
    this.resetInstitutionFieldsValidityStatus();
  };

  handleClickSelectInstitutionRadio = () => {
    this.setState({
      institutionCreate: false,
      institutionEnterRORID: false,
      institutionSelect: true,
      institutionRORID: ''
    });
    this.resetInstitutionFieldsValidityStatus();
  };

  handleClickEnterRORIDInstitutionRadio = () => {
    this.setState({
      institutionCreate: false,
      institutionEnterRORID: true,
      institutionSelect: false,
      institutionSelected: ''
    });
    this.resetInstitutionFieldsValidityStatus();
  };

  handleChangeInstutionRORID = e => {
    const institutionRORID = e.target.value;

    this.setState({institutionRORID});
  };

  handleInstutionRORIDFound = institution => {
    if (institution) {
      this.setState({institutionRODIDId: institution.id});
      this.setInstitutionFields(institution);
    }
  };


  render() {
    const validationUrlBase = `${config.registryApi}/${config.prefixRegistrationRequestValidationEndpoint}/`;
    const requestPrefixFormDescription = (
      <span>Please complete this form to register an identifier prefix that can be recognized by the meta-resolvers at <a href="https://identifiers.org">identifiers.org</a> and <a href="http://n2t.net">n2t.net</a>. Completing all fields will enable a swift processing of your request.</span>
      );
    const {
      handleClickCreateInstitutionRadio,
      handleChangeInstutionRORID,
      handleClickEnterRORIDInstitutionRadio,
      handleClickSelectInstitutionRadio,
      handleInstutionRORIDFound,
      handleSelectInstitution,
      props: {
        institutionList,
        locationList
      },
      state: {
        institutionSelect,
        institutionEnterRORID,
        institutionCreate,
        institutionIsProvider,
        institutionSelected,
        institutionRORID,
        institutionRORIDId,
        valid,
        invalidFields
      }
    } = this;

    const institutionFieldDisabled = (institutionEnterRORID && institutionRORIDId !== 0) || (institutionSelect) ? true : false;

    return (
      <>
        <PageTitle
          icon="icon-list"
          title="Request prefix form"
          description={requestPrefixFormDescription}
        />

        <div className="container py-3">
          <div className="row">
            <div className="mx-auto col-sm-12 col-lg-10">
              <div className="form" role="form" autoComplete="off">
                <div className="card mb-3">
                  <div className="card-header">
                    <h2 className="mb-3"><i className="icon icon-common icon-leaf" /> Namespace Details</h2>
                    <p className="text-muted">
                      This section collects information related to the new ID space that is being requested, including its requested prefix, e.g. <span className="text-dark">pdb</span>,
                      <span className="text-dark"> uniprot </span> or <span className="text-dark">kegg.genes</span>.
                    </p>
                  </div>

                  <div className="card-body">
                    <RequestField
                      id="name"
                      description="The name of the new ID space."
                      example="Protein Data Bank"
                      formsection="Prefix details"
                      label="Namespace Name"
                      registrationType="PREFIX"
                      required={true}
                      type="text"
                      validationurl={validationUrlBase + 'validateName'}
                    />

                    <RequestField
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
                      validationurl={validationUrlBase + 'validateDescription'}
                    />

                    <RequestField
                      id="requestedPrefix"
                      description="Character string meant to precede the colon in resolved identifiers. No spaces or
                        punctuation, only lowercase alphanumerical characters, underscores and dots."
                      example="pdb"
                      formsection="Prefix details"
                      label="Requested Prefix"
                      registrationType="PREFIX"
                      required={true}
                      type="text"
                      validationurl={validationUrlBase + 'validateRequestedPrefix'}
                    />

                    <RequestField
                      id="sampleId"
                      description="An example local identifier."
                      example="2gc4"
                      formsection="Prefix details"
                      label="Sample Id"
                      registrationType="PREFIX"
                      required={true}
                      type="text"
                      validationfields={{providerUrlPattern: this.props.providerUrlPattern.value}}
                      validationtooltip={<span>Make sure you wrote <strong>http</strong> or <strong>https</strong> correctly in the <a href="#providerUrlPattern">provider URL pattern</a>.</span>}
                      validationurl={validationUrlBase + 'validateSampleId'}
                    />

                    <RequestField
                      id="idRegexPattern"
                      description="A regular expression definition of the IDs in this namespace."
                      example="^[0-9][A-Za-z0-9]{3}$"
                      formsection="Prefix details"
                      label="Regex pattern"
                      registrationType="PREFIX"
                      required={true}
                      type="text"
                      validationfields={{sampleId: this.props.sampleId.value}}
                      validationurl={validationUrlBase + 'validateIdRegexPattern'}
                    />

                    <RequestField
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

                    <RequestField
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

                    {config. enableRegistrationRequestInstitutionDropdownSelection && (
                      <div className="form-group row">
                        <div className="col col-lg-3 col-form-label">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="institution-radio"
                              id="selectinstitution-radio"
                              value="selectinstitution"
                              checked={institutionSelect}
                              onChange={handleClickSelectInstitutionRadio}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="selectinstitution-radio"
                            >
                              Select an existing institution
                            </label>
                          </div>
                        </div>

                        <div className="col col-lg-9">
                          <select
                            className="form-control"
                            id="institutiondropdown"
                            value={institutionSelected}
                            onChange={handleSelectInstitution}
                            disabled={!institutionSelect}
                          >
                            <option value="">{institutionSelect ? 'Select an institution...' : ''}</option>
                            {
                              institutionList.map(institution => (
                                <option
                                  value={institution.shortId}
                                  key={`institution-${institution.shortId}`}
                                >
                                  {institution.name}
                                </option>
                              ))
                            }
                          </select>
                        </div>
                      </div>
                    )}

                    {config.enableRegistrationRequestRORIDinstitutionSelection && (
                      <div className="form-group row">
                        <div className="col col-lg-3 col-form-label form-control-label">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="institution-radio"
                              id="enterroridinstitution-radio"
                              value="enterroridinstitution"
                              checked={institutionEnterRORID}
                              onChange={handleClickEnterRORIDInstitutionRadio}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="enterroridinstitution-radio"
                            >
                              Enter a <a href="https://ror.org/" target="_blank" rel="noopener noreferrer" tabIndex={-1}>ROR ID</a>
                            </label>
                          </div>
                        </div>
                        <div className="col col-log-9">
                          <RORIDInput
                            disabled={!institutionEnterRORID}
                            onChange={handleChangeInstutionRORID}
                            onInstitutionFound={handleInstutionRORIDFound}
                            value={institutionRORID}
                          />
                        </div>
                      </div>
                    )}

                    <div className="form-group row">
                      <div className="col col-lg-3 col-form-label">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="institution-radio"
                            id="createinstitution-radio"
                            checked={institutionCreate}
                            onChange={handleClickCreateInstitutionRadio}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="createinstitution-radio"
                          >
                            Create a new institution
                          </label>
                        </div>
                      </div>
                    </div>

                    <RequestField
                      id="institutionName"
                      description="The name of the organization that runs the provider."
                      disabled={institutionFieldDisabled}
                      formsection="Institution details"
                      example="European Bioinformatics Institute, Hinxton, Cambridge, UK"
                      label="Name"
                      registrationType="PREFIX"
                      required={true}
                      type="text"
                      validationurl={validationUrlBase + 'validateInstitutionName'}
                    />

                    <RequestField
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
                      validationurl={validationUrlBase + 'validateInstitutionDescription'}
                    />

                    <RequestField
                      id="institutionHomeUrl"
                      description="A valid URL for the homepage of the institution or organization."
                      disabled={institutionFieldDisabled}
                      example="https://www.ebi.ac.uk/"
                      formsection="Institution details"
                      label="Home URL"
                      registrationType="PREFIX"
                      required={true}
                      type="text"
                      validationurl={validationUrlBase + 'validateInstitutionHomeUrl'}
                    />

                    <RequestField
                      id="institutionLocation"
                      description="The home country of the institution or organization."
                      disabled={institutionFieldDisabled}
                      formsection="Institution details"
                      label="Location"
                      optionlabelfield="countryName"
                      optionsfield="locations"
                      options={locationList}
                      registrationType="PREFIX"
                      required={true}
                      type="select"
                      validationurl={validationUrlBase + 'validateInstitutionLocation'}
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
                            id="institutionIsProvider"
                            className="form-check-input"
                            defaultChecked={this.state.institutionIsProvider}
                            onChange={this.handleInstitutionIsProvider}
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

                    <RequestField
                      id="providerName"
                      description="The name of the provider."
                      disabled={institutionIsProvider}
                      example="ChEBI (Chemical Entities of Biological Interest)"
                      formsection="Provider details"
                      label="Name"
                      registrationType="PREFIX"
                      required={true}
                      type="text"
                      validationurl={validationUrlBase + 'validateProviderName'}
                    />

                    <RequestField
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
                      validationurl={validationUrlBase + 'validateProviderDescription'}
                    />

                    <RequestField
                      id="providerHomeUrl"
                      description="URL for a home page that describes the role of the provider in the current namespace."
                      disabled={institutionIsProvider}
                      example="http://www.pdbe.org/"
                      formsection="Provider details"
                      label="Home URL"
                      registrationType="PREFIX"
                      required={true}
                      rows="5"
                      type="text"
                      validationurl={validationUrlBase + 'validateProviderHomeUrl'}
                    />

                    <RequestField
                      id="providerCode"
                      description="This is a unique identifier for the provider within the namespace, for forced resolution requests. No
                        spaces or punctuation, only lowercase alphanumerical characters, underscores and dots."
                      example="pdb"
                      formsection="Provider details"
                      label="Provider code"
                      registrationType="PREFIX"
                      required={true}
                      type="text"
                      validationurl={validationUrlBase + 'validateProviderCode'}
                    />

                    <RequestField
                      id="providerUrlPattern"
                      description="A URL-like string specifying a rule for resolving this identifier. The rule should
                        contain the key &#34;{$id}&#34;, which acts as a placeholder for the resolution services."
                      example="http://www.ebi.ac.uk/pdbe/entry/pdb/{$id}"
                      formsection="Provider details"
                      label="URL Pattern"
                      registrationType="PREFIX"
                      required={true}
                      type="text"
                      validationurl={validationUrlBase + 'validateProviderUrlPattern'}
                    />

                    <RequestField
                      id="providerLocation"
                      description="The location from which the provider is offering its services (main location in case of multiple ones)."
                      disabled={institutionIsProvider}
                      formsection="Provider details"
                      label="Location"
                      optionlabelfield="countryName"
                      optionsfield="locations"
                      options={locationList}
                      registrationType="PREFIX"
                      required={true}
                      type="select"
                      validationurl={validationUrlBase + 'validateProviderLocation'}
                    />
                  </div>
                </div>

                <div className="card mb-3">
                  <div className="card-header">
                    <h2 className="mb-2"><i className="icon icon-common icon-user" /> Requester details</h2>
                    <p>
                      Contact details associated with this prefix registration request for identifiers.org curator team to reach out
                       if need it, for both resolution of this request and future updates to the namespace information and / or the 
                       first registered provider.
                    </p>
                  </div>

                  <div className="card-body">
                    <RequestField
                      id="requesterName"
                      description="The full name of the person making this request."
                      field="requesterName"
                      formsection="Requester details"
                      label="Full name"
                      registrationType="PREFIX"
                      required={true}
                      type="text"
                      validation={this.standardValidator}
                      validationfields={['requesterEmail']}
                      validationurl={validationUrlBase + 'validateRequesterName'}
                      customvalidationpayload={this.createRequesterPayload}
                    />

                    <RequestField
                      id="requesterEmail"
                      description="The email address of the person making this request."
                      field="requesterEmail"
                      formsection="Requester details"
                      label="Email"
                      registrationType="PREFIX"
                      required={true}
                      type="text"
                      validation={this.standardValidator}
                      validationfields={['requesterName']}
                      validationurl={validationUrlBase + 'validateRequesterEmail'}
                      customvalidationpayload={this.createRequesterPayload}
                      defaultValue="asdf"
                    />
                  </div>
                </div>

                <div className="card m-5">
                  <div className="card-header">
                    <h2 className="mb-2"><i className="icon icon-common icon-tasks" /> Request form status</h2>
                  </div>
                  <div className="card-body">
                    <>
                      {
                        valid ? (
                          <div className="row">
                            <div className="col">
                              <div className="d-flex align-items-center">
                                <h1 className="text-success mb-0 mr-1"><i className="icon icon-common icon-check" /></h1>
                                <span className="font-weight-bold">Request is complete and ready to send.</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="row">
                              <div className="col">
                                <div className="d-flex align-items-center">
                                  <h1 className="text-danger mb-0 mr-1"><i className="icon icon-common icon-times" /></h1>
                                  <span className="font-weight-bold">Request contains errors or empty required fields.</span>
                                </div>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col mx-5 mb-3">
                                <p className="mb-0">The following required fields are empty or contain errors:</p>
                                <span className="text-muted"><small>please fill or correct them before submitting the request</small></span>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col mx-5">
                                <div className="list-group mb-3 px-5">
                                  {
                                    invalidFields.map((field, i) => (
                                      <a
                                        className="list-group-item list-group-item-action list-group-item-danger py-1"
                                        href={`#${field}`}
                                        key={`invalidField-${field}-${i}`}
                                      >
                                        {
                                          this.props[field].label.map((label, i) => (
                                            <span key={`labelcontainer-${label}-${i}`}>
                                              <span key={`label-${label}-${i}`}>{label}</span>
                                              {
                                                i < this.props[field].label.length - 1 &&
                                                <i key={`label-${label}-${i}-arrow`} className="icon icon-common icon-caret-right mx-1" />
                                              }
                                            </span>
                                          ))
                                        }
                                      </a>
                                    ))
                                  }
                                </div>
                              </div>
                            </div>
                          </>
                        )
                      }
                      <button
                        className="form-control btn btn-primary"
                        disabled={!this.state.valid && !this.state.submitted}
                        onClick={this.handleSubmit}
                      >
                        Submit prefix request
                      </button>
                    </>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

// Mapping
const mapStateToProps = (state) => ({
  name: state.prefixRegistrationRequestForm.name,
  description: state.prefixRegistrationRequestForm.description,
  requestedPrefix: state.prefixRegistrationRequestForm.requestedPrefix,
  sampleId: state.prefixRegistrationRequestForm.sampleId,
  idRegexPattern: state.prefixRegistrationRequestForm.idRegexPattern,
  supportingReferences: state.prefixRegistrationRequestForm.supportingReferences,
  additionalInformation: state.prefixRegistrationRequestForm.additionalInformation,
  institutionList: state.institutionList,
  institutionName: state.prefixRegistrationRequestForm.institutionName,
  institutionDescription: state.prefixRegistrationRequestForm.institutionDescription,
  institutionHomeUrl: state.prefixRegistrationRequestForm.institutionHomeUrl,
  institutionLocation: state.prefixRegistrationRequestForm.institutionLocation,
  institutionIsProvider: state.prefixRegistrationRequestForm.institutionIsProvider,
  providerName: state.prefixRegistrationRequestForm.providerName,
  providerDescription: state.prefixRegistrationRequestForm.providerDescription,
  providerCode: state.prefixRegistrationRequestForm.providerCode,
  providerHomeUrl: state.prefixRegistrationRequestForm.providerHomeUrl,
  providerUrlPattern: state.prefixRegistrationRequestForm.providerUrlPattern,
  providerLocation: state.prefixRegistrationRequestForm.providerLocation,
  requesterName: state.prefixRegistrationRequestForm.requesterName,
  requesterEmail: state.prefixRegistrationRequestForm.requesterEmail,
  locationList: state.locationList
});

const mapDispatchToProps = (dispatch) => ({
  getInstitutionFromRegistry: (institutionId) => dispatch(getInstitutionFromRegistry(institutionId)),
  setValue: (id, value) => dispatch(setRegistrationRequestFieldField('PREFIX', id, 'value', value)),
  validate: (id) => dispatch(setRegistrationRequestFieldField('PREFIX', id, 'requestedValidate', true)),
  setValidation: (id, validation) => dispatch(setValidation('PREFIX', id, validation)),
  resetValidityStatus: (id) => dispatch(resetValidityStatus('PREFIX', id)),
  reset: (id) => dispatch(reset('PREFIX', id))
});

export default connect (mapStateToProps, mapDispatchToProps)(PrefixRegistrationRequestPage);
