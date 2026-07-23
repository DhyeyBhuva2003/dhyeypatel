import React from "react";
import {
  FaDatabase,
  FaCode,
  FaLaptopCode,
  FaServer,
  FaMobileAlt,
  FaRobot,
  FaShoppingCart,
  FaCogs,
  FaChartLine,
  FaLayerGroup,
  FaRocket,
  FaGlobe,
  FaLock,
  FaCloud,
  FaTerminal
} from "react-icons/fa";

interface IconResolverProps {
  name: string;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FaDatabase,
  FaCode,
  FaLaptopCode,
  FaServer,
  FaMobileAlt,
  FaRobot,
  FaShoppingCart,
  FaCogs,
  FaChartLine,
  FaLayerGroup,
  FaRocket,
  FaGlobe,
  FaLock,
  FaCloud,
  FaTerminal,

  // Fallback aliases without 'Fa' prefix
  Database: FaDatabase,
  Code: FaCode,
  LaptopCode: FaLaptopCode,
  Server: FaServer,
  MobileAlt: FaMobileAlt,
  Robot: FaRobot,
  ShoppingCart: FaShoppingCart,
  Cogs: FaCogs,
  ChartLine: FaChartLine,
  LayerGroup: FaLayerGroup,
  Rocket: FaRocket,
  Globe: FaGlobe,
  Lock: FaLock,
  Cloud: FaCloud,
  Terminal: FaTerminal,
};

export default function IconResolver({ name, className = "w-5 h-5 text-brand-primary dark:text-brand-accent" }: IconResolverProps) {
  let formattedName = name;
  if (name && !name.startsWith("Fa")) {
    formattedName = "Fa" + name.charAt(0).toUpperCase() + name.slice(1);
  }

  const IconComponent = iconMap[formattedName] || iconMap[name] || FaDatabase;
  return <IconComponent className={className} />;
}
