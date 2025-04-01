import React from 'react';

const LightbulbIcon = ({ className = "h-6 w-6" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={className}
    >
      {/* Metallic base */}
      <path 
        d="M192 416v-32c0-6.6 5.4-12 12-12h104c6.6 0 12 5.4 12 12v32c0 6.6-5.4 12-12 12H204c-6.6 0-12-5.4-12-12z"
        fill="#C0C0C0"
      />
      <path 
        d="M192 368v-24c0-6.6 5.4-12 12-12h104c6.6 0 12 5.4 12 12v24c0 6.6-5.4 12-12 12H204c-6.6 0-12-5.4-12-12z"
        fill="#D6D6D6"
      />
      <path 
        d="M204 332h104c6.6 0 12-5.4 12-12v-10.24c-35.32-24.56-64-76.76-64-118.4V176c0-44.1-35.9-80-80-80s-80 35.9-80 80v15.36c0 41.64-28.68 93.84-64 118.4V320c0 6.6 5.4 12 12 12h160z"
        fill="#FFE082"
      />
      <ellipse 
        cx="256"
        cy="232"
        rx="96"
        ry="120"
        fill="#FFECB3"
        opacity="0.9"
      />

      {/* Filaments */}
      <path
        d="M232 240V170"
        fill="none"
        stroke="#CA7D00"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M280 240V170"
        fill="none"
        stroke="#CA7D00"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M232 170h48"
        fill="none"
        stroke="#CA7D00"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Light reflection */}
      <path
        d="M200 150c-16 0-30-14-30-30s14-30 30-30"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Shine effect */}
      <circle
        cx="220"
        cy="150"
        r="8"
        fill="#FFFFFF"
        opacity="0.8"
      />
    </svg>
  );
};

export default LightbulbIcon;