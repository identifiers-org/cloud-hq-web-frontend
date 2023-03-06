import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { useParams } from 'react-router-dom'
import { useMatomo } from '@datapunt/matomo-tracker-react';

// Actions.
import { getNamespaceFromRegistry, getResourcesFromRegistry } from '../../actions/NamespaceList';
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

// Config.
import { config } from '../../config/Config';

// Utils.
import { swalConfirmation, failureToast, successToast, infoToast } from '../../utils/swalDialogs';
import validators from '../../utils/validators';


class NamespaceDetailsPage extends React.Component {
  constructor (props) {
    super(props);

    const params = new URLSearchParams(window.location.search);

    this.state = {
      editNamespace: params.get('editNamespace') === 'true' || false,
      namespaceId: undefined,
      namespaceFieldsChanged: new Set(),
      newNamespace: this.props.newNamespace
    }
  }


  async componentDidMount() {
    const { trackPageView } = this.props.matomo
    trackPageView();

    const {
      getNamespaceFromRegistry,
      getResourcesFromRegistry,
      getSchemaOrgMetadataFromRegistry,
      params: { prefix },
      schemaOrgMetadata,
      setNamespacePatch
    } = this.props;

    await getNamespaceFromRegistry(prefix);
    await getResourcesFromRegistry(this.props.namespaceList[0]);

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

      if (result.status === 200) {
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

        {namespace.deprecated && (
          <div className="row justify-content-md-center p-3 mb-3">
            <div className="col col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-8 bg-danger p-2">
              <h3 className="text-center text-white mb-2">
                <i className="icon icon-common icon-trash mr-3" />
                This namespace is <strong>deactivated</strong>
              </h3>
              <p className="mb-0 text-white">
                The service has been marked as deactivated since {moment(namespace.deprecationDate).format('ll')}. This
                means either the institution abandoned it, or no providers are available for it. You can try looking in
                the institution's web below for more information.
              </p>
            </div>
          </div>
        )}

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
                  <td>Legacy registry identifier</td>
                  <td>{namespace.mirId}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

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
                  <td>{config.baseUrl}registry/{namespace.prefix}</td>
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
        { namespace.stats ? <>
          <div className="row">
            <div className="col">
              <h2><i className="icon icon-common icon-search-document" /> Usage for last month </h2>
            </div>
          </div>

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
        </> : '' }

        <div className="row">
          <div className="col">
            <h2><i className="icon icon-common icon-cubes" /> Resources</h2>
          </div>
        </div>

        {
          !namespace.resources && (
            <div className="row">
              <div className="col">
                <p>No resources.</p>
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
