import React, { createRef } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom'
import { useMatomo } from '@jonkoops/matomo-tracker-react';

// Actions.
import { getNamespaceFromRegistry, getResourcesFromRegistry, getStatisticsFromRegistry} from '../../actions/NamespaceList';
import {
  setNamespacePatch,
  setNamespacePatchField,
  patchNamespace,
  deactivateNamespace,
  reactivateNamespace
} from '../../actions/NamespacePatch';
import { getSchemaOrgMetadataFromRegistry } from '../../actions/SchemaOrgMetadata';

// Components.
import PageTitle from '../common/PageTitle';
import ResourceItem from '../NamespaceDetailsPage/ResourceItem';
import ReversibleField from '../common/ReversibleField';
import RoleConditional from '../common/RoleConditional';
import NamespaceDeprecationNotice from "../NamespaceDetailsPage/NamespaceDeprecationNotice";

// Config.
import { config } from '../../config/Config';

// Utils.
import { swalConfirmation, failureToast, successToast, infoToast } from '../../utils/swalDialogs';
import validators from '../../utils/validators';
import Spinner from "../common/Spinner";

class NamespaceDetailsPage extends React.Component {
  constructor (props) {
    super(props);

    const params = new URLSearchParams(window.location.search);

    this.state = {
      editNamespace: params.get('editNamespace') === 'true' || false,
      namespaceId: undefined,
      namespaceFieldsChanged: new Set(),
      newNamespace: this.props.newNamespace,
      modalVisible: false
    }
  }


  async componentDidMount() {
    const { trackPageView } = this.props.matomo
    trackPageView();

    const {
      getNamespaceFromRegistry,
      getResourcesFromRegistry,
      getSchemaOrgMetadataFromRegistry,
      getStatisticsFromRegistry,
      params: { prefix },
      schemaOrgMetadata,
      setNamespacePatch
    } = this.props;

    await getNamespaceFromRegistry(prefix);
    await getResourcesFromRegistry(this.props.namespaceList[0]);
    await getStatisticsFromRegistry(this.props.namespaceList[0]);

    // Prepares model for namespace patching.
    const {resources, _links, ...newNamespace} = this.props.namespaceList[0];
    const namespaceId = _links.self.href.split('/').pop();

    this.setState({namespaceId, newNamespace});
    setNamespacePatch(namespaceId, newNamespace);

    // Get Schema.org Metadata and append it to the document's head.
    if (!schemaOrgMetadata.dataset || (schemaOrgMetadata.dataset && schemaOrgMetadata.dataset.name !== this.props.namespaceList[0].name)) {
      getSchemaOrgMetadataFromRegistry(namespaceId);
    }
  }

  async componentWillUnmount() {
    const {
      getSchemaOrgMetadataFromRegistry
    } = this.props;

    // Get Schema.org Metadata for the platform and append it to the document's head.
    await getSchemaOrgMetadataFromRegistry();
  }

  //
  // Field manipulation handler. Undefined 'value' field will revert to default.
  //
  handleChangeField = (field, value) => {
    const namespace = this.props.namespaceList[0];

    // Add/remove field to changed list if modified/reset, so it is validated or not when clicked on the perform
    // validation button.
    if (namespace[field] !== value) {
      this.setState(prevState => ({
        namespaceFieldsChanged: prevState.namespaceFieldsChanged.add(field),
        newNamespace: {...this.state.newNamespace, [field]: value}
      }));
    } else {
      this.setState(prevState => {
        prevState.namespaceFieldsChanged.delete(field);
        return {
          namespaceFieldsChanged: prevState.namespaceFieldsChanged,
          newNamespace: {...this.state.newNamespace, [field]: namespace[field]}
        };
      });
    }

    this.props.setNamespacePatchField(field, value);
  }


  handleClickCommitChangesButton = async () => {
    const {
      state: { namespaceId, namespaceFieldsChanged, newNamespace },
      props: { patchNamespace }
    } = this;

    if (namespaceFieldsChanged.size === 0) {
      infoToast('No changes to commit');
      return;
    }

    const result = await swalConfirmation.fire({
      title: 'Confirm changes to namespace',
      text: `Changed fields: ${[...namespaceFieldsChanged].join(', ')}`,
      confirmButtonText: 'Commit changes',
      cancelButtonText: 'Cancel'
    });

    if (result.value) {
      const result = await patchNamespace(namespaceId, newNamespace);

      if (result.ok) {
        successToast('Changed committed successfully');
        await this.props.getNamespaceFromRegistry(this.props.params.prefix);
        await this.props.getResourcesFromRegistry(this.props.namespaceList[0]);
        this.setState({editNamespace: false, namespaceFieldsChanged: new Set()});
      } else {
        failureToast('Error committing changes');
      }
    }
  };

