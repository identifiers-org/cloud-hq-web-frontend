import { fetchAndAdd } from '../utils/fetchAndAdd';

import { config } from '../config/Config';

import { setNamespaceListParams } from './NamespaceListParams';


//
// namespaceList actions.
//

// Get namespaces from registry. Will dispatch setNamespaceList.
export const getNamespacesFromRegistry = (params) => {
  return async (dispatch) => {
    let requestUrl;

    // TODO: Refactor to strategy.
    if (params.content !== '') {
      requestUrl = new URL(`${config.registryApi}/restApi/namespaces/search/findByPrefixContaining`);
      requestUrl.searchParams.append('content', params.content);
    } else if (params.prefixStart === '#') {
      requestUrl = new URL(`${config.registryApi}/restApi/namespaces/search/findByPrefixStartsWithNumbers`);
    } else if (params.prefixStart !== '') {
      // TODO: What to do with '#' prefixstart?
      requestUrl = new URL(`${config.registryApi}/restApi/namespaces/search/findByPrefixStartsWith`);
      requestUrl.searchParams.append('prefixStart', params.prefixStart);
    } else {
      requestUrl = new URL(`${config.registryApi}/restApi/namespaces`);
    }

    // Params to add to request: PAGE, SIZE, SORT
    requestUrl.searchParams.append('page', params.number);
    requestUrl.searchParams.append('size', params.size);
    requestUrl.searchParams.append('sort', params.sort);

    let data;

    try {
      const response = await fetch(requestUrl);
      data = await response.json();
    } catch (err) {
      console.error('Error fetching namespaces: ', err);
    }

    if (data) {
      dispatch(setNamespaceList(data._embedded.namespaces));
      dispatch(setNamespaceListParams({...params, ...data.page}));
    } else {
      console.error("Null response from endpoint");
    }

    return data;
  };
};


// Get single namespace from registry. Will dispatch setNamespaces.
export const getNamespaceFromRegistry = (prefix) => {
  return async (dispatch) => {
    let data, response;

    let requestUrl = new URL(`${config.registryApi}/restApi/namespaces/search/findByPrefix?prefix=${prefix}`);
    try {
      response = await fetch(requestUrl);
      data = await response.json();
    } catch (err) {
      console.error('Error fetching namespace', err);
    }

    let statisticsUrl = new URL(`${config.registryApi}/statistics/namespace/${prefix}`);
    try {
      response = await fetch(statisticsUrl);
      if (response.ok) {
        const stats = await response.json();
        data['stats'] = stats.payload
      }
    } catch (err) {
      console.error("Error fetching namespace statistics", err)
    }

    dispatch(setNamespaceList([data]));

    return data;
  };
};


// Get resources from registry. Will dispatch setResources.
export const getResourcesFromRegistry = (namespace) => {
  return async (dispatch) => {
    let requestUrl = new URL(`${config.registryApi}/restApi/resources/search/findAllByNamespaceId`);
    requestUrl.searchParams.append('id', namespace._links.self.href.split('/').pop());
    let data;

    try {
      const response = await fetch(requestUrl);
      data = await response.json();
    } catch (err) {
      console.error('Error fetching namespaces: ', err);
      return;
    };

    const resources = await Promise.all(data._embedded.resources.map(resource => {
      let { _links, ...newResource } = resource;

      // Add id to the resource as a field, we will need this for curation stuff.
      newResource.id = _links.self.href.split('/').pop();

      return fetchAndAdd(newResource, [
        {name: 'institution', url: _links.institution.href},
        {name: 'location', url: _links.location.href}
      ]);
    }));

    dispatch(setResources(namespace.prefix, resources));

    return data;
  };
};


// Redux store update for namespace list.
export const setNamespaceList = (namespaceList) => {
  return {
    type: 'SET_NAMESPACELIST',
    namespaceList
  };
};

export const setResources = (prefix, resources) => {
  return {
    type: 'SET_RESOURCES',
    prefix,
    resources
  }
}