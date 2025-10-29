// TODO: Replace this with your actual Google Cloud Function URL
const CLOUD_FUNCTION_URL = 'https://generate-complaint-917613752271.us-west1.run.app';

export const generateComplaint = async (): Promise<string> => {
  try {
    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error from cloud function: ${response.status}`, errorBody);
      throw new Error(`Failed to generate complaint. Status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.complaint) {
        throw new Error("Invalid response from the cloud function.");
    }

    return data.complaint;

  } catch (error) {
    console.error("Error calling generate complaint cloud function:", error);
    throw new Error("Failed to communicate with the generation service.");
  }
};
