import Image from "next/image";
import React from "react";

type LogoProps = {
  className?: string;
};

const logoSrc = "/logo.png";

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <Image src={logoSrc} alt="Avatar X" width={120} height={50} />
  );
};

export default Logo;
