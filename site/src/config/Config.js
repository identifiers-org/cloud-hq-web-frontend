export const config = {
  registryApi: typeof configApiRegistryUrl !== 'undefined' ? configApiRegistryUrl : 'http://localhost:8180',

  prefixRegistrationRequestValidationEndpoint: 'prefixRegistrationApi',
  resourceRegistrationRequestValidationEndpoint: 'resourceManagementApi',

  prefixRegistrationEndpoint: 'prefixRegistrationApi',
  resourceRegistrationEndpoint: 'resourceManagementApi',

  prefixRequestEndpoint: 'prefixRegistrationApi/registerPrefix',
  resourceRequestEndpoint: 'resourceManagementApi/registerResource',

  namespaceManagementEndpoint: 'namespaceManagementApi',
  resourceManagementEndpoint: 'resourceManagementApi',

  satelliteUrl: 'https://identifiers.org',
  feedbackUrl: 'https://github.com/identifiers-org/identifiers-org.github.io/issues/new',
  documentationUrl: 'http://docs.identifiers.org',

  oldIdentifiersUrl: 'https://ebi.identifiers.org',

  showBetaBanner: false,

  suggestionListSize: 10,

  baseUrl: `${window.location.protocol}//${window.location.hostname}${location.port ? ':' + location.port : ''}/`,

  apiVersion: '1.0',

  VALIDATION_DELAY: 1000,
  DEBOUNCE_DELAY: 500,

  enableAuthFeatures: true
};
