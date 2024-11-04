/*
This file helps retrieve Cymbal Direct products that are related to a given text.
*/

import { MatchServiceClient } from "@google-cloud/aiplatform";
import { getProductById, Product } from "./products";
import { getVectorRepresentation } from "./text-embedding";
import { getProductsVectorSearchIndexEndpoint } from "./vector-search-index";

/**
 * Get a list of products that are related to a specified text.
 * @param text Any string (for instance, the user's most recent message/question).
 */
async function getProductsRelatedToText(text: string): Promise<Product[]> {
  const vectorRepresentation = await getVectorRepresentation(text);
  const nearestNeighborIds = await getNearestNeighbors(vectorRepresentation);
  const products = await Promise.all(nearestNeighborIds.map(getProductById));
  return products.filter((product) => typeof product === 'object');
}

async function getNearestNeighbors(vector: number[]): Promise<string[]> {
  const vectorSearchIndexEndpoint = await getProductsVectorSearchIndexEndpoint();
  const deployedIndexId = vectorSearchIndexEndpoint.deployedIndexes[0].id;
  const indexEndpoint = new MatchServiceClient({
    apiEndpoint: vectorSearchIndexEndpoint.publicEndpointDomainName
  });
  const query = {
    datapoint: { featureVector: vector },
    approximateNeighborCount: 3,
    neighborCount: 2,
  };
  const response = await indexEndpoint.findNeighbors({
    deployedIndexId: deployedIndexId,
    queries: [query],
  });
  if (!response[0] || !response[0].nearestNeighbors || !response[0].nearestNeighbors[0]) {
    throw new Error(`You received an invalid response from the Vector Search index endpoint on Google Cloud.`);
  }
  const neighbors = response[0].nearestNeighbors[0].neighbors;
  if (!Array.isArray(neighbors)) {
    throw new Error(`The neighbors field (from Google Cloud's response) is not an Array.`);
  }
  const nearestDatapointIds = neighbors
    .map((neighbor) => neighbor.datapoint?.datapointId)
    .filter((id) => typeof id === 'string');
  console.log(`Found ${nearestDatapointIds.length} nearest neighbors with IDs: ${nearestDatapointIds.join('; ')}.`);
  return nearestDatapointIds;
}

export { getProductsRelatedToText };
