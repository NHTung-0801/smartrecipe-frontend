import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Refrigerator, 
  Bot, 
  ShoppingCart, 
  NotebookPen, 
  ArrowRight, 
  Compass, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Flame, 
  UtensilsCrossed, 
  Heart,
  Code2,
  Cpu,
  Layers,
  Award
} from 'lucide-react';
import s from '../styles/pages/BenefitsPage.module.css';

/**
 * ScrollReveal: Component tạo hiệu ứng trượt mượt mà (fade-in + slide) khi người dùng cuộn đến vị trí
 */
function ScrollReveal({ children, delay = 0, direction = 'up', className = '', style = {} }) {
  const [isVisible, setIsVisible] = React.useState(false);
  const domRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (domRef.current) observer.unobserve(domRef.current);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    const current = domRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  const getHiddenClass = () => {
    switch (direction) {
      case 'left': return s.revealHiddenLeft;
      case 'right': return s.revealHiddenRight;
      case 'scale': return s.revealHiddenScale;
      case 'up': default: return s.revealHiddenUp;
    }
  };

  return (
    <div
      ref={domRef}
      className={`${s.revealBase} ${isVisible ? s.revealVisible : getHiddenClass()} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        ...style
      }}
    >
      {children}
    </div>
  );
}

export default function BenefitsPage() {
  return (
    <div className={s.pageContainer}>
      {/* Ambient background glow orbs */}
      <div className={s.ambientOrb1} />
      <div className={s.ambientOrb2} />

      <div className={s.contentWrapper}>

        {/* ─── 1. HERO SECTION ─── */}
        <section className={s.heroSection}>
          <div className={s.badgePill}>
            <Sparkles size={15} />
            Hệ sinh thái thông minh cho căn bếp của bạn
          </div>

          <h1 className={s.heroTitle}>
            Nấu ăn thông minh hơn,<br />
            <span className={s.gradientHighlight}>tiết kiệm hơn</span> cùng Smart Recipe
          </h1>

          <p className={s.heroSubtitle}>
            Từ lúc mở tủ lạnh kiểm tra đồ ăn, lên thực đơn theo nguyên liệu sẵn có,
            tự động tạo danh sách đi chợ theo từng kệ hàng — đến khi dọn bàn ăn thơm ngon.
            Smart Recipe đồng hành cùng bạn trong từng bước.
          </p>

          <div className={s.heroActions}>
            <Link to="/register" className={s.primaryBtn}>
              Tạo tài khoản miễn phí <ArrowRight size={17} />
            </Link>
            <Link to="/" className={s.secondaryBtn}>
              <Compass size={17} />
              Khám phá món ăn ngay
            </Link>
          </div>

          {/* Key Metrics / Thống kê nổi bật */}
          <ScrollReveal delay={100}>
            <div className={s.metricsGrid}>
              <div className={s.metricItem}>
                <span className={s.metricValue}>30%</span>
                <span className={s.metricLabel}>Tiết kiệm chi phí thực phẩm</span>
              </div>
              <div className={s.metricItem}>
                <span className={s.metricValue}>3 Giây</span>
                <span className={s.metricLabel}>AI gợi ý món từ đồ sẵn có</span>
              </div>
              <div className={s.metricItem}>
                <span className={s.metricValue}>1-Click</span>
                <span className={s.metricLabel}>Tạo giỏ đi chợ theo quầy siêu thị</span>
              </div>
              <div className={s.metricItem}>
                <span className={s.metricValue}>100%</span>
                <span className={s.metricLabel}>Kiểm soát calo & dinh dưỡng</span>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ─── 2. 4 TRỤ CỘT ĐẶC QUYỀN CÔNG NGHỆ (CORE PILLARS) ─── */}
        <section style={{ padding: '36px 0 24px' }}>
          <ScrollReveal delay={0}>
            <div className={s.sectionHeader}>
              <span className={s.sectionTag}>CÔNG NGHỆ TIÊN PHONG</span>
              <h2 className={s.sectionHeading}>
                4 Trụ cột đặc quyền dành riêng cho thành viên
              </h2>
              <p className={s.sectionSubheading}>
                Được thiết kế tỉ mỉ để giải quyết trọn vẹn những bất tiện thường gặp nhất của người nội trợ hiện đại.
              </p>
            </div>
          </ScrollReveal>

          <div className={s.pillarsGrid}>
            {/* Pillar 1: Smart Pantry */}
            <ScrollReveal delay={0} className={s.pillarRevealItem}>
              <div className={s.pillarCard} style={{ color: '#2563eb' }}>
                <div className={s.iconWrapper} style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <Refrigerator size={30} />
                </div>
                <span className={s.pillarBadge} style={{ color: '#2563eb' }}>Tiết kiệm & Quản lý</span>
                <h3 className={s.pillarTitle}>Tủ nguyên liệu thông minh (Smart Pantry)</h3>
                <p className={s.pillarDesc}>
                  Tự động theo dõi số lượng và ngày hết hạn của từng loại thực phẩm trong tủ lạnh.
                  Nhận cảnh báo sớm đồ ăn sắp hỏng để không còn lãng phí thức ăn và tiền bạc của gia đình.
                </p>
                <div className={s.featureDemoBlock}>
                  <span className={s.demoDot} style={{ background: '#f59e0b' }} />
                  <span>Cảnh báo: Trứng gà & Sữa tươi hết hạn sau 2 ngày</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Pillar 2: AI Chef */}
            <ScrollReveal delay={120} className={s.pillarRevealItem}>
              <div className={s.pillarCard} style={{ color: '#7c3aed' }}>
                <div className={s.iconWrapper} style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                  <Bot size={30} />
                </div>
                <span className={s.pillarBadge} style={{ color: '#7c3aed' }}>Sáng tạo độc bản</span>
                <h3 className={s.pillarTitle}>Trợ lý đầu bếp AI (AI Chef)</h3>
                <p className={s.pillarDesc}>
                  Chỉ cần chọn những nguyên liệu còn lại trong tủ lạnh, AI sẽ tức thì sáng tạo công thức nấu ăn phù hợp nhất.
                  Xóa tan hoàn toàn câu hỏi đau đầu mỗi chiều: "Hôm nay ăn gì?".
                </p>
                <div className={s.featureDemoBlock}>
                  <span className={s.demoDot} style={{ background: '#8b5cf6' }} />
                  <span>Nhập: Trứng + Cà chua ➔ Món Trứng sốt cà chua hoàng gia</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Pillar 3: Smart Grocery */}
            <ScrollReveal delay={240} className={s.pillarRevealItem}>
              <div className={s.pillarCard} style={{ color: '#059669' }}>
                <div className={s.iconWrapper} style={{ background: '#ecfdf5', color: '#059669' }}>
                  <ShoppingCart size={30} />
                </div>
                <span className={s.pillarBadge} style={{ color: '#059669' }}>Tiện lợi tối đa</span>
                <h3 className={s.pillarTitle}>Đi chợ 1-Click thông minh (Smart Grocery)</h3>
                <p className={s.pillarDesc}>
                  Chỉ cần 1 cú click là chuyển toàn bộ nguyên liệu của công thức vào danh sách mua sắm.
                  Tự động gom nhóm theo kệ hàng siêu thị (Gia vị, Rau củ, Thịt cá) giúp bạn đi chợ nhanh gấp 3 lần.
                </p>
                <div className={s.featureDemoBlock}>
                  <span className={s.demoDot} style={{ background: '#10b981' }} />
                  <span>Tự động gom: Quầy Rau củ (3 món) • Quầy Thịt (2 món)</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Pillar 4: Cooking Journal */}
            <ScrollReveal delay={360} className={s.pillarRevealItem}>
              <div className={s.pillarCard} style={{ color: '#a13923' }}>
                <div className={s.iconWrapper} style={{ background: '#fff5f2', color: '#a13923' }}>
                  <NotebookPen size={30} />
                </div>
                <span className={s.pillarBadge} style={{ color: '#a13923' }}>Dinh dưỡng & Kỷ niệm</span>
                <h3 className={s.pillarTitle}>Sổ tay & Nhật ký ẩm thực (Cooking Journal)</h3>
                <p className={s.pillarDesc}>
                  Lưu trữ những công thức tâm đắc, ghi chú bí quyết riêng, chấm điểm hương vị.
                  Tự động tính toán hàm lượng calo, protein, carbs và chất béo theo từng khẩu phần chuẩn xác.
                </p>
                <div className={s.featureDemoBlock}>
                  <span className={s.demoDot} style={{ background: '#ea580c' }} />
                  <span>Macro chuẩn: 420 kcal • 28g Protein • 10g Lipid</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ─── 3. BẢNG SO SÁNH TRỰC QUAN (BEFORE & AFTER) ─── */}
        <section className={s.comparisonSection}>
          <ScrollReveal delay={0}>
            <div className={s.sectionHeader}>
              <span className={s.sectionTag}>TẠI SAO BẠN CẦN SMART RECIPE</span>
              <h2 className={s.sectionHeading}>
                Nâng cấp trải nghiệm vào bếp của bạn
              </h2>
              <p className={s.sectionSubheading}>
                So sánh sự khác biệt rõ rệt giữa cách làm bếp truyền thống và khi có Smart Recipe trợ giúp.
              </p>
            </div>
          </ScrollReveal>

          <div className={s.comparisonCardGrid}>
            {/* Cột 1: Truyền thống */}
            <ScrollReveal delay={60} direction="left" className={s.comparisonRevealItem}>
              <div className={s.beforeCard}>
                <div className={s.comparisonHeader}>
                  <XCircle size={24} className={s.itemIconNegative} />
                  <h3 className={s.comparisonTitle}>Cách nấu ăn truyền thống</h3>
                </div>
                <ul className={s.comparisonList}>
                  <li className={s.comparisonItem}>
                    <XCircle size={18} className={s.itemIconNegative} />
                    <span>Mua thực phẩm về để quên trong góc tủ lạnh đến khi mốc hỏng, lãng phí tiền bạc.</span>
                  </li>
                  <li className={s.comparisonItem}>
                    <XCircle size={18} className={s.itemIconNegative} />
                    <span>Mỗi ngày mất 20–30 phút băn khoăn "Hôm nay nấu món gì cho cả nhà?".</span>
                  </li>
                  <li className={s.comparisonItem}>
                    <XCircle size={18} className={s.itemIconNegative} />
                    <span>Đi siêu thị ghi giấy nhớ lộn xộn, quên mua gia vị này, thiếu nguyên liệu kia.</span>
                  </li>
                  <li className={s.comparisonItem}>
                    <XCircle size={18} className={s.itemIconNegative} />
                    <span>Nấu ăn theo cảm tính, hoàn toàn không biết khẩu phần có đủ đạm hay thừa calo.</span>
                  </li>
                  <li className={s.comparisonItem}>
                    <XCircle size={18} className={s.itemIconNegative} />
                    <span>Lưu công thức rải rác trên mạng xã hội, khi cần nấu lại không tìm thấy ở đâu.</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>

            {/* Cột 2: Với Smart Recipe */}
            <ScrollReveal delay={160} direction="right" className={s.comparisonRevealItem}>
              <div className={s.afterCard}>
                <span className={s.afterBadge}>Được khuyên dùng</span>
                <div className={s.comparisonHeader}>
                  <CheckCircle2 size={24} className={s.itemIconPositive} />
                  <h3 className={s.comparisonTitle}>Trải nghiệm cùng Smart Recipe</h3>
                </div>
                <ul className={s.comparisonList}>
                  <li className={s.comparisonItem}>
                    <CheckCircle2 size={18} className={s.itemIconPositive} />
                    <span>Tủ lạnh số thông minh cảnh báo hạn sử dụng, tận dụng 100% đồ ăn trước khi hỏng.</span>
                  </li>
                  <li className={s.comparisonItem}>
                    <CheckCircle2 size={18} className={s.itemIconPositive} />
                    <span>AI Chef gợi ý công thức sáng tạo tức thì chỉ từ 2-3 nguyên liệu sẵn có trong tủ.</span>
                  </li>
                  <li className={s.comparisonItem}>
                    <CheckCircle2 size={18} className={s.itemIconPositive} />
                    <span>Bấm 1 nút tạo danh sách đi chợ tự động phân nhóm theo quầy siêu thị chuẩn xác.</span>
                  </li>
                  <li className={s.comparisonItem}>
                    <CheckCircle2 size={18} className={s.itemIconPositive} />
                    <span>Theo dõi dinh dưỡng chi tiết (Calo, Protein, Carbs, Fat) cho từng bữa ăn gia đình.</span>
                  </li>
                  <li className={s.comparisonItem}>
                    <CheckCircle2 size={18} className={s.itemIconPositive} />
                    <span>Sổ tay ẩm thực lưu trữ vĩnh viễn, cho phép tùy chỉnh gia vị và bí quyết riêng biệt.</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ─── 4. TESTIMONIAL / CÂU NÓI TRUYỀN CẢM HỨNG ─── */}
        <ScrollReveal delay={80} direction="scale">
          <section className={s.testimonialBox}>
            <p className={s.quoteText}>
              “Nấu ăn không chỉ là việc chuẩn bị bữa ăn, mà là cách chúng ta chăm sóc sức khỏe và vun đắp niềm vui cho những người thân yêu. Smart Recipe sinh ra để giúp hành trình đó trở nên nhẹ nhàng, thông minh và tràn đầy cảm hứng mỗi ngày.”
            </p>
            <div className={s.quoteAuthor}>
              — Ban Phát Triển Dự Án Smart Recipe —
            </div>
          </section>
        </ScrollReveal>

        {/* ─── 5. CALL TO ACTION BANNER ─── */}
        <ScrollReveal delay={80} direction="scale">
          <section className={s.ctaBanner}>
            <div className={s.ctaGlow1} />
            <div className={s.ctaGlow2} />

            <h2 className={s.ctaTitle}>
              Bắt đầu hành trình nấu ăn thông minh ngay hôm nay
            </h2>
            <p className={s.ctaSubtitle}>
              Tài khoản miễn phí hoàn toàn. Thiết lập căn bếp số và mở khóa toàn bộ sức mạnh AI chỉ trong 30 giây.
            </p>
            <Link to="/register" className={s.ctaBtn}>
              Tạo tài khoản miễn phí <ArrowRight size={18} />
            </Link>
          </section>
        </ScrollReveal>

      </div>

      {/* ─── 6. FOOTER CHUYÊN NGHIỆP ─── */}
      <footer className={s.footer}>
        <div className={s.contentWrapper}>
          <div className={s.footerGrid}>
            
            {/* Brand column */}
            <div className={s.footerBrand}>
              <div className={s.footerLogoRow}>
                <div className={s.footerLogoIcon}>
                  <UtensilsCrossed size={18} />
                </div>
                <span>Smart Recipe</span>
              </div>
              <p className={s.footerDesc}>
                Hệ sinh thái quản lý ẩm thực, hỗ trợ nấu ăn và đồng bộ dinh dưỡng thông minh dành cho gia đình hiện đại.
              </p>
              <div style={{ marginTop: 8 }}>
                <span className={s.techTag}>React 19</span>
                <span className={s.techTag}>Spring Boot</span>
                <span className={s.techTag}>AI Chef</span>
                <span className={s.techTag}>TiDB Cloud</span>
                <span className={s.techTag}>Redis</span>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className={s.footerHeading}>Điều Hướng</h4>
              <ul className={s.footerLinks}>
                <li><Link to="/" className={s.footerLink}>Trang Khám phá</Link></li>
                <li><Link to="/features" className={s.footerLink}>Đặc quyền thành viên</Link></li>
                <li><Link to="/login" className={s.footerLink}>Đăng nhập</Link></li>
                <li><Link to="/register" className={s.footerLink}>Đăng ký tài khoản</Link></li>
              </ul>
            </div>

            {/* Core Features */}
            <div>
              <h4 className={s.footerHeading}>Tính Năng Cốt Lõi</h4>
              <ul className={s.footerLinks}>
                <li><span className={s.footerLink}>Tủ nguyên liệu Smart Pantry</span></li>
                <li><span className={s.footerLink}>Trợ lý đầu bếp AI Chef</span></li>
                <li><span className={s.footerLink}>Đi chợ thông minh 1-Click</span></li>
                <li><span className={s.footerLink}>Nhật ký & Dinh dưỡng Macro</span></li>
              </ul>
            </div>

            {/* Project / Author Information */}
            <div>
              <h4 className={s.footerHeading}>Thông Tin Đồ Án</h4>
              <p style={{ color: '#a88d7f', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                <strong style={{ color: '#ffffff' }}>Smart Recipe Platform</strong><br />
                Đồ án Tốt nghiệp / Dự án Khóa luận Kỹ thuật Phần mềm.<br />
                <span style={{ display: 'block', marginTop: 6, color: '#f4c49d', fontSize: 12 }}>
                  Phiên bản: v2.0 (Sprint 6 Release)
                </span>
              </p>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className={s.footerBottom}>
            <div>
              © {new Date().getFullYear()} Smart Recipe. Bản quyền thuộc về Đội ngũ Phát triển Dự án.
            </div>
            <div className={s.authorCredit}>
              Xây dựng với <Heart size={14} className={s.authorHeart} fill="currentColor" /> cho trải nghiệm ẩm thực gia đình
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