  handleClickDiscardChangesButton = async () => {
    console.log('this.state.namespaceFieldsChanged', this.state.namespaceFieldsChanged);
    if (this.state.namespaceFieldsChanged.size === 0) {
      this.setState({editNamespace: false});
      return;
    }

    const result = await swalConfirmation.fire({
      title: 'Are you sure?',
      text: 'All data changed will be lost',
      confirmButtonText: 'Discard changes',
      cancelButtonText: 'Continue editing'
    });

    if (result.value) {
      this.setState({editNamespace: false});
    }
  };

  handleClickDeactivateButton = async () => {
    const {
      state: { namespaceId },
      props: { deactivateNamespace }
    } = this;

    const result = await swalConfirmation.fire({
      title: 'Confirm deactivation',
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    });

    if (result.value) {
      const result = await deactivateNamespace(namespaceId);

      if (result.status === 200) {
        successToast('Namespace deactivation successful');
        await this.props.getNamespaceFromRegistry(this.props.params.prefix);
        await this.props.getResourcesFromRegistry(this.props.namespaceList[0]);
        this.setState({editNamespace: false, namespaceFieldsChanged: new Set()});
      } else {
        failureToast('Error deactivating namespace');
      }
    }
  };

  handleClickReactivateButton = async () => {
    const {
      state: { namespaceId },
      props: { reactivateNamespace }
    } = this;

    const result = await swalConfirmation.fire({
      title: 'Confirm reactivation',
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    });

    if (result.value) {
      const result = await reactivateNamespace(namespaceId);

      document.querySelector("#deactivationModal button.close")?.click();

      if (result.status === 200) {
        successToast('Namespace reactivation successful');
        await this.props.getNamespaceFromRegistry(this.props.params.prefix);
        await this.props.getResourcesFromRegistry(this.props.namespaceList[0]);
        this.setState({editNamespace: false, namespaceFieldsChanged: new Set()});
      } else {
        failureToast('Error reactivating namespace');
      }
    }
  };

  handleClickValidateChangesButton = async () => {
    const { newNamespace } = this.state;
    const namespaceFieldsToValidate = [...this.state.namespaceFieldsChanged];

    if (namespaceFieldsToValidate.length === 0) {
      infoToast('No fields have changed');
      return;
    }

    const validations = await Promise.all(namespaceFieldsToValidate
      .map(field => validators[field](newNamespace[field], newNamespace, 'prefix'))
    );
    const toastMessage = validations
      .filter(validations => !validations.valid)
      .map(validations => validations.errorMessage).join('\n');

    if (toastMessage !== '') {
      failureToast(toastMessage, undefined, 10000);
    } else {
      successToast('All fields OK!');
    }
  };

  handleClickEditButton = () => {
    this.setState({editNamespace: true});
  };

  dateFormatter = Intl.DateTimeFormat("en-GB");
  dateFormat = (dateStr) => this.dateFormatter.format(new Date(dateStr))
  onlyDateFromIsoStr = (dateStr) => dateStr ? dateStr.substring(0,10) : dateStr

