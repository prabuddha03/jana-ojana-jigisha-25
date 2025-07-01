'use client';

type RulesModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full m-4">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl sm:text-3xl font-bold text-dark-purple pr-4">Rules & Regulations</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-dark-purple transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="text-gray-600 space-y-3 max-h-[60vh] overflow-y-auto pr-4 text-left">
            <p><span className="font-semibold text-dark-purple">1.</span> This is a team event. Each team must have 2 members.</p>
            <p><span className="font-semibold text-dark-purple">2.</span> The quiz will have a preliminary round followed by the final round for the top 6 teams.</p>
            <p><span className="font-semibold text-dark-purple">3.</span> The preliminary round will be a written test of 25 questions.</p>
            <p><span className="font-semibold text-dark-purple">4.</span> The final round will have multiple rounds including buzzer rounds, audio-visual rounds, and rapid-fire rounds.</p>
            <p><span className="font-semibold text-dark-purple">5.</span> Use of mobile phones or any other electronic gadgets is strictly prohibited during the quiz.</p>
            <p><span className="font-semibold text-dark-purple">6.</span> The quizmaster&apos;s decision will be final and binding.</p>
            <p><span className="font-semibold text-dark-purple">7.</span> All participants must carry their school ID cards.</p>
            <p><span className="font-semibold text-dark-purple">8.</span> Reporting time is 9:00 AM on the day of the event.</p>
          </div>
        </div>
        <div className="bg-gray-50 px-6 sm:px-8 py-4 flex justify-end rounded-b-lg">
           <button
             onClick={onClose}
             className="bg-light-purple text-white font-bold py-2 px-6 rounded-full hover:bg-dark-purple transition-all duration-300 transform hover:scale-105 shadow-md"
           >
             Close
           </button>
        </div>
      </div>
    </div>
  );
} 