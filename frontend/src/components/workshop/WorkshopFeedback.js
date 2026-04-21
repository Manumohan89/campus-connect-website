import React, { useState } from 'react';
import WorkshopBackground from './WorkshopBackground';
import WorkshopProgressBar from './WorkshopProgressBar';
import WelcomeStep      from './steps/WelcomeStep';
import ExperienceStep   from './steps/ExperienceStep';
import TechnicalStep    from './steps/TechnicalStep';
import FacultyStep      from './steps/FacultyStep';
import ImprovementStep  from './steps/ImprovementStep';
import RecommendStep    from './steps/RecommendStep';
import ThankYouStep     from './steps/ThankYouStep';
import { submitWorkshopFeedback } from './workshopApi';

const TOTAL_STEPS = 7;

const INITIAL_DATA = {
  overallRating:     0,
  likedMost:         '',
  reactConfidence:   '',
  jsUnderstanding:   '',
  nodeClarity:       '',
  mongodbConfidence: '',
  bestTopic:         '',
  improvementTopic:  '',
  mohanRating:  { knowledge: 0, clarity: 0, interaction: 0 },
  raghavRating: { knowledge: 0, clarity: 0, interaction: 0 },
  manishRating: { knowledge: 0, clarity: 0, interaction: 0 },
  improvement:  '',
  suggestions:  '',
  recommend:    null,
};

export default function WorkshopFeedback() {
  const [step,      setStep]      = useState(0);
  const [data,      setData]      = useState(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState('');

  const handleChange = (key, value) => setData(prev => ({ ...prev, [key]: value }));
  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      await submitWorkshopFeedback(data);
      setStep(TOTAL_STEPS - 1);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showProgress = step > 0 && step < TOTAL_STEPS - 1;

  const stepProps = { data, onChange: handleChange, onNext: next, onBack: back };

  const steps = [
    <WelcomeStep    key="welcome"     onNext={next} />,
    <ExperienceStep key="experience"  {...stepProps} />,
    <TechnicalStep  key="technical"   {...stepProps} />,
    <FacultyStep    key="faculty"     {...stepProps} />,
    <ImprovementStep key="improvement" {...stepProps} />,
    <RecommendStep  key="recommend"   {...stepProps} onSubmit={handleSubmit} isLoading={isLoading} />,
    <ThankYouStep   key="thankyou" />,
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: '#050508' }}>
      <WorkshopBackground />

      {showProgress && (
        <WorkshopProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
      )}

      {/* Error toast */}
      {error && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 50, padding: '0.75rem 1.5rem', borderRadius: '12px',
          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
          color: '#fca5a5', fontSize: '0.875rem', backdropFilter: 'blur(12px)',
          whiteSpace: 'nowrap',
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 10, height: '100vh', overflowY: 'auto' }}>
        {steps[step]}
      </div>
    </div>
  );
}
