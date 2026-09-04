import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, ChefHat, Check, Loader2, Sparkles, AlertCircle, X, Leaf, Bookmark } from 'lucide-react';
import { aiService } from '../../services/aiService';
import s from '../../styles/components/AiRecipeCard.module.css';

/**
 * Hiển thị kết quả công thức do AI sinh ra (dạng chat bubble)
 */
export default function AiRecipeCard({ data, logId, onCancel }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (id) => aiService.saveAiRecipe(id),
    onSuccess: (res) => {
      // res là ApiResponse body: { success, data: RecipeResponse, message }
      // res.data là RecipeResponse object, cần lấy .id
      const recipeId = res?.data?.id;
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['ai-history'] });
      if (recipeId) {
        navigate(`/recipes/${recipeId}`);
      } else {
        navigate('/recipes');
      }
    }
  });

  if (!data) return null;

  const { title, description, difficulty, prepTimeMinutes, cookTimeMinutes, ingredients, steps } = data;
  const totalTime = (prepTimeMinutes || 0) + (cookTimeMinutes || 0);

  const handleSave = () => {
    if (!logId) return;
    saveMutation.mutate(logId);
  };

  return (
    <div className={s.card}>
      <div className={s.header}>
        <h2 className={s.title}>{title}</h2>
        
        <div className={s.badges}>
          <div className={`${s.badge} ${s.badgeZeroWaste}`}>
            <Leaf size={12} /> ZERO-WASTE
          </div>
          <div className={`${s.badge} ${s.badgeAi}`}>
            <Sparkles size={12} /> AI-GENERATED
          </div>
        </div>

        <p className={s.description}>{description}</p>
        
        <div className={s.meta}>
          <div className={s.metaItem}>
            <ChefHat size={18} />
            <span>{difficulty === 'EASY' ? 'Dễ' : difficulty === 'MEDIUM' ? 'Trung bình' : 'Khó'}</span>
          </div>
          <div className={s.metaItem}>
            <Clock size={18} />
            <span>{totalTime} phút</span>
          </div>
        </div>
      </div>

      <div className={s.body}>
        <div className={s.ingredients}>
          <h3 className={s.sectionTitle}>Nguyên liệu cần chuẩn bị</h3>
          <ul className={s.ingredientList}>
            {ingredients?.map((ing, idx) => (
              <li key={idx} className={s.ingredientItem}>
                <Check size={16} className={s.checkIcon} />
                <span>
                  <strong>{ing.amount} {ing.unit}</strong> {ing.ingredientName}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={s.steps}>
          <h3 className={s.sectionTitle}>Các bước thực hiện</h3>
          <ol className={s.stepList}>
            {steps?.map((step) => (
              <li key={step.stepNumber} className={s.stepItem}>
                <div className={s.stepNumber}>{step.stepNumber}</div>
                <div className={s.stepInstruction}>{step.instruction}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {saveMutation.isError && (
        <div className={s.errorMsg}>
          <AlertCircle size={16} /> 
          {saveMutation.error?.response?.data?.message || 'Có lỗi xảy ra khi lưu công thức.'}
        </div>
      )}

      <div className={s.footer}>
        <button 
          className={s.cancelBtn}
          onClick={onCancel}
          disabled={saveMutation.isPending}
        >
          <X size={18} />
          Hủy bỏ
        </button>

        <button 
          className={s.saveBtn}
          onClick={handleSave}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 size={18} className={s.spin} />
              Đang lưu...
            </>
          ) : (
            <>
              <Bookmark size={18} />
              Lưu công thức
            </>
          )}
        </button>
      </div>
    </div>
  );
}
