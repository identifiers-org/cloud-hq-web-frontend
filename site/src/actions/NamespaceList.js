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
      if (data.deprecated) {
        const succResponse = await fetch(data["_links"]["successor"]["href"])
        if (succResponse.ok) {
          data["successor"] = await succResponse.json()
        }
      }
    } catch (err) {
      console.error('Error fetching namespace', err);
    }

    dispatch(setNamespaceList([data]));
    return data;
  };
};

export const getStatisticsFromRegistry = (namespace) => {
  return async (dispatch) => {
    let stats = null;
    const statisticsUrl = new URL(`${config.registryApi}/statistics/namespace/${namespace.prefix}`);
    try {
      const response = await fetch(statisticsUrl);
      if (response.status === 200) {
        stats = await response.json();
        stats = stats.payload;
      }
    } catch (err) {
      console.error("Error fetching namespace statistics", err)
    } finally {
      dispatch(setStatistics(namespace.prefix, stats));
    }
    return stats;
  }
}


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

export const setStatistics = (prefix, stats) => {
  return {
    type: 'SET_STATISTICS',
    prefix,
    stats
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