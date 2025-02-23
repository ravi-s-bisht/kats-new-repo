import React from "react";
import "./PatientJourney.css";
import Image from "next/image";
import BoxContent from '../../public/box-pattern.svg';
import JourneyConnecting from '../../public/journey-connecting.svg';

function PatientJourney() {
  return (
    <div className="patient-journey-container" id="technology">
      <section className="intro-text">
        <h2> Navigate your patient care journey with our <span className="highlighted-text">
            five seamless AI-powered platform components</span> utilizing predictive analytics and outcome benchmarks. </h2>
      </section>

      <div className="data-collection-container">
        <div className="journey-box">
          <Image src={BoxContent} alt="AvatarX Health" />
          <div className="header">
            <span className="step-number">1</span>
            <span className="title">Physiological Data Collection</span>
          </div>
        </div>
        <div className="journey-connecting-img">
          <Image src={JourneyConnecting} alt="AvatarX Health" />
        </div>
        <div className="center-panel">
          <Image
            src={"/images/eco-system.webp"}
            alt="Heart"
            className="heart-image"
            width={1000}
            height={600}
          />
        </div>
      </div>
    </div>
  );
}

export default PatientJourney;
