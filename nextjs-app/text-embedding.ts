/*
Functions in this file can be used to generate vector representations of some text — via Google Cloud's embedding models.
The vector representations can be used to query a Vector Search index for similar vectors.
Vector Search is a Google Cloud product: https://cloud.google.com/vertex-ai/docs/vector-search/overview
*/

import { helpers, PredictionServiceClient } from "@google-cloud/aiplatform";
import { getGoogleCloudProjectNumber } from "./google-cloud-project";

// Ensure we're using a stable model: https://cloud.google.com/vertex-ai/generative-ai/docs/learn/model-versions#embeddings_stable_model_versions
const EMBEDDING_MODEL = 'text-embedding-004';

/**
 * This function uses an embedding model to create a vector representation of the provided text.
 * @param text The string for which a vector representation will be obtained. Only the first 500 characters will be used.
 * @returns A vector (an array of 768 numbers). The length (768) is determined by the embedding model used.
 */
async function getVectorRepresentation(text: string): Promise<number[]> {
  const first500Characters = text.slice(0, 500);
  const vectors = await getVectorRepresentations([first500Characters]);
  return vectors[0];
}

/**
 * This function uses an embedding model to create vector representations for a provided array of text.
 * @param textsArray The strings for which a vector representation will be obtained. Only the first 500 characters of each string will be used.
 * @returns An array of vectors. Each vector is an array of 768 numbers. The length (768) is determined by the embedding model used.
 */
async function getVectorRepresentations(textsArray: string[]): Promise<number[][]> {
  const region = 'us-central1';
  const projectNumber = await getGoogleCloudProjectNumber();
  const endpoint = `projects/${projectNumber}/locations/${region}/publishers/google/models/${EMBEDDING_MODEL}`;
  textsArray = textsArray.map((text) => text.slice(0, 500));
  const instances = textsArray.map((text) => {
    return helpers.toValue({ content: text }) as protobuf.common.IValue;
  });
  const request = { endpoint, instances };
  const apiEndpoint = `${region}-aiplatform.googleapis.com`;
  // Make the request to Google Cloud
  const predictionServiceClient = new PredictionServiceClient({ apiEndpoint });
  const [response] = await predictionServiceClient.predict(request);
  if (!response || !Array.isArray(response.predictions)) {
    throw new Error('You received an invalid response from Google Cloud.');
  }
  // Extract the vectors from the response
  const vectors = response.predictions.map((prediction) => {
    // The vectors (arrays of 768 numbers) are deeply nested in the response
    const embeddings = prediction?.structValue?.fields?.embeddings;
    const vectorOfObjects = embeddings?.structValue?.fields?.values?.listValue?.values;
    const vectorOfNums = vectorOfObjects?.map(object => object.numberValue);
    return vectorOfNums;
  });
  console.log(`Generated ${vectors.length} vector representations.`);
  return vectors as number[][];
}

export { getVectorRepresentation, getVectorRepresentations }
