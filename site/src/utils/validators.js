import { config } from '../config/Config';


async function validateThroughAPI (url, payload) {
  const body = {
    apiVersion: 1,
    payload
  };

  const init = {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  };

  const response = await fetch(url, init);
  const responseStatusCode = response.status;
  const json = await response.json();

  return {
    valid: responseStatusCode === 200,
    errorMessage: json.errorMessage
  };
}


const validationEndpoint = {
  'prefix': config.prefixRegistrationEndpoint,
  'resource': config.resourceRegistrationEndpoint
}

const validators = {
  namespacePrefix: async (namespacePrefix, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateNamespacePrefix`;
    return validateThroughAPI(url, {namespacePrefix});
  },

  // Resource edition provider name.
  name: async (providerName, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateProviderName`;
    return validateThroughAPI(url, {providerName});
  },

  description: async (providerDescription, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateProviderDescription`;
    return validateThroughAPI(url, {providerDescription});
  },

  requestedPrefix: async (requestedPrefix, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateRequestedPrefix`;
    return validateThroughAPI(url, {requestedPrefix});
  },

  sampleId: async (sampleId, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateSampleId`;
    if (typeof registrationRequest.providerUrlPattern === 'undefined') {
      return {valid: true};
    }
    return validateThroughAPI(url, {sampleId, providerUrlPattern: registrationRequest.providerUrlPattern});
  },

  idRegexPattern: async (idRegexPattern, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateIdRegexPattern`;
    return validateThroughAPI(url, {idRegexPattern, sampleId: registrationRequest.sampleId});
  },

  pattern: async (idRegexPattern, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateIdRegexPattern`;
    return validateThroughAPI(url, {idRegexPattern, sampleId: registrationRequest.sampleId});
  },

  supportingReferences: async (supportingReferences, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateReferences`;
    return validateThroughAPI(url, {supportingReferences: supportingReferences.split('\n')});
  },

  additionalInformation: async (additionalInformation, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateAdditionalInformation`;
    return validateThroughAPI(url, {additionalInformation});
  },

  // Location and institution when selected from a dropdown will always be valid.
  institution: () => ({valid: true}),
  location: () => ({valid: true}),

  institutionName: async (institutionName, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateInstitutionName`;
    return validateThroughAPI(url, {institutionName});
  },

  institutionDescription: async (institutionDescription, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateInstitutionDescription`;
    return validateThroughAPI(url, {institutionDescription});
  },

  institutionHomeUrl: async (institutionHomeUrl, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateInstitutionHomeUrl`;
    return validateThroughAPI(url, {institutionHomeUrl});
  },

  institutionLocation: async (institutionLocation, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateInstitutionLocation`;
    return validateThroughAPI(url, {institutionLocation});
  },

  namespaceEmbeddedInLui: async (namespaceEmbeddedInLui, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateNamespaceEmbeddedInLui`;
    return validateThroughAPI(url, {namespaceEmbeddedInLui});
  },

  providerName: async (providerName, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateProviderName`;
    return validateThroughAPI(url, {providerName});
  },

  providerDescription: async (providerDescription, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateProviderDescription`;
    return validateThroughAPI(url, {providerDescription});
  },

  providerHomeUrl: async (providerHomeUrl, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateProviderHomeUrl`;
    return validateThroughAPI(url, {providerHomeUrl});
  },

  resourceHomeUrl: async (providerHomeUrl, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateProviderHomeUrl`;
    return validateThroughAPI(url, {providerHomeUrl});
  },

  providerCode: async (providerCode, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateProviderCode`;
    return validateThroughAPI(url, {providerCode});
  },

  providerUrlPattern: async (providerUrlPattern, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateProviderUrlPattern`;
    return validateThroughAPI(url, {providerUrlPattern});
  },

  urlPattern: async (providerUrlPattern, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateProviderUrlPattern`;
    return validateThroughAPI(url, {providerUrlPattern});
  },

  providerLocation: async (providerLocation, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateProviderLocation`;
    return validateThroughAPI(url, {providerLocation});
  },

  requesterName: async (requesterName, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateRequesterName`;
    return validateThroughAPI(url, {requester: {name: requesterName}});
  },

  authHelpUrl: async (requesterName, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateAuthHelpUrl`;
    return validateThroughAPI(url, {requester: {name: requesterName}});
  },

  authHelpDescription: async (requesterName, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateAuthHelpDescription`;
    return validateThroughAPI(url, {requester: {name: requesterName}});
  },

  requesterEmail: async (requesterEmail, registrationRequest, registrationRequestType) => {
    const url = `${config.registryApi}/${validationEndpoint[registrationRequestType]}/validateRequesterEmail`;
    return validateThroughAPI(url, {requester: {email: requesterEmail}});
  },

  rorId: rorId => {
    const rorIdLastPart = rorId.split('/').pop();

    const bad = {
      apiVersion: "1.0",
      errorMessage: "Incorrect ROR Id",
      payload: {
        "comment": "VALIDATION FAILED"
      }
    };

    const good = {
      apiVersion: "1.0",
      errorMessage: null,
      payload: {
        "comment": "VALIDATION OK"
      }
    };

    if (rorId.slice(0, 8) !== 'https://') return bad;                                 // Start with 'https://'.
    if (rorIdLastPart.length !== 9) return bad;                                       // Last part is not 9 long.
    if (rorIdLastPart[0] !== '0') return bad;                                         // Last part not starting with 0.
    if (isNaN(parseInt(rorIdLastPart.split(rorIdLastPart.length - 2)))) return bad;   // Last two chars not numbers.

    return good;
  }
};


export default validators;
