
import React, { useState, useRef, useEffect } from 'react';
import { generateComplaint } from './services/geminiService';
import { submitFeedback } from './services/feedbackService';
import Spinner from './components/Spinner';
import GeminiIcon from './components/icons/GeminiIcon';
import CheckIcon from './components/icons/CheckIcon';
import UserIcon from './components/icons/UserIcon';
import OriginalPost from './components/OriginalPost';
import SubmittedComment from './components/SubmittedComment';

const App: React.FC = () => {
  const [feedbackText, setFeedbackText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedComments, setSubmittedComments] = useState<string[]>([]);
  const submissionTimer = useRef<number | null>(null);

  useEffect(() => {
    // Cleanup timer when component unmounts
    return () => {
      if (submissionTimer.current) {
        clearTimeout(submissionTimer.current);
      }
    };
  }, []);

  const handleGenerateComplaint = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const complaint = await generateComplaint();
      setFeedbackText(complaint);
    } catch (err) {
      setError('Failed to generate complaint. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    // Clear any existing timer to reset the 30-second window
    if (submissionTimer.current) {
      clearTimeout(submissionTimer.current);
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Wait for the submission to complete
      await submitFeedback(feedbackText);
      console.log('Submission successful');

      // Update UI with the new comment
      setSubmittedComments(prev => [...prev, feedbackText]);
      setFeedbackText(''); // Clear input

      // Start the timer to navigate to the Thank You page
      submissionTimer.current = window.setTimeout(() => {
        setIsSubmitted(true);
        setSubmittedComments([]); // Reset for the next session
      }, 30000); // 30 seconds

    } catch (err) {
      setError('Failed to submit reply. Please check your connection and try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-2xl shadow-lg">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <CheckIcon className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Thank You!</h1>
          <p className="text-gray-600">
            Your reply has been sent. We appreciate you taking the time to help us improve.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setSubmittedComments([]); // Ensure comments are cleared
            }}
            className="w-full px-4 py-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300"
          >
            Submit Another Reply
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        <OriginalPost />
        <main className="p-4 border-t border-gray-200">
          <form onSubmit={handleSubmit}>
            <div className="flex space-x-3">
              <div className="flex-shrink-0 relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 -top-4 h-4 w-0.5 bg-gray-300"></div>
                <UserIcon className="w-12 h-12" />
              </div>
              <div className="flex-1">
                <div className="text-gray-500 text-sm">
                  Replying to <span className="text-sky-500">@coffee_shop</span>
                </div>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Post your reply"
                  className="w-full text-lg text-gray-800 placeholder-gray-500 bg-transparent border-none focus:outline-none focus:ring-0 resize-none mt-1"
                  rows={4}
                  maxLength={280}
                />
              </div>
            </div>
            {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
            <div className="mt-4 flex items-center justify-between pl-16">
                <div className="text-sm text-gray-400">
                    {feedbackText.length} / 280
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleGenerateComplaint}
                        disabled={isLoading || isSubmitting}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Generate Complaint"
                    >
                        {isLoading ? <Spinner className="w-5 h-5" /> : <GeminiIcon className="w-5 h-5" />}
                        <span>Generate</span>
                    </button>
                    <button
                        type="submit"
                        disabled={!feedbackText.trim() || isSubmitting}
                        className="px-5 py-2 text-sm font-bold text-white bg-sky-500 rounded-full hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-300 disabled:bg-sky-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? <Spinner className="w-5 h-5" /> : "Submit"}
                    </button>
                </div>
            </div>
          </form>
        </main>
        {submittedComments.map((comment, index) => (
          <SubmittedComment key={index} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default App;