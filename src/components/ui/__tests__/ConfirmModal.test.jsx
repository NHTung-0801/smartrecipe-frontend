import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmModal from '../ConfirmModal';

describe('ConfirmModal', () => {
  it('không render gì khi isOpen = false', () => {
    render(<ConfirmModal isOpen={false} onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.queryByText('Xác nhận')).not.toBeInTheDocument();
  });

  it('hiển thị title, message và nút mặc định', () => {
    render(<ConfirmModal isOpen onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Xác nhận' })).toBeInTheDocument();
    expect(screen.getByText(/Bạn có chắc chắn muốn thực hiện/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hủy' })).toBeInTheDocument();
  });

  it('gọi onConfirm và onCancel đúng nút', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        isOpen
        confirmText="Xóa"
        cancelText="Giữ lại"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Xóa' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Giữ lại' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('vô hiệu cả hai nút khi isLoading để chặn double-submit', () => {
    render(
      <ConfirmModal
        isOpen
        isLoading
        confirmText="Đang xóa"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /Đang xóa/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Hủy' })).toBeDisabled();
  });
});
