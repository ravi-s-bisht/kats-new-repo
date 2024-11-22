import Link from 'next/link';

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white py-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <nav>
        <ul>
          <li className="mb-4 bg-green-200 px-2 py-3">
            <Link href="/">
              <span className="hover:text-gray-300 text-black font-semibold">Users</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;