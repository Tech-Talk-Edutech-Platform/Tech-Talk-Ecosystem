"use client";

import {
  FaTerminal,
  FaHtml5,
  FaPython,
  FaJs,
  FaReact,
  FaRobot,
  FaGamepad,
  FaMicrochip,
  FaSitemap,
  FaCloud,
  FaNodeJs,
  FaDocker,
  FaDatabase,
  FaGitAlt,
  FaLinux,
  FaAndroid,
  FaCss3Alt,
  FaAws,
} from "react-icons/fa";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

export default function SliderWidget() {
  const techIcons = [
    { icon: FaTerminal, color: "text-blue-600" },
    { icon: FaHtml5, color: "text-orange-500" },
    { icon: FaPython, color: "text-indigo-600" },
    { icon: FaJs, color: "text-yellow-400" },
    { icon: FaReact, color: "text-cyan-500" },
    { icon: FaRobot, color: "text-green-600" },
    { icon: FaGamepad, color: "text-red-500" },
    { icon: FaMicrochip, color: "text-purple-600" },
    { icon: FaSitemap, color: "text-teal-500" },
    { icon: FaCloud, color: "text-gray-500" },
    { icon: FaNodeJs, color: "text-green-700" },
    { icon: FaDocker, color: "text-blue-400" },
    { icon: FaDatabase, color: "text-yellow-500" },
    { icon: FaGitAlt, color: "text-red-600" },
    { icon: FaLinux, color: "text-black" },
    { icon: FaAndroid, color: "text-green-500" },
    { icon: FaCss3Alt, color: "text-blue-600" },
    { icon: FaAws, color: "text-orange-400" },
  ];

  return (
    <div className="h-14 structural-carousel-wrapper">
      <Carousel
        autoPlay
        interval={2000}
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        showIndicators={false}
        centerMode
        centerSlidePercentage={20}
        showArrows={false}
      >
        {techIcons.map(({ icon: Icon, color }, idx) => (
          <div key={idx} className="flex justify-center items-center h-14">
            <Icon size={35} className={`${color} drop-shadow-md`} />
          </div>
        ))}
      </Carousel>
    </div>
  );
}