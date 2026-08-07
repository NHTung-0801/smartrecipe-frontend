import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Clock, PackageOpen, ChevronLeft, ChevronRight, Soup } from 'lucide-react';
import s from '../../styles/components/CookingMode.module.css';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=1200';

const CookingMode = ({ recipe, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Lock body scroll when active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!recipe || !recipe.steps || recipe.steps.length === 0) {
    return createPortal(
      <div className={s.overlay}>
        <div className={s.header}>
          <button onClick={onClose} className={s.backButton}>
            <ArrowLeft size={20} /> Thoát Chế Độ Nấu
          </button>
        </div>
        <div className={s.body}>
          <div className="bg-white text-gray-800 p-8 rounded-2xl text-center">
            <h3 className="text-xl font-bold mb-2">Công thức này chưa có hướng dẫn</h3>
            <p className="text-gray-500 mb-6">Vui lòng quay lại và thêm các bước thực hiện.</p>
            <button onClick={onClose} className="px-6 py-2 bg-[#a13923] text-white rounded-full font-semibold">
              Quay lại
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  const steps = recipe.steps;
  const currentStep = steps[currentStepIndex];
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;
  
  // Try to parse pseudo-title from instruction
  const textParts = currentStep.instruction.split(/(?<=\.)\s/);
  const pseudoTitle = textParts[0];
  const desc = textParts.slice(1).join(' ') || textParts[0]; // if no dot, just show full text as desc

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return createPortal(
    <div className={s.overlay}>
      {/* Header */}
      <div className={s.header}>
        <button onClick={onClose} className={s.backButton}>
          <ArrowLeft size={20} /> Thoát Chế Độ Nấu
        </button>
        
        <div className={s.headerTitle}>
          <h2>{recipe.title}</h2>
          <p>{steps.length} Bước {recipe.cookTime ? `• ${recipe.cookTime} phút` : ''}</p>
        </div>
        
        <button className={s.timerButton} onClick={() => alert('Chức năng hẹn giờ chưa được thiết lập.')}>
          <Clock size={20} />
        </button>

        {/* Progress Bar */}
        <div className={s.progressBarContainer}>
          <div className={s.progressBar} style={{ width: `${progressPercentage}%` }} />
        </div>
      </div>

      {/* Main Body */}
      <div className={s.body}>
        <div className={s.stepCard} key={currentStepIndex}> {/* key ensures re-animation on step change */}
          <div className={s.imageSection}>
            <div className={s.stepBadge}>{currentStep.stepNumber || currentStepIndex + 1}</div>
            {currentStep.imageUrl ? (
              <img 
                src={currentStep.imageUrl} 
                alt={`Bước ${currentStepIndex + 1}`} 
                className={s.stepImage} 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#a13923] opacity-40 bg-[#fceceb]">
                <Soup size={120} strokeWidth={1} />
                <span className="mt-4 font-heading font-semibold text-xl tracking-wider">CHƯA CÓ HÌNH ẢNH</span>
              </div>
            )}
          </div>
          
          <div className={s.contentSection}>
            <h4 className={s.stepTitle}>
              {currentStepIndex === 0 ? 'CHUẨN BỊ' : 'THỰC HIỆN'}
            </h4>
            {textParts.length > 1 && (
              <h3 className={s.stepSubtitle}>{pseudoTitle}</h3>
            )}
            
            <div className={s.stepDescription}>
              {desc}
            </div>
            
            {/* Optional: Show ingredient hint on first step or similar */}
            {currentStepIndex === 0 && recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className={s.ingredientsList}>
                <PackageOpen size={20} className="text-[#a13923] shrink-0" />
                <p>{recipe.ingredients.slice(0, 4).map(i => i.ingredientName).join(', ')}{recipe.ingredients.length > 4 ? '...' : ''}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={s.footer}>
        <button 
          className={`${s.navButton} ${s.prevButton}`} 
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
        >
          <ChevronLeft size={20} /> Bước Trước
        </button>
        
        <div className={s.dots}>
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`${s.dot} ${idx === currentStepIndex ? s.dotActive : ''}`} 
            />
          ))}
        </div>
        
        <button 
          className={`${s.navButton} ${s.nextButton}`} 
          onClick={handleNext}
        >
          {currentStepIndex === steps.length - 1 ? 'Hoàn thành' : 'Bước Tiếp Theo'} {currentStepIndex !== steps.length - 1 && <ChevronRight size={20} />}
        </button>
      </div>
    </div>,
    document.body
  );
};

export default CookingMode;
