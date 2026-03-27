import { useState } from 'react';
import { S } from '../lib/styles';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { seedDefaultTemplate } from '../lib/templates';
import { today } from '../lib/helpers';
import Welcome from './Welcome';
import ProfileSetup from './ProfileSetup';
import ChoosePath from './ChoosePath';
import MealPlanSetup from './MealPlanSetup';
import TrainingSplitSetup from './TrainingSplitSetup';
import Done from './Done';

export default function OnboardingFlow({ onComplete }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [saving, setSaving] = useState(false);

  const updateData = (patch) => setData((prev) => ({ ...prev, ...patch }));

  const handleEnterApp = async () => {
    setSaving(true);
    try {
      // 1. Seed default template if this is the first user or templates don't exist yet
      try {
        await seedDefaultTemplate(user.id);
      } catch (err) {
        console.warn('[onboarding] Template seed error (may already exist):', err.message);
      }

      // 2. Create/update profile
      await supabase.from('profiles').upsert({
        id: user.id,
        name: data.name || '',
        height: data.height || '',
        weight: data.weight || 220,
        body_fat_target: data.bodyFatTarget || '',
        mode: data.mode || 'cut',
        start_date: today(),
        calf_phase: 2,
        sled_stage: 0,
        onboarded: true,
        updated_at: new Date().toISOString(),
      });

      // 3. Create program
      const programName = data.programName || (data.mode === 'maintenance' ? 'Maintenance' : '12-Week Performance Cut');
      const programWeeks = data.programWeeks ?? (data.mode === 'maintenance' ? 0 : 12);

      await supabase.from('programs').insert({
        user_id: user.id,
        name: programName,
        start_date: today(),
        weeks: programWeeks,
        active: true,
      });

      // 4. Done — tell parent we're finished
      onComplete({
        startDate: today(),
        weight: data.weight || 220,
        weightLog: [],
        mealChecks: {},
        suppChecks: {},
        exLogs: {},
        mealOverrides: {},
        calfPhase: 2,
        sledStage: 0,
        checkins: {},
        rehabChecks: {},
        photos: {},
        mode: data.mode || 'cut',
        programs: [{ name: programName, start: today(), weeks: programWeeks, active: true }],
      });
    } catch (err) {
      console.error('[onboarding] Save error:', err);
      // Still enter app with defaults
      onComplete({
        startDate: today(),
        weight: data.weight || 220,
        weightLog: [],
        mealChecks: {},
        suppChecks: {},
        exLogs: {},
        mealOverrides: {},
        calfPhase: 2,
        sledStage: 0,
        checkins: {},
        rehabChecks: {},
        photos: {},
        mode: data.mode || 'cut',
        programs: [{ name: data.programName || '12-Week Performance Cut', start: today(), weeks: data.programWeeks || 12, active: true }],
      });
    } finally {
      setSaving(false);
    }
  };

  // Progress indicator
  const totalSteps = 6;
  const progressPct = ((step + 1) / totalSteps) * 100;

  return (
    <div style={{
      fontFamily: "'Barlow',system-ui,sans-serif",
      background: S.bg,
      color: S.tx,
      minHeight: '100vh',
      minHeight: '100dvh',
      maxWidth: 480,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Barlow+Condensed:wght@600;700;800&display=swap" rel="stylesheet" />

      {/* Progress bar */}
      {step > 0 && step < 5 && (
        <div style={{ height: 3, background: '#1a2744' }}>
          <div style={{
            height: '100%',
            width: `${progressPct}%`,
            background: `linear-gradient(90deg, ${S.bl}, ${S.gr})`,
            borderRadius: 2,
            transition: 'width 0.3s ease',
          }} />
        </div>
      )}

      {/* Saving overlay */}
      {saving && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10,14,23,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: "'Barlow Condensed'" }}>Setting up your program...</div>
          </div>
        </div>
      )}

      {/* Screens */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {step === 0 && <Welcome onNext={() => setStep(1)} />}
        {step === 1 && (
          <ProfileSetup
            data={data}
            onUpdate={updateData}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <ChoosePath
            data={data}
            onUpdate={updateData}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <MealPlanSetup
            data={data}
            onUpdate={updateData}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <TrainingSplitSetup
            data={data}
            onUpdate={updateData}
            onNext={() => setStep(5)}
            onBack={() => setStep(3)}
          />
        )}
        {step === 5 && (
          <Done
            data={data}
            onEnterApp={handleEnterApp}
          />
        )}
      </div>
    </div>
  );
}
