import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteUserModal from '../DeleteUserModal';

describe('DeleteUserModal', () => {
  const mockUser = {
    id: 5,
    username: 'HoangTung',
    displayName: 'Hoang Tung',
    email: 'hoangtung@gmail.com',
    role: 'USER',
    avatarUrl: null,
  };

  it('không render khi isOpen = false hoặc user = null', () => {
    const { rerender } = render(
      <DeleteUserModal isOpen={false} user={mockUser} onConfirm={vi.fn()} onClose={vi.fn()} />
    );
    expect(screen.queryByText('Xác nhận xóa tài khoản')).not.toBeInTheDocument();

    rerender(<DeleteUserModal isOpen={true} user={null} onConfirm={vi.fn()} onClose={vi.fn()} />);
    expect(screen.queryByText('Xác nhận xóa tài khoản')).not.toBeInTheDocument();
  });

  it('hiển thị thông tin người dùng và các cảnh báo cascade delete', () => {
    render(
      <DeleteUserModal isOpen={true} user={mockUser} onConfirm={vi.fn()} onClose={vi.fn()} />
    );

    expect(screen.getByText('Xác nhận xóa tài khoản')).toBeInTheDocument();
    expect(screen.getByText('Hoang Tung')).toBeInTheDocument();
    expect(screen.getByText('@HoangTung')).toBeInTheDocument();
    expect(screen.getByText('ID: #5')).toBeInTheDocument();
    expect(screen.getByText(/Dữ liệu liên quan sẽ bị xóa vĩnh viễn/)).toBeInTheDocument();
    expect(screen.getByText(/Công thức & Bộ sưu tập/)).toBeInTheDocument();
    expect(screen.getByText(/Tương tác & Xã hội/)).toBeInTheDocument();
    expect(screen.getByText(/Kho & Đi chợ/)).toBeInTheDocument();
    expect(screen.getByText(/Nhật ký/)).toBeInTheDocument();
  });

  it('gọi onConfirm với user object khi bấm nút Xác nhận xóa', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <DeleteUserModal isOpen={true} user={mockUser} onConfirm={onConfirm} onClose={onClose} />
    );

    const deleteBtn = screen.getByRole('button', { name: /Xác nhận xóa vĩnh viễn/ });
    await userEvent.click(deleteBtn);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith(mockUser);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('gọi onClose khi bấm nút Hủy bỏ hoặc nút Đóng', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <DeleteUserModal isOpen={true} user={mockUser} onConfirm={onConfirm} onClose={onClose} />
    );

    const cancelBtn = screen.getByRole('button', { name: 'Hủy bỏ' });
    await userEvent.click(cancelBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('vô hiệu hóa các nút và hiển thị trạng thái đang xóa khi isLoading = true', () => {
    render(
      <DeleteUserModal
        isOpen={true}
        user={mockUser}
        isLoading={true}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /Đang xóa toàn bộ/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Hủy bỏ' })).toBeDisabled();
  });

  it('đóng modal khi nhấn phím Escape', () => {
    const onClose = vi.fn();
    render(
      <DeleteUserModal isOpen={true} user={mockUser} onConfirm={vi.fn()} onClose={onClose} />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
