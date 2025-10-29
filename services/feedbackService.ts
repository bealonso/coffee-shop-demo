// TODO: Replace this with your actual Google Cloud Function URL
const API_URL = 'https://submit-feedback-917613752271.us-west1.run.app';

export const submitFeedback = async (comment: string): Promise<any> => {
  if (!comment.trim()) {
    throw new Error("Comment cannot be empty.");
  }

  const usertag = "user_42"

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      comment: comment,
      usertag: usertag,
    }),
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
        const errorBody = await response.text();
        errorMessage = `${errorMessage} - ${errorBody}`;
    } catch (e) {
        // Ignore if response body cannot be read
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
};
