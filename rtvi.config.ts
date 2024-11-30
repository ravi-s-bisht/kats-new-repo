export const BOT_READY_TIMEOUT = 15 * 1000; // 15 seconds

export const defaultBotProfile = "voice_2024_10";
export const defaultMaxDuration = 600;

export const LANGUAGES = [
  {
    label: "English",
    value: "en",
    tts_model: "eleven_turbo_v2_5",
    stt_model: "nova-2-general",
    default_voice: "I33geqnOHQGKDPUMUspQ",
  },
  {
    label: "Spanish",
    value: "es",
    tts_model: "eleven_turbo_v2_5",
    stt_model: "nova-2-general",
    default_voice: "rBqbBncz61jpuaOTI1GW",
  },
  // {
  //   label: "English",
  //   value: "en",
  //   tts_model: "sonic-english",
  //   stt_model: "nova-2-general",
  //   default_voice: "79a125e8-cd45-4c13-8a67-188112f4dd22",
  // },
  // {
  //   label: "Spanish",
  //   value: "es",
  //   tts_model: "sonic-multilingual",
  //   stt_model: "nova-2-general",
  //   default_voice: "846d6cb0-2301-48b6-9683-48f5618ea2f6",
  // },
  // {
  //   label: "French",
  //   value: "fr",
  //   tts_model: "sonic-multilingual",
  //   stt_model: "nova-2-general",
  //   default_voice: "a8a1eb38-5f15-4c1d-8722-7ac0f329727d",
  // },
  // {
  //   label: "German",
  //   value: "de",
  //   tts_model: "sonic-multilingual",
  //   stt_model: "nova-2-general",
  //   default_voice: "b9de4a89-2257-424b-94c2-db18ba68c81a",
  // },

  /* Not yet supported by Cartesia {
    label: "Portuguese",
    value: "pt",
    tts_model: "sonic-multilingual",
    stt_model: "nova-2-general",
    default_voice: "700d1ee3-a641-4018-ba6e-899dcadc9e2b",
  },
  {
    label: "Chinese",
    value: "zh",
    tts_model: "sonic-multilingual",
    stt_model: "nova-2-general",
    default_voice: "e90c6678-f0d3-4767-9883-5d0ecf5894a8",
  },
  {
    label: "Japanese",
    value: "ja",
    tts_model: "sonic-multilingual",
    stt_model: "nova-2-general",
    default_voice: "2b568345-1d48-4047-b25f-7baccf842eb0",
  },*/
];

export const defaultServices = {
  llm: "together",
  tts: "elevenlabs",
  stt: "deepgram",
};

export const defaultLLMPrompt = `Your name is Eric. You are an empathetic and patient virtual assistant specifically designed to help elderly individuals. Your role is to provide clear, simple, and concise answers, ensuring they feel supported and understood. Use polite and encouraging language while adapting your tone to match their level of familiarity with technology, health topics, or general information. Always prioritize clarity, safety, and respect in your responses.

Examples of tasks you assist with:

Explaining how to use smartphones or computers.
Providing reminders for medication, appointments, or daily tasks.
Answering health-related questions with caution and referring to a healthcare provider for critical advice.
Offering companionship through engaging conversations or lighthearted stories.
Helping them connect with family via technology like video calls or messaging.
When you don't know something or are asked about medical, legal, or financial advice, suggest consulting a trusted professional and provide general guidance on how to proceed.
    Your responses will converted to audio. Please do not include any special characters in your response other than '!' or '?'.
    Start by briefly introducing yourself. Don't include the examples in your introduction.`;

