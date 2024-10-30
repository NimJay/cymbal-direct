# Cymbal Direct Next.js Application

This folder contains the Cymbal Direct web application developed using Next.js.
Next.js is not just a frontend framework — it is also a backend framework.
So this folder implements both the frontend and backend.

## Develop on your machine

You can run the app on your local machine.

1. Install Node.js (version 20).
2. Move into this folder:
   ```
   cd nextjs-app/
   ```
3. Set the `GOOGLE_CLOUD_PROJECT` environment variable:
   ```
   export GOOGLE_CLOUD_PROJECT=my-project-id
   ```
4. If you haven't already done so, install the Node.js dependencies:
   ```
   npm install
   ```
5. Start the Next.js application's development server:
   ```
   npm run dev
   ```

## Build and push the Docker container

We deploy the Next.js app in a Docker container.

1. Set your Google Cloud project ID:
   ```
   PROJECT_ID=my-project-id
   ```
1. Enable the Artifact Registry API:
   ```
   gcloud --project ${PROJECT_ID} services enable artifactregistry.googleapis.com
   ```
1. Create an Artifact Registry Docker repository:
   ```
   gcloud artifacts repositories create cymbal-direct \
       --project ${PROJECT_ID} \
       --repository-format=docker \
       --location=us-central1
   ```
1. Enable the Cloud Build API:
   ```
   gcloud --project ${PROJECT_ID} services enable cloudbuild.googleapis.com
   ```
1. Build the Docker container:
   ```
   gcloud builds submit \
       --tag us-central1-docker.pkg.dev/${PROJECT_ID}/cymbal-direct/nextjs:v0.0.0.0
   ```

## More info

* The very first version of this Next.js app was generated (in 2024) from the starter template at [Learn Next.js](https://nextjs.org/learn). The following command was used:
```
npx create-next-app@latest nextjs-blog --use-npm --example "https://github.com/vercel/next-learn/tree/main/basics/learn-starter"
```
