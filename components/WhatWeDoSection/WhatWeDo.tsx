"use client";
import React from "react";
import { useRouter } from "next/navigation";
import "./WhatWeDo.css";
import Image from "next/image";
import ConnectLines from "../../public/connect-lines.svg";

function WhatWeDo() {
  const services = [
    {
      title: "Preventative Programs",
      image: "/images/preventive_programs.jpg",
    },
    { title: "Continuous Health Monitoring", image: "/images/image1.png" },
    // { title: "Post Discharge Care", image: "/images/post_discharge.jpg" },
    { title: "Ongoing Care", image: "/images/ongoing_care.jpg" },
    { title: "Wellbeing Management", image: "/images/image4.jpg" },
  ];
  const router = useRouter();
  return (
    <section className="what-we-do" id="what-we-do">
      <div className="inner-we-do">
        <div className="header">
          <h2 className="test-cls2">What we do</h2>
          <p>
            Create seamless connections with patients <br /> throughout their
            life cycle, delivering consistent <br />{" "}
            <span className="highlight">continuity of care</span>.
          </p>
        </div>
        <ul className="services-container">
          {services.map((service, index) => (
            <li key={index}>
              <div className="service-item">
                <Image
                  src={service.image}
                  alt={"service.title"}
                  width={100}
                  height={100}
                />
                <div className="service-info">
                  <p>{service.title}</p>
                  <span
                    className="arrow"
                    onClick={() => router.push("/contact")}
                  >
                    →
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Image
          className="connect-lines"
          src={ConnectLines}
          alt="AvatarX Health"
        />
        <div className="platform-info">
          <div className="platform-content">
            <p>
              Simplify healthcare access while saving costs with{" "}
              <span className="highlight">AvatarX.AI</span> Digital Transitions
              of Care™ platform
            </p>
          </div>
          <div className="platform-imagebx">
            <Image
              src={"/images/avatarAxAi.png"}
              alt="Platform Overview"
              className="platform-image"
              width={1000}
              height={600}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhatWeDo;
