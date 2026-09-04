import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle, ArrowRight, PackageOpen, Recycle,
  RefreshCw, Sparkles, WandSparkles, X, Bot, Camera,
  Send, Aperture
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { pantryService } from '../services/pantryService';
import AiRecipeCard from '../components/ai/AiRecipeCard';
import s from '../styles/pages/AiSuggestionPage.module.css';

const TAB_PANTRY = 'PANTRY';
const TAB_CUSTOM = 'CUSTOM';

function describeError(error) {
  const status = error?.response?.status;
  const body = error?.response?.data;
  const serverMessage = body?.message;

  if (!error?.response) {
    return { tone: 'danger', title: 'Không kết nối được', detail: 'Kiểm tra backend đã chạy ở http://localhost:8080 chưa.', retryable: true };
  }
  if (status === 429) {
    return { tone: 'warning', title: 'Hết lượt hôm nay', detail: serverMessage || 'Bạn đã dùng hết 10 lượt gợi ý AI.', retryable: false };
  }
  if (status === 503) {
    return { tone: 'warning', title: 'AI tạm ngưng', detail: serverMessage || 'Dịch vụ AI tạm thời không phản hồi.', retryable: true };
  }
  if (status === 400) {
    return { tone: 'danger', title: 'Chưa đủ dữ liệu', detail: serverMessage || 'Vui lòng kiểm tra lại nguyên liệu đầu vào.', retryable: false };
  }
  return { tone: 'danger', title: 'Gợi ý thất bại', detail: serverMessage || 'Đã có lỗi xảy ra. Vui lòng thử lại.', retryable: true };
}

function useElapsedSeconds(isRunning) {
  const [seconds, setSeconds] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    if (!isRunning) {
      setSeconds(0);
      startRef.current = null;
      return undefined;
    }
    startRef.current = Date.now();
    const timer = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  return seconds;
}

