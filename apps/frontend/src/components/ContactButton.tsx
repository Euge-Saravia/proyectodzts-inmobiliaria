"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const ContactModal = dynamic(() => import("./ContactModal"), { ssr: false });

export default function ContactButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        className="btn btn-info text-white px-4 py-2 fw-bold w-100 w-md-auto"
        style={{ maxWidth: "300px" }}
        onClick={() => setShowModal(true)}
      >
        contactate con <span className="fw-bold">dzts</span>
      </button>
      <ContactModal show={showModal} onHide={() => setShowModal(false)} />
    </>
  );
}
