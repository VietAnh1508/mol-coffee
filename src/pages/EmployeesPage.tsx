import { useState } from 'react';
import { useAuth, useUsers, useToggleUserRole, useToggleUserStatus, useDeleteUser, useToast } from "../hooks";
import { Toast } from "../components/Toast";
import type { User } from "../types";

export function EmployeesPage() {
  const { user } = useAuth();
  const { data: employees = [], isLoading, error } = useUsers();
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const { toast, showSuccess, showError, hideToast } = useToast();
  
  const toggleRoleMutation = useToggleUserRole({
    onSuccess: (data) => {
      showSuccess(
        `Đã ${data.role === 'admin' ? 'thăng chức' : 'hạ cấp'} ${data.name} thành công`
      );
    },
    onError: () => {
      showError('Có lỗi xảy ra khi thay đổi vai trò');
    }
  });
  
  const toggleStatusMutation = useToggleUserStatus({
    onSuccess: (data) => {
      showSuccess(
        `Đã ${data.status === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} ${data.name} thành công`
      );
    },
    onError: () => {
      showError('Có lỗi xảy ra khi thay đổi trạng thái');
    }
  });
  
  const deleteUserMutation = useDeleteUser({
    onSuccess: () => {
      showSuccess('Đã xóa nhân viên thành công');
    },
    onError: () => {
      showError('Có lỗi xảy ra khi xóa nhân viên');
    }
  });

  // Helper functions for business rule validation
  const isCurrentUser = (employee: User) => {
    return employee.id === user?.id;
  };

  const isLastAdmin = (employee: User) => {
    if (employee.role !== 'admin') return false;
    const adminCount = employees.filter(emp => emp.role === 'admin').length;
    return adminCount === 1;
  };

  const canToggleRole = (employee: User) => {
    // Can't demote yourself as admin
    if (isCurrentUser(employee) && employee.role === 'admin') return false;
    // Can't demote the last admin
    if (isLastAdmin(employee)) return false;
    return true;
  };

  const canToggleStatus = (employee: User) => {
    // Can't deactivate yourself
    if (isCurrentUser(employee) && employee.status === 'active') return false;
    return true;
  };

  const canDeleteUser = (employee: User) => {
    // Can't delete yourself
    if (isCurrentUser(employee)) return false;
    return true;
  };

  const handleToggleRole = (employee: User) => {
    toggleRoleMutation.mutate(employee);
  };

  const handleToggleStatus = (employee: User) => {
    toggleStatusMutation.mutate(employee);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này không?')) {
      deleteUserMutation.mutate(employeeId);
      setSelectedEmployee(null);
    }
  };


  const closeModal = () => {
    setSelectedEmployee(null);
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Lỗi tải danh sách nhân viên
              </h3>
              <p className="mt-2 text-sm text-red-700">
                {error?.message || 'Đã xảy ra lỗi khi tải dữ liệu'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Danh sách nhân viên</h1>
          <p className="mt-2 text-sm text-gray-700">
            Quản lý tất cả nhân viên trong hệ thống
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {employee.name}
                      {isCurrentUser(employee) && (
                        <span className="ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800">
                          Bạn
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {employee.phone}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      employee.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {employee.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                    </span>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      employee.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(employee)}
                className="ml-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={closeModal}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Thông tin nhân viên
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Đóng</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedEmployee.name}
                    {isCurrentUser(selectedEmployee) && (
                      <span className="ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800">
                        Bạn
                      </span>
                    )}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEmployee.phone}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                  <div className="mt-1 flex items-center justify-between">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      selectedEmployee.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedEmployee.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                    </span>
                    {canToggleRole(selectedEmployee) && (
                      <button
                        onClick={() => handleToggleRole(selectedEmployee)}
                        disabled={toggleRoleMutation.isPending}
                        className="text-sm text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                      >
                        {selectedEmployee.role === 'admin' ? 'Hạ cấp' : 'Thăng chức'}
                      </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                  <div className="mt-1 flex items-center justify-between">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      selectedEmployee.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedEmployee.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                    {canToggleStatus(selectedEmployee) && (
                      <button
                        onClick={() => handleToggleStatus(selectedEmployee)}
                        disabled={toggleStatusMutation.isPending}
                        className="text-sm text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                      >
                        {selectedEmployee.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <div>
                  {canDeleteUser(selectedEmployee) && (
                    <button
                      onClick={() => handleDeleteEmployee(selectedEmployee.id)}
                      disabled={deleteUserMutation.isPending}
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      Xóa nhân viên
                    </button>
                  )}
                </div>
                <button
                  onClick={closeModal}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}