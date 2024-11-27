# Cymbal Direct

Cymbal Direct is a demo web application built using TypeScript and Next.js. It demonstrates Google Cloud technologies.

## Purpose of this app

The purpose of this demo application is to demonstrate Google Cloud products and best practices related to building an LLM (large language model) based chatbot agent.

![A screenshot of the home page of Cymbal Direct, containing a chatbox and a list of products (shoes and boots).](screenshot.png)

## Run on your machine

To run this app in development mode, you will need a [Google Cloud project](https://cloud.google.com/resource-manager/docs/creating-managing-projects) with billing enabled.

1. Using [Cloud console](https://console.cloud.google.com/firestore/databases), create the default Firestore database (titled `(default)`).
1. Run the Terraform inside `/terraform/` which will deploy some of the Google Cloud resources used by this app such as a Vector Search index. Instructions are in [/terraform/README.md](/terraform/README.md).
1. Using [Cloud console](https://console.cloud.google.com/vertex-ai/matching-engine/indexes), manually deploy your Vector Search index.
1. Run the Next.js app locally on your machine. Instructions are in [/nextjs-app/README.md](/nextjs-app/README.md).