  render() {
    const {
      handleChangeField,
      handleClickCommitChangesButton,
      handleClickDiscardChangesButton,
      handleClickDeactivateButton,
      handleClickEditButton,
      handleClickReactivateButton,
      handleClickValidateChangesButton,
      state: { editNamespace }
    } = this;

    const namespace = this.props.namespaceList[0];
    let namespaceEffectivePrefix = '';
    if (namespace) {
      namespaceEffectivePrefix = namespace.prefix;
      if (namespace.namespaceEmbeddedInLui) { // This is necessary to enforce that the actual prefix matches the pattern
        const startPositionPrefix = (namespace.pattern[0] === '^' ? 1 : 0);
        namespaceEffectivePrefix = namespace.pattern.slice(startPositionPrefix, namespace.pattern.indexOf(":"));

        if (namespaceEffectivePrefix.toLowerCase() != namespace.prefix) { //if the effective prefix is still resolvable
          namespaceEffectivePrefix = namespace.prefix;
        }
      }
    }
    const sampleUrl = namespace ? `${config.satelliteUrl}/${namespaceEffectivePrefix}:${namespace.sampleId}` : '';

    return !namespace ? (
      '' // Placeholder for empty/not found.
    ) : (
      <>
        <PageTitle
          icon="icon-leaf"
          title="Namespace:"
          extraTitle={namespace.name}
        />

        {namespace.deprecated && <NamespaceDeprecationNotice namespace={namespace} />}

        {editNamespace ? (
          <div className="row mb-1">
            <div className="col">
              <RoleConditional
                requiredRoles={['editNamespace']}
              >
                <>
                  <button
                    className="btn btn-sm btn-warning edit-button mr-2"
                    onClick={handleClickValidateChangesButton}
                  >
                    <i className="icon icon-common icon-tasks mr-1" />Perform validation
                  </button>
                  <button
                    className="btn btn-sm btn-success edit-button mr-2"
                    onClick={handleClickCommitChangesButton}
                  >
                    <i className="icon icon-common icon-check" /> Commit changes
                  </button>
                  <button
                    className="btn btn-sm btn-danger edit-button"
                    onClick={handleClickDiscardChangesButton}
                  >
                    <i className="icon icon-common icon-times" /> Discard changes
                  </button>
                </>
              </RoleConditional>
            </div>
          </div>
        ) : (
          <div className="row mb-1">
            <div className="col">
              <RoleConditional
                requiredRoles={['editNamespace']}
                >
                <>
                  <button
                    className="btn btn-sm btn-success edit-button"
                    onClick={handleClickEditButton}
                    >
                    <i className="icon icon-common icon-edit mr-1"/>Edit namespace
                  </button>
                  {namespace.deprecated ? (
                    <button
                      className="btn btn-sm btn-warning edit-button ml-2"
                      onClick={handleClickReactivateButton}
                    >
                      {/* TODO: change to trash-restore when EBI adds it to EBI-Font-icons */}
                      <i className="icon icon-common icon-caret-square-up mr-1"/>Reactivate namespace
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm btn-danger edit-button ml-2"
                      onClick={handleClickDeactivateButton}
                    >
                      <i className="icon icon-common icon-trash mr-1"/>Deactivate namespace
                    </button>
                  )}
                </>
              </RoleConditional>
            </div>
          </div>
        )}

        <div className="row">
          <div className="col">
            <h2><i className="icon icon-common icon-info" /> General Information</h2>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col overflow-y-scroll">
            <table className="table table-sm table-striped table-borderless">
              <tbody>
                <tr>
                  <td className="w-35">
                    Name
                  </td>
                  <td>
                    {editNamespace ? (
                      <RoleConditional
                        requiredRoles={['editNamespace']}
                        fallbackComponent={namespace.name}
                      >
                        <ReversibleField fieldName="name" defaultValue={namespace.name} handleChangeField={handleChangeField}>
                          <input type="text" />
                        </ReversibleField>
                      </RoleConditional>
                    ) : (
                      namespace.name
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Description</td>
                  <td>
                    {editNamespace ? (
                      <RoleConditional
                        requiredRoles={['editNamespace']}
                        fallbackComponent={namespace.description}
                      >
                        <ReversibleField fieldName="description" defaultValue={namespace.description} handleChangeField={handleChangeField}>
                          <textarea rows="5" />
                        </ReversibleField>
                      </RoleConditional>
                    ) : (
                      namespace.description
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Local Unique Identifier (LUI) pattern</td>
                  <td>
                    {editNamespace ? (
                      <RoleConditional
                        requiredRoles={['editNamespace']}
                        fallbackComponent={namespace.pattern}
                      >
                        <ReversibleField fieldName="pattern" defaultValue={namespace.pattern} handleChangeField={handleChangeField}>
                        <input type="text" />
                        </ReversibleField>
                      </RoleConditional>
                    ) : (
                      namespace.pattern
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Prefix embedded in LUI</td>
                  <td>
                    {editNamespace ? (
                      <RoleConditional
                        requiredRoles={['editNamespace']}
                        fallbackComponent={namespace.namespaceEmbeddedInLui}
                      >
                        <ReversibleField fieldName="namespaceEmbeddedInLui" defaultValue={namespace.namespaceEmbeddedInLui} handleChangeField={handleChangeField}>
                          <input type="checkbox" className="form-check-input"/>
                        </ReversibleField>
                      </RoleConditional>
                    ) : (
                      namespace.namespaceEmbeddedInLui ? "Yes" : "No"
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Legacy registry identifier</td>
                  <td>{namespace.mirId}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {namespace.deprecated && ( <>
        <div className="row">
          <div className="col">
            <h2><i className="icon icon-common icon-trash"/> Deactivation information</h2>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col overflow-y-scroll">
            <table className="table table-sm table-striped table-borderless">
              <tbody>
                <tr>
                  <td className="w-35">Date of deactivation</td>
                  <td>{this.dateFormat(namespace.deprecationDate)}</td>
                </tr>
                <tr>
                  <td>
                    Approximated expiration date
                    <span className="ml-1" title="Approximation of when this collection went offline">
                      <i className="icon icon-common icon-question-circle"></i>
                    </span>
                  </td>
                  <td>
                    {editNamespace ? (
                      <RoleConditional
                        requiredRoles={['editNamespace']}
                        fallbackComponent={namespace.deprecationOfflineDate}
                      >
                        <ReversibleField fieldName="deprecationOfflineDate"
                                         defaultValue={this.onlyDateFromIsoStr(namespace.deprecationOfflineDate)}
                                         handleChangeField={handleChangeField}>
                          <input type="date" />
                        </ReversibleField>
                      </RoleConditional>
                    ) : (
                      namespace.deprecationOfflineDate ? this.dateFormat(namespace.deprecationOfflineDate) : "Unknown"
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Deactivation statement</td>
                  <td>
                    {editNamespace ? (
                      <RoleConditional
                        requiredRoles={['editNamespace']}
                        fallbackComponent={namespace.deprecationStatement}
                      >
                        <ReversibleField fieldName="deprecationStatement"
                                         defaultValue={namespace.deprecationStatement}
                                         handleChangeField={handleChangeField}>
                          <input type="text" />
                        </ReversibleField>
                      </RoleConditional>
                    ) : (
                      namespace.deprecationStatement ? namespace.deprecationStatement : "Not provided"
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    Data acquisition
                    <span className="ml-1" title="Instructions on how to currently access data">
                      <i className="icon icon-common icon-question-circle"></i>
                    </span>
                  </td>
                  <td>
                    {editNamespace ? (
                      <RoleConditional
                        requiredRoles={['editNamespace']}
                        fallbackComponent={namespace.infoOnPostmortemAccess}
                      >
                        <ReversibleField fieldName="infoOnPostmortemAccess"
                                         defaultValue={namespace.infoOnPostmortemAccess}
                                         handleChangeField={handleChangeField}>
                          <input type="text" />
                        </ReversibleField>
                      </RoleConditional>
                    ) : (
                      namespace.infoOnPostmortemAccess ? namespace.deprecationStatement : "Not available"
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    Succeeding namespace
                    <span className="ml-1" title="Namespace that currently handles data of this namespace">
                      <i className="icon icon-common icon-question-circle"></i>
                    </span>
                  </td>
                  <td>
                    {editNamespace ? (
                      <RoleConditional
                        requiredRoles={['editNamespace']}
                        fallbackComponent={namespace.successor}
                      >
                        <ReversibleField fieldName="successor"
                                         defaultValue={namespace.successor}
                                         handleChangeField={handleChangeField}>
                          <input type="text" />
                        </ReversibleField>
                      </RoleConditional>
                    ) : (
                      namespace.successor ? <a href={`/registry/${namespace.successor}`}>{namespace.successor}</a > : "Not available"
                    )}
                  </td>
                </tr>
                <RoleConditional requiredRoles={['editNamespace']}>
                  <tr>
                    <td> Deactivation landing page </td>
                    <td>
                      { editNamespace ? (
                        <ReversibleField fieldName="renderDeprecatedLanding"
                                         defaultValue={namespace.renderDeprecatedLanding}
                                         handleChangeField={handleChangeField}>
                          <input type="checkbox" className="form-check-input" />
                        </ReversibleField>
                      ) : (
                        namespace.renderDeprecatedLanding ? "Yes" : "No"
                      ) }
                    </td>
                  </tr>
                </RoleConditional>
              </tbody>
            </table>
          </div>
        </div>
        </>)}

        <div className="row">
          <div className="col">
            <h2><i className="icon icon-common icon-barcode" /> Identification schemes</h2>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col overflow-y-scroll">
            <table className="table table-sm table-striped table-borderless">
              <tbody>
                <tr>
                  <td className="w-35">
                    Prefix
                  </td>
                  <td>
                    {namespaceEffectivePrefix}
                  </td>
                </tr>
                <tr>
                  <td>Registry URI</td>
                  <td><a href={config.baseUrl + "registry/" + namespace.prefix} target="_blank">{config.baseUrl}registry/{namespace.prefix}</a></td>
                </tr>
                <tr>
                  <td>Sample URL</td>
                  <td><a href={sampleUrl} target="_blank" rel="noopener noreferrer">{sampleUrl}</a></td>
                </tr>
                <tr>
                  <td>Sample Compact identifier</td>
                  <td>{namespaceEffectivePrefix}:{namespace.sampleId}</td>
                </tr>
                <tr>
                  <td>Sample ID (LUI)</td>
                  <td>
                    {editNamespace ? (
                        <RoleConditional
                          requiredRoles={['editNamespace']}
                          fallbackComponent={namespace.sampleId}
                        >
                          <ReversibleField fieldName="sampleId" defaultValue={namespace.sampleId} handleChangeField={handleChangeField}>
                          <input type="text" />
                          </ReversibleField>
                        </RoleConditional>
                      ) : (
                        namespace.sampleId
                      )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Page first loads without statistics */}
        <div className="row">
          <div className="col">
            <h2><i className="icon icon-common icon-search-document" /> Usage for last month </h2>
          </div>
        </div>
        { (namespace.stats === undefined) ? <Spinner noText noCenter /> :
            (namespace.stats === null ?  <div className="row mb-3"> Statistics deactivated </div> : <>
              <div className="row mb-3">
                <div className="col overflow-y-scroll">
                  <table className="table table-sm table-striped table-borderless">
                    <tbody>
                      <tr>
                        <td className="w-35">Number of visits</td>
                        <td> {namespace.stats.nb_visits} </td>
                      </tr>
                      <tr>
                        <td className="w-35">Number of unique visitors</td>
                        <td> {namespace.stats.nb_uniq_visitors} </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
        </>) }

        <div className="row">
          <div className="col">
            <h2><i className="icon icon-common icon-cubes" /> Resources</h2>
          </div>
        </div>

        {
          !namespace.resources && (
            <div className="row">
              <div className="col">
                { namespace.resources === undefined ? <Spinner noText noCenter /> : <p>No resources.</p> }
              </div>
            </div>
          ) || (
            namespace.resources.sort((a, b) => {
              // Official resources always go first.
              if (b.official - a.official !== 0) {
                return b.official - a.official;
              }

              // Deprecated resources always go last.
              if (a.deprecated - b.deprecated !== 0) {
                return a.deprecated - b.deprecated;
              }

              // CURATOR_REVIEW provider code resources always go last.
              if (a.providerCode === 'CURATOR_REVIEW' && b.providerCode !== 'CURATOR_REVIEW') return 1;
              if (a.providerCode !== 'CURATOR_REVIEW' && b.providerCode === 'CURATOR_REVIEW') return -1;

              return a.providerCode > b.providerCode ? 1 : a.providerCode < b.providerCode ? -1 : 0;
            }).map(resource =>
              <ResourceItem
                key={`resource-${resource.mirId}`}
                namespace={namespace}
                resource={resource}
              />
            )
          )
        }
      </>
    );
  }
}


// Mapping
const mapStateToProps = (state) => {
  return ({
    namespaceList: state.registryBrowser.namespaceList,
    newNamespace: state.curationEditNamespace,
    schemaOrgMetadata: state.schemaOrgMetadata
  })
};

const mapDispatchToProps = dispatch => ({
  getNamespaceFromRegistry: (prefix) => dispatch(getNamespaceFromRegistry(prefix)),
  getResourcesFromRegistry: (namespace) => dispatch(getResourcesFromRegistry(namespace)),
  getStatisticsFromRegistry: (namespace) => dispatch(getStatisticsFromRegistry(namespace)),
  getSchemaOrgMetadataFromRegistry: (namespaceId) => dispatch(getSchemaOrgMetadataFromRegistry(namespaceId)),
  setNamespacePatch: (id, namespace) => dispatch(setNamespacePatch(id, namespace)),
  setNamespacePatchField: (field, value) => dispatch(setNamespacePatchField(field, value)),
  patchNamespace: (id, newNamespace) => dispatch(patchNamespace(id, newNamespace)),
  deactivateNamespace: (id) => dispatch(deactivateNamespace(id)),
  reactivateNamespace: (id) => dispatch(reactivateNamespace(id))
});

const ConnectedNamespaceDetailsPage = connect (mapStateToProps, mapDispatchToProps)(NamespaceDetailsPage)
export default function(props) {
  const params = useParams();
  const matomo = useMatomo();
  return <ConnectedNamespaceDetailsPage {...props} matomo={matomo} params={params} />
}
