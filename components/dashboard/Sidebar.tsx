import Link from "next/link";
import PersonIcon from "@mui/icons-material/Person";
import Person from "@mui/icons-material/Person";

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 h-screen bg-white text-white py-4 px-4 border-r border-gray-200">
      <nav>
        <ul>
          <li className="mb-4 bg-gray-100 px-3 py-3 rounded-md">
            <Link href="/">
              <span className="text-blue-800 font-semibold items-center justify-start flex">
                <PersonIcon className="mr-3" />
                Users
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
