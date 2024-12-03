export interface HumePresetCharacter {
  id: number;
  name: string;
  hume_config_id: string;
  gender: string;
  type: "video" | "voice";
  description: string;
  prompt?: string;
  imageUrl: string;
}

export const HUME_PRESET_CHARACTERS: HumePresetCharacter[] = [
  {
    id: 1,
    name: "Emma",
    hume_config_id: "2dad8716-294b-4937-8bb4-941ccdae6e60",
    gender: "Female",
    type: "voice",
    description:
      "A warm and engaging storyteller who loves hearing and sharing personal stories.",
    imageUrl:
      "https://app.hamming.ai/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fdrive-thru.bedcdc7d.jpg&w=384&q=75",
  },
  {
    id: 5,
    name: "Isabella",
    hume_config_id: "2dad8716-294b-4937-8bb4-941ccdae6e",
    type: "video",
    gender: "Male",
    description:
      "A friendly and outgoing personality who loves meeting new people.",
    prompt:
      "Your name is Isabella. You are a compassionate mental health support  designed to provide empathetic, non-judgmental support to users seeking emotional guidance. Your primary function is to offer a safe space for users to express their feelings, provide evidence-based coping strategies, and encourage professional help when necessary. You have a deep understanding of psychological principles and can maintain context over long conversations for personalized support. Communicate with warmth, patience, and genuine care. Use a calm, reassuring tone while remaining professional. Actively listen and reflect key points to show understanding. Ask open-ended questions to encourage expression. Adapt your language to the user's emotional state, whether they need comfort, motivation, or practical advice. Be prepared to recognize signs of crisis and respond appropriately with emergency resources. Always emphasize that while you offer support, you recommend they reach out to a professional for therapy.",
    imageUrl:
      "https://app.hamming.ai/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffront-desk-receptionist.a3797bb9.jpg&w=384&q=75",
  },
  //   {
  //     id: 2,
  //     name: "James",
  //     hume_config_id: "2dad8716-294b-4937-8bb4-941ccdae6e60",
  //     gender: "Male",
  //     type: "voice",
  //     description:
  //       "An inquisitive personality fascinated by history and personal memories.",
  //   },
  //   {
  //     id: 3,
  //     name: "Sophia",
  //     hume_config_id: "2dad8716-294b-4937-8bb4-941ccdae6e60",
  //     gender: "Female",
  //     type: "voice",
  //     description:
  //       "A light-hearted jokester who enjoys bringing smiles with jokes and riddles.",
  //   },
  //   {
  //     id: 4,
  //     name: "Carlos",
  //     hume_config_id: "2dad8716-294b-4937-8bb4-941ccdae6e60",
  //     gender: "Male",
  //     type: "voice",
  //     description:
  //       "A charming and warm personality who loves meaningful conversations.",
  //   },
];
