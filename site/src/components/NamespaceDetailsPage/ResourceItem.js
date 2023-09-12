import React from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

// Actions.
import { getResourcesFromRegistry } from '../../actions/NamespaceList';
import {
  setResourcePatch,
  setResourcePatchField,
  patchResource,
  reactivateResource,
  deactivateResource
} from '../../actions/ResourcePatch';

// Components.
import ReversibleField from '../common/ReversibleField';
import RoleConditional from '../common/RoleConditional';

// Utils.
import { swalConfirmation, failureToast, successToast, infoToast } from '../../utils/swalDialogs';
import validators from '../../utils/validators';



class ResourceItem extends React.Component {
  constructor(props) {
    super(props);

    const params = new URLSearchParams(window.location.search);

    this.state = {
      editResource: params.get('editResource') === 'true' || false,
      reactivateResource: params.get('reactivateResource') === 'true' || false,
      resourceId: undefined,
      resourceFieldsChanged: new Set(),
      newResource: this.props.newResource
    }
  }


  async componentDidMount() {
    // Prepares model for resource patching.
    const { resource } = this.props;

    const newResource = {
      providerCode: resource.providerCode,
      description: resource.description,
      urlPattern: resource.urlPattern,
      institution: resource.institution._links.self.href,
      resourceHomeUrl: resource.resourceHomeUrl,
      location: resource.location._links.self.href,
      sampleId: resource.sampleId,
      official: resource.official
    }

    this.setState({resourceId: resource.id, newResource});
    this.props.setResourcePatch(resource.id, newResource);
  }


  //
  // Field manipulation handler. Undefined 'value' field will revert to default.
  //
  handleChangeField = (field, value) => {
    const { resource } = this.props;

    // Add/remove field to changed list if modified/reset, so it is validated or not when clicked on the perform
    // validation button.
    if (resource[field] !== value) {
      this.setState(prevState => ({
        resourceFieldsChanged: prevState.resourceFieldsChanged.add(field),
        newResource: {...this.state.newResource, [field]: value}
      }));
    } else {
      this.setState(prevState => {
        prevState.resourceFieldsChanged.delete(field);
        return {
          resourceFieldsChanged: prevState.resourceFieldsChanged,
          newResource: {...this.state.newResource, [field]: resource[field]}
        };
      });
    }

    this.props.setResourcePatchField(field, value);
  };


  handleClickAddInstitution = () => {
    this.props.navigate('/curation/#curation-institution');
  };


  handleClickCommitChangesButton = async () => {
    const {
      state: { editResource, newResource, resourceId, resourceFieldsChanged },
      props: { namespace, patchResource, reactivateResource }
    } = this;

    const dialogTitleCaption = editResource ? 'Confirm changes to resource' : reactivateResource ? 'Confirm reactivation' : undefined;
    const dialogTextCaption = editResource ? `Changed fields: ${[...resourceFieldsChanged].join(', ')}` : undefined;
    const buttonCaption = editResource ? 'edition' : reactivateResource ? 'reactivation' : undefined;


    if (editResource && resourceFieldsChanged.size === 0) {
      infoToast('No changes to commit');
      return;
    }

    const result = await swalConfirmation.fire({
      title: dialogTitleCaption,
      text: dialogTextCaption,
      confirmButtonText: `Commit ${buttonCaption}`,
      cancelButtonText: `Cancel ${buttonCaption}`
    });

    if (result.value) {
      const result = editResource ? await patchResource(resourceId, newResource) : reactivateResource ? await reactivateResource(resourceId, newResource) : undefined;

      if (result.status === 200) {
        successToast('Changes committed successfully');
        await this.props.getResourcesFromRegistry(namespace);
        this.setState({editResource: false, reactivateResource: false, resourceFieldsChanged: new Set()});
      } else {
        failureToast('Error committing changes');
      }
    }
  };

  handleClickDiscardChangesButton = async () => {
    if (this.state.resourceFieldsChanged.size === 0) {
      this.setState({editResource: false});
      return;
    }

    const result = await swalConfirmation.fire({
      title: 'Are you sure?',
      text: 'All data changed will be lost',
      confirmButtonText: 'Discard changes',
      cancelButtonText: 'Continue editing'
    });

    if (result.value) {
      this.setState({editResource: false, reactivateResource: false});
    }
  };

