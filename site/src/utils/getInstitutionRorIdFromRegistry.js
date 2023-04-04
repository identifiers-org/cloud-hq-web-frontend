import {config} from "../config/Config";

export default async (rorId) => {
  let requestURL = new URL(`${config.registryApi}/${config.rorIdEndpoint}/getInstitutionForRorId`);
  const init = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      apiVersion: '1.0',
      payload: {rorId}
    })
  };

  const response = await fetch(requestURL, init);

  return response.status === 200 ? await response.json() : null;
};