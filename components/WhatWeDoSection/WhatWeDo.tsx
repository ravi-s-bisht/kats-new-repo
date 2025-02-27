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
      backfaceimage: "/images/preventative-programs-hover.webp",
      backfacecontent: "Proactive wellness solutions for a healthier future."
    },
    { 
      title: "Continuous Health Monitoring", 
      image: "/images/image1.jpg",
      backfaceimage: "/images/continuous-health-monitoring-hover.webp",
      backfacecontent: "Stay connected with live patient monitoring."
    },
    // { title: "Post Discharge Care", image: "/images/post_discharge.jpg" },
    { 
      title: "Ongoing Care", 
      image: "/images/ongoing_care.jpg",
      backfaceimage: "/images/chronic-condition-treatment-hover.webp",
      backfacecontent: "Comprehensive support for long-term health management."
    },
    { title: "Wellbeing Management",
      image: "/images/image4.jpg",
      backfaceimage: "/images/wellbeing-management-hover.webp",
      backfacecontent: "Elevating lifestyles through holistic wellbeing management solutions."
    },
  ];
  const router = useRouter();
  return (
    <section className="what-we-do" id="what-we-do">
      <div className="inner-we-do">
        <div className="header">
          <h2 className="test-cls2" data-aos="fade-up">What we do</h2>
          <p data-aos="fade-up">
            Create seamless connections with patients <br /> throughout their
            life cycle, delivering consistent <br />{" "}
            <span className="highlight">continuity of care</span>.
          </p>
        </div>
        <ul className="services-container">
          {services.map((service, index) => (
            <li key={index} data-aos="fade-up" data-aos-delay="0">
              <div className="relative h-full flip-card">
                <div className="flip-card-inner">
                  <div className="service-item flip-card-front">
                    <Image
                      src={service.image}
                      alt={"service.title"}
                      width={1000}
                      height={600}
                      unoptimized
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
                  <a aria-label="Learn more about Ongoing Care" className="absolute inset-0 bg-white rounded-[30px] md:rounded-[40px] overflow-hidden flip-card-back" href="/contact/">
                    <div className="p-[16px] pl-[16px] pr-[10px] fg-secondary-500">
                      <h4 className="text-[16px] lg:text-[21px] text-left lh-1.2 -ls-0.4 max-w-[200px]">{service.title}</h4>
                      <p className="text-[14px] lg:text-[16px] text-left mt-[10px] lh-1.25 -ls-0.8 fw-400">{service.backfacecontent}</p>
                    </div>
                    <Image src={service.backfaceimage} alt={''} width={1000} height={800} />
                    <div className="absolute bottom-0 right-0 mr-[15px] mb-[20px]  w-[26px] md:w-[35px] flex h-[26px] md:h-[35px] rounded-[100px] bg-[#fc1754] hover:bg-secondary-500">
                      <svg stroke="#fff" fill="#fff" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" className="w-20 md:w-28 m-auto" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </div>
                  </a>
                  <div className="absolute -z-1 inset-0 rounded-[30px] md:rounded-[40px] bg-[#fc1754] flip-card-background"></div>
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
            <p data-aos="fade-right">
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
              data-aos="fade-left"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhatWeDo;
