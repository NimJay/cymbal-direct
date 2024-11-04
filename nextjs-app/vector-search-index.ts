/*
This file allows us to programmatically obtain details (such as ID and name) of the Vector Search index endpoint used for this app.
We grab this info programmatically because we want to avoid having to manually configure the app with these sensitive details — both,
for security and convenience.
*/

import { IndexEndpointServiceClient, protos } from '@google-cloud/aiplatform';
import { getGoogleCloudProjectId } from './google-cloud-project';

interface VectorSearchIndexEndpoint {
  id: string;
  name: string, // The name looks like projects/123456789123/locations/us-central1/indexes/1234567891234567891
  displayName: string;
  publicEndpointDomainName: string, // This looks like '123456789.us-central1-123456789123.vdb.vertexai.goog'
  deployedIndexes: {
    id: string,
  }[];
};

let cachedVectorSearchEndpoints: VectorSearchIndexEndpoint[];

async function listVectorSearchEndpoints(): Promise<VectorSearchIndexEndpoint[]> {
  if (cachedVectorSearchEndpoints) {
    return cachedVectorSearchEndpoints;
  }
  const googleCloudProjectId = await getGoogleCloudProjectId();
  const region = 'us-central1';
  const apiEndpoint = `${region}-aiplatform.googleapis.com`;
  const client = new IndexEndpointServiceClient({ apiEndpoint });
  const parent = `projects/${googleCloudProjectId}/locations/${region}`;
  const [response] = await client.listIndexEndpoints({ parent });
  console.log(`Got ${response.length} Vector Search index endpoint(s) from Google Cloud.`);
  const endpoints = response.map(convertIIndexEndpointToVectorSearchIndexEndpoint);
  cachedVectorSearchEndpoints = endpoints;
  return endpoints;
}

/**
 * This function converts an IIndexEndpoint object (from the Google Cloud API response)
 * to a VectorSearchIndexEndpoint which is a little cleaner and easier to work with.
 * @param iIndexEndpoint The IIndexEndpoint object obtains from the Google Cloud API which you want to convert.
 * @returns The VectorSearchIndexEndpoint.
 */
function convertIIndexEndpointToVectorSearchIndexEndpoint(
  iIndexEndpoint: protos.google.cloud.aiplatform.v1.IIndexEndpoint,
): VectorSearchIndexEndpoint {
  // The name looks like projects/123456789123/locations/us-central1/indexes/1234567891234567891
  const id = (iIndexEndpoint.name as string).split('/')[5];
  const endpoint: VectorSearchIndexEndpoint = {
    id,
    name: iIndexEndpoint.name as string,
    displayName: iIndexEndpoint.displayName as string,
    publicEndpointDomainName: iIndexEndpoint.publicEndpointDomainName as string,
    deployedIndexes: [],
  };
  if (Array.isArray(iIndexEndpoint.deployedIndexes)) {
    endpoint.deployedIndexes = iIndexEndpoint.deployedIndexes.map(deployedIndex => {
      return {
        id: deployedIndex.id as string,
      };
    });
  }
  return endpoint;
}

async function getProductsVectorSearchIndexEndpoint(): Promise<VectorSearchIndexEndpoint> {
  const endpoints = await listVectorSearchEndpoints();
  const indexEndpointDisplayName = `cymbal-direct-index-endpoint`;
  const endpoint = endpoints.find(endpoint => endpoint.displayName === indexEndpointDisplayName);
  if (!endpoint) {
    throw new Error(`Failed to find Vector Search index endpoint with display name ${indexEndpointDisplayName}. Make sure you've created the index.`);
  }
  if (endpoint.deployedIndexes.length === 0) {
    throw new Error(`The Vector Search index endpoint with display name, ${indexEndpointDisplayName}, doesn't have a deployed endpoint.`);
  }
  return endpoint;
}

export { getProductsVectorSearchIndexEndpoint };
