import ExpiryTimer from "@/components/Header/ExpiryTimer";

import { Logo } from "./logo";

const aCx =
  "underline decoration-primary-400/0 hover:decoration-primary-400 underline-offset-4 transition-all duration-300";

export function DashboardHeader() {
  return (
    <header
      id="header"
      className="bg-white w-full flex self-start items-center p-[10px] justify-between shadow-sm border-gray-200 border-b"
    >
      <div className="group flex gap-8 justify-center">
        <span className="rounded-xl p-2 ml-8 flex place-content-center transition-all bg-white">
          <Logo className="w-[42px] h-auto aspect-square" />
        </span>
        {/* <nav className="pointer-events-none flex-row items-center gap-8 text-lg leading-7 hidden group-hover:flex group-hover:pointer-events-auto">
          <a href="https://bots.daily.co" target="_blank" className={aCx}>
            Dashboard
          </a>
          <a
            href="https://github.com/daily-demos/daily-bots-web-demo"
            target="_blank"
            className={aCx}
          >
            Source code
          </a>
        </nav> */}
      </div>
    </header>
  );
}

export default DashboardHeader;
