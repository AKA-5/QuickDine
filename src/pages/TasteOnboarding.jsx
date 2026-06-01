import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../context/AppContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const QUESTIONS = [
  {
    id: 'cuisines',
    title: 'Which cuisines do you crave?',
    subtitle: 'Select all that apply to guide your recommendations.',
    type: 'multi-select',
    options: ['Pakistani', 'Chinese', 'Italian', 'BBQ', 'Cafe', 'Continental'],
  },
  {
    id: 'spiceLevel',
    title: 'Select your preferred spice level',
    subtitle: 'How much kick do you prefer in your dishes?',
    type: 'slider',
    options: ['Mild', 'Medium', 'Hot', 'Extra Hot'],
  },
  {
    id: 'budget',
    title: 'What is your budget per person?',
    subtitle: 'Helps us filter dining options in your price range.',
    type: 'radio',
    options: [
      'Under PKR 800',
      'PKR 800–1500',
      'PKR 1500–3000',
      'PKR 3000+'
    ],
  },
  {
    id: 'diningWith',
    title: 'Who do you usually dine with?',
    subtitle: 'Adjusts recommendations for group size and ambiance.',
    type: 'chips-single',
    options: ['Solo', 'Couple', 'Family', 'Friends', 'Work'],
  },
  {
    id: 'dietary',
    title: 'Any dietary preferences or restrictions?',
    subtitle: 'Let us know if you have specific meal filters.',
    type: 'multi-select',
    options: ['None', 'Vegetarian', 'No Pork', 'Halal Only', 'Gluten-Free'],
  },
];

export default function TasteOnboarding() {
  const { user } = useAuth();
  const { setUser } = useApp();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    cuisines: [],
    spiceLevel: 'Medium',
    budget: 'PKR 800–1500',
    diningWith: 'Solo',
    dietary: ['None'],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleMultiSelect = (field, option) => {
    setAnswers(prev => {
      let currentVal = [...prev[field]];
      
      // If none is selected, clear everything else
      if (option === 'None') {
        currentVal = ['None'];
      } else {
        // If selecting something else, filter out "None"
        currentVal = currentVal.filter(item => item !== 'None');
        
        if (currentVal.includes(option)) {
          currentVal = currentVal.filter(item => item !== option);
        } else {
          currentVal.push(option);
        }
      }

      // If empty, default back to None for dietary
      if (currentVal.length === 0 && field === 'dietary') {
        currentVal = ['None'];
      }

      return {
        ...prev,
        [field]: currentVal,
      };
    });
  };

  const handleSingleSelect = (field, option) => {
    setAnswers(prev => ({
      ...prev,
      [field]: option,
    }));
  };

  const handleSliderChange = (e) => {
    const valueIndex = parseInt(e.target.value, 10);
    const selectedLevel = QUESTIONS[1].options[valueIndex];
    setAnswers(prev => ({
      ...prev,
      spiceLevel: selectedLevel,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (user?.uid) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          tasteProfile: answers
        });
        
        // Update local user state
        setUser(prev => ({
          ...prev,
          tasteProfile: answers
        }));

        navigate('/home');
      }
    } catch (err) {
      console.error('Error saving taste profile:', err);
      setIsSubmitting(false);
    }
  };

  const currentQ = QUESTIONS[currentStep];
  const progressPercent = ((currentStep + 1) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col justify-between">
      {/* Progress bar */}
      <div className="w-full bg-border h-1.5">
        <div 
          className="bg-accent h-full transition-all duration-300 ease-out" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-lg border border-border shadow-card p-8 md:p-12 space-y-8 transition-all duration-300">
          
          {/* Step indicator */}
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest font-semibold text-text-secondary">
              Question {currentStep + 1} of {QUESTIONS.length}
            </span>
          </div>

          {/* Question title */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-serif text-text-primary leading-tight font-normal">
              {currentQ.title}
            </h2>
            <p className="text-sm text-text-secondary font-sans">
              {currentQ.subtitle}
            </p>
          </div>

          {/* Options input wrapper */}
          <div className="py-4">
            
            {/* Multi select chips */}
            {currentQ.type === 'multi-select' && (
              <div className="flex flex-wrap justify-center gap-3">
                {currentQ.options.map(option => {
                  const isSelected = answers[currentQ.id].includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => handleMultiSelect(currentQ.id, option)}
                      className={`px-5 py-2.5 rounded-[6px] text-sm font-medium border transition-colors ${
                        isSelected 
                          ? 'bg-accent-light border-accent text-accent' 
                          : 'bg-white border-border hover:bg-bg text-text-primary'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Slider spice selection */}
            {currentQ.type === 'slider' && (
              <div className="space-y-6 max-w-sm mx-auto">
                <input
                  type="range"
                  min="0"
                  max={currentQ.options.length - 1}
                  step="1"
                  value={currentQ.options.indexOf(answers.spiceLevel)}
                  onChange={handleSliderChange}
                  className="w-full accent-accent bg-border h-2 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs uppercase tracking-wider font-semibold text-text-secondary">
                  {currentQ.options.map((option) => {
                    const isSelected = answers.spiceLevel === option;
                    return (
                      <span 
                        key={option} 
                        className={`transition-colors ${isSelected ? 'text-accent font-bold text-sm' : ''}`}
                      >
                        {option}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Radio list */}
            {currentQ.type === 'radio' && (
              <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                {currentQ.options.map(option => {
                  const isSelected = answers[currentQ.id] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleSingleSelect(currentQ.id, option)}
                      className={`w-full text-left px-5 py-3.5 rounded-[6px] text-sm font-medium border flex items-center justify-between transition-colors ${
                        isSelected 
                          ? 'bg-accent-light border-accent text-accent' 
                          : 'bg-white border-border hover:bg-bg text-text-primary'
                      }`}
                    >
                      <span>{option}</span>
                      <span className="material-symbols-outlined select-none text-xl">
                        {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Chips single select */}
            {currentQ.type === 'chips-single' && (
              <div className="flex flex-wrap justify-center gap-3">
                {currentQ.options.map(option => {
                  const isSelected = answers[currentQ.id] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleSingleSelect(currentQ.id, option)}
                      className={`px-5 py-2.5 rounded-[6px] text-sm font-medium border transition-colors ${
                        isSelected 
                          ? 'bg-accent-light border-accent text-accent' 
                          : 'bg-white border-border hover:bg-bg text-text-primary'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center justify-between border-t border-border pt-6 gap-4">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none`}
            >
              <span className="material-symbols-outlined text-lg mr-1 select-none">arrow_back</span>
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              disabled={
                isSubmitting || 
                (currentQ.type === 'multi-select' && answers[currentQ.id].length === 0)
              }
              className="bg-accent text-white rounded-[6px] px-6 py-2.5 text-sm font-medium hover:bg-[#B03D24] transition-colors flex items-center"
            >
              <span>{currentStep === QUESTIONS.length - 1 ? (isSubmitting ? 'Saving...' : 'Finish Setup') : 'Continue'}</span>
              {currentStep < QUESTIONS.length - 1 && (
                <span className="material-symbols-outlined text-lg ml-1 select-none">arrow_forward</span>
              )}
            </button>
          </div>

        </div>
      </main>

      {/* Decorative Brand Tagline */}
      <footer className="py-6 text-center text-xs text-text-secondary uppercase tracking-widest font-medium">
        Tailoring QuickDine AI to your palate.
      </footer>
    </div>
  );
}
