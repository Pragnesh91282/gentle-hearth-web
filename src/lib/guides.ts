export type GuideType = "doctor" | "psychologist" | "listener";

type GuideTypeInfo = {
  label: string;
  // What this kind of guide may and may not do in a conversation.
  scope: string;
  registration?: {
    councilHint: string;
    numberLabel: string;
    registerName: string;
    registerUrl: string;
  };
};

export const GUIDE_TYPES: Record<GuideType, GuideTypeInfo> = {
  doctor: {
    label: "Registered doctor",
    scope: "Offers general medical guidance. No prescriptions or medicine changes over chat.",
    registration: {
      councilHint: "e.g. Gujarat Medical Council, or National Medical Commission",
      numberLabel: "Medical registration number",
      registerName: "Indian Medical Register (NMC)",
      registerUrl: "https://www.nmc.org.in/information-desk/indian-medical-register/",
    },
  },
  psychologist: {
    label: "Registered clinical psychologist",
    scope: "Offers psychological guidance and coping strategies. No diagnosis or medication advice over chat.",
    registration: {
      councilHint: "Rehabilitation Council of India",
      numberLabel: "RCI CRR number",
      registerName: "Central Rehabilitation Register (RCI)",
      registerUrl: "https://rehabcouncil.nic.in/",
    },
  },
  listener: {
    label: "Listener",
    scope: "Offers a listening ear and emotional support only. No diagnosis, medication, or treatment advice.",
  },
};

export function isGuideType(value: unknown): value is GuideType {
  return value === "doctor" || value === "psychologist" || value === "listener";
}
