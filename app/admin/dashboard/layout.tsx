import Sidebar from '@/components/dashboard/Sidebar';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default DashboardLayout;