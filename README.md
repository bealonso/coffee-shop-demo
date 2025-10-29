# 🚀 Coffee Shop Feedback Application Deployment Guide

Welcome! This guide provides comprehensive instructions for deploying the Coffee Shop Feedback application and its backend services to Google Cloud.

The architecture features a modern serverless design: a frontend web application on **Cloud Run**, and two backend microservices on **Cloud Functions**.

---

## 🏛️ Architecture Overview

The application consists of three main components:

-   **Frontend (`coffee-shop-feedback`)**: A React application built with Vite. It's containerized and served globally via Cloud Run, providing a responsive user interface for submitting feedback.
-   **Backend (`generate-complaint`)**: A Cloud Function that leverages the Gemini API. It dynamically generates sample negative comments, showcasing generative AI capabilities.
-   **Backend (`submit-feedback`)**: A Cloud Function that acts as a secure endpoint for receiving user comments. It serializes the data using Protocol Buffers and publishes it to a Pub/Sub topic for reliable, asynchronous processing.

```
[User] -> [Frontend on Cloud Run] --(HTTP POST)--> [submit-feedback Cloud Function] -> [Pub/Sub Topic]
        |                                                                           ^
        |--(HTTP POST for generation)--> [generate-complaint Cloud Function] --------|
```

---

## ✅ Prerequisites

Before you begin, ensure you have the following ready.

-   **Google Cloud Project**: A project with billing enabled.
-   **gcloud CLI**: The [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated.
    -   Run `gcloud auth login` to authenticate.
    -   Run `gcloud config set project [YOUR_PROJECT_ID]` to set your project.
-   **Enabled APIs**: Key Google Cloud APIs must be enabled.
    > You can enable them all with this command:
    > ```sh
    > gcloud services enable \
    >   run.googleapis.com \
    >   cloudfunctions.googleapis.com \
    >   cloudbuild.googleapis.com \
    >   pubsub.googleapis.com \
    >   iam.googleapis.com
    > ```
-   **Node.js**: [Node.js](https://nodejs.org/) (version 18 or later).
-   **Gemini API Key**: At least one Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey). The `generate-complaint` function is designed to use up to three keys for better resilience.

---

## 🛠️ Deployment Steps

Follow these steps in order to deploy all components.

### Step 1: Deploy `generate-complaint` Backend (Cloud Function)

This function generates negative comments using the Gemini API.

1.  **Navigate to the function directory**:
    ```sh
    cd cloud-functions/generate-complaint
    ```

2.  **Deploy the Cloud Function**:
    Execute the command below. Replace the placeholders with your details.
    -   `[YOUR_REGION]`: Your desired Google Cloud region (e.g., `us-central1`).
    -   `[YOUR_GEMINI_API_KEY]`: Your Gemini API key.

    ```sh
    gcloud functions deploy generate-complaint \
      --gen2 \
      --runtime=nodejs18 \
      --region="[YOUR_REGION]" \
      --source=. \
      --entry-point=generateComplaint \
      --trigger-http \
      --allow-unauthenticated \
      --set-env-vars="GEMINI_API_KEY_1=[YOUR_GEMINI_API_KEY]"
    ```

    > 📝 **Tip**: To add more API keys for round-robin usage, append them to the `--set-env-vars` flag, like this:
    > `GEMINI_API_KEY_1=[KEY_1],GEMINI_API_KEY_2=[KEY_2]`

3.  **Save the Function URL**: After deployment, a trigger URL will be displayed. **Copy this URL.** You'll need it for the frontend configuration. It will look like: `https://generate-complaint-....run.app`.

### Step 2: Deploy `submit-feedback` Backend (Cloud Function)

This function submits feedback to a Pub/Sub topic.

1.  **Create the Pub/Sub Topic**:
    This topic will receive the feedback messages.
    ```sh
    gcloud pubsub topics create devfest-comments-topic
    ```

2.  **Update the Source Code**:
    The function needs to know your project ID to find the topic.
    -   Open `cloud-functions/submit-feedback/index.js`.
    -   Locate the line: `const topicName = 'projects/bia-demos/topics/devfest-comments-topic';`
    -   Replace `bia-demos` with your actual Google Cloud Project ID.
        ```javascript
        const topicName = 'projects/[YOUR_PROJECT_ID]/topics/devfest-comments-topic';
        ```
    -   Save the file.

3.  **Navigate to the function directory**:
    ```sh
    # If you are in the generate-complaint directory
    cd ../submit-feedback
    ```

4.  **Deploy the Cloud Function**:
    Run the deployment command, using the same `[YOUR_REGION]` as before.
    ```sh
    gcloud functions deploy submit-feedback \
      --gen2 \
      --runtime=nodejs18 \
      --region="[YOUR_REGION]" \
      --source=. \
      --entry-point=submitFeedback \
      --trigger-http \
      --allow-unauthenticated
    ```

5.  **Grant Pub/Sub Permissions**:
    The function needs permission to publish messages.
    
    > ⚠️ **Important**: This step is crucial for the function to work correctly.
    
    a. Get the function's unique service account email:
    ```sh
    gcloud functions describe submit-feedback --region="[YOUR_REGION]" --gen2 --format="value(serviceConfig.serviceAccountEmail)"
    ```
    
    b. Copy the email address from the output and use it to grant the `Pub/Sub Publisher` role:
    ```sh
    gcloud projects add-iam-policy-binding [YOUR_PROJECT_ID] \
      --member="serviceAccount:[PASTE_THE_SERVICE_ACCOUNT_EMAIL_HERE]" \
      --role="roles/pubsub.publisher"
    ```

6.  **Save the Function URL**: After deployment completes, **copy the trigger URL** for this function. It will look like: `https://submit-feedback-....run.app`.

### Step 3: Build & Deploy Frontend Application (Cloud Run)

The final step is to configure and deploy the React frontend.

1.  **Navigate to the project root**:
    ```sh
    # If you are in the submit-feedback directory
    cd ../.. 
    ```

2.  **Install Frontend Dependencies**:
    ```sh
    npm install
    ```

3.  **Update Backend Service URLs**:
    -   Open `src/services/geminiService.ts` and replace the placeholder with the URL from **Step 1.3**.
    -   Open `src/services/feedbackService.ts` and replace the placeholder with the URL from **Step 2.6**.

4.  **Deploy to Cloud Run**:
    This single command builds the container image using the `Dockerfile` and deploys it.
    ```sh
    gcloud run deploy coffee-shop-feedback \
      --source . \
      --platform managed \
      --region="[YOUR_REGION]" \
      --allow-unauthenticated
    ```

---

## 🎉 Verification

Once deployment is complete, `gcloud` will provide the final URL for your Cloud Run service. Open this URL in your web browser.

You should be able to:
-   See the coffee shop post.
-   Click the **Generate** button to have Gemini create a comment.
-   Click **Submit** to send the comment.
-   See a "Thank You" page after a short delay.

Your application is now live!
