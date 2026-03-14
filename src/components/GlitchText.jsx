/* eslint-disable react/prop-types */
const GlitchText = ({ text, as: Tag = "span", className = "" }) => {
  return (
    <Tag className={`glitch-text ${className}`} data-text={text}>
      {text}
    </Tag>
  );
};

export default GlitchText;