  handleClickDeactivateButton = async () => {
    const {
      state: { resourceId },
      props: { deactivateResource, namespace }
    } = this;

    const result = await swalConfirmation.fire({
      title: 'Confirm deactivation',
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    });

    if (result.value) {
      const result = await deactivateResource(resourceId);

      if (result.status === 200) {
        successToast('Resource deactivation successful');
        await this.props.getResourcesFromRegistry(namespace);
        this.setState({editResource: false, resourceFieldsChanged: new Set()});
      } else {
        failureToast('Error deactivating resource');
      }
    }
  };

  handleClickValidateChangesButton = async () => {
    const { newResource } = this.state;
    const resourceFieldsToValidate = [...this.state.resourceFieldsChanged];

    if (resourceFieldsToValidate.length === 0) {
      infoToast('No fields have changed');
      return;
    }

    const validations = await Promise.all(resourceFieldsToValidate
      .map(field => validators[field](newResource[field], newResource, 'resource'))
    );

    const toastMessage = validations
      .filter(validations => !validations.valid)
      .map(validations => validations.errorMessage).join('\n');

    if (toastMessage !== '') {
      failureToast(toastMessage, undefined, 10000);
    } else {
      successToast('All fields OK!');
    }
  }

  handleClickEditButton = () => {
    this.setState({editResource: true});
  };

  handleClickReactivateButton = async () => {
    this.setState({reactivateResource: true});
  };

  dateFormatter = Intl.DateTimeFormat("en-GB");
  dateFormat = (dateStr) => this.dateFormatter.format(new Date(dateStr))
  onlyDateFromIsoStr = (dateStr) => dateStr ? dateStr.substring(0,10) : dateStr

