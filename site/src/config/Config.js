export const config = {
  registryApi: typeof configApiRegistryUrl !== 'undefined' ? configApiRegistryUrl : 'http://localhost:8180',
  authApi: typeof configAuthUrl !== 'undefined' ? `${configAuthUrl}/auth` : 'http://localkeycloak:8080/auth',
  authRedirectUri: typeof configAuthRedirectUri !== 'undefined' ? configAuthRedirectUri : 'http://127.0.0.1:8182/',

  prefixRegistrationRequestValidationEndpoint: 'prefixRegistrationApi',
  resourceRegistrationRequestValidationEndpoint: 'resourceManagementApi',

  prefixRegistrationEndpoint: 'prefixRegistrationApi',
  resourceRegistrationEndpoint: 'resourceManagementApi',

  prefixRequestEndpoint: 'prefixRegistrationApi/registerPrefix',
  resourceRequestEndpoint: 'resourceManagementApi/registerResource',

  rorIdEndpoint: 'rorIdApi',

  institutionManagementEndpoint: 'institutionManagementApi',
  namespaceManagementEndpoint: 'namespaceManagementApi',
  resourceManagementEndpoint: 'resourceManagementApi',

  // Schema.org metadata endpoints.
  schemaOrgPlatformEndpoint: 'schemaOrgApi/getMetadataForPlatform',
  schemaOrgNamespaceEndpoint: 'schemaOrgApi/getMetadataForNamespace',
  schemaOrgNamespacePrefixEndpoint: 'schemaOrgApi/getMetadataForNamespacePrefix',

  satelliteUrl: 'https://identifiers.org',
  feedbackUrl: 'https://github.com/identifiers-org/identifiers-org.github.io/issues/new',
  documentationUrl: 'https://docs.identifiers.org',

  oldIdentifiersUrl: 'https://ebi.identifiers.org',

  showBetaBanner: false,

  suggestionQuerySize: 10,

  baseUrl: `${window.location.protocol}//${window.location.hostname}${location.port ? ':' + location.port : ''}/`,

  apiVersion: '1.0',

  VALIDATION_DELAY: 1000,
  DEBOUNCE_DELAY: 500,

  // Enable ROR ID selection in registration request institution fields.
  enableRegistrationRequestRORIDinstitutionSelection: true,

  // Enable institution dropdown selection in registration request.
  enableRegistrationRequestInstitutionDropdownSelection: false,

  enableAuthFeatures: true,

  ebiSearchDomainEndpoint: 'https://www.ebi.ac.uk/ebisearch/ws/rest/identifiers_registry',
  ebiSearchResponseSize: 100,
};
