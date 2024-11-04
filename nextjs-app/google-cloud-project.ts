/*
This file contains functions related to your Google Cloud project.
Almost every Google Cloud resource you deploy or interact with will live inside a Google Cloud project that you create.
When this app is deployed, there will always be an associated project ID.
*/

import { ProjectsClient } from "@google-cloud/resource-manager";

let cachedProjectNumber: string;

function getGoogleCloudProjectId(): string {
  // The GOOGLE_CLOUD_PROJECT environment variable is automatically set by Google Cloud
  // for containers you run inside Cloud Run.
  const googleCloudProjectId = process.env.GOOGLE_CLOUD_PROJECT;
  if (!googleCloudProjectId) {
    throw new Error(`Failed to get Google Cloud project ID.
If you're running this app on your local machine, you'll need to set the GOOGLE_CLOUD_PROJECT environment variable:

    export GOOGLE_CLOUD_PROJECT=my-project-id

If you're running this app on Cloud Run, the GOOGLE_CLOUD_PROJECT environment variable will automatically be set by Google Cloud.`);
  }
  return googleCloudProjectId;
}

async function getGoogleCloudProjectNumber(): Promise<string> {
  if (cachedProjectNumber) {
    return cachedProjectNumber;
  }
  const client = new ProjectsClient();
  const request = { query: `id:${getGoogleCloudProjectId()}` };
  const [response] = await client.searchProjects(request);
  const projectId = getGoogleCloudProjectId();
  const project = response.find(project => project.projectId === projectId);
  const projectNumber = project?.name?.split('/')[1];
  const isValidProjectNumber = typeof projectNumber === 'string' && projectNumber.length > 0;
  if (isValidProjectNumber) {
    cachedProjectNumber = projectNumber;
    return projectNumber;
  }
  throw new Error('Failed to query for your Google Cloud project number, from your Google Cloud project ID.');
}

export { getGoogleCloudProjectId, getGoogleCloudProjectNumber };
