"use client";

import ConsultationModal from "./ConsultationModal";

export default function EvaluationModal(props: { onClose: () => void; quoteContext?: Record<string, string | number | boolean | null> }) {
  return <ConsultationModal {...props} kind="evaluation" />;
}
