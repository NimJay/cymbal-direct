# Cymbal Direct Terraform

This folder contains Terraform code that can be run to create Google Cloud resources (such as a Vector Search index on Google Cloud) that are necessary for deploying the Cymbal Direct sample application.
Terraform is an "infrastructure as code" tool that lets you define your cloud resources — instead of, for instance, using the web UI to create, manage, and destroy resources.

To run this Terraform:

1.  Move into this folder.
    ```
    cd terraform/
    ```
1.  Initialize Terraform (and download provider plugins).
    ```
    terraform init
    ```
1.  Provision the Google Cloud resources by applying the Terraform:
    ```
    terraform apply -var="project_id=GOOGLE_CLOUD_PROJECT_ID"
    ```
    Replace `GOOGLE_CLOUD_PROJECT_ID` with your Google Cloud project ID.
