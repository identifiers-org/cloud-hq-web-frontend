import { config } from "../../config/Config";


export default Object.freeze({
  async queryEbiSearchForRelevantNamespacesWithHitCount(query, opts = {}) {
    const {ebiSearchDomainEndpoint, ebiSearchResponseSize} = config;

    const params = new URLSearchParams({
      fields: 'prefix, name',
      size: ebiSearchResponseSize.toString(),
      query: query,
      format: 'JSON',
      ...opts
    });
    return fetch(ebiSearchDomainEndpoint + '?' + params)
      .then(r => r.json())
      .then(json => [
        json.hitCount,
        json.entries?.map(e => {
          return e.fields;
        }) || []
      ])
      .then(([hitCount, namespaces]) => [
        hitCount,
        namespaces.map(namespace => {
          // Convert ebi search fields from singleton arrays to simple values
          const newEntries = Object.entries(namespace)
            .map(([attr, val]) =>
              [attr, Array.isArray(val) ? val[0] : val])
          return Object.fromEntries(newEntries);
        })
      ]);
  },

  async queryEbiSearchForRelevantNamespaces(query, opts = {}) {
    const {ebiSearchDomainEndpoint, ebiSearchResponseSize} = config;
    const params = new URLSearchParams({
      fields: 'prefix, name',
      size: ebiSearchResponseSize.toString(),
      query: query,
      format: 'JSON',
      ...opts
    });
    return await fetch(ebiSearchDomainEndpoint + '?' + params)
      .then(r => r.json())
      .then(json => json.entries?.map(e => {
        return e.fields;
      }) || [])
      .then(namespaces => namespaces.map(namespace => {
        // Convert ebi search fields from singleton arrays to simple values
        const newEntries = Object.entries(namespace)
          .map(([attr, val]) =>
            [attr, Array.isArray(val) ? val[0] : val])
        return Object.fromEntries(newEntries);
      }));
  }
});