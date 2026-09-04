import { Construction } from 'lucide-react';

export default function AdminPlaceholder({ title }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '1rem', padding: '5rem 2rem', color: '#6b7280', textAlign: 'center' }}>
      <Construction size={48} style={{ color: '#a13923', opacity: 0.6 }} />
      <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#374151', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {title}
      </h2>
      <p style={{ margin: 0 }}>Module này đang được phát triển, sẽ có trong bản cập nhật tiếp theo.</p>
    </div>
  );
}
