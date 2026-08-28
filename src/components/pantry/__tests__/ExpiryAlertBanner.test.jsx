import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExpiryAlertBanner from '../ExpiryAlertBanner';

// CSS Module trả về object rỗng khi test.css = false, nên component vẫn render
// bình thường, chỉ là className thành undefined — không ảnh hưởng assertion.
describe('ExpiryAlertBanner', () => {
  it('ẩn hoàn toàn khi không có nguyên liệu hết hạn hay sắp hết hạn', () => {
    const { container } = render(
      <ExpiryAlertBanner summary={{ expiredCount: 0, expiringSoonCount: 0 }} onCleanup={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('ẩn khi summary chưa có (đang tải)', () => {
    const { container } = render(<ExpiryAlertBanner summary={undefined} onCleanup={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('chỉ hiện nút dọn tủ khi thực sự có nguyên liệu ĐÃ hết hạn', () => {
    render(
      <ExpiryAlertBanner summary={{ expiredCount: 0, expiringSoonCount: 3 }} onCleanup={vi.fn()} />
    );

    expect(screen.getByText('3')).toBeInTheDocument();
    // Sắp hết hạn thì chưa có gì để dọn
    expect(screen.queryByRole('button', { name: /Dọn tủ ngay/ })).not.toBeInTheDocument();
  });

  it('hiện nút dọn tủ và gọi onCleanup khi có nguyên liệu hết hạn', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const onCleanup = vi.fn();
    render(
      <ExpiryAlertBanner summary={{ expiredCount: 2, expiringSoonCount: 1 }} onCleanup={onCleanup} />
    );

    await userEvent.click(screen.getByRole('button', { name: /Dọn tủ ngay/ }));

    expect(onCleanup).toHaveBeenCalledTimes(1);
  });

  it('vô hiệu nút và đổi nhãn khi đang dọn', () => {
    render(
      <ExpiryAlertBanner
        summary={{ expiredCount: 2, expiringSoonCount: 0 }}
        onCleanup={vi.fn()}
        isCleaning
      />
    );

    const button = screen.getByRole('button', { name: /Đang dọn/ });
    expect(button).toBeDisabled();
  });
});
