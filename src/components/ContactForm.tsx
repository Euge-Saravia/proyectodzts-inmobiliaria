import React from 'react';
import './ContactForm.scss';

const ContactForm: React.FC = () => (
  <section className="contact-form-section d-flex flex-column align-items-center justify-content-center">
    <h2 className="contact-form-title text-center mb-4">
      Contáctate con <span className="dzts-highlight">DZTS</span>
    </h2>
    <form className="container">
      <div className="row g-3 justify-content-center">
        {/* Inputs a la izquierda en desktop, arriba en mobile */}
        <div className="col-12 col-lg-4 d-flex flex-column gap-3">
          <input
            type="text"
            className="form-control contact-input"
            placeholder="Nombre y apellido"
            
          />
          <input
            type="text"
            className="form-control contact-input"
            placeholder="Teléfono"
            
          />
          <input
            type="email"
            className="form-control contact-input"
            placeholder="Correo electrónico"
            
          />
        </div>
        {/* Textarea a la derecha en desktop, abajo en mobile */}
        <div className="col-12 col-lg-8">
          <textarea
            className="form-control contact-textarea"
            placeholder="Dejá tu mensaje"
            rows={6}
            
          ></textarea>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-12 d-flex justify-content-center">
          <button type="button" className="btn btn-lg bg-primary text-white px-5 py-2 fw-bold contact-btn">
            Enviar
          </button>
        </div>
      </div>
    </form>
  </section>
);

export default ContactForm;
