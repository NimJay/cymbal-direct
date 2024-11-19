/*
This file uses Google Cloud's Sensitive Data Protection (SDP) to redact sensitive info in strings.
SDP is part of the Data Loss Prevention (DLP) API.
*/

import { DlpServiceClient, protos } from "@google-cloud/dlp";
import { getGoogleCloudProjectId } from "./google-cloud-project";

type IInspectContentResponse = protos.google.privacy.dlp.v2.IInspectContentResponse;
type IInspectContentRequest = protos.google.privacy.dlp.v2.IInspectContentRequest;

// See https://cloud.google.com/sensitive-data-protection/docs/infotypes-reference#global
// There are more InfoTypes that you'll need to add to the type below.
// For simplicity, we just support a few types.
type InfoTypes = 'CREDIT_CARD_NUMBER' | 'EMAIL_ADDRESS' | 'PERSON_NAME';

const DEFAULT_INFO_TYPES: InfoTypes[] = [
  'CREDIT_CARD_NUMBER', 'EMAIL_ADDRESS', 'PERSON_NAME'
];

async function redactSensitiveData(
  string: string, infoTypesToRedact?: InfoTypes[],
): Promise<string> {
  // Construct request
  if (!infoTypesToRedact) {
    infoTypesToRedact = DEFAULT_INFO_TYPES;
  }
  const infoTypes = infoTypesToRedact.map(type => {
    return { name: type };
  });
  const projectId = getGoogleCloudProjectId();
  const request: IInspectContentRequest = {
    parent: `projects/${projectId}/locations/us-west1`,
    item: { value: string },
    inspectConfig: {
      infoTypes,
      minLikelihood: 'LIKELIHOOD_UNSPECIFIED',
      limits: { maxFindingsPerRequest: 0 },
      includeQuote: true,
    },
  };
  // DLP stands for Data Loss Prevention
  const client = new DlpServiceClient();
  const [ response ] = await client.inspectContent(request) as unknown as [IInspectContentResponse];
  const findings = response.result?.findings;
  if (!Array.isArray(findings)) {
    throw new Error('Invalid response from Sensitive Data Protection.');
  }
  console.log(`Sensitive Data Protection found ${findings?.length} substrings to be redacted.`);
  let indexOffset = 0;
  // Redact each substring (finding)
  for (const finding of findings) {
    const substring = finding.quote;
    const startingIndex = finding.location?.codepointRange?.start;
    const endingIndex = finding.location?.codepointRange?.end;
    const infoType = finding.infoType?.name;
    // Replace with [infoType]
    if ((startingIndex || startingIndex === 0) && endingIndex && infoType && substring) {
      string = string.slice(0, Number(startingIndex) + indexOffset)
        + `[${infoType}]`
        + string.slice(Number(endingIndex) + indexOffset);
      // As we redact substrings, the length of the string changes
      indexOffset += infoType.length + 2 - substring.length;
    }
  }
  return string;
}

export { redactSensitiveData };