function QuotaCard({ remaining, dailyLimit, isLoading }) {
  const known = !isLoading && typeof remaining === 'number' && dailyLimit > 0;
  const percent = known ? Math.round((remaining / dailyLimit) * 100) : 0;

  return (
    <div className={`${s.quotaCard} ${known && remaining === 0 ? s.quotaEmpty : ''}`}>
      <span className={s.quotaLabel}>
        <Sparkles size={13} /> Lượt hôm nay
      </span>
      <div className={s.quotaValue}>
        {known ? remaining : '--'}
        <small> / {known ? dailyLimit : '--'}</small>
      </div>
      <div className={s.quotaBar}>
        <div className={s.quotaFill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function AiSuggestionPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(TAB_PANTRY);
  const [chips, setChips] = useState([]);
  const [draft, setDraft] = useState('');
  const [chatDraft, setChatDraft] = useState('');
  const [validationError, setValidationError] = useState('');

  const remainingQuery = useQuery({
    queryKey: ['ai-remaining'],
    queryFn: aiService.getRemaining,
    staleTime: 0,
  });
  const quota = remainingQuery.data?.data;
  const outOfQuota = quota?.remaining === 0;

  // Lấy danh sách nguyên liệu sắp hết hạn (5 ngày)
  const expiringQuery = useQuery({
    queryKey: ['pantry-expiring', 5],
    queryFn: () => pantryService.getExpiringSoon(5),
  });
  const expiringItems = expiringQuery.data?.data || [];

  const suggestMutation = useMutation({
    mutationFn: ({ mode, ingredients }) =>
      mode === TAB_PANTRY
        ? aiService.suggestFromPantry()
        : aiService.suggestFromInput(ingredients),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['ai-remaining'] }),
  });

  const elapsed = useElapsedSeconds(suggestMutation.isPending);
  const suggestion = suggestMutation.data?.data;
  const failure = suggestMutation.isError ? describeError(suggestMutation.error) : null;

  const addChip = () => {
    const value = draft.trim();
    if (!value) return;
    const existed = chips.some((chip) => chip.toLowerCase() === value.toLowerCase());
    if (existed) {
      setValidationError(`"${value}" đã có trong danh sách.`);
      setDraft('');
      return;
    }
    setChips((prev) => [...prev, value]);
    setDraft('');
    setValidationError('');
  };

  const handleDraftKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addChip();
      return;
    }
    if (event.key === 'Backspace' && !draft && chips.length > 0) {
      setChips((prev) => prev.slice(0, -1));
    }
  };

  const removeChip = (index) => {
    setChips((prev) => prev.filter((_, i) => i !== index));
    setValidationError('');
  };

  const submit = () => {
    setValidationError('');
    if (tab === TAB_CUSTOM) {
      const pending = draft.trim();
      const payload = pending && !chips.some((c) => c.toLowerCase() === pending.toLowerCase())
        ? [...chips, pending]
        : chips;
      if (payload.length === 0) {
        setValidationError('Vui lòng nhập ít nhất 1 nguyên liệu.');
        return;
      }
      setChips(payload);
      setDraft('');
      suggestMutation.mutate({ mode: TAB_CUSTOM, ingredients: payload });
      return;
    }
    suggestMutation.mutate({ mode: TAB_PANTRY });
  };

  const switchTab = (next) => {
    if (next === tab) return;
    setTab(next);
    setValidationError('');
    suggestMutation.reset();
  };

  const handleChatSubmit = () => {
    if (!chatDraft.trim()) return;
    
    // Split by comma or space if no commas
    let ingredients = [];
    if (chatDraft.includes(',')) {
      ingredients = chatDraft.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      ingredients = chatDraft.split(' ').map(s => s.trim()).filter(Boolean);
    }
    
    if (ingredients.length === 0) return;
    
    setTab(TAB_CUSTOM);
    setChips(ingredients);
    setChatDraft('');
    suggestMutation.mutate({ mode: TAB_CUSTOM, ingredients });
  };

  // Tạo lời dẫn AI dựa trên nguyên liệu sắp hết hạn (nếu có)
  const aiIntroText = () => {
    if (tab === TAB_CUSTOM) {
      return `Dựa trên các nguyên liệu bạn cung cấp, mình gợi ý món ${suggestion?.title}. Chúc bạn nấu ăn vui vẻ!`;
    }
    if (expiringItems.length > 0) {
      const names = expiringItems.slice(0, 3).map(i => i.ingredientName).join(', ');
      return `Dựa trên các nguyên liệu sắp hết hạn trong tủ lạnh của bạn (${names}...), mình gợi ý món ${suggestion?.title}. Món này rất nhanh gọn và giúp giải quyết thực phẩm kịp thời!`;
    }
    return `Mình tìm thấy một món cực ngon từ tủ lạnh của bạn: ${suggestion?.title}. Bắt tay vào làm ngay nào!`;
  };

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div className={s.titleArea}>
          <div>
            <h1 className={s.title}>
              <span className={s.gradientText}>Trợ lý AI</span> 
              <Bot size={36} className={s.titleIconInline} />
            </h1>
            <p className={s.subtitle}>Khám phá món ngon từ những nguyên liệu bạn đang có</p>
          </div>
        </div>
      </div>

      <div className={s.quotaBanner}>
        <QuotaCard 
          remaining={quota?.remaining} 
          dailyLimit={quota?.dailyLimit} 
          isLoading={remainingQuery.isLoading} 
        />
      </div>

      <div className={s.tabs}>
        <button 
          className={`${s.tab} ${tab === TAB_PANTRY ? s.activeTab : ''}`}
          onClick={() => switchTab(TAB_PANTRY)}
        >
          <Recycle size={18} />
          Giải cứu tủ lạnh
        </button>
        <button 
          className={`${s.tab} ${tab === TAB_CUSTOM ? s.activeTab : ''}`}
          onClick={() => switchTab(TAB_CUSTOM)}
        >
          <WandSparkles size={18} />
          Tôi có...
        </button>
      </div>

      <div className={s.content}>
        {tab === TAB_PANTRY ? (
          <div className={s.expiringCard}>
            <h3 className={s.expiringTitle}>Nguyên liệu sắp hết hạn</h3>
            <div className={s.expiringContent}>
              <div className={`${s.scannerCircle} ${suggestMutation.isPending ? s.scanning : ''}`}>
                <Aperture size={40} className={s.spin} />
                <span className={s.scannerText}>SCANNING...</span>
              </div>
              
              <div className={s.expiringList}>
                {expiringQuery.isLoading ? (
                  <p className={s.emptyPantry}>Đang tải kho nguyên liệu...</p>
                ) : expiringItems.length === 0 ? (
                  <p className={s.emptyPantry}>Tủ lạnh của bạn đang rất ổn, không có món nào sắp hỏng!</p>
                ) : (
                  expiringItems.map(item => {
                    const daysLeft = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                    const dotClass = daysLeft <= 2 ? s.dotRed : daysLeft <= 4 ? s.dotYellow : s.dotGreen;
                    return (
                      <div key={item.id} className={s.expiringItem}>
                        <div className={`${s.dot} ${dotClass}`}></div>
                        <span>{item.ingredientName} – Còn {Math.max(0, daysLeft)} ngày</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <button 
              className={s.submitBtnCard} 
              onClick={submit}
              disabled={suggestMutation.isPending || outOfQuota}
            >
              {suggestMutation.isPending ? (
                <>
                  <RefreshCw size={20} className={s.spin} /> 
                  Đang phân tích... {elapsed > 0 && `(${elapsed}s)`}
                </>
              ) : (
                <>
                  <Sparkles size={20} /> 
                  Magic Suggest
                </>
              )}
            </button>
          </div>
        ) : (
          <div className={s.customBox}>
            <h3>Nhập nguyên liệu bạn có</h3>
            <p>Gõ tên nguyên liệu và nhấn Enter (ví dụ: Thịt bò, Cà chua...)</p>
            
            <div className={s.chipInputContainer}>
              <div className={s.chips}>
                {chips.map((chip, index) => (
                  <div key={index} className={s.chip}>
                    {chip}
                    <button type="button" onClick={() => removeChip(index)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleDraftKeyDown}
                  placeholder={chips.length === 0 ? "Nhập nguyên liệu..." : ""}
                  className={s.chipInput}
                  disabled={suggestMutation.isPending}
                />
              </div>
            </div>

            <button 
              className={s.submitBtnCard} 
              style={{ marginTop: '1.5rem' }}
              onClick={submit}
              disabled={suggestMutation.isPending || outOfQuota}
            >
              {suggestMutation.isPending ? (
                <>
                  <RefreshCw size={20} className={s.spin} /> 
                  Đang suy nghĩ... {elapsed > 0 && `(${elapsed}s)`}
                </>
              ) : (
                <>
                  <Sparkles size={20} /> 
                  Gợi ý món ăn
                </>
              )}
            </button>
          </div>
        )}

        {validationError && (
          <div className={s.inlineError}>
            <AlertCircle size={16} /> {validationError}
          </div>
        )}
      </div>

      {failure && (
        <div className={`${s.alertBox} ${s[failure.tone]}`}>
          <div className={s.alertIcon}>
            <AlertCircle size={24} />
          </div>
          <div className={s.alertContent}>
            <h4>{failure.title}</h4>
            <p>{failure.detail}</p>
            {failure.retryable && (
              <button 
                className={s.retryBtn} 
                onClick={submit}
                disabled={suggestMutation.isPending}
              >
                Thử lại <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI Chat Response */}
      {suggestion && !suggestMutation.isPending && (
        <>
          <div className={s.chatContainer}>
            <div className={s.aiAvatar}>
              <Aperture size={24} />
            </div>
            <div className={s.chatBubble}>
              <div className={s.chatName}>Gemini AI</div>
              <p className={s.chatText}>{aiIntroText()}</p>
            </div>
          </div>
          <div className={s.resultArea}>
            <AiRecipeCard data={suggestion} logId={suggestion.logId} onCancel={() => suggestMutation.reset()} />
          </div>
        </>
      )}
      {/* Sticky Chat Input Bar */}
      <div className={s.chatInputContainer}>
        <div className={s.chatInputBox}>
          <input 
            type="text" 
            placeholder="Nhập câu hỏi hoặc nguyên liệu cho Gemini AI..."
            value={chatDraft}
            onChange={(e) => setChatDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleChatSubmit();
            }}
            disabled={suggestMutation.isPending || outOfQuota}
          />
          <button 
            className={s.chatSendBtn} 
            onClick={handleChatSubmit}
            disabled={!chatDraft.trim() || suggestMutation.isPending || outOfQuota}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
