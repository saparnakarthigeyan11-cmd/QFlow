function Loading({ text = "Loading..." }) {
  return (
    <div className="loading-box" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true"></div>
      <span>{text}</span>
    </div>
  );
}

export default Loading;
