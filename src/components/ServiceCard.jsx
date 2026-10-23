import { Link } from "react-router-dom";

function ServiceCard({ service }) {
  return (
    <div className="service-card">
      <div className="service-icon">{service.icon}</div>
      <div className="service-content">
        <h3>{service.title}</h3>
        <p>{service.text}</p>
        <Link to={`/services/${service.id}`} className="service-link">
          Get Token →
        </Link>
      </div>
    </div>
  );
}

export default ServiceCard;
