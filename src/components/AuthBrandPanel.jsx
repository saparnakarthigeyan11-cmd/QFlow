// Left side of the login / register pages (college name + map link).
// It was copy-pasted twice in the old App.jsx; now it is written once.
import { COLLEGE } from "../data";

function openMap() {
  const url =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(COLLEGE.mapQuery);
  window.open(url, "_blank", "noopener,noreferrer");
}

function AuthBrandPanel() {
  return (
    <div className="college-info">
      <div className="qflow-logo">Q</div>
      <h1>QFlow</h1>
      <h2>{COLLEGE.name}</h2>
      <p className="tagline">Smart Admission & Student Services</p>

      <div className="campus-box">
        <div className="pin">📍</div>
        <div>
          <h3>Campus Location</h3>
          <p>
            {COLLEGE.addressLines.map((line, i) => (
              <span key={line}>
                {line}
                {i < COLLEGE.addressLines.length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>
      </div>

      <button className="map-btn" onClick={openMap}>
        View Campus on Google Maps →
      </button>
    </div>
  );
}

export default AuthBrandPanel;
