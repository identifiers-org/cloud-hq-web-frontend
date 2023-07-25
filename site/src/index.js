import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import moment from 'moment';

// Store.
import store from './store/store';

// Actions.
import { authInit, saveAuthRenewalIntervalHandler } from './actions/Auth';
import { getInstitutionListFromRegistry } from './actions/InstitutionList';
import { getLocationListFromRegistry } from './actions/LocationList';
import { getSchemaOrgMetadataFromRegistry, getSchemaOrgMetadataByPrefixFromRegistry } from './actions/SchemaOrgMetadata';

// Routers.
import AppRouter from './routers/AppRouter';

// Utils.
import { appendSchemaOrg } from './utils/schemaOrg';

// CSS.
import './styles/styles.scss';
import { renewToken } from './utils/auth';

import { MatomoProvider, createInstance as createMatomoInstance } from '@jonkoops/matomo-tracker-react';

import "@popperjs/core"
import "bootstrap/dist/js/bootstrap.min"

// ==================== APP Initialization ====================
(async () => {
  const instance = createMatomoInstance({
    urlBase: 'https://matomo.identifiers.org/',
    siteId: 1,
    disabled: false, // optional, false by default. Makes all tracking calls no-ops if set to true.
    heartBeat: { // optional, enabled by default
      active: true, // optional, default value: true
      seconds: 30 // optional, default value: `15
    },
    linkTracking: true, // optional, default value: true
    configurations: { // optional, default value: {}
      // any valid matomo configuration, all below are optional
      disableCookies: true,
      setSecureCookie: location.protocol.includes('https'), // Only available in https
      setRequestMethod: 'GET'
    }
  });

  // Get locations.
  store.dispatch(getLocationListFromRegistry());
  // Get institutions.
  store.dispatch(getInstitutionListFromRegistry());
  // Get Schema.org Metadata depending on current path and append it to the document's head.
  const prefix = window.location.pathname.split('/').pop();

  if (window.location.pathname.includes('registry') && (prefix !== "registry" && prefix !== "")) {
    await store.dispatch(getSchemaOrgMetadataByPrefixFromRegistry(prefix));
  } else {
    await store.dispatch(getSchemaOrgMetadataFromRegistry());
  }

  appendSchemaOrg(store.getState().schemaOrgMetadata);

  // Init auth.
  store.getState().config.enableAuthFeatures && await store.dispatch(authInit());

  // Auth token periodic renewal.
  if (store.getState().auth.authenticated) {
    const keycloak = store.getState().auth.keycloak;
    const tokenDuration = (moment.unix(keycloak.tokenParsed.exp) - moment.unix(keycloak.tokenParsed.iat));

    console.debug(`Auth -> Setting auth token renewal interval to ${(tokenDuration - tokenDuration * .1) / 1000} seconds.`);

    store.dispatch(saveAuthRenewalIntervalHandler(renewToken, tokenDuration - (tokenDuration * .1)));
  }

  // Render app.
  const container = document.getElementById("app");
  const root = createRoot(container);
  root.render(
    <Provider store={store}>
      <MatomoProvider value={instance}>
        <AppRouter />
      </MatomoProvider>,
    </Provider>
  );
})()
