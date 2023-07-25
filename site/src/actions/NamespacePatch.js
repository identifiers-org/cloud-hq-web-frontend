// Config.
import { config } from '../config/Config';

// Utils.
import { renewToken } from '../utils/auth';


//
// NamespacePatch actions.
//

// Redux store update for namespace patch fields.
export const setNamespacePatchField = (field, value) => {
  const action = {
    type: 'SET_NAMESPACEPATCHREDUCERFIELD',
    field,
    value
  };

  return action;
};


// Redux store update for whole namespace patch.
export const setNamespacePatch = (id, namespace) => {
  const action = {
    type: 'SET_NAMESPACEPATCHREDUCER',
    id,
    namespace
  };

  return action;
};


// Patch a namespace.
export const patchNamespace = (id, newNamespace) => {
  return async () => {
    let requestUrl = `${config.registryApi}/restApi/namespaces/${id}`;
    let authToken = await renewToken();

    let successor = undefined;
    if ("successor" in newNamespace) {
      successor = newNamespace.successor;
      delete newNamespace.successor;
    }

    let init = {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(newNamespace)
    };

    let response = await fetch(requestUrl, init);
    if (!response.ok) {
      console.error("Failed namespace patch")
      return response;
    }
    console.error("Not failed namespace patch")

    if (successor !== undefined) {
      requestUrl = `${config.registryApi}/restApi/namespaces/search/findByPrefix?prefix=${successor}`;
      authToken = await renewToken();

      let init = {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      };
      response = await fetch(requestUrl, init);
      if (!response.ok) {
        console.error("Failed namespace GET by prefix")
        return response;
      }
      console.error("Not failed namespace GET by prefix")

      const jsonResponse = await response.json();
      successor = jsonResponse["_links"].self.href;

      requestUrl = `${config.registryApi}/restApi/namespaces/${id}/successor`;
      authToken = await renewToken();

      init = {
        method: 'PUT',
        headers: {
          'content-type': 'text/uri-list',
          'Authorization': `Bearer ${authToken}`
        },
        body: successor
      };
      return await fetch(requestUrl, init);
    }
  };
};


// Deactivate a namespace.
export const deactivateNamespace = (id) => {
  return async () => {
    const requestUrl = `${config.registryApi}/${config.namespaceManagementEndpoint}/deactivateNamespace/${id}`;

    const authToken = await renewToken();
    const init = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    };

    return await fetch(requestUrl, init);
  };
};


// Reactivate a namespace.
export const reactivateNamespace = (id) => {
  return async () => {
    const requestUrl = `${config.registryApi}/${config.namespaceManagementEndpoint}/reactivateNamespace/${id}`;
    const authToken = await renewToken();
    const init = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    };

    return await fetch(requestUrl, init);
  };
};