  render() {
    const {
      handleChangeField,
      handleClickAddInstitution,
      handleClickCommitChangesButton,
      handleClickDeactivateButton,
      handleClickDiscardChangesButton,
      handleClickEditButton,
      handleClickReactivateButton,
      handleClickValidateChangesButton,
      props: { institutionList, locationList, resource },
      state: { editResource, reactivateResource }
    } = this;

    const providerCodeLabel = resource.providerCode === 'CURATOR_REVIEW' ? 'Empty provider code' : resource.providerCode;
    const locationCountryCode = resource ? resource.location._links.self.href : undefined;
    const institutionId = resource ? resource.institution._links.self.href : undefined;

    const buttonCaption = editResource ? 'edition' : reactivateResource ? 'reactivation' : undefined;


    return (
      <>
        {editResource || reactivateResource ? (
          <div className="row">
            <div className="col">
            <RoleConditional
              requiredRoles={['editResource']}
            >
              <>
                <button
                  className="btn btn-sm btn-warning edit-button mb-1 mr-2 w-20"
                  onClick={handleClickValidateChangesButton}
                >
                  <i className="icon icon-common icon-tasks mr-1" />Perform validation
                </button>
                <button
                  className="btn btn-sm btn-success edit-button mb-1 mr-2 w-15"
                  onClick={handleClickCommitChangesButton}
                >
                  <i className="icon icon-common icon-check" /> {`Commit ${buttonCaption}`}
                </button>
                <button
                  className="btn btn-sm btn-danger edit-button mb-1 w-15"
                  onClick={handleClickDiscardChangesButton}
                >
                  <i className="icon icon-common icon-times" /> {`Discard ${buttonCaption}`}
                </button>
              </>
            </RoleConditional>
          </div>
        </div>
        ) : (
          <div className="row">
            <div className="col">
              <RoleConditional
                requiredRoles={['editResource']}
              >
                <>
                  <button
                    className="btn btn-sm btn-success edit-button mb-1 w-20"
                    onClick={handleClickEditButton}
                  >
                    <i className="icon icon-common icon-edit mr-1"/>Edit resource
                  </button>
                  {resource.deprecated ? (
                    <button
                      className="btn btn-sm btn-warning edit-button ml-2 mb-1 w-15"
                      onClick={handleClickReactivateButton}
                    >
                      {/* TODO: change to trash-restore when EBI adds it to EBI-Font-icons */}
                      <i className="icon icon-common icon-caret-square-up mr-1"/>Reactivate resource
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm btn-danger edit-button ml-2 mb-1 w-15"
                      onClick={handleClickDeactivateButton}
                    >
                      <i className="icon icon-common icon-trash mr-1"/>Deactivate resource
                    </button>
                  )}
                </>
              </RoleConditional>
            </div>
          </div>
        )}

        <div className="row">
          <div className="col overflow-y-scroll">
            <table className="table table-sm table-striped table-borderless">
              <tbody>
                <tr>
                  <td
                    rowSpan="16"
                    className={`w-20 align-middle ${resource.deprecated ? 'bg-danger text-white' : resource.official ? 'bg-warning' : 'bg-primary text-white'}`}
                  >
                    {resource.deprecated && (
                      <>
                        <p className="font-weight-bold text-center mb-0 lh-05">DEACTIVATED</p>
                        <p className="text-center mb-3"><small>on {moment(resource.deprecationDate).format('ll')}</small></p>
                      </>
                    )}
                    {editResource ? (
                      <RoleConditional
                        requiredRoles={['editResource']}
                        fallbackComponent={<p className="font-weight-bold text-center n-0">{providerCodeLabel}</p>}
                      >
                        <>
                          <p className="text-center font-weight-bold m-0">Provider code</p>
                          <ReversibleField fieldName="providerCode" defaultValue={resource.providerCode} handleChangeField={handleChangeField}>
                            <input type="text" />
                          </ReversibleField>
                          <p className="text-center font-weight-bold m-0">Primary</p>
                          <ReversibleField fieldName="official" defaultValue={resource.official} handleChangeField={handleChangeField}>
                            <input type="checkbox" className="form-check-input"/>
                          </ReversibleField>
                        </>
                      </RoleConditional>
                    ) : (
                      <p className="font-weight-bold text-center n-0">{providerCodeLabel}</p>
                    )}
                    <p className="text-center m-0">{resource.mirId}</p>
                    <p className="font-weight-bold text-center m-0">{resource.official ? 'Primary' : ''}</p>
                  </td>
                  <td className="w-20 px-3">Name</td>
                  <td className="resourceitem-table__wide">
                    {editResource ? (
                      <RoleConditional
                        requiredRoles={['editResource']}
                        fallbackComponent={resource.name}
                      >
                        <ReversibleField fieldName="name" defaultValue={resource.name} handleChangeField={handleChangeField}>
                          <input type="text" />
                        </ReversibleField>
                      </RoleConditional>
                    ) : (
                      resource.name
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="w-20 px-3">Description</td>
                  <td className="resourceitem-table__wide">
                    {editResource ? (
                      <RoleConditional
                        requiredRoles={['editResource']}
                        fallbackComponent={resource.description}
                      >
                        <ReversibleField fieldName="description" defaultValue={resource.description} handleChangeField={handleChangeField}>
                          <textarea rows="5" />
                        </ReversibleField>
                      </RoleConditional>
                    ) : (
                      resource.description
                    )}
                  </td>
                </tr>
                {resource.deprecated && ( <>
                  <tr>
                    <td className="w-20 px-3">Date of deactivation</td>
                    <td>{this.dateFormat(resource.deprecationDate)}</td>
                  </tr>
                  <tr>
                    <td className="w-20 px-3">Approximated expiration date</td>
                    <td>
                      {editResource ? (
                        <RoleConditional
                          requiredRoles={['editResource']}
                          fallbackComponent={resource.deprecationOfflineDate}
                        >
                          <ReversibleField fieldName="deprecationOfflineDate"
                                           defaultValue={this.onlyDateFromIsoStr(resource.deprecationOfflineDate)}
                                           handleChangeField={handleChangeField}>
                            <input type="date" />
                          </ReversibleField>
                        </RoleConditional>
                      ) : (
                        resource.deprecationOfflineDate ? this.dateFormat(resource.deprecationOfflineDate) : "Unknown"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-20 px-3">Deactivation statement</td>
                    <td>
                      {editResource ? (
                        <RoleConditional
                          requiredRoles={['editResource']}
                          fallbackComponent={resource.deprecationStatement}
                        >
                          <ReversibleField fieldName="deprecationStatement"
                                           defaultValue={resource.deprecationStatement}
                                           handleChangeField={handleChangeField}>
                            <input type="text" />
                          </ReversibleField>
                        </RoleConditional>
                      ) : (
                        resource.deprecationStatement || "Not provided"
                      )}
                    </td>
                  </tr>
                  <RoleConditional requiredRoles={['editResource']}>
                    <tr>
                      <td className="w-20 px-3">Deactivation landing page</td>
                      <td>
                        {editResource ? (
                          <ReversibleField fieldName="renderDeprecatedLanding"
                                           defaultValue={resource.renderDeprecatedLanding}
                                           handleChangeField={handleChangeField}>
                            <input type="checkbox" className="form-check-input" />
                          </ReversibleField>
                        ) : (
                          resource.renderDeprecatedLanding ? "Yes" : "No"
                        )}
                      </td>
                    </tr>
                  </RoleConditional>
                </>)}
                <tr>
                  <td className="px-3">URL Pattern</td>
                  <td>
                    {editResource || reactivateResource ? (
                      <RoleConditional
                        requiredRoles={['editResource']}
                        fallbackComponent={resource.urlPattern}
                      >
                        <ReversibleField fieldName="urlPattern"
                                         defaultValue={resource.urlPattern}
                                         handleChangeField={handleChangeField}>
                          <input type="text" />
                        </ReversibleField>
                      </RoleConditional>
                    ) : (
                      resource.urlPattern
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 align-middle">Home URL</td>
                  <td>
                  {editResource ? (
                      <RoleConditional
                        requiredRoles={['editResource']}
                        fallbackComponent={resource.resourceHomeUrl}
                      >
                        <ReversibleField fieldName="resourceHomeUrl" defaultValue={resource.resourceHomeUrl} handleChangeField={handleChangeField}>
                          <input type="text" />
                        </ReversibleField>
                      </RoleConditional>
                    ) : (
                      <a target='_blank' href={resource.resourceHomeUrl}>{resource.resourceHomeUrl}</a>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-3">Has protected URLs</td>
                  <td>
                    {editResource ? (
                      <RoleConditional
                        requiredRoles={['editResource']}
                        fallbackComponent={resource.protectedUrls}
                      >
                        <ReversibleField fieldName="protectedUrls" defaultValue={resource.protectedUrls} handleChangeField={handleChangeField}>
                          <input type="checkbox" className="form-check-input" />
                        </ReversibleField>
                      </RoleConditional>
                    ) : (
                      resource.protectedUrls ? "Yes" : "No"
                    )}
                  </td>
                </tr>
                {resource.protectedUrls && <>
                  <tr>
                    <td className="px-3">Authorization help URL</td>
                    <td>
                      {editResource ? (
                        <RoleConditional
                          requiredRoles={['editResource']}
                          fallbackComponent={resource.authHelpUrl}
                        >
                          <ReversibleField fieldName="authHelpUrl" defaultValue={resource.authHelpUrl} handleChangeField={handleChangeField}>
                            <input type="text" />
                          </ReversibleField>
                        </RoleConditional>
                      ) : (
                        <a href={resource.authHelpUrl} target='_blank'>{resource.authHelpUrl}</a>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3">Authorization description</td>
                    <td>
                      {editResource ? (
                        <RoleConditional
                          requiredRoles={['editResource']}
                          fallbackComponent={resource.authHelpDescription}
                        >
                          <ReversibleField fieldName="authHelpDescription" defaultValue={resource.authHelpDescription} handleChangeField={handleChangeField}>
                            <textarea rows="5" />
                          </ReversibleField>
                        </RoleConditional>
                      ) : (
                        resource.authHelpDescription
                      )}
                    </td>
                  </tr>
                  <RoleConditional
                    requiredRoles={['editResource']}
                    fallbackComponent={resource.renderProtectedLanding}
                  >
                    <tr>
                      <td className="px-3">Render protected landing</td>
                      <td>
                        {editResource ? (
                            <ReversibleField fieldName="renderProtectedLanding" defaultValue={resource.renderProtectedLanding} handleChangeField={handleChangeField}>
                              <input type="checkbox" className="form-check-input" />
                            </ReversibleField>
                        ) : (
                          resource.renderProtectedLanding ? "Yes" : "No"
                        )}
                      </td>
                    </tr>
                  </RoleConditional>
                </>}
                <tr>
                  <td className="px-3">Location</td>
                  <td>
                    {editResource ? (
                      <RoleConditional
                        requiredRoles={['editResource']}
                        fallbackComponent={resource.location.countryName}
                      >
                        <ReversibleField fieldName="location" defaultValue={locationCountryCode} handleChangeField={handleChangeField}>
                          <select
                            className="form-control"
                            value={resource.location}
                          >
                            <option value="" disabled>Select location...</option>
                            {
                              locationList.map(location =>
                                <option
                                  value={location.id}
                                  key={`option-${location.id}`}
                                >
                                  {location.label}
                                </option>
                              )
                            }
                          </select>
                        </ReversibleField>
                      </RoleConditional>
                    ) : (
                      resource.location.countryName
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-3">Sample ID (LUI)</td>
                  <td>
                  {editResource ? (
                      <RoleConditional
                        requiredRoles={['editResource']}
                        fallbackComponent={resource.sampleId}
                      >
                        <ReversibleField fieldName="sampleId" defaultValue={resource.sampleId} handleChangeField={handleChangeField}>
                          <input type="text" />
                        </ReversibleField>
                      </RoleConditional>
                    ) : (
                      <a href={resource.urlPattern.replace("{$id}", resource.sampleId)}> {resource.sampleId} </a>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-3">Institution</td>
                  <td className="d-flex">
                    {editResource ? (
                      <RoleConditional
                        requiredRoles={['editResource']}
                        fallbackComponent={resource.institution.name}
                      >
                        <>
                          <ReversibleField fieldName="institution" defaultValue={institutionId} handleChangeField={handleChangeField}>
                            <select
                              className="form-control"
                              value={institutionId}
                            >
                              <option value="" disabled>Select institution...</option>
                              {
                                institutionList.map(institution =>
                                  <option
                                    value={institution.id}
                                    key={`option-${institution.id}`}
                                  >
                                    {institution.name}
                                  </option>
                                )
                              }
                            </select>
                          </ReversibleField>
                          <button
                            className="btn btn-sm btn-primary ml-2"
                            onClick={handleClickAddInstitution}
                          >
                            <i className="icon icon-common icon-plus" />
                          </button>
                        </>
                      </RoleConditional>
                    ) : (
                      resource.institution.name
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="w-20 px-3">Institution ROR ID</td>
                  <td className="resourceitem-table__wide">
                    {resource.institution.rorId ? <a target="_blank" href={resource.institution.rorId}> {resource.institution.rorId} </a> : "Unknown"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }
}

//
// Redux Mappings
//
const mapStateToProps = (state) => ({
  institutionList: state.institutionList,
  locationList: state.locationList
});

const mapDispatchToProps = dispatch => ({
  getResourcesFromRegistry: (namespace) => dispatch(getResourcesFromRegistry(namespace)),
  setResourcePatch: (id, resource) => dispatch(setResourcePatch(id, resource)),
  setResourcePatchField: (field, value) => dispatch(setResourcePatchField(field, value)),
  patchResource: (id, newResource) => dispatch(patchResource(id, newResource)),
  deactivateResource: (id) => dispatch(deactivateResource(id)),
  reactivateResource: (id, newResource) => dispatch(reactivateResource(id, newResource))
});

const ConnectedResourceItem = connect(mapStateToProps, mapDispatchToProps)(ResourceItem);

export default (props) => {
  const navigate = useNavigate();
  return <ConnectedResourceItem {...props} navigate={navigate} />
};