export const defaultConfig = [
  { service: "vad", options: [{ name: "params", value: { stop_secs: 0.5 } }] },
  {
    service: "tts",
    options: [
      { name: "voice", value: "I33geqnOHQGKDPUMUspQ" },
      { name: "model", value: LANGUAGES[0].tts_model },
      { name: "language", value: LANGUAGES[0].value },
      {
        name: "text_filter",
        value: {
          filter_code: false,
          filter_tables: false,
        },
      },
    ],
  },
  {
    service: "llm",
    options: [
      { name: "model", value: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo" },
      {
        name: "initial_messages",
        value: [
          {
            role: "system",
            content: defaultLLMPrompt,
          },
        ],
      },
      { name: "run_on_config", value: true },
    ],
  },
  {
    service: "stt",
    options: [
      { name: "model", value: LANGUAGES[0].stt_model },
      { name: "language", value: LANGUAGES[0].value },
    ],
  },
];

export const LLM_MODEL_CHOICES = [
  {
    label: "Together AI",
    value: "together",
    models: [
      {
        label: "Meta Llama 3.1 70B Instruct Turbo",
        value: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      },
      {
        label: "Meta Llama 3.1 8B Instruct Turbo",
        value: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      },
      {
        label: "Meta Llama 3.1 405B Instruct Turbo",
        value: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
      },
    ],
  },
  {
    label: "Anthropic",
    value: "anthropic",
    models: [
      {
        label: "Claude 3.5 Sonnet",
        value: "claude-3-5-sonnet-20240620",
      },
    ],
  },
  {
    label: "Grok (x.ai)",
    value: "grok",
    models: [
      {
        label: "Grok Beta",
        value: "grok-beta",
      },
    ],
  },
  {
    label: "Gemini",
    value: "gemini",
    models: [
      {
        label: "Gemini 1.5 Flash",
        value: "gemini-1.5-flash",
      },
      {
        label: "Gemini 1.5 Pro",
        value: "gemini-1.0-pro",
      },
    ],
  },
  {
    label: "Open AI",
    value: "openai",
    models: [
      {
        label: "GPT-4o",
        value: "gpt-4o",
      },
      {
        label: "GPT-4o Mini",
        value: "gpt-4o-mini",
      },
    ],
  },
];

export const PRESET_CHARACTERS = [
  // {
  //   name: "Chronic one-upper",
  //   prompt: `You are a chronic one-upper. Ask me about my summer.
  //   Your responses will converted to audio. Please do not include any special characters in your response other than '!' or '?'.`,
  //   voice: "b7d50908-b17c-442d-ad8d-810c63997ed9",
  // },
  {
    id: 1,
    name: "Emma",
    prompt:
      "You are a friendly storyteller who loves to share heartwarming stories and listen to others. Ask me about my favorite childhood memory. Your responses will be converted to audio. Please do not include any special characters in your response other than '!' or '?'.",
    voice: "I33geqnOHQGKDPUMUspQ",
    gender: "Female",
    description:
      "A warm and engaging storyteller who loves hearing and sharing personal stories.",
  },
  {
    id: 2,
    name: "James",
    prompt:
      "You are a curious historian who loves learning about personal histories and sharing interesting facts. Ask me about a historical event I remember. Your responses will be converted to audio. Please do not include any special characters in your response other than '!' or '?'.",
    voice: "I33geqnOHQGKDPUMUspQ",
    gender: "Male",
    description:
      "An inquisitive personality fascinated by history and personal memories.",
  },
  {
    id: 3,
    name: "Sophia",
    prompt:
      "You are a playful jokester who loves to tell light-hearted jokes and riddles. Ask me if I want to hear a funny story. Your responses will be converted to audio. Please do not include any special characters in your response other than '!' or '?'.",
    voice: "I33geqnOHQGKDPUMUspQ",
    gender: "Female",
    description:
      "A light-hearted jokester who enjoys bringing smiles with jokes and riddles.",
  },
  {
    id: 4,
    name: "Carlos",
    prompt:
      "You are a charming conversationalist with a warm personality. Ask me about my favorite place to travel. Your responses will be converted to audio. Please do not include any special characters in your response other than '!' or '?'.",
    voice: "rBqbBncz61jpuaOTI1GW",
    gender: "Male",
    description:
      "A charming and warm personality who loves meaningful conversations.",
  },
];
