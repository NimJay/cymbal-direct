/*
This script creates a JSONL file that contains the embeddings for Cymbal Direct products.

To run this script:
1. Move into this folder: cd product-embeddings/
2. Install dependencies: npm install
3. Populate the PRODUCTS array below.
4. Set your PROJECT_NUMBER and other variables below.
5. Run this script: node generate-product-embeddings.js
*/

const fs = require('node:fs');
const { PredictionServiceClient } = require("@google-cloud/aiplatform").v1;
const { helpers } = require('@google-cloud/aiplatform');

const PROJECT_NUMBER = ''; // To derive your project number from your project ID, run: gcloud projects describe your-project-id --format="value(projectNumber)"
const EMBEDDING_MODEL = 'text-embedding-004'; // See https://cloud.google.com/vertex-ai/generative-ai/docs/learn/model-versions#embeddings_stable_model_versions
const FILE_TO_WRITE = 'product-embeddings.jsonl';
const PRODUCTS = [
  // When running this script, you'll need to copy over the list of products from products.ts
];

/**
 * Generate a vector representation (embedding) for each string in a given array, using an embedding model on Google Cloud.
 * Related documentation: https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/text-embeddings-api#embed_a_text_string
 * @param {*} textsArray An array of strings.
 * @returns An array of vectors. Each vector is a array of 768 numbers. (768 may differ based on the model you choose for embedding.)
 */
async function generateVectorRepresentations(textsArray) {
  if (!textsArray || !Array.isArray(textsArray) || textsArray.length === 0) {
    throw new Error('Invalid textsArray. It must be non-empty array of strings.');
  }
  const region = 'us-central1';
  const endpoint = `projects/${PROJECT_NUMBER}/locations/${region}/publishers/google/models/${EMBEDDING_MODEL}`;
  const instances = textsArray.map((text) => {
    return helpers.toValue({ content: text });
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
    // The vector (array of 768 numbers) is deeply nested in the response
    const embeddings = prediction?.structValue?.fields?.embeddings;
    const vectorOfObjects = embeddings?.structValue?.fields?.values?.listValue?.values;
    const vectorOfNums = vectorOfObjects.map(object => object.numberValue);
    return vectorOfNums;
  });
  return vectors;
}

async function main() {
  if (PRODUCTS.length === 0) {
    throw Error("The PRODUCT array is empty. You'll need to copy over the list of products.");
  }
  const productDescriptions = PRODUCTS.map((product) => product.description);
  const vectors = await generateVectorRepresentations(productDescriptions);
  // Write to a JSONL file where each line will looke like { id: "123", "name": "Black boots", embedding: [ ... ] }
  const output = PRODUCTS.map((product, index) => ({
    id: product.id,
    name: product.name,
    embedding: vectors[index]
  }));
  const jsonLines = output.map(JSON.stringify).join('\n');
  fs.writeFileSync(FILE_TO_WRITE, jsonLines);
}

main();
