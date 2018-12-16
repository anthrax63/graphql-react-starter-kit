import fetch from '../core/fetch';
import check from 'check-types';
import FormData from 'form-data';

function createGraphqlRequest(fetchKnowingCookie) {
  return async function graphqlRequest(query, variables) {
    const fetchConfig = {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({query, variables}),
      credentials: 'include'
    };
    const resp = await fetchKnowingCookie('/graphql', fetchConfig);
    if (resp.status !== 200) throw new Error(resp.statusText);
    return await resp.json();
  };
}

function createFileUploadRequest(fetchKnowingCookie) {
  return async function fileUploadRequest(id, file) {
    check.assert.nonEmptyString(id, '"id" is required');
    check.assert.assigned(file, '"file" is required');
    let form = new FormData();
    if (file.size) {
      form.append('size', file.size);
    }
    form.append('file', file);
    const fetchConfig = {
      method: 'post',
      body: form,
      credentials: 'include'
    };
    const resp = await fetchKnowingCookie(`/files/${id}`, fetchConfig);
    if (resp.status !== 201) throw new Error(resp.statusText);
    return true;
  };
}

function createFetchKnowingCookie({cookie}) {
  if (!process.env.BROWSER) {
    return (url, options = {}) => {
      const isLocalUrl = /^\/($|[^/])/.test(url);

      // pass cookie only for itself.
      // We can't know cookies for other sites BTW
      if (isLocalUrl && options.credentials === 'include') {
        const headers = {
          ...options.headers,
          cookie
        };
        return fetch(url, {...options, headers});
      }

      return fetch(url, options);
    };
  }

  return fetch;
}

export default function createHelpers(config) {
  const fetchKnowingCookie = createFetchKnowingCookie(config);
  const graphqlRequest = createGraphqlRequest(fetchKnowingCookie);
  const fileUploadRequest = createFileUploadRequest(fetchKnowingCookie);

  return {
    fetch: fetchKnowingCookie,
    graphqlRequest,
    fileUploadRequest,
    history: config.history
  };
}
