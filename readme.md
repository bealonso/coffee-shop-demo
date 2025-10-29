# Coffee Shop Feedback Application Deployment Guide

This document provides step-by-step instructions to deploy the Coffee Shop Feedback application and its backend services to Google Cloud. The architecture consists of a frontend web application hosted on Cloud Run, and two backend services (`generate-complaint` and `submit-feedback`) hosted as Cloud Functions.

## Overview

-   **Frontend**: A React application, built with Vite and served from a container on Cloud Run.
-   **`generate-complaint` Backend**: A Cloud Function that uses the Gemini API to generate a sample negative comment.
-   **`submit-feedback` Backend**: A Cloud Function that receives user comments, serializes them using Protocol Buffers, and publishes them to a Google Cloud Pub/Sub topic.

## Prerequisites

Before you begin, ensure you have the following:

1.  **Google Cloud Project**: A Google Cloud project with billing enabled.
2.  **gcloud CLI**: The [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed and configured.
    -   Authenticate the CLI: `gcloud auth login`
    -   Set your project context: `gcloud config set project [YOUR_PROJECT_ID]`
3.  **APIs Enabled**: Ensure the following APIs are enabled in your project:
    -   Cloud Run API
    -   Cloud Functions API
    -   Cloud Build API
    -   Pub/Sub API
    -   IAM API
    You can enable them with:
    ```sh
    gcloud services enable run.googleapis.com cloudfunctions.googleapis.com cloudbuild.googleapis.com pubsub.googleapis.com iam.googleapis.com
    ```
4.  **Node.js**: [Node.js](https://nodejs.org/) (version 18 or later) installed on your local machine.
5.  **Gemini API Key**: At least one active Gemini API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey). The function is configured to use up to three keys for resilience.

---

## Deployment Steps

Follow these steps in order to deploy all components of the application.

### 1. Deploy `generate-complaint` Backend Service

This function generates negative feedback comments using the Gemini API.

1.  **Navigate to the function directory**:
    ```sh
    cd cloud-functions/generate-complaint
    ```

2.  **Deploy the Cloud Function**:
    Run the following command, replacing `[YOUR_REGION]` with your desired Google Cloud region (e.g., `us-central1`) and `[YOUR_GEMINI_API_KEY]` with your Gemini API key. You can provide up to three comma-separated keys.

    ```sh
    gcloud functions deploy generate-complaint \
      --gen2 \
      --runtime=nodejs18 \
      --region=[YOUR_REGION] \
      --source=. \
      --entry-point=generateComplaint \
      --trigger-http \
      --allow-unauthenticated \
      --set-env-vars="GEMINI_API_KEY_1=[YOUR_GEMINI_API_KEY]"
    ```
    *Note: To add more keys, append them to the `--set-env-vars` flag: `GEMINI_API_KEY_1=...,GEMINI_API_KEY_2=...`*

3.  **Save the Trigger URL**: After deployment, the command will output a trigger URL. Copy and save this URL for the frontend configuration. It will look like `https://generate-complaint-....run.app`.

### 2. Deploy `submit-feedback` Backend Service

This function submits feedback comments to a Pub/Sub topic.

1.  **Create a Pub/Sub Topic**:
    Create the topic where feedback messages will be published.
    ```sh
    gcloud pubsub topics create devfest-comments-topic
    ```

2.  **Update Function Source Code**:
    Before deploying, you must update the project ID in the function's source code.
    -   Open the file `cloud-functions/submit-feedback/index.js`.
    -   Find the line: `const topicName = 'projects/bia-demos/topics/devfest-comments-topic';`
    -   Replace `bia-demos` with your Google Cloud Project ID:
        ```javascript
        const topicName = 'projects/[YOUR_PROJECT_ID]/topics/devfest-comments-topic';
        ```
    -   Save the file.

3.  **Navigate to the function directory**:
    ```sh
    # Assuming you are still in the generate-complaint directory
    cd ../submit-feedback
    ```

4.  **Deploy the Cloud Function**:
    Run the following command, replacing `[YOUR_REGION]` with the same region you used before.
    ```sh
    gcloud functions deploy submit-feedback \
      --gen2 \
      --runtime=nodejs18 \
      --region=[YOUR_REGION] \
      --source=. \
      --entry-point=submitFeedback \
      --trigger-http \
      --allow-unauthenticated
    ```

5.  **Grant Pub/Sub Permissions**:
    The deployed function runs as a specific service account, which needs permission to publish messages to your Pub/Sub topic.
    
    First, get the service account email for your function:
    ```sh
    gcloud functions describe submit-feedback --region=[YOUR_REGION] --gen2 --format="value(serviceConfig.serviceAccountEmail)"
    ```
    Copy the output email address. Then, grant it the `Pub/Sub Publisher` role:
    ```sh
    gcloud projects add-iam-policy-binding [YOUR_PROJECT_ID] \
      --member="serviceAccount:[FUNCTION_SERVICE_ACCOUNT_EMAIL]" \
      --role="roles/pubsub.publisher"
    ```
    Replace `[FUNCTION_SERVICE_ACCOUNT_EMAIL]` with the email you just copied.

6.  **Save the Trigger URL**: After deployment, copy and save the trigger URL for this function. It will look like `https://submit-feedback-....run.app`.

### 3. Build and Deploy Frontend Application

The final step is to configure the frontend with the backend URLs and deploy it to Cloud Run.

1.  **Navigate to the project root**:
    ```sh
    # Assuming you are in the submit-feedback directory
    cd ../.. 
    ```

2.  **Install Frontend Dependencies**:
    ```sh
    npm install
    ```

3.  **Update Backend URLs**:
    -   Open `src/services/geminiService.ts` and replace the placeholder `CLOUD_FUNCTION_URL` with the URL you saved from the `generate-complaint` deployment.
    -   Open `src/services/feedbackService.ts` and replace the placeholder `API_URL` with the URL you saved from the `submit-feedback` deployment.

4.  **Deploy to Cloud Run**:
    Run the following command from the project root. Cloud Build will automatically use the `Dockerfile` to build the React app and deploy the container. Replace `[YOUR_REGION]` with your desired region.

    ```sh
    gcloud run deploy coffee-shop-feedback \
      --source . \
      --platform managed \
      --region=[YOUR_REGION] \
      --allow-unauthenticated
    ```

5.  **Access Your Application**: After deployment, `gcloud` will provide a URL for your Cloud Run service. Open this URL in your web browser to use the application.

## Conclusion

Your Coffee Shop Feedback application is now fully deployed and operational on Google Cloud.
